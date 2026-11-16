/* STANLEY FOOTBALL LIVE - Modulo de calendario */
(() => {
  'use strict';

  const ESPN = 'https://site.api.espn.com/apis/site/v2/sports/soccer';
  const LIGAS = [
    ['bra.1', 'Brasileirão Série A'],
    ['bra.2', 'Brasileirão Série B'],
    ['bra.copa_do_brazil', 'Copa do Brasil'],
    ['conmebol.libertadores', 'Libertadores'],
    ['conmebol.sudamericana', 'Sul-Americana'],
    ['uefa.champions', 'Champions League'],
    ['eng.1', 'Premier League'],
    ['esp.1', 'LaLiga'],
    ['uefa.nations', 'UEFA Nations League'],
    ['fifa.friendly', 'Amistosos de Seleções']
  ];

  const $ = id => document.getElementById(id);

  const clean = s => String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  const diaBR = date => new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);

  const dataHoje = () => diaBR(new Date()).replace(/-/g, '');

  const horaBR = data => new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(data));

  function el(tag, text, css) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (css) node.style.cssText = css;
    return node;
  }

  const btn = (texto, fn) => {
    const b = el('button', texto);
    b.type = 'button';
    b.onclick = fn;
    return b;
  };

  const modal = el('section', undefined,
    'display:none;position:fixed;inset:2%;z-index:1000;overflow:auto;' +
    'padding:17px;background:#091810;color:#f4fff9;border:1px solid #25cc8d;' +
    'border-radius:16px;box-shadow:0 12px 60px #000e;font:14px Arial,sans-serif;'
  );

  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-label', 'Futebol de Hoje');

  const cab = el('div', undefined,
    'display:flex;gap:8px;align-items:center;flex-wrap:wrap'
  );

  const titulo = el('h2', '⚽ STANLEY FOOTBALL LIVE',
    'margin:5px auto 5px 0;font-size:20px'
  );

  const aviso = el('p', 'Abra para consultar os jogos de hoje.',
    'color:#b1d9c4'
  );

  const lista = el('div', undefined,
    'display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:12px'
  );

  cab.append(
    titulo,
    btn('↻ Atualizar', carregar),
    btn('✕ Fechar', () => {
      modal.style.display = 'none';
    })
  );

  modal.append(cab, aviso, lista);
  document.body.append(modal);

  const tools = document.querySelector('.tools');
  if (!tools) return;

  tools.prepend(btn('⚽ Futebol de Hoje', () => {
    modal.style.display = 'block';
    carregar();
  }));

  async function pegarLiga(codigo, nome) {
    try {
      const url = `${ESPN}/${codigo}/scoreboard?dates=${dataHoje()}`;
      const res = await fetch(url, { cache: 'no-store' });

      if (!res.ok) throw new Error('HTTP ' + res.status);

      const json = await res.json();

      return {
        ok: true,
        nome,
        eventos: json.events || []
      };
    } catch (erro) {
      console.warn('Calendário ' + codigo + ':', erro.message);
      return { ok: false, nome, eventos: [] };
    }
  }

  function equipe(competidores, lado) {
    const item = competidores.find(c => c.homeAway === lado) || {};
    const t = item.team || {};

    return {
      nome: t.displayName || t.name || '',
      logo: t.logo || '',
      placar: item.score
    };
  }

  function converter(evento, liga) {
    if (
      !evento.date ||
      diaBR(new Date(evento.date)) !== diaBR(new Date())
    ) return null;

    const competicao = (evento.competitions || [])[0] || {};
    const competidores = competicao.competitors || [];

    const casa = equipe(competidores, 'home');
    const fora = equipe(competidores, 'away');

    if (!casa.nome || !fora.nome) return null;

    const status = (evento.status || {}).type || {};

    return {
      id: liga + ':' + evento.id,
      liga,
      casa,
      fora,
      hora: horaBR(evento.date),
      inicio: evento.date,
      estado: status.state === 'in'
        ? 'AO VIVO'
        : status.state === 'post'
          ? 'ENCERRADO'
          : 'AGENDADO'
    };
  }

  async function carregarLives() {
    try {
      const r = await fetch(
        'stanley-esportes-ao-vivo.json?v=' + Date.now(),
        { cache: 'no-store' }
      );

      if (!r.ok) return [];

      const d = await r.json();
      return Array.isArray(d.items) ? d.items : [];
    } catch {
      return [];
    }
  }

  function encontrarLive(jogo, lives) {
    const a = clean(jogo.casa.nome);
    const b = clean(jogo.fora.nome);

    const palavras = nome => nome
      .split(' ')
      .filter(p => p.length > 3);

    const aPalavras = palavras(a);
    const bPalavras = palavras(b);

    if (!aPalavras.length || !bPalavras.length) return null;

    return lives.find(x => {
      const titulo = clean(x.name);

      return (
        aPalavras.some(p => titulo.includes(p)) &&
        bPalavras.some(p => titulo.includes(p))
      );
    }) || null;
  }

  function abrirNoPlayer(live) {
    modal.style.display = 'none';

    const todos = [...document.querySelectorAll('#menu button')]
      .find(b => b.textContent.includes('Todos os conteúdos'));

    if (todos) todos.click();

    const busca = $('search');
    if (!busca) return;

    busca.value = live.name;
    busca.dispatchEvent(new Event('input', { bubbles: true }));

    const card = [...document.querySelectorAll('#cards button.card')]
      .find(b =>
        b.getAttribute('aria-label') === 'Assistir ' + live.name
      );

    if (card) {
      card.click();
    } else {
      window.open(
        'https://www.youtube.com/watch?v=' +
        encodeURIComponent(live.videoId),
        '_blank',
        'noopener'
      );
    }
  }

  function renderizar(jogos, lives, erros) {
    lista.replaceChildren();

    aviso.textContent =
      jogos.length + ' jogos de hoje • ' +
      (LIGAS.length - erros) + '/' +
      LIGAS.length + ' competições consultadas • ' +
      'horários de Brasília. Transmissões são correspondências estimadas.';

    if (erros === LIGAS.length) {
      aviso.textContent =
        'Não foi possível consultar a ESPN neste dispositivo. ' +
        'Tente novamente mais tarde.';
      return;
    }

    if (!jogos.length) {
      lista.append(el('p',
        'Nenhuma partida encontrada hoje nas ligas consultadas.'
      ));
      return;
    }

    for (const jogo of jogos) {
      const live = encontrarLive(jogo, lives);

      const box = el('article', undefined,
        'border:1px solid #285c42;border-radius:12px;' +
        'padding:12px;background:#10271b;'
      );

      box.append(el('div', jogo.liga,
        'font-size:12px;color:#b1d9c4'
      ));

      box.append(el('div',
        `${jogo.casa.nome} × ${jogo.fora.nome}`,
        'font-size:16px;font-weight:bold;margin:12px 0;line-height:1.35'
      ));

      box.append(el('div',
        jogo.hora + ' • ' + jogo.estado,
        'font-size:12px;color:#b1d9c4;margin-bottom:10px'
      ));

      if (live) {
        box.append(btn(
          '▶ Possível transmissão — assistir',
          () => abrirNoPlayer(live)
        ));

        box.append(el('p',
          live.channel || 'YouTube',
          'font-size:11px;color:#b1d9c4'
        ));
      } else {
        box.append(el('div',
          'Transmissão não encontrada no catálogo do YouTube',
          'font-size:12px;color:#d6b5a2'
        ));
      }

      lista.append(box);
    }
  }

  let carregando = false;

  async function carregar() {
    if (carregando) return;

    carregando = true;
    aviso.textContent = 'Consultando calendário do STANLEY SPORTS...';
    lista.replaceChildren();

    try {
      const [resultados, lives] = await Promise.all([
        Promise.all(
          LIGAS.map(([codigo, nome]) => pegarLiga(codigo, nome))
        ),
        carregarLives()
      ]);

      const jogos = [];
      const ids = new Set();

      for (const r of resultados) {
        for (const e of r.eventos) {
          const g = converter(e, r.nome);

          if (g && !ids.has(g.id)) {
            ids.add(g.id);
            jogos.push(g);
          }
        }
      }

      jogos.sort((a, b) =>
        a.inicio.localeCompare(b.inicio)
      );

      renderizar(
        jogos,
        lives,
        resultados.filter(r => !r.ok).length
      );

    } catch (e) {
      aviso.textContent =
        'Erro ao consultar partidas: ' + e.message;
    } finally {
      carregando = false;
    }
  }
})();