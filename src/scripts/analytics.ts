import { trackAnalyticsEvent } from "../lib/analytics";

const body = document.body;

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;

  const discordLink = event.target.closest<HTMLElement>("[data-analytics-discord]");
  if (discordLink?.dataset.analyticsDiscord) {
    trackAnalyticsEvent("click_discord", {
      placement: discordLink.dataset.analyticsDiscord,
    });
    return;
  }

  const relatedLink = event.target.closest<HTMLElement>("[data-analytics-related-article]");
  const sourceSlug = body.dataset.analyticsContentId;
  const targetSlug = relatedLink?.dataset.analyticsRelatedArticle;

  if (relatedLink && sourceSlug && targetSlug) {
    trackAnalyticsEvent("click_related_article", {
      source_slug: sourceSlug,
      target_slug: targetSlug,
    });
  }
});

if (body.dataset.analyticsPage === "join-guide") {
  trackAnalyticsEvent("view_join_guide", {});
}

if (body.dataset.analyticsPage === "blog-post" && body.dataset.analyticsContentId) {
  trackAnalyticsEvent("view_blog_post", {
    post_slug: body.dataset.analyticsContentId,
  });
}

const statusSection = document.querySelector<HTMLElement>("[data-analytics-server-status]");

if (statusSection) {
  const trackStatusView = () => {
    trackAnalyticsEvent("open_server_status", {
      placement: statusSection.dataset.analyticsServerStatus || "live_section",
    });
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        trackStatusView();
        observer.disconnect();
      },
      { threshold: 0.5 },
    );
    observer.observe(statusSection);
  } else {
    trackStatusView();
  }
}
