const NOTES_PAGE_SIZE = 5;

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseBoolean(value) {
  return String(value || "").toLowerCase() === "true";
}

function parseFrontMatter(markdown) {
  if (!markdown.startsWith("---")) {
    return { meta: {}, body: markdown };
  }

  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { meta: {}, body: markdown };
  }

  const meta = {};
  match[1].split("\n").forEach((line) => {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      return;
    }
    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    meta[key] = rawValue.replace(/^"(.*)"$/, "$1");
  });

  return { meta, body: match[2] };
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];
  let listItems = [];
  let listType = "";

  function flushParagraph() {
    if (!paragraph.length) {
      return;
    }
    const text = paragraph.join(" ").trim();
    if (text) {
      blocks.push(`<p>${inlineMarkdown(text)}</p>`);
    }
    paragraph = [];
  }

  function flushList() {
    if (!listItems.length) {
      return;
    }
    const tag = listType === "ol" ? "ol" : "ul";
    blocks.push(`<${tag}>${listItems.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</${tag}>`);
    listItems = [];
    listType = "";
  }

  function inlineMarkdown(text) {
    return escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
      .replace(/\n/g, "<br>");
  }

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    const unordered = trimmed.match(/^-\s+(.+)$/);
    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);

    if (unordered) {
      flushParagraph();
      if (listType && listType !== "ul") {
        flushList();
      }
      listType = "ul";
      listItems.push(unordered[1]);
      return;
    }

    if (ordered) {
      flushParagraph();
      if (listType && listType !== "ol") {
        flushList();
      }
      listType = "ol";
      listItems.push(ordered[1]);
      return;
    }

    flushList();
    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();
  return blocks.join("");
}

function renderNoteCard(note) {
  const images = Array.isArray(note.images) && note.images.length
    ? note.images
    : (note.image ? [note.image] : []);

  let imageHtml = "";
  if (images.length === 1) {
    imageHtml = `
      <figure class="note-image note-single">
        <div class="note-single-frame">
          <img src="${escapeHtml(images[0])}" alt="${escapeHtml(note.title)}" loading="lazy" decoding="async" />
        </div>
      </figure>
    `;
  } else if (images.length > 1) {
    imageHtml = `
      <figure class="note-image note-gallery" data-note-gallery>
        <button class="note-gallery-arrow" type="button" data-direction="prev" aria-label="Previous image">‹</button>
        <div class="note-gallery-track">
          ${images.map((src, index) => `
            <div class="note-gallery-slide${index === 0 ? " is-active" : ""}">
              <div class="note-gallery-frame">
                <img src="${escapeHtml(src)}" alt="${escapeHtml(note.title)} ${index + 1}" loading="lazy" decoding="async" />
              </div>
            </div>
          `).join("")}
        </div>
        <button class="note-gallery-arrow" type="button" data-direction="next" aria-label="Next image">›</button>
        <div class="note-gallery-dots">
          ${images.map((_, index) => `
            <button
              class="note-gallery-dot${index === 0 ? " is-active" : ""}"
              type="button"
              data-index="${index}"
              aria-label="Go to image ${index + 1}"
            ></button>
          `).join("")}
        </div>
      </figure>
    `;
  }

  return `
    <article class="note-entry">
      <header class="note-entry-header">
        <div class="note-avatar">
          <img src="${escapeHtml(note.avatar || "assets/img/profile/prof_img.webp")}" alt="Profile image" loading="lazy" decoding="async" />
        </div>
        <div class="note-meta">
          <p class="note-date">${escapeHtml(note.date)}</p>
          <h2 class="note-title">${escapeHtml(note.title)}</h2>
        </div>
      </header>
      <div class="note-body">${markdownToHtml(note.body)}</div>
      ${imageHtml}
    </article>
  `;
}

