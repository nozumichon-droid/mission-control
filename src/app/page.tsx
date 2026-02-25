import { MissionControlDashboard } from "@/components/MissionControlDashboard";
import { getDashboardSummary } from "@/lib/data";

export default async function Home() {
  const data = await getDashboardSummary();
  return <MissionControlDashboard initialData={data} />;
}
