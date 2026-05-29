"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ManagedAd, SiteAnalytics } from "@/lib/types";

const placementOptions = [
  { value: "auto", label: "Any automatic slot" },
  { value: "auto-top", label: "Top of page" },
  { value: "auto-inline", label: "Inside article/body" },
  { value: "auto-feed", label: "Inside feeds/lists" },
  { value: "auto-bottom", label: "Before footer" },
  { value: "auto-sticky", label: "Mobile sticky" }
];

const emptyForm = {
  advertiserName: "",
  title: "",
  description: "",
  ctaLabel: "Learn more",
  destinationUrl: "",
  altText: "",
  status: "paused",
  priority: "5",
  placements: ["auto"],
  startsAt: "",
  endsAt: "",
  maxImpressions: ""
};

type FormState = typeof emptyForm;

const fieldHelp = {
  advertiserName: "Company or brand name shown in the sponsored label and admin list.",
  status: "Active ads can be delivered. Paused ads stay saved but never render.",
  title: "Main headline shown on the ad card.",
  description: "Short supporting copy. Keep it concise so it fits smaller placements.",
  ctaLabel: "Action text shown as the final prompt on the ad card.",
  priority:
    "Priority 1 stays stable for the same site, page, and slot. Priorities 2 to 10 rotate, and higher numbers are more likely to show.",
  destinationUrl: "Where the user lands after clicking the ad.",
  media: "Upload one image or video for the card. New uploads replace the previous media.",
  altText: "Accessible description for the media. Falls back to the headline if left empty.",
  placements: "Choose which automatic positions this ad is allowed to fill.",
  startsAt: "Optional start date and time. Leave empty to allow delivery immediately.",
  endsAt: "Optional end date and time. Leave empty to keep running until paused or capped.",
  maxImpressions: "Optional hard cap for total impressions across all sites."
} as const;

