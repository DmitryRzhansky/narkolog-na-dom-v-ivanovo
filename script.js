(() => {
  const initOutreachTabs = () => {
    document.querySelectorAll('[data-outreach-tabs]').forEach((group) => {
      const owned = (selector) => [...group.querySelectorAll(selector)]
        .filter((item) => item.closest('[data-outreach-tabs]') === group);
      const tabs = owned('[data-outreach-tab]');
      const panels = owned('[data-outreach-panel]');
      if (!tabs.length || !panels.length) return;
      const select = (tab, focus = false) => {
        const value = tab.dataset.outreachTab;
        tabs.forEach((item) => {
          const selected = item === tab;
          item.setAttribute('aria-selected', String(selected));
          item.tabIndex = selected ? 0 : -1;
        });
        panels.forEach((panel) => { panel.hidden = panel.dataset.outreachPanel !== value; });
        if (focus) tab.focus();
      };
      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => select(tab));
        tab.addEventListener('keydown', (event) => {
          let next = null;
          if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
          if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
          if (event.key === 'Home') next = 0;
          if (event.key === 'End') next = tabs.length - 1;
          if (next !== null) { event.preventDefault(); select(tabs[next], true); }
        });
      });
      select(tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0]);
    });
  };

  const initDispatchSlider = () => {
    document.querySelectorAll('[data-dispatch-carousel]').forEach((carousel) => {
      const slides = [...carousel.querySelectorAll('[data-dispatch-slide]')];
      const controls = carousel.querySelector('[data-dispatch-controls]');
      const prev = carousel.querySelector('[data-dispatch-prev]');
      const next = carousel.querySelector('[data-dispatch-next]');
      const status = carousel.querySelector('[data-dispatch-status]');
      if (slides.length < 2 || !controls || !prev || !next) return;
      let current = 0;
      const show = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => {
          slide.hidden = i !== current;
          slide.setAttribute('aria-hidden', String(i !== current));
        });
        if (status) status.textContent = `${current + 1} / ${slides.length}`;
      };
      prev.addEventListener('click', () => show(current - 1));
      next.addEventListener('click', () => show(current + 1));
      carousel.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
        if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
      });
      show(0);
      controls.hidden = false;
    });
  };

  const initPricesTabs = () => {
    document.querySelectorAll('[data-prices]').forEach((root) => {
      const tabs = [...root.querySelectorAll('[data-prices-tab]')];
      const panels = [...root.querySelectorAll('[data-prices-panel]')];
      if (!tabs.length || !panels.length) return;
      const activate = (tab, focus = false) => {
        tabs.forEach((item) => {
          const active = item === tab;
          item.classList.toggle('prices__tab--active', active);
          item.setAttribute('aria-selected', String(active));
          item.tabIndex = active ? 0 : -1;
          const panel = document.getElementById(item.getAttribute('aria-controls'));
          if (panel && root.contains(panel)) panel.hidden = !active;
        });
        if (focus) tab.focus();
      };
      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => activate(tab));
        tab.addEventListener('keydown', (event) => {
          let next = null;
          if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
          if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
          if (event.key === 'Home') next = 0;
          if (event.key === 'End') next = tabs.length - 1;
          if (next !== null) { event.preventDefault(); activate(tabs[next], true); }
        });
      });
      activate(tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0]);
    });
  };

  const initFaq = () => {
    document.querySelectorAll('[data-faq]').forEach((root) => {
      const items = [...root.querySelectorAll('[data-faq-item]')];
      const setOpen = (item, open) => {
        const toggle = item.querySelector('[data-faq-toggle]');
        const panel = item.querySelector('[data-faq-panel]');
        if (!toggle || !panel) return;
        item.classList.toggle('faq-item--open', open);
        toggle.setAttribute('aria-expanded', String(open));
        panel.setAttribute('aria-hidden', String(!open));
        panel.hidden = !open;
      };
      items.forEach((item) => {
        const toggle = item.querySelector('[data-faq-toggle]');
        if (!toggle) return;
        setOpen(item, false);
        toggle.addEventListener('click', () => {
          const open = !item.classList.contains('faq-item--open');
          items.forEach((other) => setOpen(other, other === item && open));
        });
      });
    });
  };

  const initHorizontalTracks = () => {
    const bind = (rootSelector, trackSelector, prevSelector, nextSelector) => {
      document.querySelectorAll(rootSelector).forEach((root) => {
        const track = root.querySelector(trackSelector);
        if (!track) return;
        const move = (direction) => {
          const card = track.firstElementChild;
          const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 16;
          const step = card ? card.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
          track.scrollBy({ left: direction * step, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        };
        root.querySelectorAll(prevSelector).forEach((button) => button.addEventListener('click', () => move(-1)));
        root.querySelectorAll(nextSelector).forEach((button) => button.addEventListener('click', () => move(1)));
      });
    };
    bind('[data-reviews]', '[data-reviews-track]', '[data-reviews-prev]', '[data-reviews-next]');
    bind('[data-cases]', '[data-cases-track]', '[data-cases-prev]', '[data-cases-next]');
  };

  const initLightbox = () => {
    const root = document.querySelector('[data-standalone-lightbox]');
    if (!root) return;
    const image = root.querySelector('img');
    const caption = root.querySelector('[data-standalone-caption]');
    const close = root.querySelector('[data-standalone-close]');
    let previous = null;
    const hide = () => {
      root.hidden = true;
      image.removeAttribute('src');
      document.body.classList.remove('lightbox-open');
      if (previous) previous.focus();
      previous = null;
    };
    document.querySelectorAll('[data-lightbox-open]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const src = trigger.getAttribute('data-lightbox-src');
        if (!src) return;
        previous = trigger;
        image.src = src;
        image.alt = trigger.getAttribute('data-lightbox-alt') || '';
        caption.textContent = trigger.getAttribute('data-lightbox-caption') || '';
        caption.hidden = !caption.textContent;
        root.hidden = false;
        document.body.classList.add('lightbox-open');
        close.focus();
      });
    });
    close.addEventListener('click', hide);
    root.addEventListener('click', (event) => { if (event.target === root) hide(); });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !root.hidden) hide();
    });
  };

  const init = () => {
    initOutreachTabs();
    initDispatchSlider();
    initPricesTabs();
    initFaq();
    initHorizontalTracks();
    initLightbox();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
