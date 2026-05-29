import { Resend } from "resend";
import { ManagedAd } from "./types";

type NotificationKind = "created" | "updated" | "deleted" | "paused" | "activated" | "limit-reached";

const labels: Record<NotificationKind, string> = {
  created: "Ad created",
  updated: "Ad updated",
  deleted: "Ad deleted",
  paused: "Ad paused",
  activated: "Ad activated",
  "limit-reached": "Ad impression limit reached"
};

export async function sendAdNotification(kind: NotificationKind, ad: ManagedAd) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = notificationRecipients();

  if (!apiKey || to.length === 0) return;

  const resend = new Resend(apiKey);
  const subject = `${labels[kind]}: ${ad.advertiserName}`;
  const from = process.env.ADS_FROM_EMAIL || "Ads by Se7enInc <onboarding@resend.dev>";
  const appUrl = process.env.NEXT_PUBLIC_ADS_SERVICE_URL || "";
  const adminUrl = appUrl ? `${appUrl.replace(/\/$/, "")}/admin` : "/admin";

  await resend.emails.send({
    from,
    to,
    subject,
    text: [
      labels[kind],
      "",
      `Advertiser: ${ad.advertiserName}`,
      `Headline: ${ad.title}`,
      `Status: ${ad.status}`,
      `Priority: ${ad.priority}`,
      `Destination: ${ad.destinationUrl}`,
      `Admin: ${adminUrl}`
    ].join("\n"),
    html: `
      <div style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;line-height:1.5">
        <h1 style="font-size:20px;margin:0 0 16px">${labels[kind]}</h1>
        <table style="border-collapse:collapse;width:100%;max-width:640px">
          <tr><td style="padding:8px;border:1px solid #e5e7eb;color:#6b7280">Advertiser</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(ad.advertiserName)}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb;color:#6b7280">Headline</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(ad.title)}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb;color:#6b7280">Status</td><td style="padding:8px;border:1px solid #e5e7eb">${ad.status}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb;color:#6b7280">Priority</td><td style="padding:8px;border:1px solid #e5e7eb">${ad.priority}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb;color:#6b7280">Destination</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(ad.destinationUrl)}</td></tr>
        </table>
        <p style="margin-top:16px"><a href="${escapeHtml(adminUrl)}">Open admin</a></p>
      </div>
    `
  });
}

function notificationRecipients() {
  const value = process.env.ADS_NOTIFICATION_EMAILS || process.env.ADS_NOTIFICATION_EMAIL || "";

  return value
    .split(/[\n,;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char] || char;
  });
}