function setupGalleries(scope) {
  scope.querySelectorAll("[data-note-gallery]").forEach((gallery) => {
    const track = gallery.querySelector(".note-gallery-track");
    const originalSlides = Array.from(gallery.querySelectorAll(".note-gallery-slide"));
    const dots = Array.from(gallery.querySelectorAll(".note-gallery-dot"));
    const prev = gallery.querySelector('[data-direction="prev"]');
    const next = gallery.querySelector('[data-direction="next"]');
    const slideWidthPercent = window.innerWidth <= 767 ? 58 : 50;
    if (originalSlides.length <= 1) {
      return;
    }

    const firstClone = originalSlides[0].cloneNode(true);
    const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);
    track.insertBefore(lastClone, originalSlides[0]);
    track.appendChild(firstClone);

    const slides = Array.from(track.querySelectorAll(".note-gallery-slide"));
    let current = 0;
    let visualIndex = 1;

    function updateActiveState() {
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === visualIndex);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function setPosition(index, withTransition = true) {
      track.classList.toggle("is-no-transition", !withTransition);
      visualIndex = index;
      const galleryWidth = gallery.clientWidth;
      const slideCenter = (visualIndex * galleryWidth * (slideWidthPercent / 100)) + (galleryWidth * (slideWidthPercent / 100) / 2);
      const offset = (galleryWidth / 2) - slideCenter;
      track.style.transform = `translateX(${offset}px)`;
      updateActiveState();
    }

    function goTo(index) {
      current = (index + originalSlides.length) % originalSlides.length;
      setPosition(index + 1, true);
    }

    track.addEventListener("transitionend", () => {
      if (visualIndex === 0) {
        setPosition(originalSlides.length, false);
        track.getBoundingClientRect();
        requestAnimationFrame(() => {
          track.classList.remove("is-no-transition");
        });
      } else if (visualIndex === slides.length - 1) {
        setPosition(1, false);
        track.getBoundingClientRect();
        requestAnimationFrame(() => {
          track.classList.remove("is-no-transition");
        });
      }
    });

    if (prev) {
      prev.addEventListener("click", () => goTo(current - 1));
    }
    if (next) {
      next.addEventListener("click", () => goTo(current + 1));
    }
    dots.forEach((dot) => {
      dot.addEventListener("click", () => goTo(Number(dot.dataset.index)));
    });

    window.addEventListener("resize", () => {
      setPosition(visualIndex, false);
    });

    setPosition(1, false);
  });
}

function renderPagination(paginationEl, totalPages, currentPage, onChange) {
  paginationEl.innerHTML = "";
  if (totalPages <= 1) {
    return;
  }

  for (let page = 1; page <= totalPages; page += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `note-page-button${page === currentPage ? " is-current" : ""}`;
    button.textContent = String(page);
    button.disabled = page === currentPage;
    button.addEventListener("click", () => onChange(page));
    paginationEl.appendChild(button);
  }
}

async function loadNotes() {
  const response = await fetch("notes/posts/index.json");
  if (!response.ok) {
    throw new Error("Failed to load notes index");
  }

  const manifest = await response.json();
  const posts = await Promise.all(
    manifest.posts.map(async (filename) => {
      const markdownResponse = await fetch(`notes/posts/${filename}`);
      if (!markdownResponse.ok) {
        throw new Error(`Failed to load ${filename}`);
      }
      const markdown = await markdownResponse.text();
      const { meta, body } = parseFrontMatter(markdown);
      return {
        ...meta,
        published: parseBoolean(meta.published),
        images: meta.images
          ? meta.images.split("|").map((item) => item.trim()).filter(Boolean)
          : [],
        body,
      };
    })
  );

  return posts.filter((post) => post.published);
}

document.addEventListener("DOMContentLoaded", async () => {
  if (document.body.dataset.page !== "notes") {
    return;
  }

  const feedEl = document.querySelector("[data-notes-feed]");
  const paginationEl = document.querySelector("[data-notes-pagination]");
  if (!feedEl || !paginationEl) {
    return;
  }

  try {
    const posts = await loadNotes();
    if (!posts.length) {
      feedEl.innerHTML = '<div class="note-empty">まだ記事がありません。</div>';
      paginationEl.innerHTML = "";
      return;
    }

    let currentPage = 1;
    const totalPages = Math.ceil(posts.length / NOTES_PAGE_SIZE);

    function renderPage(page) {
      currentPage = page;
      const start = (page - 1) * NOTES_PAGE_SIZE;
      const currentPosts = posts.slice(start, start + NOTES_PAGE_SIZE);
      feedEl.innerHTML = currentPosts.map(renderNoteCard).join("");
      setupGalleries(feedEl);
      renderPagination(paginationEl, totalPages, currentPage, renderPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    renderPage(1);
  } catch (error) {
    console.error(error);
    feedEl.innerHTML = '<div class="note-empty">記事の読み込みに失敗しました。</div>';
    paginationEl.innerHTML = "";
  }
});
