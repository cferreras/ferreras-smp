export const ANALYTICS_EVENT_NAMES = [
  "copy_server_ip",
  "click_discord",
  "view_join_guide",
  "view_blog_post",
  "click_related_article",
  "open_server_status",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];
export type AnalyticsProvider = "none" | "plausible" | "ga4";

type EventProperties = {
  copy_server_ip: { placement: string };
  click_discord: { placement: string };
  view_join_guide: Record<string, never>;
  view_blog_post: { post_slug: string };
  click_related_article: { source_slug: string; target_slug: string };
  open_server_status: { placement: string };
};

export type AnalyticsEventDetail<Name extends AnalyticsEventName = AnalyticsEventName> = {
  name: Name;
  properties: EventProperties[Name] & { page_path: string };
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    plausible?: {
      (eventName: string, options?: { props?: Record<string, string> }): void;
      init?: (options?: Record<string, unknown>) => void;
      q?: IArguments[];
    };
  }

  interface WindowEventMap {
    "ferreras:analytics": CustomEvent<AnalyticsEventDetail>;
  }
}

const getProvider = (): AnalyticsProvider => {
  const provider = document.body.dataset.analyticsProvider;
  return provider === "plausible" || provider === "ga4" ? provider : "none";
};

export const trackAnalyticsEvent = <Name extends AnalyticsEventName>(
  name: Name,
  properties: EventProperties[Name],
) => {
  const detail = {
    name,
    properties: {
      ...properties,
      page_path: window.location.pathname,
    },
  } as AnalyticsEventDetail<Name>;

  window.dispatchEvent(new CustomEvent("ferreras:analytics", { detail }));

  if (new URLSearchParams(window.location.search).get("analytics_debug") === "1") {
    console.info("[analytics]", detail.name, detail.properties);
  }

  try {
    const provider = getProvider();

    if (provider === "plausible") {
      window.plausible?.(name, { props: detail.properties });
    } else if (provider === "ga4") {
      window.gtag?.("event", name, detail.properties);
    }
  } catch {
    // Analytics must never interrupt navigation or an interaction.
  }
};
