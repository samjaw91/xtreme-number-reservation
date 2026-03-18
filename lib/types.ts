export type NumberStatus = "available" | "pending" | "confirmed";
export type ReservationStatus = "pending" | "confirmed" | "rejected" | "expired" | "cancelled";

export interface CampaignNumber {
  id: string;
  number_value: number;
  current_status: NumberStatus;
}

export interface ActiveCampaign {
  id: string;
  title_ar: string;
  description_ar: string | null;
  instructions_ar: string | null;
  status: string;
  max_numbers_per_user: number;
  pending_timeout_minutes: number;
}
