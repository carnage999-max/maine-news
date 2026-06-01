export type AdStatus = "active" | "paused";

export type AdPlacement =
  | "auto"
  | "auto-top"
  | "auto-inline"
  | "auto-feed"
  | "auto-bottom"
  | "auto-sticky"
  | "home-header-left"
  | "home-header-right"
  | "home-featured"
  | "home-feed-inline"
  | "home-footer-feature";

export type ManagedAd = {
  id: string;
  advertiserName: string;
  title: string;
  description: string;
  ctaLabel: string;
  destinationUrl: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  mediaBase64: string;
  mediaContentType: string;
  mediaFileName: string;
  altText: string;
  status: AdStatus;
  priority: number;
  placements: AdPlacement[];
  startsAt: string | null;
  endsAt: string | null;
  maxImpressions: number | null;
  impressions: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
};

export type PublicAd = Pick<
  ManagedAd,
  | "id"
  | "advertiserName"
  | "title"
  | "description"
  | "ctaLabel"
  | "destinationUrl"
  | "mediaUrl"
  | "mediaType"
  | "altText"
>;

export type DeliveryResponse = {
  site: string;
  page: string;
  ads: Array<{
    placement: string;
    ad: PublicAd;
  }>;
};

export type SiteAnalytics = {
  siteKey: string;
  origin: string;
  referrerHost: string;
  lastPage: string;
  lastReferrer: string;
  lastUserAgent: string;
  lastAllowedPaths: string[];
  lastBlockedPaths: string[];
  lastMaxSlots: number;
  deliveryRequests: number;
  impressions: number;
  clicks: number;
  firstSeenAt: string;
  lastSeenAt: string;
};
