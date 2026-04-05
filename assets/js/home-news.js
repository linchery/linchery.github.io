const HOME_NEWS_LIMIT = 3;

const HOME_NEWS_BADGE_CLASS = {
  paper: "badge-paper",
  talk: "badge-talk",
  award: "badge-award",
  event: "badge-talk",
  media: "badge-paper",
  note: "badge-note",
};

function escapeHomeNewsHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatHomeNewsDate(item) {
  if (item.displayDate) {
    return item.displayDate;
  }

  if (!item.date) {
    return "";
  }

  const parts = item.date.split("-");
  if (parts.length >= 2) {
    return `${parts[0]}.${parts[1]}`;
  }
  return item.date;
}

function sortHomeNews(items) {
  return [...items].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
}

function selectHomeNews(items) {
  const published = items.filter((item) => item.published !== false);
  const featured = sortHomeNews(published.filter((item) => item.featured === true)).slice(0, HOME_NEWS_LIMIT);
  if (featured.length > 0) {
    return featured;
  }
  return sortHomeNews(published).slice(0, HOME_NEWS_LIMIT);
}

function renderHomeNewsItem(item) {
  const categoryKey = String(item.category || "").toLowerCase();
  const badgeClass = HOME_NEWS_BADGE_CLASS[categoryKey] || "badge-paper";
  const categoryLabel = item.categoryLabel || item.category || "";

  return `
    <article class="news-entry">
      <p class="news-date">${escapeHomeNewsHtml(formatHomeNewsDate(item))}</p>
      <div class="news-body">
        <span class="news-badge ${badgeClass}">${escapeHomeNewsHtml(categoryLabel)}</span>
        <p>${escapeHomeNewsHtml(item.content)}</p>
      </div>
    </article>
  `;
}

async function loadHomeNews() {
  const response = await fetch("assets/data/news.json");
  if (!response.ok) {
    throw new Error("Failed to load home news");
  }
  const payload = await response.json();
  return Array.isArray(payload.items) ? payload.items : [];
}

document.addEventListener("DOMContentLoaded", async () => {
  if (document.body.dataset.page !== "home") {
    return;
  }

  const mount = document.querySelector("[data-home-news]");
  if (!mount) {
    return;
  }

  try {
    const items = await loadHomeNews();
    const selected = selectHomeNews(items);
    if (!selected.length) {
      mount.innerHTML = '<p class="news-loading">No news available.</p>';
      return;
    }
    mount.innerHTML = selected.map(renderHomeNewsItem).join("");
  } catch (error) {
    console.error(error);
    mount.innerHTML = '<p class="news-loading">Failed to load news.</p>';
  }
});
