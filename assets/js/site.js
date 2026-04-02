const SITE_CONFIG = {
  siteName: "Nozomi HAYASHIDA",
  profileName: "Nozomi Hayashida",
  affiliationHtml:
    'Graduate School of Engineering<br>Nagoya University<br/><a href="http://www.ucl.nuee.nagoya-u.ac.jp">Nobuo Kawaguchi Lab.</a>',
  profileImages: {
    sp: "./assets/img/profile.jpg",
    pc: "./assets/img/profile_wide.jpg",
  },
  navItems: [
    { key: "home", href: "index.html", label: "HOME" },
    { key: "research", href: "research.html", label: "RESEARCH" },
    { key: "publication", href: "publication.html", label: "PUBLICATION" },
    { key: "special", href: "special.html", label: "SPECIAL" },
    { key: "gallery", href: "gallery.html", label: "GALLERY" },
  ],
  socialLinks: [
    {
      key: "icon_X",
      href: "https://x.com/linda_uclab",
      label: "X",
      iconSrc: "./assets/img/icon_X.svg",
    },
    {
      key: "icon_instagram",
      href: "https://www.instagram.com/linchery",
      label: "Instagram",
      iconSrc: "./assets/img/icon_instagram.svg",
    },
    {
      key: "icon_facebook",
      href: "https://m.facebook.com/linchery.nh",
      label: "Facebook",
      iconSrc: "./assets/img/icon_facebook.svg",
    },
    {
      key: "icon_youtube",
      href: "https://youtube.com/@linchery",
      label: "YouTube",
      iconSrc: "./assets/img/icon_youtube.svg",
    },
    {
      key: "icon_github",
      href: "https://github.com/linchery/",
      label: "GitHub",
      iconSrc: "./assets/img/icon_github.svg",
    },
  ],
  footer: {
    address:
      "〒464-8603<br>愛知県名古屋市千種区不老町<br>名古屋大学 IB電子情報館 北棟9F 905号室",
    email: "linda[at]ucl.nuee.nagoya-u.ac.jp",
  },
};

const PAGE_TITLE_DECORATIONS = {
  research: "title_deco_blue",
  publication: "title_deco_pink",
  special: "title_deco_green",
  gallery: "title_deco_blue",
};

function renderSocialIcon(link) {
  return `
    <li class="${link.key}">
      <a href="${link.href}" target="_blank" rel="noreferrer" aria-label="${link.label}">
        <img src="${link.iconSrc}" alt="${link.label}" />
      </a>
    </li>
  `;
}

function renderMenu(pageKey) {
  const nav = SITE_CONFIG.navItems
    .map((item) => {
      const currentClass = item.key === pageKey ? "is-current" : "";
      return `<li><a href="${item.href}" class="${currentClass}">${item.label}</a></li>`;
    })
    .join("");

  const icons = SITE_CONFIG.socialLinks.map(renderSocialIcon).join("");

  return `
    <div class="hamburger-menu">
      <input type="checkbox" id="menu-btn-check">
      <label for="menu-btn-check" class="menu-btn"><span></span></label>
      <div class="menu-content">
        <div class="menu-panel">
          <div class="menu-main">
            <p class="menu-heading">MENU</p>
            <ul class="links">${nav}</ul>
          </div>
          <div class="menu-footer">
            <ul class="share_icon menu-share">${icons}</ul>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderHeader(pageKey, pageTitle) {
  if (pageKey !== "home") {
    const decoClass = PAGE_TITLE_DECORATIONS[pageKey] || "";
    return `
      <header class="header header-page">
        <div class="page-hero">
          <h1 class="page-title is-visible ${decoClass}">${pageTitle.toUpperCase()}</h1>
        </div>
      </header>
    `;
  }

  return `
    <header class="header">
      <div class="header_top">
        <h1 class="on">
          <span>${SITE_CONFIG.profileName}</span>
          <span>${SITE_CONFIG.affiliationHtml}</span>
        </h1>
        <div class="mainimg">
          <span style="background-image: url(${SITE_CONFIG.profileImages.sp});" class="sp"></span>
          <span style="background-image: url(${SITE_CONFIG.profileImages.pc});" class="pc"></span>
        </div>
      </div>
    </header>
  `;
}

function renderSocialArea() {
  const icons = SITE_CONFIG.socialLinks.map(renderSocialIcon).join("");
  return `
    <div class="sns_area">
      <ul class="share_icon">${icons}</ul>
    </div>
  `;
}

function renderFooter(pageKey) {
  const nav = SITE_CONFIG.navItems
    .map((item) => {
      const currentClass = item.key === pageKey ? "is-current" : "";
      return `<li><a href="${item.href}" class="${currentClass}">${item.label}</a></li>`;
    })
    .join("");

  return `
    <footer id="footer" class="footer">
      <div class="fc_support">
        <h3>MENU</h3>
        <ul class="support_navi">${nav}</ul>
        <div class="footer-contact-grid">
          <section class="footer-contact-block">
            <h3>Address</h3>
            <p>${SITE_CONFIG.footer.address}</p>
          </section>
          <section class="footer-contact-block">
            <h3>Email</h3>
            <p>${SITE_CONFIG.footer.email}</p>
          </section>
        </div>
      </div>
    </footer>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const pageKey = document.body.dataset.page || "";
  const pageTitle = document.body.dataset.pageTitle || SITE_CONFIG.siteName;

  document.title = `${pageTitle} | ${SITE_CONFIG.siteName}`;

  const menuMount = document.querySelector("[data-site-menu]");
  if (menuMount) {
    menuMount.innerHTML = renderMenu(pageKey);
  }

  const headerMount = document.querySelector("[data-site-header]");
  if (headerMount) {
    headerMount.innerHTML = renderHeader(pageKey, pageTitle);
  }

  const socialMount = document.querySelector("[data-site-social]");
  if (socialMount) {
    socialMount.innerHTML = renderSocialArea();
  }

  const footerMount = document.querySelector("[data-site-footer]");
  if (footerMount) {
    footerMount.innerHTML = renderFooter(pageKey);
  }
});
