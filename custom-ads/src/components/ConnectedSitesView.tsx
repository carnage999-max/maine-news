import Link from "next/link";
import { SiteAnalytics } from "@/lib/types";

export default function ConnectedSitesView({
  sites
}: {
  sites: SiteAnalytics[];
}) {
  return (
    <main className="sitesShell">
      <header className="sitesTopbar">
        <div className="sitesTopbarTitle">
          <p className="smallLabel">Ads by Se7enInc</p>
          <h1>Connected sites</h1>
          <p>
            Every site that loads the embed script is recorded here with its latest integration details and delivery
            totals.
          </p>
        </div>
        <div className="topbarActions">
          <Link className="button buttonSubtle" href="/admin">
            Back to ad desk
          </Link>
          <form action="/api/auth/logout" method="post">
            <button className="button buttonSubtle" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <section className="sitesPanel">
        {sites.length === 0 ? (
          <div className="sitesEmpty">
            <strong>No connected sites yet</strong>
            <span>The first embed integration will appear here after it requests delivery.</span>
          </div>
        ) : (
          <div className="sitesTableWrap">
            <table className="sitesTable">
              <thead>
                <tr>
                  <th>Site</th>
                  <th>Origin</th>
                  <th>Deliveries</th>
                  <th>Impressions</th>
                  <th>Clicks</th>
                  <th>Slots</th>
                  <th>Last page</th>
                  <th>Last seen</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((site) => (
                  <tr key={`${site.siteKey}:${site.origin || "direct"}`}>
                    <td>
                      <div className="sitesCellStack">
                        <strong>{site.siteKey}</strong>
                        {site.referrerHost ? <span>{site.referrerHost}</span> : null}
                      </div>
                    </td>
                    <td>{site.origin || "origin unavailable"}</td>
                    <td>{compact(site.deliveryRequests)}</td>
                    <td>{compact(site.impressions)}</td>
                    <td>{compact(site.clicks)}</td>
                    <td>{site.lastMaxSlots}</td>
                    <td>
                      <code>{site.lastPage}</code>
                    </td>
                    <td>{formatDateTime(site.lastSeenAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function compact(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}
