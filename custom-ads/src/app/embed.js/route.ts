import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const client = String.raw`
(function () {
  var script = document.currentScript;
  if (!script || script.__customAdsLoaded) return;
  script.__customAdsLoaded = true;

  var baseUrl = new URL(script.src).origin;
  var site = script.getAttribute("data-site") || location.hostname;
  var maxSlots = Number(script.getAttribute("data-max-slots") || "4");
  var allowedPaths = script.getAttribute("data-allowed-paths") || "";
  var blockedPaths = script.getAttribute("data-blocked-paths") || "";
  var page = location.pathname + location.search;
  var renderedIds = [];

  function resolveMediaUrl(path) {
    if (!path) return "";
    if (path.indexOf("http") === 0) return path;
    return baseUrl + (path.charAt(0) === "/" ? path : "/" + path);
  }

  function addStyles() {
    if (document.getElementById("custom-ads-style")) return;
    var style = document.createElement("style");
    style.id = "custom-ads-style";
    style.textContent = [
      ".custom-ad-slot{display:block;margin:24px 0;clear:both}",
      ".custom-ad-slot[data-custom-ad-empty='true']{display:none}",
      ".custom-ad-card{font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#141414;text-decoration:none;background:#fff;border:1px solid rgba(15,23,42,.14);border-radius:12px;box-shadow:none;display:grid;grid-template-columns:128px 1fr;gap:14px;overflow:hidden;min-height:118px}",
      ".custom-ad-card:hover{border-color:rgba(15,23,42,.28)}",
      ".custom-ad-media{background:#eef1f4;min-height:118px;overflow:hidden}",
      ".custom-ad-media img,.custom-ad-media video{width:100%;height:100%;object-fit:cover;display:block}",
      ".custom-ad-body{padding:14px 16px 14px 0;display:flex;flex-direction:column;gap:5px;justify-content:center}",
      ".custom-ad-label{font-size:11px;line-height:1.2;color:#64748b;font-weight:650}",
      ".custom-ad-title{font-size:17px;line-height:1.25;font-weight:750;color:#111827}",
      ".custom-ad-copy{font-size:13px;line-height:1.45;color:#475569;margin:0}",
      ".custom-ad-cta{font-size:13px;font-weight:720;color:#0f172a;margin-top:3px}",
      ".custom-ad-sticky{position:fixed;left:12px;right:12px;bottom:12px;z-index:2147483000;margin:0;display:none}",
      ".custom-ad-sticky .custom-ad-card{grid-template-columns:86px 1fr;min-height:84px;border-radius:10px}",
      ".custom-ad-sticky .custom-ad-media{min-height:84px}",
      ".custom-ad-sticky .custom-ad-body{padding:10px 12px 10px 0}",
      ".custom-ad-sticky .custom-ad-title{font-size:14px}",
      ".custom-ad-sticky .custom-ad-copy{display:none}",
      "@media (max-width:700px){.custom-ad-card{grid-template-columns:96px 1fr;min-height:92px}.custom-ad-media{min-height:92px}.custom-ad-body{padding:11px 12px 11px 0}.custom-ad-title{font-size:14px}.custom-ad-copy{font-size:12px}.custom-ad-sticky{display:block}}"
    ].join("");
    document.head.appendChild(style);
  }

  function createSlot(name, className) {
    var slot = document.createElement("div");
    slot.className = "custom-ad-slot" + (className ? " " + className : "");
    slot.setAttribute("data-custom-ad-slot", name);
    slot.setAttribute("data-custom-ad-empty", "true");
    return slot;
  }

  function discoverSlots() {
    var existing = Array.prototype.slice.call(document.querySelectorAll("[data-custom-ad-slot]"));
    if (existing.length) return existing.slice(0, maxSlots);

    var slots = [];
    var root = document.querySelector("article") || document.querySelector("main") || document.body;
    var firstChild = root.firstElementChild;
    var top = createSlot("auto-top");
    root.insertBefore(top, firstChild || null);
    slots.push(top);

    var paragraphs = Array.prototype.slice.call(root.querySelectorAll("p")).filter(function (node) {
      return (node.textContent || "").trim().length > 80;
    });
    if (paragraphs[1]) {
      var inline = createSlot("auto-inline");
      paragraphs[1].insertAdjacentElement("afterend", inline);
      slots.push(inline);
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll(".story-card,[class*='StoryCard'],[class*='post-card'],[class*='card']"));
    if (cards[3] && slots.length < maxSlots) {
      var feed = createSlot("auto-feed");
      cards[3].insertAdjacentElement("afterend", feed);
      slots.push(feed);
    }

    if (slots.length < maxSlots) {
      var bottom = createSlot("auto-bottom");
      var footer = document.querySelector("footer");
      if (footer && footer.parentNode) footer.parentNode.insertBefore(bottom, footer);
      else root.appendChild(bottom);
      slots.push(bottom);
    }

    if (window.matchMedia("(max-width: 700px)").matches && slots.length < maxSlots) {
      var sticky = createSlot("auto-sticky", "custom-ad-sticky");
      document.body.appendChild(sticky);
      slots.push(sticky);
    }

    return slots;
  }

  function report(adId, eventName) {
    var payload = JSON.stringify({ adId: adId, event: eventName, site: site, page: page });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(baseUrl + "/api/events", new Blob([payload], { type: "application/json" }));
      return;
    }
    fetch(baseUrl + "/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(function () {});
  }

  function render(slot, ad) {
    var link = document.createElement("a");
    link.className = "custom-ad-card";
    link.href = ad.destinationUrl;
    link.target = "_blank";
    link.rel = "sponsored noopener";
    link.setAttribute("aria-label", "Sponsored ad from " + ad.advertiserName + ": " + ad.title);

    var media = document.createElement("div");
    media.className = "custom-ad-media";
    if (ad.mediaType === "video") {
      var video = document.createElement("video");
      video.src = resolveMediaUrl(ad.mediaUrl);
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.autoplay = true;
      media.appendChild(video);
    } else {
      var image = document.createElement("img");
      image.src = resolveMediaUrl(ad.mediaUrl);
      image.alt = ad.altText || ad.title;
      image.loading = "lazy";
      media.appendChild(image);
    }

    var body = document.createElement("div");
    body.className = "custom-ad-body";
    body.innerHTML = '<span class="custom-ad-label">Sponsored by ' + escapeHtml(ad.advertiserName) + '</span><strong class="custom-ad-title">' + escapeHtml(ad.title) + '</strong><p class="custom-ad-copy">' + escapeHtml(ad.description || "") + '</p><span class="custom-ad-cta">' + escapeHtml(ad.ctaLabel || "Learn more") + '</span>';

    link.appendChild(media);
    link.appendChild(body);
    link.addEventListener("click", function () { report(ad.id, "click"); });

    slot.removeAttribute("data-custom-ad-empty");
    slot.innerHTML = "";
    slot.appendChild(link);
    renderedIds.push(ad.id);

    observe(slot, ad.id);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char];
    });
  }

  function observe(slot, adId) {
    if (!("IntersectionObserver" in window)) {
      report(adId, "impression");
      return;
    }
    var seen = false;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!seen && entry.isIntersecting && entry.intersectionRatio >= 0.45) {
          seen = true;
          report(adId, "impression");
          observer.disconnect();
        }
      });
    }, { threshold: [0.45] });
    observer.observe(slot);
  }

  function load() {
    addStyles();
    var slots = discoverSlots();
    var placements = slots.map(function (slot) {
      return slot.getAttribute("data-custom-ad-slot") || "auto";
    });

    if (!placements.length) return;

    var url = baseUrl + "/api/delivery?site=" + encodeURIComponent(site) + "&page=" + encodeURIComponent(page) + "&placements=" + encodeURIComponent(placements.join(",")) + "&exclude=" + encodeURIComponent(renderedIds.join(",")) + "&maxSlots=" + encodeURIComponent(String(maxSlots)) + "&allowedPaths=" + encodeURIComponent(allowedPaths) + "&blockedPaths=" + encodeURIComponent(blockedPaths);

    fetch(url)
      .then(function (response) { return response.json(); })
      .then(function (payload) {
        var slotGroups = slots.reduce(function (grouped, slot) {
          var placement = slot.getAttribute("data-custom-ad-slot") || "auto";
          if (!grouped[placement]) grouped[placement] = [];
          grouped[placement].push(slot);
          return grouped;
        }, {});

        (payload.ads || []).forEach(function (item) {
          var candidates = slotGroups[item.placement] || [];
          var slot = candidates.find(function (candidate) {
            return candidate.getAttribute("data-custom-ad-empty") === "true";
          }) || candidates[0];
          if (slot && item.ad) render(slot, item.ad);
        });
      })
      .catch(function () {});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", load);
  else load();
})();`;

export async function GET() {
  return new NextResponse(client, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300"
    }
  });
}
