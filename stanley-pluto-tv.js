/* STANLEY TV HIBRIDA - PLUTO TV V1.0 */
(() => {
  'use strict';

  const links = [
    {
      nome: 'Esportes',
      icon: '⚽',
      desc: 'Canais esportivos ao vivo',
      url: 'https://pluto.tv/br/watch/live-tv/category/esportes-br/'
    },
    {
      nome: 'Filmes',
      icon: '🎬',
      desc: 'Explore os filmes na Pluto TV',
      url: 'https://pluto.tv/br/'
    },
    {
      nome: 'Séries',
      icon: '📺',
      desc: 'Explore as séries na Pluto TV',
      url: 'https://pluto.tv/br/'
    },
    {
      nome: 'Infantil',
      icon: '🧸',
      desc: 'Explore os canais infantis na Pluto TV',
      url: 'https://pluto.tv/br/'
    }
  ];

  const style = document.createElement('style');
  style.textContent = `
    #stanley-pluto-modal[hidden] {
      display: none !important;
    }
    #stanley-pluto-modal {
      position: fixed;
      inset: 0;
      z-index: 210;
      overflow-y: auto;
      background: rgba(3,13,9,.96);
      color: #effff6;
      padding: clamp(18px,4vw,48px);
    }
    #stanley-pluto-modal .pluto-header {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 14px;
      margin: 0 auto 28px;
      max-width: 1080px;
    }
    #stanley-pluto-modal h2 {
      margin: 0;
      font-size: clamp(22px,3vw,34px);
    }
    #stanley-pluto-modal .pluto-grid {
      display: grid;
      grid-template-columns:
        repeat(auto-fit,minmax(200px,1fr));
      gap: 17px;
      max-width: 1080px;
      margin: auto;
    }
    #stanley-pluto-modal .pluto-card {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      min-height: 190px;
      padding: 23px;
      border-radius: 20px;
      border: 1px solid #3b7d58;
      background:
        linear-gradient(150deg,#17432e,#081b16);
      text-decoration: none;
      color: #fff;
      box-shadow: 0 12px 28px #0007;
      transition:
        transform .17s,
        box-shadow .17s,
        border-color .17s;
    }
    #stanley-pluto-modal .pluto-card:hover,
    #stanley-pluto-modal .pluto-card:focus-visible {
      transform: translateY(-5px) scale(1.02);
      border-color: #70ffaa;
      box-shadow: 0 0 24px #2aff7b65;
      outline: 2px solid #aaffcc;
    }
    #stanley-pluto-modal .pluto-symbol {
      font-size: 37px;
      margin-bottom: 12px;
    }
    #stanley-pluto-modal .pluto-title {
      font-size: 21px;
      font-weight: 800;
      margin-bottom: 8px;
    }
    #stanley-pluto-modal .pluto-desc {
      color: #c0dbca;
      font-size: 13px;
      line-height: 1.45;
    }
    #stanley-pluto-modal .pluto-note {
      max-width: 1080px;
      margin: 22px auto;
      color: #a7cbb7;
      font-size: 13px;
    }
    #stanley-pluto-menu {
      border-color: #3b8c62 !important;
    }
  `;
  document.head.append(style);

  const panel = document.createElement('section');
  panel.id = 'stanley-pluto-modal';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Pluto TV');

  panel.innerHTML = `
    <div class="pluto-header">
      <h2>📡 Pluto TV</h2>
      <button type="button" id="stanley-pluto-back">
        ✕ Voltar à STANLEY TV
      </button>
    </div>
    <div class="pluto-grid"></div>
    <p class="pluto-note">
      Os links abrem a plataforma oficial Pluto TV.
      A reprodução acontece fora do player Stanley.
    </p>
  `;

  document.body.append(panel);

  const cards = panel.querySelector('.pluto-grid');

  for (const info of links) {
    const a = document.createElement('a');
    a.className = 'pluto-card';
    a.href = info.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    const symbol = document.createElement('span');
    symbol.className = 'pluto-symbol';
    symbol.textContent = info.icon;

    const name = document.createElement('span');
    name.className = 'pluto-title';
    name.textContent = info.nome;

    const desc = document.createElement('span');
    desc.className = 'pluto-desc';
    desc.textContent = info.desc + ' ↗';

    a.append(symbol, name, desc);
    cards.append(a);
  }

  let previousFocus = null;

  function openPanel() {
    previousFocus = document.activeElement;
    panel.hidden = false;
    document.body.style.overflow = 'hidden';
    panel.querySelector('#stanley-pluto-back').focus();
  }

  function closePanel() {
    panel.hidden = true;
    document.body.style.overflow = '';
    previousFocus?.focus?.();
  }

  panel.querySelector('#stanley-pluto-back')
    .addEventListener('click', closePanel);

  document.addEventListener('keydown', event => {
    if (
      !panel.hidden &&
      (event.key === 'Escape' ||
       event.key === 'Backspace')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      closePanel();
    }
  }, true);

  const menu = document.getElementById('menu');
  if (!menu) return;

  let expanded = false;

  const observer = new MutationObserver(() => mount());
  observer.observe(menu, { childList: true });

  function mount() {
    if (document.getElementById('stanley-pluto-menu')) {
      return;
    }

    const parent = document.createElement('button');
    parent.id = 'stanley-pluto-menu';
    parent.type = 'button';
    parent.className = 'parent';
    parent.textContent = '📡 Pluto TV ›';

    parent.addEventListener('click', () => {
      expanded = !expanded;
      mountEntries();
    });

    const anchor = [
      ...menu.querySelectorAll('button')
    ].find(b => /Favoritos/.test(b.textContent));

    menu.insertBefore(parent, anchor || null);
    mountEntries();
  }

  function mountEntries() {
    const parent = document.getElementById(
      'stanley-pluto-menu'
    );
    if (!parent) return;

    parent.textContent =
      '📡 Pluto TV ' + (expanded ? '⌄' : '›');

    menu.querySelectorAll('[data-pluto-entry]')
      .forEach(x => x.remove());

    if (!expanded) return;

    const all = document.createElement('button');
    all.type = 'button';
    all.className = 'child';
    all.dataset.plutoEntry = '1';
    all.textContent = 'Ver categorias Pluto TV';
    all.addEventListener('click', openPanel);

    parent.after(all);
    let last = all;

    for (const info of links) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'child';
      b.dataset.plutoEntry = '1';
      b.textContent = info.icon + ' ' + info.nome;

      b.addEventListener('click', () => {
        window.open(
          info.url,
          '_blank',
          'noopener,noreferrer'
        );
      });

      last.after(b);
      last = b;
    }
  }

  mount();
})();