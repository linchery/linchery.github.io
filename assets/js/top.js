function syncHeroHeight() {
  const headerTop = document.querySelector(".header_top");
  if (!headerTop) {
    return;
  }

  if (document.body.dataset.page !== "home") {
    headerTop.style.height = "";
    return;
  }

  headerTop.style.height = `${window.innerHeight}px`;
}

document.addEventListener("DOMContentLoaded", syncHeroHeight);
window.addEventListener("resize", syncHeroHeight);
