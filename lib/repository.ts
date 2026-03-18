import { getServiceSupabase } from "@/lib/supabase";
import { makeRequestCode, normalizePhone } from "@/lib/format";

export async function getActiveCampaign() {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getCampaignNumbers(campaignId: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("campaign_numbers")
    .select("id,number_value,current_status")
    .eq("campaign_id", campaignId)
    .order("number_value", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createReservation(payload: { fullName: string; phone: string; numbers: number[] }) {
  const supabase = getServiceSupabase();
  const campaign = await getActiveCampaign();
  if (!campaign) throw new Error("لا توجد حملة مفتوحة حالياً");
  if (!payload.numbers.length) throw new Error("يجب اختيار رقم واحد على الأقل");
  if (payload.numbers.length > campaign.max_numbers_per_user) {
    throw new Error(`الحد الأقصى للاختيار هو ${campaign.max_numbers_per_user} رقم`);
  }

  const selectedNumbers = [...new Set(payload.numbers)].sort((a, b) => a - b);

  const { data: numberRows, error: numbersError } = await supabase
    .from("campaign_numbers")
    .select("id,number_value,current_status")
    .eq("campaign_id", campaign.id)
    .in("number_value", selectedNumbers);
  if (numbersError) throw numbersError;

  if (!numberRows || numberRows.length !== selectedNumbers.length) {
    throw new Error("بعض الأرقام غير موجودة");
  }

  const unavailable = numberRows.filter((row) => row.current_status !== "available");
  if (unavailable.length) {
    throw new Error(`هذه الأرقام لم تعد متاحة: ${unavailable.map((n) => n.number_value).join("، ")}`);
  }

  const normalized = normalizePhone(payload.phone);
  let participantId: string;
  const { data: existingParticipant } = await supabase
    .from("participants")
    .select("id")
    .eq("normalized_phone", normalized)
    .maybeSingle();

  if (existingParticipant?.id) {
    participantId = existingParticipant.id;
    await supabase.from("participants").update({
      full_name: payload.fullName,
      phone_number: payload.phone,
      updated_at: new Date().toISOString(),
    }).eq("id", participantId);
  } else {
    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .insert({
        full_name: payload.fullName,
        phone_number: payload.phone,
        normalized_phone: normalized,
      })
      .select("id")
      .single();
    if (participantError) throw participantError;
    participantId = participant.id;
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + campaign.pending_timeout_minutes * 60 * 1000).toISOString();
  const requestCode = makeRequestCode();

  const { data: reservation, error: reservationError } = await supabase
    .from("reservations")
    .insert({
      request_code: requestCode,
      campaign_id: campaign.id,
      participant_id: participantId,
      status: "pending",
      payment_status: "under_review",
      expires_at: expiresAt,
      submitted_at: now.toISOString(),
    })
    .select("id,request_code,expires_at")
    .single();
  if (reservationError) throw reservationError;

  const items = numberRows.map((row) => ({
    reservation_id: reservation.id,
    campaign_number_id: row.id,
    number_value: row.number_value,
    item_status: "pending",
  }));

  const { error: itemsError } = await supabase.from("reservation_items").insert(items);
  if (itemsError) throw itemsError;

  const numberIds = numberRows.map((r) => r.id);
  const { error: updateNumbersError } = await supabase
    .from("campaign_numbers")
    .update({ current_status: "pending", current_reservation_id: reservation.id, updated_at: new Date().toISOString() })
    .in("id", numberIds)
    .eq("current_status", "available");
  if (updateNumbersError) throw updateNumbersError;

  return {
    requestCode: reservation.request_code,
    expiresAt: reservation.expires_at,
    selectedNumbers,
    campaign,
  };
}

export async function findReservationStatus(query: { requestCode?: string; phone?: string }) {
  const supabase = getServiceSupabase();
  let reservationId = null as string | null;
  let reservation: any = null;

  if (query.requestCode) {
    const result = await supabase
      .from("reservations")
      .select("id,request_code,status,submitted_at,expires_at,reviewed_at,admin_notes,participants(full_name,phone_number)")
      .eq("request_code", query.requestCode)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (result.error) throw result.error;
    reservation = result.data;
    reservationId = reservation?.id ?? null;
  } else if (query.phone) {
    const normalized = normalizePhone(query.phone);
    const participantResult = await supabase
      .from("participants")
      .select("id")
      .eq("normalized_phone", normalized)
      .maybeSingle();
    if (participantResult.error) throw participantResult.error;
    if (!participantResult.data?.id) return null;
    const resResult = await supabase
      .from("reservations")
      .select("id,request_code,status,submitted_at,expires_at,reviewed_at,admin_notes,participants(full_name,phone_number)")
      .eq("participant_id", participantResult.data.id)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (resResult.error) throw resResult.error;
    reservation = resResult.data;
    reservationId = reservation?.id ?? null;
  }

  if (!reservationId || !reservation) return null;

  const itemsResult = await supabase
    .from("reservation_items")
    .select("number_value,item_status")
    .eq("reservation_id", reservationId)
    .order("number_value", { ascending: true });
  if (itemsResult.error) throw itemsResult.error;

  return {
    ...reservation,
    items: itemsResult.data ?? [],
  };
}

export async function getDashboardStats() {
  const campaign = await getActiveCampaign();
  if (!campaign) return null;
  const numbers = await getCampaignNumbers(campaign.id);
  const stats = {
    available: numbers.filter((n) => n.current_status === "available").length,
    pending: numbers.filter((n) => n.current_status === "pending").length,
    confirmed: numbers.filter((n) => n.current_status === "confirmed").length,
  };
  return { campaign, stats };
}

export async function listReservations(status?: string) {
  const supabase = getServiceSupabase();
  let query = supabase
    .from("reservations")
    .select("id,request_code,status,payment_status,submitted_at,expires_at,admin_notes,participants(full_name,phone_number)")
    .order("submitted_at", { ascending: false });
  if (status && status !== "all") query = query.eq("status", status);
  const { data, error } = await query.limit(100);
  if (error) throw error;
  const ids = (data ?? []).map((d) => d.id);
  const itemsMap = new Map<string, number[]>();
  if (ids.length) {
    const { data: items } = await supabase.from("reservation_items").select("reservation_id,number_value").in("reservation_id", ids);
    (items ?? []).forEach((item) => {
      const arr = itemsMap.get(item.reservation_id) || [];
      arr.push(item.number_value);
      itemsMap.set(item.reservation_id, arr);
    });
  }
  return (data ?? []).map((row) => ({ ...row, numbers: (itemsMap.get(row.id) || []).sort((a, b) => a - b) }));
}

async function logAdminAction(adminUsername: string, actionType: string, entityType: string, entityId: string, beforeData: any, afterData: any, note?: string) {
  const supabase = getServiceSupabase();
  await supabase.from("admin_actions").insert({
    action_type: actionType,
    entity_type: entityType,
    entity_id: entityId,
    note: note || null,
    before_data: beforeData || null,
    after_data: afterData || null,
    admin_display_name: adminUsername,
  });
}

export async function updateReservationStatus(reservationId: string, nextStatus: "confirmed" | "rejected" | "expired", adminUsername: string, adminNotes?: string) {
  const supabase = getServiceSupabase();
  const { data: reservation, error } = await supabase
    .from("reservations")
    .select("id,status,request_code,admin_notes")
    .eq("id", reservationId)
    .single();
  if (error) throw error;

  const { data: items, error: itemsError } = await supabase
    .from("reservation_items")
    .select("campaign_number_id,number_value")
    .eq("reservation_id", reservationId);
  if (itemsError) throw itemsError;

  const reviewTime = new Date().toISOString();
  const updatePayload: any = {
    status: nextStatus,
    reviewed_at: reviewTime,
    admin_notes: adminNotes ?? reservation.admin_notes ?? null,
    payment_status: nextStatus === "confirmed" ? "verified" : nextStatus === "rejected" ? "rejected" : "pending",
  };

  const { error: updateError } = await supabase.from("reservations").update(updatePayload).eq("id", reservationId);
  if (updateError) throw updateError;

  const itemStatus = nextStatus === "confirmed" ? "confirmed" : nextStatus;
  await supabase.from("reservation_items").update({ item_status: itemStatus }).eq("reservation_id", reservationId);

  const numberIds = (items ?? []).map((i) => i.campaign_number_id);
  if (numberIds.length) {
    if (nextStatus === "confirmed") {
      await supabase.from("campaign_numbers").update({ current_status: "confirmed", updated_at: reviewTime }).in("id", numberIds);
    } else {
      await supabase.from("campaign_numbers").update({ current_status: "available", current_reservation_id: null, updated_at: reviewTime }).in("id", numberIds);
    }
  }

  await logAdminAction(adminUsername, `reservation_${nextStatus}`, "reservation", reservationId, reservation, updatePayload, adminNotes);
}

export async function expireTimedOutReservations() {
  const supabase = getServiceSupabase();
  const now = new Date().toISOString();
  const { data: expired, error } = await supabase
    .from("reservations")
    .select("id")
    .eq("status", "pending")
    .lt("expires_at", now)
    .limit(100);
  if (error) throw error;
  for (const row of expired ?? []) {
    await updateReservationStatus(row.id, "expired", "cron", "Expired automatically by scheduled job");
  }
  return (expired ?? []).length;
}

export async function getSettingsBundle() {
  const supabase = getServiceSupabase();
  const campaign = await getActiveCampaign();
  const { data: settings, error } = await supabase.from("app_settings").select("*").limit(1).maybeSingle();
  if (error) throw error;
  return { campaign, settings };
}

export async function updateCampaignAndSettings(input: {
  campaignTitleAr?: string;
  campaignDescriptionAr?: string;
  instructionsAr?: string;
  campaignStatus?: string;
  maxNumbersPerUser?: number;
  pendingTimeoutMinutes?: number;
  siteNameAr?: string;
  legalNoticeAr?: string;
  supportPhone?: string;
}, adminUsername: string) {
  const supabase = getServiceSupabase();
  const bundle = await getSettingsBundle();
  if (!bundle.campaign) throw new Error("لا توجد حملة مفتوحة أو جاهزة للتعديل");
  const before = { campaign: bundle.campaign, settings: bundle.settings };
  const campaignPatch: any = {};
  if (input.campaignTitleAr !== undefined) campaignPatch.title_ar = input.campaignTitleAr;
  if (input.campaignDescriptionAr !== undefined) campaignPatch.description_ar = input.campaignDescriptionAr;
  if (input.instructionsAr !== undefined) campaignPatch.instructions_ar = input.instructionsAr;
  if (input.campaignStatus !== undefined) campaignPatch.status = input.campaignStatus;
  if (input.maxNumbersPerUser !== undefined) campaignPatch.max_numbers_per_user = input.maxNumbersPerUser;
  if (input.pendingTimeoutMinutes !== undefined) campaignPatch.pending_timeout_minutes = input.pendingTimeoutMinutes;
  if (Object.keys(campaignPatch).length) {
    await supabase.from("campaigns").update(campaignPatch).eq("id", bundle.campaign.id);
  }

  const settingsPatch: any = {};
  if (input.siteNameAr !== undefined) settingsPatch.site_name_ar = input.siteNameAr;
  if (input.legalNoticeAr !== undefined) settingsPatch.legal_notice_ar = input.legalNoticeAr;
  if (input.supportPhone !== undefined) settingsPatch.support_phone = input.supportPhone;
  if (Object.keys(settingsPatch).length) {
    if (bundle.settings?.id) await supabase.from("app_settings").update(settingsPatch).eq("id", bundle.settings.id);
    else await supabase.from("app_settings").insert(settingsPatch);
  }
  await logAdminAction(adminUsername, "settings_update", "app", bundle.campaign.id, before, input, "Updated campaign/settings");
}
