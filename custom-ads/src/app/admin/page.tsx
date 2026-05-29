import AdminDashboard from "@/components/AdminDashboard";
import { readAds, readSiteAnalytics } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [ads, sites] = await Promise.all([readAds(), readSiteAnalytics()]);

  return <AdminDashboard initialAds={ads} initialSites={sites} />;
}
