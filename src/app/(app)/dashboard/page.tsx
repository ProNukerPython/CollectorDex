import { DashboardView } from "@/features/dashboard/dashboard-view";
import { requireUser } from "@/server/session";
import { getDashboardData } from "@/services/dashboard";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);
  return <DashboardView data={data} />;
}
