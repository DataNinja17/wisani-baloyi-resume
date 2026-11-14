/* Indicate slow document navigations without delaying fast ones. */
(() => {
  const badge = document.createElement('div');
  badge.className = 'navigation-status';
  badge.setAttribute('role', 'status');
  const logo = new Image(28, 28);
  logo.src = '/brand/blank-devs.png';
  logo.alt = '';
  badge.append(logo, 'Loading…');
  badge.hidden = true;
  document.body.append(badge);
  let delay, timeout;
  function clear() {
    clearTimeout(delay);
    clearTimeout(timeout);
    badge.hidden = true;
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
    clear();
    delay = setTimeout(() => { badge.hidden = false; }, 180);
    timeout = setTimeout(clear, 12000);
  });
  window.addEventListener('pageshow', clear);
  window.addEventListener('pagehide', clear);
  window.addEventListener('keydown', event => { if (event.key === 'Escape') clear(); });
})();
