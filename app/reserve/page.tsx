import { PublicLayout } from "@/components/PublicLayout";
import { ReserveForm } from "@/components/ReserveForm";
import { getActiveCampaign, getCampaignNumbers } from "@/lib/repository";

export default async function ReservePage() {
  const campaign = await getActiveCampaign();
  if (!campaign) {
    return (
      <PublicLayout>
        <section className="card"><h1>لا توجد حملة مفتوحة حالياً</h1><p className="muted">يمكنك العودة لاحقاً أو مراجعة الإدارة.</p></section>
      </PublicLayout>
    );
  }
  const numbers = await getCampaignNumbers(campaign.id);
  return (
    <PublicLayout>
      <section className="hero">
        <h1>{campaign.title_ar}</h1>
        <p>{campaign.description_ar || "اختر الأرقام المتاحة وأرسل طلبك ليتم مراجعته من قبل الإدارة."}</p>
        {campaign.instructions_ar ? <div className="card" style={{marginTop:16}}>{campaign.instructions_ar}</div> : null}
      </section>
      <ReserveForm campaign={campaign} numbers={numbers} />
    </PublicLayout>
  );
}