export default function AdminDashboard({
  initialAds,
  initialSites
}: {
  initialAds: ManagedAd[];
  initialSites: SiteAnalytics[];
}) {
  const [ads, setAds] = useState(initialAds);
  const [sites] = useState(initialSites);
  const [selectedId, setSelectedId] = useState<string | null>(initialAds[0]?.id || null);
  const [form, setForm] = useState<FormState>(() => adToForm(initialAds[0]));
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [origin, setOrigin] = useState("https://ads.example.com");

  const selectedAd = useMemo(() => ads.find((ad) => ad.id === selectedId) || null, [ads, selectedId]);
  const activeCount = ads.filter((ad) => ad.status === "active").length;
  const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0);
  const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  function selectAd(ad: ManagedAd) {
    setSelectedId(ad.id);
    setForm(adToForm(ad));
    setMediaFile(null);
    setMessage("");
  }

  function newAd() {
    setSelectedId(null);
    setForm(emptyForm);
    setMediaFile(null);
    setMessage("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      body.append(key, Array.isArray(value) ? value.join(",") : value);
    });
    if (mediaFile) body.append("media", mediaFile);

    const endpoint = selectedId ? `/api/admin/ads/${selectedId}` : "/api/admin/ads";
    const response = await fetch(endpoint, {
      method: selectedId ? "PATCH" : "POST",
      body
    });

    setIsSaving(false);

    if (!response.ok) {
      setMessage("The ad could not be saved. Check the required fields and try again.");
      return;
    }

    const payload = (await response.json()) as { ad: ManagedAd };
    setAds((current) => {
      const exists = current.some((ad) => ad.id === payload.ad.id);
      return exists ? current.map((ad) => (ad.id === payload.ad.id ? payload.ad : ad)) : [payload.ad, ...current];
    });
    setSelectedId(payload.ad.id);
    setForm(adToForm(payload.ad));
    setMediaFile(null);
    setMessage("Ad saved.");
  }

  async function removeSelected() {
    if (!selectedId) return;
    const ad = selectedAd;
    if (!ad || !confirm(`Delete the ad for ${ad.advertiserName}?`)) return;

    const response = await fetch(`/api/admin/ads/${selectedId}`, { method: "DELETE" });
    if (!response.ok) {
      setMessage("The ad could not be deleted.");
      return;
    }

    const remaining = ads.filter((item) => item.id !== selectedId);
    setAds(remaining);
    setSelectedId(remaining[0]?.id || null);
    setForm(adToForm(remaining[0]));
    setMessage("Ad deleted.");
  }

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function togglePlacement(value: string) {
    setForm((current) => {
      const next = current.placements.includes(value)
        ? current.placements.filter((placement) => placement !== value)
        : [...current.placements, value];

      return { ...current, placements: next.length ? next : ["auto"] };
    });
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brandBlock">
          <div className="brandIdentity">
            <div className="logoSlot" aria-label="Se7enInc logo">
              <img src="/se7eninc.png" alt="" />
            </div>
            <div>
              <p className="smallLabel">Ads by Se7enInc</p>
              <h1>Ad desk</h1>
            </div>
          </div>
          <button className="button buttonPrimary" type="button" onClick={newAd}>
            New ad
          </button>
        </div>

        <div className="metricGrid">
          <Metric label="Active" value={activeCount.toString()} />
          <Metric label="Ads" value={ads.length.toString()} />
          <Metric label="Views" value={compact(totalImpressions)} />
          <Metric label="Clicks" value={compact(totalClicks)} />
        </div>

        <div className="adList">
          {ads.length === 0 ? (
            <div className="emptyState">
              <strong>No ads yet</strong>
              <span>Create the first advertiser placement to activate delivery.</span>
            </div>
          ) : (
            ads.map((ad) => (
              <button
                key={ad.id}
                type="button"
                className={`adRow ${selectedId === ad.id ? "adRowSelected" : ""}`}
                onClick={() => selectAd(ad)}
              >
                <span className={`statusDot ${ad.status === "active" ? "statusActive" : ""}`} />
                <span>
                  <strong>{ad.advertiserName}</strong>
                  <small>{ad.title}</small>
                </span>
                <em>{ad.priority}</em>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="smallLabel">Reusable script</p>
            <code>{siteSnippet(origin)}</code>
          </div>
          <div className="topbarActions">
            {message ? <span className="message">{message}</span> : null}
            <form action="/api/auth/logout" method="post">
              <button className="button buttonSubtle" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </header>

        <div className="contentGrid">
          <form className="editorPanel" onSubmit={submit}>
            <div className="sectionTitle">
              <div>
                <h2>{selectedId ? "Edit ad" : "Create ad"}</h2>
                <p>Structured ads only: media, text, destination, priority, placement rules.</p>
              </div>
              {selectedId ? (
                <button className="button buttonSubtle" type="button" onClick={removeSelected}>
                  Delete
                </button>
              ) : null}
            </div>

            <div className="formGrid">
              <Field label="Advertiser" help={fieldHelp.advertiserName}>
                <input required value={form.advertiserName} onChange={(event) => updateForm("advertiserName", event.target.value)} />
              </Field>
              <Field label="Status" help={fieldHelp.status}>
                <select value={form.status} onChange={(event) => updateForm("status", event.target.value)}>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </Field>
            </div>

            <Field label="Headline" help={fieldHelp.title}>
              <input required value={form.title} onChange={(event) => updateForm("title", event.target.value)} />
            </Field>

            <Field label="Description" help={fieldHelp.description}>
              <textarea rows={3} value={form.description} onChange={(event) => updateForm("description", event.target.value)} />
            </Field>

            <div className="formGrid">
              <Field label="CTA label" help={fieldHelp.ctaLabel}>
                <input required value={form.ctaLabel} onChange={(event) => updateForm("ctaLabel", event.target.value)} />
              </Field>
              <Field label="Priority" help={fieldHelp.priority}>
                <input min="1" max="10" type="number" value={form.priority} onChange={(event) => updateForm("priority", event.target.value)} />
              </Field>
            </div>

            <Field label="Destination URL" help={fieldHelp.destinationUrl}>
              <input required type="url" value={form.destinationUrl} onChange={(event) => updateForm("destinationUrl", event.target.value)} />
            </Field>

            <div className="formGrid">
              <Field label="Media" help={fieldHelp.media}>
                <input accept="image/*,video/*" type="file" onChange={(event) => setMediaFile(event.target.files?.[0] || null)} />
              </Field>
              <Field label="Alt text" help={fieldHelp.altText}>
                <input value={form.altText} onChange={(event) => updateForm("altText", event.target.value)} />
              </Field>
            </div>

            <FieldsetLabel label="Placements" help={fieldHelp.placements} />
            <div className="placementGrid">
              {placementOptions.map((option) => (
                <label key={option.value} className="checkItem">
                  <input
                    type="checkbox"
                    checked={form.placements.includes(option.value)}
                    onChange={() => togglePlacement(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>

            <div className="formGrid">
              <Field label="Start date" help={fieldHelp.startsAt}>
                <input type="datetime-local" value={form.startsAt} onChange={(event) => updateForm("startsAt", event.target.value)} />
              </Field>
              <Field label="End date" help={fieldHelp.endsAt}>
                <input type="datetime-local" value={form.endsAt} onChange={(event) => updateForm("endsAt", event.target.value)} />
              </Field>
            </div>

            <Field label="Max impressions" help={fieldHelp.maxImpressions}>
              <input min="1" type="number" value={form.maxImpressions} onChange={(event) => updateForm("maxImpressions", event.target.value)} />
            </Field>

            <div className="actions">
              <button className="button buttonPrimary" type="submit" disabled={isSaving}>
                {isSaving ? "Saving" : "Save ad"}
              </button>
              <button className="button buttonSubtle" type="button" onClick={newAd}>
                Reset form
              </button>
            </div>
          </form>

          <aside className="previewPanel">
            <div className="sectionTitle compact">
              <div>
                <h2>Preview</h2>
                <p>Approximate rendered card from the embed script.</p>
              </div>
            </div>

            <div className="previewCard">
              <div className="previewMedia">
                {mediaFile ? (
                  <span>{mediaFile.name}</span>
                ) : selectedAd?.mediaUrl ? (
                  selectedAd.mediaType === "video" ? <video src={selectedAd.mediaUrl} muted /> : <img src={selectedAd.mediaUrl} alt="" />
                ) : (
                  <span>Media</span>
                )}
              </div>
              <div className="previewBody">
                <span>Sponsored by {form.advertiserName || "Advertiser"}</span>
                <strong>{form.title || "Ad headline"}</strong>
                <p>{form.description || "A short description will appear here."}</p>
                <em>{form.ctaLabel || "Learn more"}</em>
              </div>
            </div>

            <div className="logicBox">
              <h3>Delivery logic</h3>
              <p>
                A page can show up to the site integration&apos;s <code>data-max-slots</code> value, subject to real
                discovered positions in the page. Priority 1 stays fixed for the same site, page, and slot. Priorities
                2 to 10 rotate, and higher numbers are more likely to win each rotating slot.
              </p>
            </div>

            <div className="logicBox">
              <h3>Connected sites</h3>
              {sites.length === 0 ? (
                <p>No embed integrations have checked in yet.</p>
              ) : (
                <div className="siteStatsList">
                  {sites.map((site) => (
                    <article key={`${site.siteKey}:${site.origin || "direct"}`} className="siteStatCard">
                      <div className="siteStatHeader">
                        <strong>{site.siteKey}</strong>
                        <span>{site.origin || "origin unavailable"}</span>
                      </div>
                      <dl className="siteStatGrid">
                        <SiteStat label="Deliveries" value={compact(site.deliveryRequests)} />
                        <SiteStat label="Impressions" value={compact(site.impressions)} />
                        <SiteStat label="Clicks" value={compact(site.clicks)} />
                        <SiteStat label="Slots" value={String(site.lastMaxSlots)} />
                      </dl>
                      <p className="siteStatMeta">
                        Last page: <code>{site.lastPage}</code>
                      </p>
                      <p className="siteStatMeta">
                        Seen: {formatDateTime(site.firstSeenAt)} to {formatDateTime(site.lastSeenAt)}
                      </p>
                      {site.referrerHost ? <p className="siteStatMeta">Referrer host: {site.referrerHost}</p> : null}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Field({ label, help, children }: { label: string; help: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <FieldLabel label={label} help={help} />
      {children}
    </label>
  );
}

function FieldsetLabel({ label, help }: { label: string; help: string }) {
  return <div className="fieldsetLabel"><FieldLabel label={label} help={help} /></div>;
}

function FieldLabel({ label, help }: { label: string; help: string }) {
  return (
    <span className="fieldLabel">
      <span>{label}</span>
      <span className="tooltipWrap" tabIndex={0}>
        <span aria-hidden="true" className="tooltipTrigger">
          ?
        </span>
        <span className="tooltipBubble" role="tooltip">
          {help}
        </span>
      </span>
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function SiteStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="siteStat">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function adToForm(ad?: ManagedAd): FormState {
  if (!ad) return emptyForm;

  return {
    advertiserName: ad.advertiserName,
    title: ad.title,
    description: ad.description,
    ctaLabel: ad.ctaLabel,
    destinationUrl: ad.destinationUrl,
    altText: ad.altText,
    status: ad.status,
    priority: String(ad.priority),
    placements: ad.placements,
    startsAt: ad.startsAt ? ad.startsAt.slice(0, 16) : "",
    endsAt: ad.endsAt ? ad.endsAt.slice(0, 16) : "",
    maxImpressions: ad.maxImpressions ? String(ad.maxImpressions) : ""
  };
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

function siteSnippet(origin: string) {
  return `<script async src="${origin}/widget.js" data-site="maine-news" data-max-slots="4" data-allowed-paths="/article/*,/latest/*" data-blocked-paths="/admin/*"></script>`;
}
