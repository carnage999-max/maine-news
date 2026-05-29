import ConnectedSitesView from "@/components/ConnectedSitesView";
import { readSiteAnalytics } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ConnectedSitesPage() {
  const sites = await readSiteAnalytics();

  return <ConnectedSitesView sites={sites} />;
}
