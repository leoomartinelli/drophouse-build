/* Descarregador de Fotos - versao Web (SPA sem build) */
const $app = document.getElementById('app');
const $modal = document.getElementById('modal-root');
const S = { view: 'home', st: null, editId: null, form: null, sel: {}, origem: null, poll: null };

// ---------- utilidades ----------
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// ---------- icones (SVG de traco, 24x24): um conjunto so para o app inteiro ----------
const IC = {
  ant: '<path d="M15 18l-6-6 6-6"/>', prox: '<path d="M9 18l6-6-6-6"/>', baixo: '<path d="M6 9l6 6 6-6"/>',
  voltar: '<path d="M19 12H5M11 6l-6 6 6 6"/>', seguir: '<path d="M5 12h14M13 6l6 6-6 6"/>', cima: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  desfazer: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 010 11H11"/>', refazer: '<path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 000 11H13"/>',
  menos: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M8 11h6"/>', mais: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M8 11h6M11 8v6"/>',
  comparar: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M12 4v16"/><path d="M14.5 9h4M14.5 13h4"/>',
  copiar: '<rect x="9" y="9" width="12" height="12" rx="3"/><path d="M5 15V6a3 3 0 013-3h9"/>',
  colar: '<path d="M16 4h1a3 3 0 013 3v12a3 3 0 01-3 3H7a3 3 0 01-3-3V7a3 3 0 013-3h1"/><rect x="8" y="2" width="8" height="4" rx="1.5"/>',
  varias: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  zerar: '<path d="M3 12a9 9 0 109-9 9.7 9.7 0 00-6.7 2.8L3 8"/><path d="M3 3v5h5"/>',
  original: '<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/>',
  ok: '<path d="M20 6L9 17l-5-5"/>', orientacao: '<rect x="2.5" y="8" width="11" height="8" rx="1.5"/><rect x="16" y="3.5" width="6" height="17" rx="1.5"/>', cortar: '<path d="M6 2v14a2 2 0 002 2h14"/><path d="M18 22V8a2 2 0 00-2-2H2"/>',
  girar: '<path d="M21 12a9 9 0 11-3-6.7L21 8"/><path d="M21 3v5h-5"/>', lixo: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 12.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5l1-12.5"/>',
  add: '<path d="M12 5v14M5 12h14"/>', salvar: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M18 6L6 18M6 6l12 12"/>',
  teclado: '<rect x="2" y="6" width="20" height="12" rx="3"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
  conta: '<path d="M2 22l1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="M15 6l3-3a2.1 2.1 0 013 3l-3 3 1 1-2 2-6-6 2-2z"/>',
  chave: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.7 12.3L20 3M16 7l3 3"/>', lista: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
  relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', ajustes: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  power: '<path d="M12 3v9"/><path d="M18.4 6.6a9 9 0 11-12.8 0"/>', pasta: '<path d="M3 7.5A2.5 2.5 0 015.5 5H9l2 2.5h7.5A2.5 2.5 0 0121 10v7.5a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 17.5z"/>',
  nuvem: '<path d="M17.5 19H7a5 5 0 111-9.9A6 6 0 0119.5 11a4 4 0 01-2 8z"/>', enviar: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 20h14"/>',
  baixar: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M5 20h14"/>', pc: '<rect x="3" y="4" width="18" height="12" rx="3"/><path d="M8 20h8M12 16v4"/>',
  cartao: '<path d="M8 3h7l4 4v11a3 3 0 01-3 3H8a3 3 0 01-3-3V6a3 3 0 013-3z"/><path d="M9.5 7v2M12.5 7v2"/>', pessoa: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
  fotos: '<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/>', luz: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 000 17z" fill="currentColor"/>',
  celular: '<rect x="6" y="2" width="12" height="20" rx="3.5"/><path d="M11 18h2"/>', bandeira: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
  pulso: '<path d="M3 12h4l3-8 4 16 3-8h4"/>', lapis: '<path d="M4 20h4L19 9l-4-4L4 16z"/>', minimizar: '<path d="M6 12h12"/>', maximizar: '<rect x="5" y="5" width="14" height="14" rx="3.5"/>',
  parar: '<rect x="6" y="6" width="12" height="12" rx="2.5"/>',
  mais3: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  olho: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  olhoX: '<path d="M3 3l18 18"/><path d="M10.6 5.1A10.4 10.4 0 0112 5c6.4 0 10 7 10 7a17 17 0 01-3.2 4.2M6.6 6.6A17 17 0 002 12s3.6 7 10 7a9.9 9.9 0 005.4-1.6"/><path d="M9.9 9.9a3 3 0 004.2 4.2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>', lupa: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  alerta: '<path d="M10.3 4.3L2.6 17.5A2 2 0 004.3 20.5h15.4a2 2 0 001.7-3L13.7 4.3a2 2 0 00-3.4 0z"/><path d="M12 10v3.5M12 17h.01"/>',
  arquivo: '<path d="M14 3H8a3 3 0 00-3 3v12a3 3 0 003 3h8a3 3 0 003-3V8z"/><path d="M14 3v5h5"/>', pin: '<path d="M12 21s7-6.2 7-12a7 7 0 00-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  rede: '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v4M12 11.5l-5.5 5.5M12 11.5l5.5 5.5"/>',
};
const ic = (n, c = '') => `<svg class="ic ${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;
// bolinha de estado (ok, aviso, procurando...) no lugar dos emojis de status
const pt = c => `<i class="pt ${c || ''}"></i>`;
async function api(url, opts = {}) {
  // X-DropHouse: o servidor so aceita pedidos que mudam algo com este cabecalho (barra pedidos vindos de outros sites)
  const o = { method: opts.method || 'GET', headers: { 'X-DropHouse': '1' } };
  if (opts.body !== undefined) { o.body = JSON.stringify(opts.body); o.headers['Content-Type'] = 'application/json'; if (!opts.method) o.method = 'POST'; }
  const r = await fetch(url, o);
  let d = null; try { d = await r.json(); } catch (e) { }
  if (!r.ok) throw new Error((d && (d.detail || d.erro)) || ('Erro ' + r.status));
  return d;
}
// avisos rapidos: empilhados no rodape (varios seguidos nao se sobrepoem)
function toast(msg, err) {
  let pilha = document.getElementById('toasts');
  if (!pilha) { pilha = document.createElement('div'); pilha.id = 'toasts'; document.body.appendChild(pilha); }
  pilha.setAttribute('role', 'status'); pilha.setAttribute('aria-live', 'polite');   // leitor de tela anuncia os avisos
  // o mesmo aviso nao empilha (clicar varias vezes num preset so renova o que ja esta na tela)
  // e no maximo TOAST_MAX ficam visiveis: o mais antigo sai para o novo entrar
  const dur = err ? 6000 : 3500, cls = 'toast' + (err ? ' err' : '');
  let t = [...pilha.children].find(x => x.textContent === msg && x.className === cls);
  if (t) { clearTimeout(t._fim); pilha.appendChild(t); }
  else { t = document.createElement('div'); t.className = cls; t.textContent = msg; pilha.appendChild(t); }
  while (pilha.children.length > TOAST_MAX) { clearTimeout(pilha.firstElementChild._fim); pilha.firstElementChild.remove(); }
  t._fim = setTimeout(() => t.remove(), dur);
}
const TOAST_MAX = 3;
// janela = dialogo: o foco entra (na opcao segura), Tab fica dentro, Esc cancela e o foco volta para quem abriu.
// As teclas nao vazam para a tela de baixo (selecao de fotos e editor tem atalhos no documento inteiro).
function dialogo(bg, cancelar) {
  const caixa = bg.querySelector('.modal'), antes = document.activeElement;
  caixa.setAttribute('role', 'dialog'); caixa.setAttribute('aria-modal', 'true'); caixa.tabIndex = -1;
  const h = caixa.querySelector('h2'); if (h) { h.id = 'dlg-' + Math.random().toString(36).slice(2); caixa.setAttribute('aria-labelledby', h.id); }
  const focaveis = () => [...caixa.querySelectorAll('button:not([disabled]),input:not([disabled]),select,a[href]')].filter(e => e.offsetParent !== null);
  bg.addEventListener('keydown', e => {
    e.stopPropagation();
    if (e.key === 'Escape') { e.preventDefault(); cancelar(); return; }
    if (e.key !== 'Tab') return;
    const f = focaveis(); if (!f.length) return; const k = f.indexOf(document.activeElement);
    if (e.shiftKey && k <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && k === f.length - 1) { e.preventDefault(); f[0].focus(); }
  });
  new MutationObserver((_, o) => { if (!bg.isConnected) { o.disconnect(); if (antes && antes.isConnected && !document.querySelector('.modal-bg')) antes.focus(); } }).observe(bg.parentNode, { childList: true });
  requestAnimationFrame(() => (caixa.querySelector('[data-foco]') || focaveis()[0] || caixa).focus());
}
function modal(html, botoes, larga) {
  return new Promise(res => {
    const bg = document.createElement('div'); bg.className = 'modal-bg';
    bg.innerHTML = `<div class="modal ${larga ? 'larga' : ''}"><div class="mc">${html}</div><div class="btns"></div></div>`;
    const btns = bg.querySelector('.btns');
    // opcao segura: "continuar" (null), senao "nao" (false), senao a unica resposta; recebe o foco e e o que o Esc escolhe
    const seguro = botoes.find(b => b.v === null) || botoes.find(b => b.v === false) || botoes[botoes.length - 1];
    botoes.forEach(b => {
      const el = document.createElement('button'); el.textContent = b.t; if (b.c) el.className = b.c; if (b === seguro) el.dataset.foco = '';
      el.onclick = () => { bg.remove(); res(b.v); }; btns.appendChild(el);
    });
    $modal.appendChild(bg);
    dialogo(bg, () => { bg.remove(); res(seguro.v); });
  });
}
const alerta = (t, m) => modal(`<h2>${esc(t)}</h2>${esc(m)}`, [{ t: 'OK', v: true }]);
// perigo: o "sim" apaga ou encerra algo; fica vermelho em vez de lime
const confirmar = (t, m, sim = 'Sim', nao = 'Não', perigo) => modal(`<h2>${esc(t)}</h2>${esc(m)}`, [{ t: nao, v: false, c: 'cinza' }, { t: sim, v: true, c: perigo ? 'verm' : '' }]);
// alerta de erro: a caixa treme e os olhos ficam tristes
const alertaErro = (t, m) => modal(`${mascote('erro', 64)}<h2>${esc(t)}</h2>${esc(m)}`, [{ t: 'OK', v: true }]);

// ---------- formatos e nomes ----------
const fmtBytes = b => { if (!b) return '0 MB'; const u = ['B', 'KB', 'MB', 'GB', 'TB']; let k = 0; while (b >= 1024 && k < u.length - 1) { b /= 1024; k++; } return b.toLocaleString('pt-BR', { maximumFractionDigits: b < 10 && k > 1 ? 1 : 0 }) + ' ' + u[k]; };
const fmtNum = n => Number(n || 0).toLocaleString('pt-BR');
// nome de pessoa: "ana paula DE souza" -> "Ana Paula de Souza" (o Historico tinha "leo" e "Leo" como duas pessoas)
const MINUSCULAS = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
const normNome = s => String(s || '').trim().replace(/\s+/g, ' ').split(' ').map((p, k) => { const m = p.toLocaleLowerCase('pt-BR'); return k && MINUSCULAS.has(m) ? m : m.charAt(0).toLocaleUpperCase('pt-BR') + m.slice(1); }).join(' ');
const mesmoNome = (a, b) => normNome(a).toLocaleLowerCase('pt-BR') === normNome(b).toLocaleLowerCase('pt-BR');
// "Ana, Leo; Bia" colado de uma vez vira tres itens
const separarLista = s => String(s || '').split(/[,;\n]+/).map(x => x.trim()).filter(Boolean);
// caminho longo: so as ultimas partes, sem cortar palavra no meio (quebra so depois das barras)
const encurtaCaminho = (p, partes = 3) => { const s = String(p || ''), sep = s.includes('\\') ? '\\' : '/', v = s.split(/[\\/]/).filter(Boolean); return v.length > partes ? '…' + sep + v.slice(-partes).join(sep) : s; };
const caminhoHtml = p => esc(p).replace(/([\\/])/g, '$1<wbr>');
const abrirNo = /Mac/i.test(navigator.platform) ? 'Abrir no Finder' : /Win/i.test(navigator.platform) ? 'Abrir no Explorer' : 'Abrir na pasta';

// ---------- botao desabilitado sempre diz por que ----------
// travar(btn, 'motivo') desabilita e mostra o motivo numa linha logo abaixo (e no title/aria); travar(btn, '') libera.
// `onde`: elemento depois do qual a linha entra (padrao: a linha .row do botao, ou o proprio botao)
function travar(btn, motivo, onde) {
  if (!btn) return;
  const id = btn.id + '-motivo'; let m = document.getElementById(id);
  btn.disabled = !!motivo;
  if (motivo) {
    if (!m) { m = document.createElement('p'); m.id = id; m.className = 'motivo'; (onde || btn.closest('.row') || btn).insertAdjacentElement('afterend', m); }
    m.textContent = motivo; btn.title = motivo; btn.setAttribute('aria-describedby', id);
  } else { if (m) m.remove(); if (btn.title === btn.dataset.motivo) btn.removeAttribute('title'); btn.removeAttribute('aria-describedby'); }
  btn.dataset.motivo = motivo || '';
}

// ---------- validacao de formulario: erro embaixo do campo, borda vermelha, foco no campo ----------
// A linha do erro ja existe vazia no HTML (campoErro) com altura reservada: mostrar o erro nao empurra nada.
const campoErro = id => `<p class="erro-campo" id="${id}-erro" role="alert"></p>`;
function erroCampo(input, msg) {
  if (!input || !input.id) return false;
  const caixa = input.closest('.tags') || input;
  let m = document.getElementById(input.id + '-erro');
  if (!m && msg) { m = document.createElement('p'); m.id = input.id + '-erro'; m.className = 'erro-campo'; m.setAttribute('role', 'alert'); (input.closest('.row') || caixa).insertAdjacentElement('afterend', m); }
  if (m) m.textContent = msg || '';
  caixa.classList.toggle('invalido', !!msg);
  if (msg) { input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', m.id); input.focus(); }
  else input.removeAttribute('aria-invalid');
  return !msg;
}
// digitar de novo no campo tira o erro
document.addEventListener('input', e => { if (e.target.getAttribute && e.target.getAttribute('aria-invalid') === 'true') erroCampo(e.target, ''); });

// ---------- mascote: a caixa do logo em varios estados ----------
// Usa os gradientes e o recorte que ja estao no SVG do cabecalho (#dh-g1..g5, #dh-recorte): nada de <defs> repetido.
// Desempenho: corpo, olhos e "fotos" sao elementos de HTML por cima do desenho, entao o pulo, o tremor, o olhar e as
// fotos caindo rodam so na composicao (sem layout nem pintura por quadro); o SVG em si nunca anima.
// Animacoes de evento rodam uma vez (a classe sai no animationend).
let MASCOTE_CAIXA = '';
function mascote(estado, tam = 72) {
  // sem o quadrado menta atras, a caixa vai inteira: o recorte do logo deixava o fundo dela reto, parecendo cortado
  if (!MASCOTE_CAIXA) { const c = document.querySelector('.simbolo .dh-caixa svg'); MASCOTE_CAIXA = c ? c.innerHTML.replace(' clip-path="url(#dh-recorte)"', '') : ''; }
  // os olhos sao <i> de HTML por cima do desenho: olhar e piscar tambem so compoem
  return `<span class="mascote m-${estado}" style="--m:${tam}px" aria-hidden="true"><i class="m-foto"></i><i class="m-foto"></i><i class="m-foto"></i><span class="m-corpo"><svg viewBox="6 18 760 760">${MASCOTE_CAIXA}</svg><span class="m-olhos"><i class="m-olho"></i><i class="m-olho"></i></span></span></span>`;
}
// troca o estado sem recriar o no (o poll so mexe na classe)
function mascoteEstado(el, estado, umaVez) {
  if (!el) return;
  if (el._fim) { el.removeEventListener('animationend', el._fim); el._fim = null; }   // troca no meio: so vale a ultima
  el.className = `mascote m-${estado}`;
  if (umaVez) {
    void el.offsetWidth;
    el._fim = e => { if (e.target.closest('.mascote') !== el) return; el.removeEventListener('animationend', el._fim); el._fim = null; el.className = `mascote m-${umaVez}`; };
    el.addEventListener('animationend', el._fim);
  }
}
// confete em CSS puro: 6 pedacinhos que somem do DOM em 1 s
function confete(perto) {
  if (!perto || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.createElement('span'); c.className = 'confete'; c.setAttribute('aria-hidden', 'true');
  c.innerHTML = [0, 1, 2, 3, 4, 5].map(k => `<i style="--a:${k * 60 - 150}deg;--d:${k % 2 ? 46 : 62}px"></i>`).join('');
  perto.appendChild(c); setTimeout(() => c.remove(), 1000);
}
// aba escondida: todas as animacoes do mascote e do logo param
document.addEventListener('visibilitychange', () => document.body.classList.toggle('pausado', document.hidden));

// ---------- navegacao: Voltar volta para a tela de onde veio; Inicio vai direto ao Painel ----------
S.pilha = [];
function voltar() { S.view = S.pilha.pop() || 'home'; pararPoll(); render(); }
function irInicio() { S.pilha = []; S.view = 'home'; pararPoll(); render(); }
// telas com conteudo estreito: o logo do cabecalho acompanha a mesma largura
const TELAS_ESTREITAS = ['descarregar', 'predef'];

// ---------- aviso de reinicio (persistente, no canto) ----------
let $reinicio = null;
function avisoReinicio(mostrar) {
  if (!mostrar) { if ($reinicio) { $reinicio.remove(); $reinicio = null; } return; }
  if ($reinicio) return;
  $reinicio = document.createElement('div'); $reinicio.className = 'aviso-fixo'; $reinicio.setAttribute('role', 'status');
  $reinicio.innerHTML = `${ic('alerta')}<span>Nova versão instalada. Reinicie o DropHouse para aplicar.</span><button class="pq" id="rei-como">Como reiniciar</button>`;
  document.body.appendChild($reinicio);
  $reinicio.querySelector('#rei-como').onclick = async () => {
    const r = await modal(`<h2>Como reiniciar</h2>1. Clique em <b>Encerrar</b> (feche o programa neste computador).
2. Abra o DropHouse de novo pelo atalho de sempre (ou pelo rodar.sh / rodar.bat).

Envios ao Drive em andamento são interrompidos ao encerrar.`.replace(/\n/g, '<br>'), [{ t: 'Agora não', v: false, c: 'cinza' }, { t: 'Encerrar agora', v: true, c: 'verm' }]);
    if (r) encerrarPrograma(true);
  };
}
async function encerrarPrograma(jaConfirmado) {
  if (!jaConfirmado && !await confirmar('Encerrar programa', 'Fechar o DropHouse neste computador?\n\nEnvios ao Drive em andamento serão interrompidos. Para abrir de novo, clique no ícone do programa.', 'Encerrar', 'Cancelar', true)) return;
  try { await api('/api/encerrar', { body: {} }); } catch (e) { }
  pararPoll(); avisoReinicio(false);
  $app.innerHTML = `<div class="wrap"><div class="card vazio">${mascote('dormindo', 56)}<h2>Programa encerrado</h2><p class="mut">Pode fechar esta aba. Para abrir de novo, clique no ícone do DropHouse.</p></div></div>`;
  S.encerrado = true;
}

// seletor de pasta do servidor (o navegador nao enxerga o disco da maquina)
function escolherPasta(titulo, inicio) {
  return new Promise(async res => {
    const bg = document.createElement('div'); bg.className = 'modal-bg';
    bg.innerHTML = `<div class="modal larga"><h2>${esc(titulo)}</h2><div class="path" id="fs-p"></div>
      <div class="chips" id="fs-at"></div><div class="fs-list" id="fs-l"></div>
      <div class="btns"><button class="cinza pq" id="fs-new">${ic('add')}Nova pasta</button><span style="flex:1"></span>
      <button class="cinza" id="fs-c">Cancelar</button><button class="verde" id="fs-ok">Selecionar esta pasta</button></div></div>`;
    $modal.appendChild(bg);
    dialogo(bg, () => { bg.remove(); res(null); });
    let atual = inicio || '';
    const $ = id => bg.querySelector(id);
    async function ir(p) {
      try {
        const d = await api('/api/fs/list?path=' + encodeURIComponent(p || '')); atual = d.path;
        $('#fs-p').textContent = d.path;
        $('#fs-at').innerHTML = d.atalhos.map((a, i) => `<button type="button" class="chip" data-a="${i}">${ic('pin')}${esc(a.nome)}</button>`).join('');
        $('#fs-at').querySelectorAll('[data-a]').forEach(e => e.onclick = () => ir(d.atalhos[e.dataset.a].caminho));
        $('#fs-l').innerHTML = `<button type="button" data-p="${esc(d.parent)}">${ic('cima')}..</button>` + d.pastas.map(n => `<button type="button" data-n="${esc(n)}">${ic('pasta')}${esc(n)}</button>`).join('');
        $('#fs-l').querySelector('[data-p]').onclick = () => ir(d.parent);
        $('#fs-l').querySelectorAll('[data-n]').forEach(e => e.onclick = () => ir(d.path.replace(/[\\/]$/, '') + (d.path.includes('\\') ? '\\' : '/') + e.dataset.n));
      } catch (e) { toast(e.message, true); }
    }
    $('#fs-c').onclick = () => { bg.remove(); res(null); };
    $('#fs-ok').onclick = () => { bg.remove(); res(atual); };
    $('#fs-new').onclick = async () => {
      const nome = prompt('Nome da nova pasta:'); if (!nome) return;
      try { const d = await api('/api/fs/mkdir', { body: { path: atual, nome } }); ir(d.path); } catch (e) { toast(e.message, true); }
    };
    ir(inicio);
  });
}

async function carregar() { S.st = await api('/api/state'); const b = document.getElementById('banner'); const u = S.st.update;
  avisoReinicio(S.st.precisa_reiniciar);
  if (u && u.disponivel && u.url) { b.style.background = ''; b.classList.remove('hidden');   // programa instalado: baixa o novo instalador
    b.innerHTML = `${esc(u.msg)} <button id="b-up">${ic('baixar')}Baixar nova versão</button>`; document.getElementById('b-up').onclick = () => window.open(u.url, '_blank'); }
  else if (u && u.disponivel) { b.style.background = ''; b.classList.remove('hidden'); b.innerHTML = `${esc(u.msg)} <button id="b-up">Atualizar agora</button>`;
    document.getElementById('b-up').onclick = async () => { try { const r = await api('/api/update/aplicar', { body: {} }); toast(r.msg); b.classList.add('hidden'); } catch (e) { toast(e.message, true); } };
  } else b.classList.add('hidden'); }
function ir(v) { if (v !== S.view) S.pilha.push(S.view); S.view = v; pararPoll(); render(); }
// tela acesa enquanto copia (o computador nao dorme no meio). Todo poll que para (trocar de tela, Inicio, Voltar)
// solta a tela e devolve o titulo da aba: nada fica preso em "42% · DropHouse" com a tela acesa para sempre.
let travaTela = null;
const acenderTela = async () => { try { if (!travaTela && navigator.wakeLock) { travaTela = await navigator.wakeLock.request('screen'); travaTela.addEventListener('release', () => { travaTela = null; }); } } catch (e) { } };
const soltarTela = () => { if (travaTela) { travaTela.release().catch(() => { }); travaTela = null; } };
const TITULO = document.title;
// o navegador solta a tela sozinho quando a aba esconde; ao voltar, se ainda esta copiando, pede de novo
document.addEventListener('visibilitychange', () => { if (!document.hidden && S.view === 'descarregar' && S.wiz && S.wiz.step === 4 && S.poll) acenderTela(); });
function pararPoll() { if (S.poll) { clearInterval(S.poll); S.poll = null; } soltarTela(); document.title = TITULO; }
function iniciarPoll(fn, ms) { pararPoll(); S.poll = setInterval(fn, ms); }
async function render() {
  try { await carregar(); } catch (e) { $app.innerHTML = `<div class="wrap"><p class="bad">Servidor indisponível: ${esc(e.message)}</p></div>`; return; }
  if (S.st.servir_finalizado_remotamente) {
    await api('/api/ack-finalizado', { body: {} }); S.st.active_servir = null;
    await alerta('Servir finalizado', 'O computador Líder finalizou o Dia de Servir.\nSua estação foi desconectada automaticamente.'); S.view = 'home';
  }
  if (S.view === 'home' && (S.st.active_servir || S.avulso) && S.entrou) S.view = 'descarregar';
  document.body.dataset.largura = TELAS_ESTREITAS.includes(S.view) ? 'estreito' : 'largo';
  ({ home: vHome, descarregar: vDescarregar, historico: vHistorico, drive: vDrive, google: vGoogle, predef: vPredef }[S.view] || vHome)();
}

// cria no Drive as pastas de categoria do Servir (com a data de hoje) assim que ele comeca; nao bloqueia a tela
async function criarPastasDriveAuto(sv) {
  if (!sv || !sv.drive_criar_categorias || !(sv.pastas_predefinidas || []).length || !(sv.drive_folders || []).length) return;
  toast('Criando as pastas de categoria no Google Drive...');
  try {
    const r = (await api(`/api/servir/${sv.id}/drive-pastas`, { body: {} })).resultado, falhas = r.filter(x => !x.ok);
    if (falhas.length) toast(`Drive: ${falhas.length} de ${r.length} pastas com erro (${falhas[0].erro})`, true);
    else toast(`${[...new Set(r.map(x => x.pasta))].length} pasta(s) criadas no Drive e salvas em "Pastas do Google Drive" do Servir`);
  } catch (e) { toast('Pastas no Drive: ' + e.message, true); }
}

// ---------- painel de acompanhamento: QR code que abre o painel em qualquer celular da mesma rede ----------
async function mostrarQR() {
  let info; try { info = await api('/api/painel/info'); } catch (e) { return toast(e.message, true); }
  const bg = document.createElement('div'); bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal qr-modal"><h2>Painel de acompanhamento</h2>
    <p class="mut mini">Escaneie com um celular na <b>mesma rede</b> deste computador.</p>
    <div class="qr-box"><img id="qr-img" alt="QR code do painel"></div>
    <div class="path" id="qr-url" style="text-align:center"></div>
    ${info.ips.length > 1 ? `<p class="mut mini">Não abriu? Escolha a rede dos celulares:</p><div class="chips" id="qr-ips">${info.ips.map((ip, i) => `<button type="button" class="chip" data-i="${i}">${esc(ip)}</button>`).join('')}</div>` : ''}
    <div class="btns"><a id="qr-abrir" target="_blank" rel="noopener"><button class="cinza">Abrir painel aqui</button></a><button id="qr-ok">Fechar</button></div></div>`;
  $modal.appendChild(bg);
  const $ = x => bg.querySelector(x);
  const usa = i => {
    $('#qr-img').src = '/api/painel/qr.svg?ip=' + encodeURIComponent(info.ips[i]); $('#qr-url').textContent = info.urls[i]; $('#qr-abrir').href = info.urls[i];
    bg.querySelectorAll('#qr-ips [data-i]').forEach(c => c.classList.toggle('sel', +c.dataset.i === i));
  };
  bg.querySelectorAll('#qr-ips [data-i]').forEach(c => c.onclick = () => usa(+c.dataset.i));
  $('#qr-ok').onclick = () => bg.remove();
  dialogo(bg, () => bg.remove());
  usa(0);
}
// conta para o painel que este PC esta ocupado (e por quem); falha aqui nunca atrapalha o descarregamento
const avisarAtividade = voluntario => api('/api/atividade', { body: { acao: 'ocupar', voluntario } }).catch(() => { });

// ---------- predefinicoes de categorias: janela so de SELECAO (o cadastro fica na tela "Predefinições") ----------
async function abrirPredefinicoes(jaTem) {
  let lista; try { lista = await api('/api/predefinicoes'); } catch (e) { toast(e.message, true); return null; }
  return new Promise(res => {
    const bg = document.createElement('div'); bg.className = 'modal-bg';
    bg.innerHTML = `<div class="modal larga"><h2>Predefinições de categorias</h2>
      <div id="pd-corpo"></div><div class="btns"><button class="cinza" id="pd-x">Cancelar</button><button class="verde" id="pd-ok" disabled>Adicionar selecionadas</button></div></div>`;
    $modal.appendChild(bg);
    const sel = lista.map(() => new Set()), corpo = bg.querySelector('#pd-corpo'), ok = bg.querySelector('#pd-ok');
    function desenha() {
      corpo.innerHTML = lista.map((p, i) => {
        const livres = p.pastas.filter(n => !jaTem.includes(n)), marc = livres.filter(n => sel[i].has(n)).length;
        return `<div class="pd"><div class="pd-h"><label><input type="checkbox" data-p="${i}" ${livres.length && marc === livres.length ? 'checked' : ''} ${livres.length ? '' : 'disabled'}> <b>${esc(p.titulo)}</b></label></div>
          <div class="pd-c">${p.pastas.map(n => jaTem.includes(n) ? `<label class="mut"><input type="checkbox" checked disabled> ${esc(n)} <small>(já adicionada)</small></label>`
            : `<label><input type="checkbox" data-c="${i}|${esc(n)}" ${sel[i].has(n) ? 'checked' : ''}> ${esc(n)}</label>`).join('')}</div></div>`;
      }).join('') || '<p class="mut">Nenhuma predefinição criada.</p>';
      corpo.querySelectorAll('[data-p]').forEach(cb => {
        const i = +cb.dataset.p, livres = lista[i].pastas.filter(n => !jaTem.includes(n)), marc = livres.filter(n => sel[i].has(n)).length;
        cb.indeterminate = marc > 0 && marc < livres.length;
        cb.onchange = () => { sel[i] = new Set(cb.checked ? livres : []); desenha(); };
      });
      corpo.querySelectorAll('[data-c]').forEach(cb => cb.onchange = () => { const [i, n] = cb.dataset.c.split('|'); cb.checked ? sel[+i].add(n) : sel[+i].delete(n); desenha(); });
      const total = new Set(sel.flatMap(x => [...x])).size;
      ok.disabled = !total; ok.textContent = total ? `Adicionar ${total} selecionada(s)` : 'Adicionar selecionadas';
    }
    bg.querySelector('#pd-x').onclick = () => { bg.remove(); res(null); };
    ok.onclick = () => { const r = [...new Set(sel.flatMap(x => [...x]))]; bg.remove(); res(r); };
    dialogo(bg, () => { bg.remove(); res(null); });
    desenha();
  });
}

// ---------- tela de cadastro das predefinicoes (criar, editar, excluir) ----------
async function vPredef(cache) {
  // `cache`: lista ja carregada (redesenhos de edicao nao precisam buscar no servidor de novo)
  let lista = cache; if (!lista) { try { lista = await api('/api/predefinicoes'); } catch (e) { return alertaErro('Erro', e.message); } }
  const ed = S.pdEd || null;
  const salvar = async nova => { try { await api('/api/predefinicoes', { method: 'PUT', body: nova }); return true; } catch (e) { toast(e.message, true); return false; } };
  // chips da edicao: clicar no nome renomeia, x remove, arrastar reordena
  const chipsEd = () => ed.pastas.map((n, k) => `<span class="chip arrasta" draggable="true" data-k="${k}"><span class="pega" aria-hidden="true">⋮⋮</span><button type="button" class="chip-nome" data-ren="${k}" title="Clique para renomear">${esc(n)}</button><button type="button" class="chip-x" data-r="${k}" title="Remover" aria-label="Remover ${esc(n)}">${ic('x')}</button></span>`).join('');
  $app.innerHTML = `<div class="wrap"><div class="topbar"><div><h1>Predefinições</h1><div class="mut mini">Grupos de pastas de categoria para adicionar de uma vez</div></div><div class="acts"><button class="cinza" id="pr-v">${ic('voltar')}Voltar</button></div></div>
  ${ed ? `<div class="card"><h2>${ed.i === null ? 'Nova predefinição' : 'Editar predefinição'}</h2>
     <label for="pd-t">Título</label><input type="text" id="pd-t" value="${esc(ed.titulo)}" placeholder="Ex.: ELEVE">${campoErro('pd-t')}
     <label for="pd-n">Pastas${contador(ed.pastas.length)}</label>
     <div class="row"><div class="tags" id="pd-tags">${chipsEd()}<input type="text" id="pd-n" placeholder="${ed.pastas.length ? 'Adicionar mais…' : 'Nome da pasta (ou várias, separadas por vírgula)'}"></div><button class="fix" id="pd-add">Adicionar</button></div>${campoErro('pd-n')}
     <p class="mut mini">Clique num nome para renomear; arraste para mudar a ordem.</p>
     <div class="nav"><button class="cinza" id="pd-cancel">Cancelar</button><button class="verde" id="pd-save">Salvar predefinição</button></div></div>`
  : `${lista.map((p, i) => `<div class="pd"><div class="pd-h"><b>${esc(p.titulo)}</b><span><button class="pq cinza" data-e="${i}">Editar</button>${menuMais(`<button class="verm" data-x="${i}">${ic('lixo')}Excluir</button>`, 'Mais ações de ' + esc(p.titulo))}</span></div>
      <div class="chips">${p.pastas.map(n => `<span class="chip">${esc(n)}</span>`).join('')}</div></div>`).join('')
     || `<div class="card vazio">${mascote('dormindo', 56)}<h2>Nenhuma predefinição ainda</h2><p class="mut">Exemplo: <b>ELEVE</b> → Voltz, Bold, Burn, A3. No Painel inicial, o botão "Predefinições" adiciona o grupo inteiro de uma vez.</p>
        <button class="cinza" id="pd-exemplo">${ic('add')}Começar pelo exemplo</button></div>`}
     <button class="verde medio" id="pd-new" style="margin-top:12px">${ic('add')}Nova predefinição</button>`}</div>`;
  const q = x => $app.querySelector(x);
  q('#pr-v').onclick = () => { S.pdEd = null; voltar(); };
  if (ed) {
    const lerT = () => { ed.titulo = q('#pd-t').value; };
    const redesenha = async foco => { await vPredef(lista); if (foco) q(foco).focus(); };
    const add = (texto = q('#pd-n').value) => { lerT(); separarLista(texto).forEach(v => { if (!ed.pastas.some(x => x.toLocaleLowerCase('pt-BR') === v.toLocaleLowerCase('pt-BR'))) ed.pastas.push(v); }); redesenha('#pd-n'); };
    q('#pd-add').onclick = () => add();
    q('#pd-n').onkeydown = e => { if (e.key === 'Enter' || (e.key === ',' && e.target.value.trim())) { e.preventDefault(); add(); } else if (e.key === 'Backspace' && !e.target.value && ed.pastas.length) { lerT(); ed.pastas.pop(); redesenha('#pd-n'); } };
    q('#pd-n').onpaste = e => { const t = e.clipboardData.getData('text'); if (separarLista(t).length > 1) { e.preventDefault(); add(q('#pd-n').value + ',' + t); } };
    $app.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { lerT(); ed.pastas.splice(+b.dataset.r, 1); redesenha('#pd-n'); });
    // renomear no lugar: o nome vira um campo; Enter ou sair do campo grava, Esc desiste
    $app.querySelectorAll('[data-ren]').forEach(b => b.onclick = () => {
      const k = +b.dataset.ren, inp = document.createElement('input'); inp.type = 'text'; inp.value = ed.pastas[k]; inp.className = 'chip-edita'; inp.setAttribute('aria-label', 'Novo nome da pasta');
      b.replaceWith(inp); inp.focus(); inp.select();
      let feito = false;
      const fim = grava => { if (feito) return; feito = true; const v = inp.value.trim(); lerT(); if (grava && v && !ed.pastas.some((x, j) => j !== k && x.toLocaleLowerCase('pt-BR') === v.toLocaleLowerCase('pt-BR'))) ed.pastas[k] = v; redesenha(); };
      inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); fim(true); } else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); fim(false); } };
      inp.onblur = () => fim(true);
    });
    // arrastar para reordenar
    let de = null;
    $app.querySelectorAll('.chip.arrasta').forEach(ch => {
      ch.ondragstart = e => { de = +ch.dataset.k; ch.classList.add('arrastando'); e.dataTransfer.effectAllowed = 'move'; };
      ch.ondragend = () => ch.classList.remove('arrastando');
      ch.ondragover = e => { e.preventDefault(); ch.classList.add('alvo'); };
      ch.ondragleave = () => ch.classList.remove('alvo');
      ch.ondrop = e => { e.preventDefault(); const para = +ch.dataset.k; if (de === null || de === para) return; lerT(); const [m] = ed.pastas.splice(de, 1); ed.pastas.splice(para, 0, m); de = null; redesenha(); };
    });
    q('#pd-tags').onclick = e => { if (e.target.id === 'pd-tags') q('#pd-n').focus(); };
    q('#pd-cancel').onclick = () => { S.pdEd = null; vPredef(lista); };
    q('#pd-save').onclick = async () => {
      lerT(); separarLista(q('#pd-n').value).forEach(v => { if (!ed.pastas.includes(v)) ed.pastas.push(v); });
      if (!ed.titulo.trim()) return erroCampo(q('#pd-t'), 'Dê um título à predefinição.');
      if (!ed.pastas.length) return erroCampo(q('#pd-n'), 'Adicione pelo menos uma pasta.');
      const nova = lista.map(x => ({ ...x })), item = { titulo: ed.titulo.trim(), pastas: ed.pastas };
      if (ed.i === null) nova.push(item); else nova[ed.i] = item;
      if (await salvar(nova)) { S.pdEd = null; toast('Predefinição salva!'); vPredef(); }
    };
  } else {
    q('#pd-new').onclick = () => { S.pdEd = { i: null, titulo: '', pastas: [] }; vPredef(lista); };
    if (q('#pd-exemplo')) q('#pd-exemplo').onclick = () => { S.pdEd = { i: null, titulo: 'ELEVE', pastas: ['Voltz', 'Bold', 'Burn', 'A3'] }; vPredef(lista); };
    $app.querySelectorAll('[data-e]').forEach(b => b.onclick = () => { const p = lista[+b.dataset.e]; S.pdEd = { i: +b.dataset.e, titulo: p.titulo, pastas: [...p.pastas] }; vPredef(lista); });
    $app.querySelectorAll('[data-x]').forEach(b => b.onclick = async () => {
      const p = lista[+b.dataset.x];
      if (await confirmar('Excluir predefinição', `Excluir a predefinição "${p.titulo}"?\n\nIsso não apaga nenhuma pasta já criada.`, 'Excluir', 'Cancelar', true) && await salvar(lista.filter((_, k) => k !== +b.dataset.x))) vPredef();
    });
  }
}

// ---------- HOME ----------
// caixa de texto com os itens ja adicionados dentro dela (voluntarios, categorias); o x de cada um usa data-<attr>
const campoTags = (id, attr, lista, ph) => `<div class="tags">${lista.map((v, i) => `<span class="chip">${esc(v)} <button type="button" class="chip-x" data-${attr}="${i}" title="Remover" aria-label="Remover ${esc(v)}">${ic('x')}</button></span>`).join('')}<input type="text" id="${id}" placeholder="${lista.length ? 'Adicionar mais…' : ph}"></div>`;
const contador = n => n ? ` <span class="conta">${n}</span>` : '';
// menu "⋯" (acoes secundarias de um item); fecha ao clicar fora
const menuMais = (itens, rotulo = 'Mais ações') => `<details class="mais"><summary class="so-ic" title="${rotulo}" aria-label="${rotulo}">${ic('mais3')}</summary><div class="mais-lista">${itens}</div></details>`;
document.addEventListener('click', e => document.querySelectorAll('details.mais[open]').forEach(d => { if (!d.contains(e.target)) d.open = false; }));
function formVazio() { return { nome: '', voluntarios: [], pastas: [], drives: [], local: '', criarDrive: false }; }

// card "Rede local": desenhado sozinho, para o poll atualizar so ele (sem mexer no formulario nem no foco)
function cardRede(st) {
  const r = st.rede;
  return `<h2>Rede local (várias estações)</h2>
     <div class="row"><select id="n-modo" aria-label="Papel deste computador na rede"><option value="lider" ${r.modo === 'lider' ? 'selected' : ''}>Estação Líder</option><option value="auxiliar" ${r.modo === 'auxiliar' ? 'selected' : ''}>Estação Auxiliar</option></select><button class="fix cinza" id="n-rein">Reiniciar rede</button></div>
     <p class="mut mini">Este computador: ${esc(r.ip)}:${r.porta}</p>
     ${r.modo === 'lider' ? `<h3>Estações conectadas</h3>${r.auxiliares.map(a => `<div class="item"><span>${ic('pc')} ${esc(a.nome)} (${esc(a.ip)}) <span class="mini ${a.versao === st.versao ? 'mut' : 'warn'}">${a.versao ? 'v' + esc(a.versao) : 'versão desconhecida'}${a.versao === st.versao ? '' : ' · diferente deste PC (v' + esc(st.versao) + ') — atualize'}</span></span><span class="ok mini">${pt('ok')}Conectado</span></div>`).join('')
        || '<p class="mut mini">Nenhuma estação conectada. Em outro computador da mesma rede, abra o DropHouse e escolha <b>Estação Auxiliar</b>.</p>'}`
      : (r.lider ? `<p class="ok">${pt('ok')}Líder encontrado</p><p>Evento: <b>${esc(r.lider.nome_evento)}</b><br><span class="mut mini">Líder IP: ${esc(r.lider.ip)}:${r.lider.port}</span></p><button class="verde" id="n-sync">${ic('link')}Conectar e sincronizar</button>`
        : `<p class="warn">${pt('busca')}Procurando o Líder na rede local…</p>`)}`;
}
function ligarRede(caixa, aoMudarModo) {
  const q = s => caixa.querySelector(s);
  q('#n-modo').onchange = async e => {
    const novo = e.target.value, antigo = novo === 'lider' ? 'auxiliar' : 'lider';
    const texto = novo === 'auxiliar' ? 'Como auxiliar, este computador não cria Dias de Servir: ele recebe o Servir da estação Líder.' : 'Como Líder, este computador cria o Dia de Servir e transmite para as estações auxiliares.';
    if (!await confirmar(`Mudar para ${novo === 'lider' ? 'Estação Líder' : 'Estação Auxiliar'}?`, texto, 'Mudar', 'Cancelar')) { e.target.value = antigo; return; }
    await api('/api/rede/modo', { body: { modo: novo } }); aoMudarModo();
  };
  q('#n-rein').onclick = async () => { await api('/api/rede/reiniciar', { body: {} }); toast('Rede local reiniciada.'); await carregar(); caixa.innerHTML = cardRede(S.st); ligarRede(caixa, aoMudarModo); };
  const sync = q('#n-sync'); if (sync) sync.onclick = async () => { try { await api('/api/rede/sincronizar', { body: {} }); S.entrou = true; ir('descarregar'); } catch (e) { alertaErro('Erro de sincronização', e.message); } };
}

async function vHome() {
  const st = S.st; S.entrou = false; S.avulso = false;
  if (!S.form) S.form = formVazio();
  const dias = await api('/api/servir'); const f = S.form; const editando = !!S.editId;
  const aux = st.rede.modo === 'auxiliar';   // estacao auxiliar: o Dia de Servir e criado so no Lider e chega por "Conectar e sincronizar"
  if (aux) S.editId = null;
  const sv = st.active_servir, g = st.google || {};
  // o formulario fica aberto quando ainda nao ha nenhum Servir (ou quando esta editando / ja tem algo digitado)
  const temAlgo = f.nome || f.voluntarios.length || f.pastas.length || f.drives.length || f.local;
  const formAberto = editando || !dias.length || temAlgo || S.formAberto;
  const gTitulo = g.token ? 'Conta Google conectada' : g.credenciais ? 'Google sem login' : 'Google não configurado';
  $app.innerHTML = `<div class="wrap">
  <div class="topbar"><div><h1>Painel inicial</h1><div class="mut mini">versão ${esc(st.versao)}</div></div>
   <div class="acts"><button class="cinza" data-go="google" title="${gTitulo}">${ic('chave')}Login Google<i class="pt ${g.token ? 'ok' : 'warn'}" aria-label="${gTitulo}"></i></button><button class="cinza" data-go="predef">${ic('lista')}Predefinições</button><button class="cinza" data-go="historico">${ic('relogio')}Histórico</button><button class="cinza" data-go="drive">${ic('ajustes')}Config Drive</button>
    <span class="acts-sep" aria-hidden="true"></span>
    <button class="verm so-ic b-sair so-largo" title="Encerrar o programa neste computador" aria-label="Encerrar o programa">${ic('power')}</button>
    ${menuMais(`<button class="verm b-sair">${ic('power')}Encerrar programa</button>`, 'Mais opções')}</div></div>
  ${sv ? `<div class="card destaque"><div><span class="eyebrow">Servir ativo</span><h2>${esc(sv.nome)}</h2><p class="mut">${esc(sv.data_criacao || '')} · ${sv.voluntarios.length} voluntário(s)</p></div>
     <button class="verde medio" id="b-continuar">${ic('baixar')}Descarregar fotos</button></div>` : ''}
  <div class="home-grid">
    ${aux ? `<div class="card h-form"><h2>Estação auxiliar</h2>
     <p class="mut">O Dia de Servir é criado na <b>estação Líder</b>. Quando ela aparecer em "Rede local", clique em <b>Conectar e sincronizar</b>.</p>
     <button class="cinza pq avulso b-avulso">Modo avulso (sem Dia de Servir)</button></div>`
    : `<details class="card dobra h-form" id="f-card" ${formAberto ? 'open' : ''}><summary><h2 class="${editando ? 'warn' : 'ok'}">${ic('add')}${editando ? 'Editando Dia do Servir' : 'Criar novo Dia do Servir'}</h2>
       <span class="dobra-acoes"><button type="button" class="fantasma pq avulso-fechado b-avulso">Modo avulso</button>${ic('baixo', 'seta')}</span></summary>
     <div class="form-cols"><div>
     <label for="f-nome">Nome do Servir</label><input type="text" id="f-nome" value="${esc(f.nome)}" placeholder="Ex.: Culto de Domingo">${campoErro('f-nome')}
     <label for="f-vol">Voluntários (fotógrafos)${contador(f.voluntarios.length)}</label>
     <div class="row">${campoTags('f-vol', 'rv', f.voluntarios, 'Nome (ou vários, separados por vírgula)')}<button class="fix" id="a-vol">Adicionar</button></div>${campoErro('f-vol')}
     <label for="f-pasta">Pastas de categoria (opcional)${contador(f.pastas.length)}</label>
     <div class="row">${campoTags('f-pasta', 'rp', f.pastas, 'Ex.: Louvor, Pregação')}<button class="fix" id="a-pasta">Adicionar</button><button class="fix cinza" id="a-pred" title="Adicionar um grupo de categorias pronto">${ic('lista')}Predefinições</button></div>
     </div><div>
     <label for="f-dl">Pastas do Google Drive (opcional)${contador(f.drives.length)}</label>
     <input type="text" id="f-dl" placeholder="Link da pasta do Drive">
     <div class="row" style="margin-top:8px"><input type="text" id="f-dn" aria-label="Nome da pasta do Drive (opcional)" placeholder="Nome (opcional)"><button class="fix" id="a-dr">Adicionar</button></div>
     ${f.drives.map((d, i) => `<div class="item"><span class="t">${esc(d.nome)}${d.auto ? ' <span class="chip mini">criada automaticamente</span>' : ''}<br><span class="mut mini">${esc(d.link)}</span></span><button class="verm pq" data-rd="${i}">Remover</button></div>`).join('')}
     <label class="check"><input type="checkbox" id="f-cdrive" ${f.criarDrive ? 'checked' : ''}><span>Criar as pastas de categoria dentro do Drive</span></label>
     <label for="p-local">Pasta local do evento (opcional)</label>
     <div class="row"><div class="campo-lido ${f.local ? '' : 'sem-valor'}" title="${esc(f.local)}">${f.local ? ic('pasta') + `<span>${caminhoHtml(encurtaCaminho(f.local))}</span>` : 'Padrão: pasta do aplicativo'}</div>${f.local ? `<button class="fix cinza so-ic" id="l-limpa" title="Voltar para a pasta padrão" aria-label="Voltar para a pasta padrão">${ic('x')}</button>` : ''}<button class="fix cinza" id="p-local">Procurar</button></div>
     </div></div>
     <div class="form-acoes"><button class="verde medio" id="b-salvar">${editando ? 'Salvar alterações' : 'Criar e ativar Servir'}</button>${editando ? '<button class="cinza medio" id="b-canc">Cancelar</button>' : ''}
     <span class="acts-sep"></span><button class="cinza pq b-avulso">Modo avulso (sem Dia de Servir)</button></div>
    </details>`}
    <div class="card h-dias"><h2>Dias de Servir anteriores</h2>
     ${dias.slice().reverse().map(d => `<div class="item ${sv && sv.id === d.id ? 'ativo' : ''}"><span class="t"><b>${esc(d.nome)}</b><br><span class="mut mini">${esc(d.data_criacao || '')} · ${d.voluntarios.length} voluntário(s)</span></span>
       ${sv && sv.id === d.id ? '<span class="chip mini sel">Ativo</span>' : `<button class="verde pq" data-at="${esc(d.id)}">Ativar</button>`}${menuMais(`${aux ? '' : `<button data-ed="${esc(d.id)}">${ic('ajustes')}Editar</button>`}<button class="verm" data-ex="${esc(d.id)}">${ic('lixo')}Excluir</button>`, 'Mais ações de ' + esc(d.nome))}</div>`).join('')
       || `<div class="vazio">${mascote('dormindo', 56)}<p class="mut">Nenhum Dia de Servir criado ainda.</p></div>`}
    </div>
    <div class="card h-rede" id="c-rede">${cardRede(st)}</div></div></div>`;
  const q = s => $app.querySelector(s), qa = s => $app.querySelectorAll(s);
  const ler = () => { if (aux) return; f.nome = q('#f-nome').value; f.criarDrive = q('#f-cdrive').checked; };
  qa('[data-go]').forEach(b => b.onclick = () => ir(b.dataset.go));
  qa('.b-sair').forEach(b => b.onclick = () => encerrarPrograma());
  if (q('#b-continuar')) q('#b-continuar').onclick = () => { S.entrou = true; ir('descarregar'); };
  if (!aux) {   // formulario de criar/editar Servir (nao existe na estacao auxiliar)
  // so o clique da pessoa conta (o navegador tambem dispara 'toggle' ao desenhar o <details> ja aberto)
  q('#f-card > summary').addEventListener('click', () => { S.formAberto = !q('#f-card').open; });
  // campos com chips: Enter ou virgula adicionam; colar "Ana, Leo, Bia" cria tres; Backspace no vazio tira o ultimo
  const tags = (id, lista, nomes) => {
    const el = () => q('#' + id);
    const adicionar = async (texto = el().value) => {
      ler(); let novos = 0;
      separarLista(texto).forEach(v => { if (nomes) v = normNome(v); if (v && !lista.some(x => nomes ? mesmoNome(x, v) : x.toLocaleLowerCase('pt-BR') === v.toLocaleLowerCase('pt-BR'))) { lista.push(v); novos++; } });
      if (!novos && texto.trim()) { el().value = ''; return toast('Esse nome já está na lista.'); }
      await vHome(); el().focus();
    };
    el().onkeydown = async e => {
      if (e.key === 'Enter' || (e.key === ',' && el().value.trim())) { e.preventDefault(); adicionar(); }
      else if (e.key === 'Backspace' && !e.target.value && lista.length) { ler(); lista.pop(); await vHome(); el().focus(); }
    };
    el().onpaste = e => { const t = (e.clipboardData || window.clipboardData).getData('text'); if (separarLista(t).length > 1) { e.preventDefault(); adicionar(el().value + ',' + t); } };
    el().closest('.tags').onclick = e => { if (e.target.classList.contains('tags')) el().focus(); };
    return () => adicionar();
  };
  q('#a-vol').onclick = tags('f-vol', f.voluntarios, true);
  q('#a-pasta').onclick = tags('f-pasta', f.pastas, false);
  q('#a-pred').onclick = async () => { ler(); const novas = await abrirPredefinicoes(f.pastas); if (novas) novas.forEach(n => { if (!f.pastas.includes(n)) f.pastas.push(n); }); vHome(); };
  const addDrive = async () => {
    ler(); const link = q('#f-dl').value.trim(); let nome = q('#f-dn').value.trim();
    if (!link) return erroCampo(q('#f-dl'), 'Cole o link da pasta do Drive.');
    if (!nome) { try { nome = (await api('/api/drive/nome-pasta?link=' + encodeURIComponent(link))).nome || ''; } catch (e) { } }
    f.drives.push({ link, nome: nome || 'Pasta do Google Drive' }); vHome();
  };
  q('#a-dr').onclick = addDrive; q('#f-dl').onkeydown = q('#f-dn').onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); addDrive(); } };
  qa('[data-rv]').forEach(b => b.onclick = () => { ler(); f.voluntarios.splice(b.dataset.rv, 1); vHome(); });
  qa('[data-rp]').forEach(b => b.onclick = () => { ler(); f.pastas.splice(b.dataset.rp, 1); vHome(); });
  qa('[data-rd]').forEach(b => b.onclick = () => { ler(); f.drives.splice(b.dataset.rd, 1); vHome(); });
  q('#p-local').onclick = async () => { ler(); const p = await escolherPasta('Pasta local do evento', f.local); if (p) { f.local = p; vHome(); } };
  if (q('#l-limpa')) q('#l-limpa').onclick = () => { ler(); f.local = ''; vHome(); };
  q('#b-salvar').onclick = async () => {
    ler();
    const pendVol = q('#f-vol').value.trim(); if (pendVol) separarLista(pendVol).map(normNome).forEach(v => { if (!f.voluntarios.some(x => mesmoNome(x, v))) f.voluntarios.push(v); });
    const pend = q('#f-dl').value.trim();
    if (pend && !f.drives.some(d => d.link === pend)) f.drives.push({ link: pend, nome: q('#f-dn').value.trim() || 'Pasta do Google Drive' });
    if (!f.nome.trim()) return erroCampo(q('#f-nome'), 'Dê um nome ao Servir.');
    if (/[\\/:*?"<>|]/.test(f.nome)) return erroCampo(q('#f-nome'), 'O nome não pode ter / \\ : * ? " < > |');
    if (!f.voluntarios.length) return erroCampo(q('#f-vol'), 'Adicione pelo menos um voluntário.');
    const body = { nome: f.nome.trim(), voluntarios: f.voluntarios, pastas_predefinidas: f.pastas, drive_folders: f.drives, local_path: f.local, drive_criar_categorias: f.criarDrive };
    try {
      const querDrive = f.criarDrive && f.drives.length && f.pastas.length;
      if (f.criarDrive && !querDrive) toast('Para criar as pastas no Drive, informe a pasta do Drive e ao menos uma pasta de categoria.', true);
      const sv = editando ? await api('/api/servir/' + S.editId, { method: 'PUT', body }) : await api('/api/servir', { body });
      criarPastasDriveAuto(sv);
      if (editando) { toast('Dia do Servir editado.'); S.editId = null; S.form = formVazio(); vHome(); }
      else { S.form = formVazio(); S.entrou = true; S.qr = true; ir('descarregar'); }
    } catch (e) { toast(e.message, true); }
  };
  if (editando) q('#b-canc').onclick = () => { S.editId = null; S.form = formVazio(); vHome(); };
  }
  qa('[data-at]').forEach(b => b.onclick = async () => { try { const sv = await api('/api/servir/' + b.dataset.at + '/ativar', { body: {} }); criarPastasDriveAuto(sv); S.entrou = true; S.qr = true; ir('descarregar'); } catch (e) { toast(e.message, true); } });
  qa('[data-ed]').forEach(b => b.onclick = () => {
    const d = dias.find(x => x.id === b.dataset.ed); S.editId = d.id;
    S.form = { nome: d.nome, voluntarios: [...d.voluntarios], pastas: [...(d.pastas_predefinidas || [])], drives: JSON.parse(JSON.stringify(d.drive_folders || [])), local: d.local_path || '', criarDrive: !!d.drive_criar_categorias };
    vHome(); window.scrollTo(0, 0);
  });
  qa('[data-ex]').forEach(b => b.onclick = async () => {
    const d = dias.find(x => x.id === b.dataset.ex);
    if (await confirmar('Excluir Dia de Servir', `Excluir o Dia de Servir "${d.nome}"?\n\nSai só a configuração do painel; nenhuma foto salva é apagada.`, 'Excluir', 'Cancelar', true)) {
      await api('/api/servir/' + d.id, { method: 'DELETE' }); vHome();
    }
  });
  // dois botoes (na barra fechada e embaixo do "Criar"): o da barra nao pode abrir/fechar o formulario
  qa('.b-avulso').forEach(b => b.onclick = async e => { e.preventDefault(); e.stopPropagation(); await api('/api/avulso', { body: {} }); S.avulso = true; S.entrou = true; ir('descarregar'); });
  const caixaRede = q('#c-rede');
  ligarRede(caixaRede, async () => { ler(); await carregar(); vHome(); });
  // a Rede local se atualiza sozinha; so o card dela e redesenhado (o que esta sendo digitado no formulario fica intacto)
  iniciarPoll(async () => {
    if (S.view !== 'home' || !caixaRede.isConnected) return;
    const n = await api('/api/state');
    if (n.servir_finalizado_remotamente) { ler(); return render(); }
    const chave = JSON.stringify([n.rede.modo, n.rede.lider, n.rede.auxiliares]);
    if (S.chave !== undefined && S.chave !== chave && !caixaRede.contains(document.activeElement)) { S.st = n; caixaRede.innerHTML = cardRede(n); ligarRede(caixaRede, async () => { ler(); await carregar(); vHome(); }); }
    S.chave = chave;
  }, 3000);
}

// ---------- DESCARREGAMENTO (assistente passo a passo) ----------
const PASSOS = ['Origem', 'Fotógrafo', 'Destino', 'Copiando', 'Finalizar'];
async function vDescarregar() {
  const st = S.st, sv = st.active_servir;
  S.entrou = true; S.avulso = !sv;
  const W = S.wiz || (S.wiz = { step: 1, pastas: [] });
  const tr = await api('/api/transferencia/status');
  if (tr.estado === 'rodando') W.step = 4;
  else if (tr.estado === 'concluido' && st.transferidas > 0) W.step = 5;
  else if (W.step >= 4) W.step = sv ? 2 : 3;
  if (sv && W.step === 3) W.step = 2;
  if (W.step !== 4) { soltarTela(); document.title = TITULO; }
  // voltou depois de recarregar a pagina: o resumo vem do servidor (o que foi copiado, de onde, por quem e para onde)
  const R = tr.resumo || {};
  if (W.step >= 4 && R.fotografo) { if (!W.pastas.length) W.pastas = R.pastas || []; if (!S.oCam) S.oCam = R.origem; if (!S.finalPath) S.finalPath = R.destino; W.fotografo = R.fotografo; }
  const nP = k => (sv && k > 3 ? k - 1 : k);   // numero exibido do passo
  // presets para aplicar em todas as fotos direto da tela de concluido (sem abrir o editor)
  let presets = [];
  if (W.step === 5 && st.editor_disponivel && st.transferidas) { try { presets = (await api('/api/editor-predefinicoes')).predefinicoes; } catch (e) { } }

  // opcoes de destino local e de Drive
  const optsDest = []; if (sv && sv.local_path) optsDest.push({ r: 'Pasta do Servir: ' + (sv.local_nome || sv.local_path), p: sv.local_path });
  optsDest.push({ r: 'Pasta do Aplicativo (Padrão)', p: st.destino_padrao });
  st.pastas_local.forEach(p => optsDest.push({ r: p.nome, p: p.caminho }));
  if (!S.sel.destR || !optsDest.concat([{ r: 'Escolher pasta personalizada...' }]).some(o => o.r === S.sel.destR)) { S.sel.destR = optsDest[0].r; S.sel.destP = optsDest[0].p; }
  if (sv) { S.sel.destR = optsDest[0].r; S.sel.destP = optsDest[0].p; }
  const optsDrive = []; const dfs = sv ? (sv.drive_folders && sv.drive_folders.length ? sv.drive_folders : (sv.drive_link ? [{ link: sv.drive_link, nome: sv.drive_nome || 'Configurada' }] : [])) : [];
  dfs.forEach(d => optsDrive.push({ r: 'Pasta do Servir: ' + d.nome, l: d.link }));
  optsDrive.push({ r: 'Raiz do Google Drive (Padrão)', l: '' }); st.pastas_drive.forEach(p => optsDrive.push({ r: p.nome, l: p.link }));
  if (!S.sel.drive || !optsDrive.some(o => o.r === S.sel.drive)) S.sel.drive = optsDrive[0].r;
  if (sv && W.step === 5 && !S.sel.driveManual && S.sel.cat && S.sel.cat !== 'Raiz (Nenhuma)') {   // sugere a pasta do Drive da categoria usada
    const sug = optsDrive.map(o => o.r).filter(r => r.startsWith(`Pasta do Servir: ${S.sel.cat} `)).sort().pop(); if (sug) S.sel.drive = sug;
  }
  const cats = sv ? [...(sv.pastas_predefinidas || []), 'Raiz (Nenhuma)'] : [];
  if (sv) { if (!cats.includes(S.sel.cat)) S.sel.cat = cats[0]; if (!sv.voluntarios.includes(S.sel.fot) && S.sel.fot !== 'Outro...') S.sel.fot = sv.voluntarios[0]; }
  if (S.sel.sub === undefined) S.sel.sub = true;
  // sugestoes de nome no modo avulso: quem ja descarregou neste computador (sem repetir "leo" e "Leo")
  let sugestoes = [];
  if (!sv && W.step === 2) { try { (await api('/api/historico')).forEach(h => { if (h.fotografo && !sugestoes.some(n => mesmoNome(n, h.fotografo))) sugestoes.push(normNome(h.fotografo)); }); } catch (e) { } }

  const nomeFot = () => normNome(sv ? (S.sel.fot === 'Outro...' ? (S.sel.outro || '') : S.sel.fot) : (S.sel.nome || ''));
  const nomeOk = () => { const n = nomeFot(); return n && !/[\\/:*?"<>|]/.test(n) && n !== '.' && n !== '..'; };
  const catAtual = () => sv ? S.sel.cat : 'Raiz (Nenhuma)';
  const subpasta = () => sv ? true : !!S.sel.sub;
  // parcial: a contagem parou no teto (HD externo inteiro); o numero e o minimo
  const previaTexto = p => p && p.fotos ? `≈ ${fmtNum(p.fotos)}${p.parcial ? '+' : ''} foto(s) · ${fmtBytes(p.bytes)}${p.parcial ? '+' : ''}${p.tipos.length ? ' · ' + p.tipos.join(' + ') : ''}` : '';

  // --- cabecalho + indicador de passos (passos ja feitos sao clicaveis para voltar, enquanto nao comecou a copiar) ---
  const editavel = W.step <= 3;
  const passosVis = sv ? PASSOS.filter((_, i) => i !== 2) : PASSOS, atual = nP(W.step);
  const realDe = k => (sv && k >= 3 ? k + 1 : k);
  const stepper = `<div class="stepper">${passosVis.map((n, i) => { const k = i + 1, feito = k < atual, ir = feito && editavel;
    return `<${ir ? `button type="button" data-ed="${realDe(k)}" title="Voltar para ${n}"` : 'div'} class="stp ${feito ? 'done' : k === atual ? 'cur' : ''}"><span>${feito ? ic('ok') : k}</span><small>${n}</small></${ir ? 'button' : 'div'}>`; }).join('<i></i>')}</div>`;
  // resumo do que ja foi escolhido; linha sem dado nao aparece
  const resumos = [];
  if (W.step > 1 && (S.oCam || W.pastas.length)) resumos.push({ k: 1, t: `${ic('cartao')}<span>${[S.oCam ? esc(encurtaCaminho(S.oCam, 2)) : '', W.pastas.length ? `${W.pastas.length} pasta(s)` : '', previaTexto(W.previa)].filter(Boolean).join(' · ')}</span>` });
  const fotResumo = W.step >= 4 && W.fotografo ? W.fotografo : nomeFot();
  if (W.step > 2 && fotResumo) resumos.push({ k: 2, t: `${ic('pessoa')}<span><b>${esc(fotResumo)}</b>${sv ? ' · ' + esc(catAtual()) : ''}</span>` });
  const destResumo = S.finalPath || S.sel.destP;
  if (W.step > 3 && destResumo) resumos.push({ k: 3, t: `${ic('pasta')}<span class="mini" title="${esc(destResumo)}">${caminhoHtml(encurtaCaminho(destResumo))}</span>` });

  let corpo = '';
  if (W.step === 1) corpo = `<h2>Passo 1 · De onde vêm as fotos?</h2>
    <div id="o-espera" class="vazio hidden">${mascote('espera', 72)}<p class="mut">Insira o cartão SD no computador.</p></div>
    <div id="o-status"></div><div id="o-cand" class="volumes"></div><div class="checks hidden" id="o-lista"></div>${campoErro('o-lista')}
    <p class="previa mut" id="o-previa"></p>
    <div class="row" style="margin-top:4px"><button class="cinza" id="o-man">${ic('pasta')}Escolher outra pasta de origem</button><button class="cinza fix" id="o-open">${ic('pasta')}${abrirNo}</button></div>
    <div class="nav"><span></span><button class="verde" id="w-next">Continuar${ic('seguir')}</button></div>`;
  else if (W.step === 2) corpo = `<h2>Passo 2 · Quem está descarregando?</h2>
    ${sv ? `<span class="rotulo" id="s-fot-r">Fotógrafo (voluntário)</span>
      <div class="chips escolha" role="radiogroup" aria-labelledby="s-fot-r">${sv.voluntarios.concat('Outro...').map(v => `<button type="button" role="radio" class="chip ${S.sel.fot === v ? 'sel' : ''}" aria-checked="${S.sel.fot === v}" data-fot="${esc(v)}">${v === 'Outro...' ? ic('add') + 'Outro' : esc(v)}</button>`).join('')}</div>
      <input type="text" id="s-outro" aria-label="Nome do fotógrafo" placeholder="Digite o nome do fotógrafo" value="${esc(S.sel.outro || '')}" class="${S.sel.fot === 'Outro...' ? '' : 'hidden'}" style="margin-top:6px">${campoErro('s-outro')}
      <label for="s-cat">Em qual categoria salvar?</label><select id="s-cat">${cats.map(c => `<option ${S.sel.cat === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>`
      : `<label for="s-nome">Nome do fotógrafo</label><input type="text" id="s-nome" list="s-nomes" autocomplete="off" value="${esc(S.sel.nome || '')}" placeholder="Digite o nome do fotógrafo">${campoErro('s-nome')}
      <datalist id="s-nomes">${sugestoes.map(n => `<option value="${esc(n)}">`).join('')}</datalist>
      <label class="check"><input type="checkbox" id="s-sub" ${S.sel.sub ? 'checked' : ''}><span>Criar subpasta com o nome do fotógrafo</span></label>`}
    ${sv ? '<span class="rotulo">As fotos serão salvas em</span><div class="path" id="s-final">…</div><p class="espaco mini" id="s-espaco"></p>' : ''}
    <div class="nav"><button class="cinza" id="w-back">${ic('voltar')}Voltar</button><button class="verde" id="w-next">${sv ? 'Iniciar descarregamento' + ic('seguir') : 'Continuar' + ic('seguir')}</button></div>`;
  else if (W.step === 3) corpo = `<h2>Passo 3 · Onde salvar no computador?</h2>
    <select id="s-dest" aria-label="Onde salvar no computador">${optsDest.map(o => `<option ${S.sel.destR === o.r ? 'selected' : ''}>${esc(o.r)}</option>`).join('')}<option ${S.sel.destR === 'Escolher pasta personalizada...' ? 'selected' : ''}>Escolher pasta personalizada...</option></select>
    <span class="rotulo">As fotos serão salvas em</span><div class="path" id="s-final">…</div><p class="espaco mini" id="s-espaco"></p>
    <div class="nav"><button class="cinza" id="w-back">${ic('voltar')}Voltar</button><button class="verde" id="b-iniciar">Iniciar descarregamento${ic('seguir')}</button></div>`;
  else if (W.step === 4) corpo = `<h2>Passo ${nP(4)} · Copiando fotos…</h2>
    <div class="copiando">${mascote('recebendo', 96)}</div>
    <progress id="pg" value="${tr.progresso || 0}" max="1"></progress>
    <p class="numeros" id="pg-t">${esc(tr.msg || '')}</p><p class="mut mini arquivo-atual" id="pg-arq"></p>
    <p class="mut">Não feche esta página nem remova o cartão.</p>
    <div class="nav"><span></span><button class="verm" id="b-cancelar">${ic('x')}Cancelar cópia</button></div>`;
  else corpo = `<h2 class="ok feito">${ic('ok', 'desenha')}Descarregamento concluído</h2>
    <div class="fim">${mascote('feliz', 64)}<p class="numeros">${esc(tr.msg || '')}${st.transferidas ? ` · <b>${fmtNum(st.transferidas)}</b> foto(s) para revisar` : ''}</p></div>
    <button class="grande verde" id="b-sel">${ic('fotos')}Selecionar fotos</button>
    ${st.editor_disponivel ? `<button class="cinza largo" id="b-edit">${ic('luz')}Editar fotos</button>` : ''}
    ${presets.length ? `<div class="preset-todas"><label for="s-pre">Preset em todas as fotos</label>
      <div class="row"><select id="s-pre"><option value="">Escolha um preset…</option>${presets.map((p, k) => `<option value="${k}">${esc(p.nome)}</option>`).join('')}</select>
      <button class="fix" id="b-pre">${ic('varias')}Aplicar</button></div>
      <p class="mut mini" id="pre-st">O corte e a foto original são mantidos.</p></div>` : ''}
    <div class="terciarios"><button class="cinza" id="b-novo">${ic('girar')}Novo descarregamento</button><button class="fantasma" id="b-abrir">${ic('pasta')}Abrir pasta</button></div>
    <section class="secao-drive"><h3>Enviar para o Google Drive (opcional)</h3>
    <select id="s-drive" aria-label="Pasta de destino no Google Drive">${optsDrive.map(o => `<option ${S.sel.drive === o.r ? 'selected' : ''}>${esc(o.r)}</option>`).join('')}</select>
    <button class="lar largo" id="b-up">${ic('enviar')}Enviar ${st.transferidas ? fmtNum(st.transferidas) + ' foto(s)' : 'fotos'} para o Drive</button></section>`;

  $app.innerHTML = `<div class="wrap">
  <div class="topbar"><div><h1>${sv ? esc(sv.nome) : 'Modo avulso'}</h1>${sv ? '<div class="mut mini">Dia do Servir ativo</div>' : ''}</div>
   <div class="acts">${sv && st.rede.modo === 'lider' ? '<button class="pq cinza" id="b-qr">' + ic('celular') + 'Painel (QR)</button>' : ''}${sv ? '<button class="lar pq" id="b-raiz">' + ic('pasta') + 'Pasta do Servir</button><button class="verm pq" id="b-fin">' + ic('bandeira') + 'Finalizar Servir</button>' : ''}<button class="cinza pq" id="b-voltar">${ic('voltar')}Início</button></div></div>
  ${stepper}
  ${resumos.map(r => `<div class="resumo"><span>${r.t}</span>${editavel ? `<button class="pq cinza" data-ed="${r.k}">Alterar</button>` : ''}</div>`).join('')}
  <div class="card passo">${corpo}</div></div>`;

  const q = s => $app.querySelector(s);
  // Inicio: com Servir ativo ele continua ativo (o Painel mostra o card para voltar); so o PC fica livre no painel.
  // No avulso nao ha o que manter: comeca do zero na proxima vez.
  q('#b-voltar').onclick = async () => {
    if (sv) api('/api/atividade', { body: { acao: 'liberar' } }).catch(() => { });
    else { await api('/api/avulso', { body: {} }); S.wiz = null; }
    S.entrou = false; S.avulso = false; irInicio();
  };
  if (sv) {
    q('#b-raiz').onclick = () => api('/api/fs/abrir', { body: { path: S.sel.destP + '/' + sv.nome } }).catch(() => alerta('Informação', `A pasta raiz do servir '${sv.nome}' ainda não foi criada localmente.`));
    q('#b-fin').onclick = () => finalizarServir();
    if (st.rede.modo === 'lider') { q('#b-qr').onclick = mostrarQR; if (S.qr) { S.qr = false; mostrarQR(); } }
  }
  S.qr = false;
  $app.querySelectorAll('[data-ed]').forEach(b => b.onclick = () => { W.step = +b.dataset.ed; vDescarregar(); });
  const ir_ = n => { W.step = n; vDescarregar(); };

  // caminho final + espaco livre do disco x tamanho estimado (da previa do passo 1)
  let livre = null;
  async function atualizaFinal() {
    const el = q('#s-final'); if (!el) return;
    if (!S.sel.destP) { el.textContent = 'Selecione a pasta de destino acima...'; return; }
    try {
      const d = await api(`/api/destino/preview?base=${encodeURIComponent(S.sel.destP)}&fotografo=${encodeURIComponent(nomeFot())}&categoria=${encodeURIComponent(catAtual())}&subpasta=${subpasta()}`);
      S.finalPath = d.caminho; el.innerHTML = caminhoHtml(encurtaCaminho(d.caminho, 4)); el.title = d.caminho; livre = d.livre;
      const esp = q('#s-espaco'), precisa = W.previa ? W.previa.bytes : 0;
      if (esp) {
        const falta = livre != null && precisa > livre;
        esp.className = 'espaco mini ' + (falta ? 'bad' : 'mut');
        esp.innerHTML = livre == null ? '' : `${falta ? pt('aviso') : ''}Espaço livre: <b>${fmtBytes(livre)}</b>${precisa ? ` · necessário: ≈ ${fmtBytes(precisa)}` : ''}${falta ? ' · <b>não cabe neste disco</b>' : ''}`;
      }
    } catch (e) { }
  }
  async function iniciar() {
      const body = { fotografo: nomeFot(), destino_base: S.sel.destP, pastas: W.pastas, categoria: catAtual(), subpasta: subpasta() };
      try {
        if (livre != null && W.previa && W.previa.bytes > livre &&
          !await confirmar('Pode faltar espaço', `As fotos ocupam cerca de ${fmtBytes(W.previa.bytes)}, mas o disco de destino tem ${fmtBytes(livre)} livres.\n\nA cópia pode parar no meio.`, 'Copiar mesmo assim', 'Cancelar', true)) return;
        const plano = await api('/api/transferencia/plano', { body });
        if (plano.total_encontrados === 0) return alerta('Informação', 'Nenhuma imagem encontrada nas pastas selecionadas.');
        let modo = 'novas';
        if (plano.novas === 0 && plano.ja_descarregados > 0) {
          if (!await confirmar('Fotos já descarregadas', `Todas as ${plano.ja_descarregados} fotos encontradas já foram descarregadas antes.\n\nDescarregar de novo?`)) return;
          modo = 'todas';
        } else if (plano.novas > 0 && plano.ja_descarregados > 0) {
          if (!await confirmar('Fotos já descarregadas', `${plano.ja_descarregados} foto(s) desta pasta já foram descarregadas antes.\n\nDescarregar só as ${plano.novas} novas?\n(Se escolher "Não", todas as ${plano.todas} serão copiadas.)`)) modo = 'todas';
        }
        const temRaw = modo === 'novas' ? plano.tem_raw_novas : plano.tem_raw;
        let converter_raw = false;
        if (temRaw && plano.pode_converter_raw) {
          const r = await modal(`<h2>Fotos em RAW</h2>${esc('Há fotos em RAW (.cr3, .cr2, .nef, .arw) entre as selecionadas.\n\nTransformar em JPEG? Os JPEGs saem na resolução total e, no computador, fica só o JPEG. O cartão não é alterado.')}`,
            [{ t: 'Cancelar', v: null, c: 'cinza' }, { t: 'Manter em RAW', v: false, c: 'cinza' }, { t: 'Transformar em JPEG', v: true }]);
          if (r === null) return;
          converter_raw = r;
        } else if (temRaw && !await confirmar('Fotos em RAW', 'Há fotos em RAW (.cr3, .cr2, .nef, .arw) nas pastas selecionadas.\n\nElas serão copiadas no formato original. Continuar?')) return;
        await api('/api/transferencia/iniciar', { body: { ...body, modo, converter_raw } });
        W.fotografo = nomeFot();
        ir_(4);
      } catch (e) { toast(e.message, true); }
  }

  // ---- passo 1 ----
  if (W.step === 1) {
    let previaPedido = 0, tPrevia = null, detectadoAntes = null;
    const pedirPrevia = () => {
      clearTimeout(tPrevia); const el = q('#o-previa');
      if (!W.pastas.length || !S.oOk) { W.previa = null; el.textContent = ''; return; }
      el.textContent = 'Contando as fotos…';
      tPrevia = setTimeout(async () => {
        const n = ++previaPedido;
        try { const p = await api('/api/origem/previa', { body: { pastas: W.pastas } }); if (!p || n !== previaPedido || !q('#o-previa')) return; W.previa = p; q('#o-previa').textContent = p.fotos ? previaTexto(p) : 'Nenhuma foto nestas pastas.'; } catch (e) { }
      }, 300);
    };
    const marcarProx = () => { W.pastas = [...document.querySelectorAll('#o-lista input:checked')].map(i => i.value); if (W.pastas.length) erroCampo(q('#o-lista'), ''); };
    async function atualizaOrigem() {
      if (S.view !== 'descarregar' || W.step !== 1 || !q('#o-status')) return;
      const o = await api('/api/origem'); S.oOk = o.detectada; S.oCam = o.caminho;
      const chave = JSON.stringify([o.caminho, o.detectada, o.pastas.length, o.candidatos.map(c => c.mountpoint)]);
      if (S.oChave === chave) return;
      S.oChave = chave;
      // so o texto de espera e o mascote ficam no estado vazio; detectou: o mascote pula e some
      q('#o-espera').classList.toggle('hidden', o.detectada);
      if (o.detectada && detectadoAntes === false) { const m = q('#o-espera .mascote'); toast(o.manual ? 'Origem escolhida' : 'Cartão detectado!'); if (m) mascoteEstado(m, 'achou', 'espera'); }
      detectadoAntes = o.detectada;
      // sem cartao, o estado vazio (mascote + "Insira o cartão") ja diz tudo
      q('#o-status').innerHTML = o.detectada ? `<p class="${o.manual ? 'az' : 'ok'}">${pt('ok')}${o.manual ? 'Origem escolhida' : 'Cartão detectado'}: <span title="${esc(o.caminho)}">${caminhoHtml(encurtaCaminho(o.caminho))}</span></p>` : '';
      // cada volume e um card: nome, espaco usado; o que esta em uso fica marcado
      q('#o-cand').innerHTML = o.candidatos.map((c, i) => `<button type="button" class="volume ${o.detectada && c.mountpoint === o.caminho ? 'sel' : ''}" data-c="${i}">${ic('cartao')}<span><b>${esc(c.nome || c.mountpoint)}</b><small>${c.total ? `${fmtBytes(c.usado)} usados de ${fmtBytes(c.total)}` : esc(c.mountpoint)}</small></span></button>`).join('');
      q('#o-cand').querySelectorAll('[data-c]').forEach(e => e.onclick = async () => { await api('/api/origem', { body: { path: o.candidatos[e.dataset.c].mountpoint } }); S.oChave = null; W.pastas = []; atualizaOrigem(); });
      const marc = new Set(W.pastas);
      q('#o-lista').classList.toggle('hidden', !o.detectada);
      q('#o-lista').innerHTML = o.detectada ? o.pastas.map(p => `<label><input type="checkbox" value="${esc(p.valor)}" ${marc.has(p.valor) ? 'checked' : ''}> ${esc(p.rotulo)}</label>`).join('') : '';
      q('#o-lista').querySelectorAll('input').forEach(i => i.onchange = () => { marcarProx(); pedirPrevia(); });
      marcarProx(); pedirPrevia();
    }
    S.oChave = null; await atualizaOrigem();
    q('#o-man').onclick = async () => { const p = await escolherPasta('Selecione a pasta de origem das fotos (cartão ou pasta)', S.oUlt); if (p) { S.oUlt = p; try { await api('/api/origem', { body: { path: p } }); S.oChave = null; W.pastas = []; atualizaOrigem(); } catch (e) { toast(e.message, true); } } };
    q('#o-open').onclick = async () => { const o = await api('/api/origem'); if (o.caminho) api('/api/fs/abrir', { body: { path: o.caminho } }).catch(e => toast(e.message, true)); else toast('Nenhum cartão ou pasta de origem para abrir.', true); };
    // Continuar sempre habilitado: valida no clique e diz o que falta logo abaixo da lista
    q('#w-next').onclick = () => {
      if (!S.oOk) return erroCampo(q('#o-lista'), 'Insira o cartão SD ou escolha uma pasta de origem.');
      if (!W.pastas.length) { erroCampo(q('#o-lista'), 'Marque pelo menos uma pasta.'); const i = q('#o-lista input'); if (i) i.focus(); return; }
      avisarAtividade(); ir_(2);
    };
    iniciarPoll(atualizaOrigem, 2000);
  }
  // ---- passo 2 ----
  if (W.step === 2) {
    const campo = sv ? q('#s-outro') : q('#s-nome');
    if (sv) {
      avisarAtividade(nomeFot());
      $app.querySelectorAll('[data-fot]').forEach(b => b.onclick = () => {
        S.sel.fot = b.dataset.fot;
        $app.querySelectorAll('[data-fot]').forEach(x => { x.classList.toggle('sel', x === b); x.setAttribute('aria-checked', x === b); });
        const outro = S.sel.fot === 'Outro...'; q('#s-outro').classList.toggle('hidden', !outro);
        if (outro) q('#s-outro').focus(); else { erroCampo(q('#s-outro'), ''); avisarAtividade(nomeFot()); }
        atualizaFinal();
      });
      q('#s-outro').oninput = e => { S.sel.outro = e.target.value; atualizaFinal(); };
      q('#s-cat').onchange = e => { S.sel.cat = e.target.value; atualizaFinal(); };
      if (S.sel.fot === 'Outro...') q('#s-outro').focus(); else { const s = $app.querySelector('[data-fot].sel'); if (s) s.focus(); }
    } else { q('#s-nome').oninput = e => { S.sel.nome = e.target.value; }; q('#s-sub').onchange = e => { S.sel.sub = e.target.checked; }; q('#s-nome').focus(); }
    const avancar = () => {
      if (!nomeOk()) return erroCampo(campo, nomeFot() ? 'O nome não pode ter / \\ : * ? " < > |' : 'Digite o nome do fotógrafo.');
      if (!sv) { S.sel.nome = nomeFot(); q('#s-nome').value = S.sel.nome; } else if (S.sel.fot === 'Outro...') S.sel.outro = nomeFot();
      avisarAtividade(nomeFot()); if (sv) iniciar(); else ir_(3);
    };
    q('#w-next').onclick = avancar; q('#w-back').onclick = () => ir_(1);
    $app.querySelectorAll('input[type=text]').forEach(i => i.onkeydown = e => { if (e.key === 'Enter') avancar(); });
    if (sv) atualizaFinal();
  }
  // ---- passo 3 ----
  if (W.step === 3) {
    await atualizaFinal();
    q('#w-back').onclick = () => ir_(2);
    q('#s-dest').onchange = async e => {
      const v = e.target.value;
      if (v === 'Escolher pasta personalizada...') { const p = await escolherPasta('Selecione onde salvar as fotos', S.sel.destP); if (p) { S.sel.destR = v; S.sel.destP = p; } else e.target.value = S.sel.destR; }
      else { const o = optsDest.find(x => x.r === v); S.sel.destR = v; S.sel.destP = o.p; }
      atualizaFinal();
    };
    q('#b-iniciar').onclick = iniciar;
  }
  // ---- passo 4 ----
  if (W.step === 4) {
    const t0 = { t: Date.now(), b: tr.bytes_feitos || 0 };
    q('#b-cancelar').onclick = async () => {
      if (!await confirmar('Cancelar cópia', 'Parar a cópia agora?\n\nO que já foi copiado fica na pasta; o cartão não é alterado.', 'Cancelar cópia', 'Continuar copiando', true)) return;
      try { await api('/api/transferencia/cancelar', { body: {} }); q('#b-cancelar').disabled = true; q('#b-cancelar').textContent = 'Cancelando…'; } catch (e) { toast(e.message, true); }
    };
    iniciarPoll(async () => {
      const t = await api('/api/transferencia/status'); const pg = q('#pg'); if (!pg) { soltarTela(); return; }
      pg.value = t.progresso;
      const pct = Math.round(t.progresso * 100);
      // velocidade medida desde que a tela abriu: da o tempo restante
      let resta = '';
      if (t.bytes_total && t.bytes_feitos > t0.b) { const vel = (t.bytes_feitos - t0.b) / ((Date.now() - t0.t) / 1000), s = (t.bytes_total - t.bytes_feitos) / vel; if (isFinite(s) && s > 2) resta = ` · ~${s < 60 ? Math.ceil(s) + ' s' : Math.ceil(s / 60) + ' min'} restantes`; }
      q('#pg-t').textContent = t.fase === 'convertendo' ? `Convertendo RAW para JPEG · ${fmtNum(t.feitos)} de ${fmtNum(t.total)}`
        : `${fmtNum(t.feitos)} de ${fmtNum(t.total)} fotos${t.bytes_total ? ` · ${fmtBytes(t.bytes_feitos)} de ${fmtBytes(t.bytes_total)}` : ''}${resta}`;
      q('#pg-arq').textContent = t.atual || '';
      document.title = `${pct}% · DropHouse`;
      if (t.fase === 'convertendo') q('#b-cancelar').classList.add('hidden');
      if (t.estado === 'concluido' || t.estado === 'erro' || t.estado === 'cancelado') {
        pararPoll(); soltarTela(); document.title = TITULO;
        if (t.estado === 'cancelado') { toast(t.msg); W.step = sv ? 2 : 3; return vDescarregar(); }
        if (t.estado === 'erro') { await alertaErro('Erro na cópia', t.msg); W.step = sv ? 2 : 3; return vDescarregar(); }
        if (t.aviso) await alerta('Atenção', t.aviso);
        W.step = 5; await render();
        const fim = document.querySelector('.fim'); if (fim) { mascoteEstado(fim.querySelector('.mascote'), 'feliz-pula', 'feliz'); confete(fim); }
        if (t.revisaveis > 0 && await confirmar('Cópia concluída', `${t.revisaveis} foto(s) copiadas!${t.falhas ? `\n(${t.falhas} arquivo(s) com erro de cópia — veja o log do servidor.)` : ''}${t.falhas_raw ? `\n(${t.falhas_raw} RAW não puderam ser convertidos e ficaram em RAW — veja o log do servidor.)` : ''}\n\nAbrir a seleção agora para revisar e apagar as fotos indesejadas?`, 'Abrir seleção', 'Agora não')) abrirRevisor();
        else if (t.revisaveis === 0) alerta('Concluído', 'A cópia terminou, mas nenhuma imagem compatível com revisão foi transferida.');
      }
    }, 600);
    acenderTela();          // depois do iniciarPoll: ele chama pararPoll, que solta a tela
  }
  // ---- passo 5 ----
  if (W.step === 5) {
    const semFotos = st.transferidas ? '' : 'Nenhuma foto disponível nesta sessão. Faça um novo descarregamento.';
    // o motivo aparece uma vez (embaixo de "Selecionar fotos"); Editar e Enviar apontam para a mesma linha
    travar(q('#b-sel'), semFotos);
    ['#b-edit', '#b-up'].forEach(s => { const b = q(s); if (!b || !semFotos) return; b.disabled = true; b.title = semFotos; b.setAttribute('aria-describedby', 'b-sel-motivo'); });
    q('#b-sel').onclick = abrirRevisor;
    if (q('#b-edit')) q('#b-edit').onclick = () => abrirEditor();
    q('#b-abrir').onclick = () => api('/api/revisor/abrir-pasta', { body: {} }).catch(e => toast(e.message, true));
    q('#b-novo').onclick = async () => { await api('/api/transferencia/nova', { body: {} }); S.sel.nome = ''; S.sel.outro = ''; S.sel.driveManual = false; W.step = 1; W.pastas = []; W.previa = null; W.fotografo = ''; S.finalPath = ''; S.oChave = null; await carregar(); vDescarregar(); };
    q('#s-drive').onchange = e => { S.sel.drive = e.target.value; S.sel.driveManual = true; };
    // preset em todas as fotos: salva em segundo plano pela fila do editor; o envio ao Drive espera terminar
    const travarPreset = () => { const b = q('#b-pre'), s = q('#s-pre'); if (b && s) travar(b, s.value ? '' : 'Escolha um preset para aplicar.', q('#b-pre').closest('.row')); };
    const acompanharPreset = async () => {
      let t; try { t = await api('/api/transferencia/status'); } catch (e) { return; }
      const el = q('#pre-st'); if (!el) return pararPoll();
      if (t.edicoes_pendentes) { el.textContent = `Aplicando o preset… faltam ${t.edicoes_pendentes} foto(s).`; return; }
      pararPoll(); if (S.presetAplicado) { el.textContent = `Preset "${S.presetAplicado}" aplicado em todas as fotos.`; S.presetAplicado = ''; }
      travarPreset();          // da para aplicar outro em seguida
    };
    if (tr.edicoes_pendentes && q('#pre-st')) { acompanharPreset(); iniciarPoll(acompanharPreset, 1500); }
    if (q('#s-pre')) {
      travarPreset();
      q('#s-pre').onchange = travarPreset;
      q('#b-pre').onclick = async ev => {
        const btn = ev.currentTarget, p = presets[+q('#s-pre').value]; if (!p) return;
        if (!await confirmar('Preset em todas as fotos', `Aplicar o preset "${p.nome}" nas ${st.transferidas} foto(s)?\n\nA luz e a cor de cada foto são trocadas pelas do preset; o corte fica como está. A original continua guardada (dá para restaurar no editor).`, 'Aplicar em todas', 'Cancelar')) return;
        travar(btn, 'Aplicando o preset…', btn.closest('.row'));
        try {
          await api('/api/editor/aplicar', { body: { indices: [...Array(st.transferidas).keys()], ajustes: p.ajustes, grupos: ['luz', 'curva', 'cor'] } });
          S.presetAplicado = p.nome; toast(`Aplicando o preset "${p.nome}" em ${st.transferidas} foto(s)`);
          acompanharPreset(); iniciarPoll(acompanharPreset, 1500);
        } catch (er) { toast(er.message, true); travarPreset(); }
      };
    }
    q('#b-up').onclick = async ev => {
      const btn = ev.currentTarget; if (btn.disabled) return;
      btn.disabled = true;   // duplo clique nao envia duas vezes
      const o = optsDrive.find(x => x.r === S.sel.drive);
      try {
        const r = await api('/api/upload/iniciar', { body: { link: o ? o.l : '' } });
        toast(r && r.ignoradas ? `Envio iniciado (${r.ignoradas} foto(s) já enviadas ou em envio foram puladas).` : 'Envio ao Drive iniciado em segundo plano.');
        uploadsAtualiza();
      } catch (e) { alertaErro('Envio ao Drive', e.message); }
      setTimeout(() => { btn.disabled = false; }, 1500);
    };
  }
}

async function finalizarServir(ignorar) {
  if (!ignorar && !await confirmar('Finalizar Servir', 'Tem certeza que deseja finalizar este Servir e enviar todos os dados para o webhook?', 'Finalizar Servir', 'Cancelar')) return;
  const b = document.getElementById('b-fin'); if (b) { b.disabled = true; b.textContent = 'Enviando...'; }
  try {
    const r = await api('/api/servir/finalizar', { body: { ignorar_erros: !!ignorar } });
    if (r.status === 'confirmar') {
      if (b) { b.disabled = false; b.innerHTML = ic('bandeira') + 'Finalizar Servir'; }
      if (await confirmar('Erro de comunicação na rede', `Não foi possível obter dados das seguintes estações:\n${r.estacoes_com_erro.join(', ')}\n\nDeseja finalizar o Servir mesmo assim (ignorando estas estações)?`)) return finalizarServir(true);
      return;
    }
    await alerta('Servir finalizado', 'Todos os dados foram enviados para o webhook.'); S.entrou = false; S.wiz = null; irInicio();
  } catch (e) { if (b) { b.disabled = false; b.innerHTML = ic('bandeira') + 'Finalizar Servir'; } alertaErro('Erro ao finalizar', 'Não foi possível enviar os dados ao webhook:\n' + e.message); }
}

// ---------- zoom da tela de selecao ----------
// Roda do mouse / pinca no ponto do cursor, arrastar para mover, duplo clique alterna entre "tela inteira" e 100%.
// Quando a foto aparece maior que a imagem carregada (zoom ou tela grande), busca a foto no tamanho original.
// O zoom e a posicao continuam ao trocar de foto: da para conferir o foco da mesma regiao numa sequencia.
function criarZoom(stage, img, aoMudar) {
  const Z = { z: 1, cx: .5, cy: .5, urlOrig: '', alta: false, origW: 0, carregando: false, cem: null };
  let fitW = 0, fitH = 0, sw = 0, sh = 0, ptrs = new Map(), gesto = null;
  const selo = document.createElement('div'); selo.className = 'zselo hidden'; stage.appendChild(selo);
  function medidas() {
    sw = stage.clientWidth; sh = stage.clientHeight;
    const ar = (img.naturalWidth || 3) / (img.naturalHeight || 2);
    fitW = Math.min(sw, sh * ar); fitH = fitW / ar;
  }
  const maxZ = () => Math.max(2, Z.origW ? 4 * Z.origW / fitW : 8);   // ate 400% do original
  const pos = () => ({ w: fitW * Z.z, h: fitH * Z.z, l: sw / 2 - Z.cx * fitW * Z.z, t: sh / 2 - Z.cy * fitH * Z.z });
  function desenha() {
    if (!fitW) return;
    let { w, h, l, t } = pos();
    if (w <= sw) { l = (sw - w) / 2; Z.cx = .5; } else { l = Math.min(0, Math.max(sw - w, l)); Z.cx = (sw / 2 - l) / w; }
    if (h <= sh) { t = (sh - h) / 2; Z.cy = .5; } else { t = Math.min(0, Math.max(sh - h, t)); Z.cy = (sh / 2 - t) / h; }
    Object.assign(img.style, { width: w + 'px', height: h + 'px', left: l + 'px', top: t + 'px' });
    stage.classList.toggle('zoom', Z.z > 1.01);
    if (!Z.alta && w > img.naturalWidth * 1.15) carregarOriginal();
    aoMudar(Z.z <= 1.01 ? 'Tela inteira' : Z.origW ? Math.round(w / Z.origW * 100) + '%' : Z.z.toFixed(1) + '×');
  }
  function zoomEm(novo, mx, my) {
    const a = pos(), px = (mx - a.l) / a.w, py = (my - a.t) / a.h;
    Z.z = Math.min(maxZ(), Math.max(1, novo));
    const w = fitW * Z.z, h = fitH * Z.z;
    Z.cx = (sw / 2 - (mx - px * w)) / w; Z.cy = (sh / 2 - (my - py * h)) / h;
    desenha();
  }
  function carregarOriginal() {
    if (Z.carregando || !Z.urlOrig) return;
    Z.carregando = true; const url = Z.urlOrig, im = new Image();
    const t = setTimeout(() => { if (Z.urlOrig === url) selo.classList.remove('hidden'); }, 300);
    selo.textContent = 'Carregando em alta resolução…';
    im.onload = () => {
      clearTimeout(t); selo.classList.add('hidden'); Z.carregando = false;
      if (Z.urlOrig !== url) return desenha();             // ja trocou de foto: busca a original da atual, se precisar
      Z.alta = true; Z.origW = im.naturalWidth; img.src = url;
      if (Z.cem) { const c = Z.cem; Z.cem = null; zoomEm(Z.origW / fitW, c.x, c.y); } else desenha();
    };
    im.onerror = () => { clearTimeout(t); Z.carregando = false; if (Z.urlOrig !== url) return desenha(); selo.textContent = 'Não foi possível carregar em alta resolução'; selo.classList.remove('hidden'); };
    im.src = url;
  }
  const centro = () => ({ x: sw / 2, y: sh / 2 });
  const ajustar = () => { Z.z = 1; Z.cx = Z.cy = .5; Z.cem = null; desenha(); };
  function cem(p = centro()) {                             // 100%: um pixel da foto = um pixel da tela
    if (Z.origW) zoomEm(Z.origW / fitW, p.x, p.y);
    else { Z.cem = p; zoomEm(Math.max(Z.z, 2), p.x, p.y); carregarOriginal(); }
  }
  const local = e => { const r = stage.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  stage.addEventListener('wheel', e => { e.preventDefault(); const p = local(e); zoomEm(Z.z * Math.exp(-e.deltaY * 0.0015), p.x, p.y); }, { passive: false });
  stage.addEventListener('dblclick', e => { if (Z.z > 1.01) ajustar(); else cem(local(e)); });
  stage.addEventListener('pointerdown', e => {
    stage.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, local(e));
    const ps = [...ptrs.values()];
    if (ps.length === 2) gesto = { tipo: 'pinca', d: Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y), z: Z.z };
    else if (Z.z > 1.01) { gesto = { tipo: 'mover', ...local(e), cx: Z.cx, cy: Z.cy }; stage.classList.add('arrastando'); }
  });
  stage.addEventListener('pointermove', e => {
    if (!ptrs.has(e.pointerId) || !gesto) return;
    ptrs.set(e.pointerId, local(e));
    const ps = [...ptrs.values()];
    if (gesto.tipo === 'pinca' && ps.length === 2) {
      const d = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y);
      zoomEm(gesto.z * d / gesto.d, (ps[0].x + ps[1].x) / 2, (ps[0].y + ps[1].y) / 2);
    } else if (gesto.tipo === 'mover') {
      const p = local(e); Z.cx = gesto.cx - (p.x - gesto.x) / (fitW * Z.z); Z.cy = gesto.cy - (p.y - gesto.y) / (fitH * Z.z); desenha();
    }
  });
  const solta = e => { ptrs.delete(e.pointerId); if (ptrs.size < 2 && gesto && gesto.tipo === 'pinca') gesto = null; if (!ptrs.size) { gesto = null; stage.classList.remove('arrastando'); } };
  stage.addEventListener('pointerup', solta); stage.addEventListener('pointercancel', solta);
  img.draggable = false;
  img.addEventListener('load', () => { medidas(); desenha(); });
  const redimensiona = () => { medidas(); desenha(); };
  addEventListener('resize', redimensiona);
  return {
    // nova foto: mostra a versao leve; a original vem sozinha se o zoom (que continua) precisar
    foto(urlLeve, urlOrig) { Z.urlOrig = urlOrig; Z.alta = false; Z.origW = 0; Z.cem = null; selo.classList.add('hidden'); img.src = urlLeve; },
    mais: () => zoomEm(Z.z * 1.5, centro().x, centro().y),
    menos: () => zoomEm(Z.z / 1.5, centro().x, centro().y),
    alternar: () => (Z.z > 1.01 ? ajustar() : cem()),
    ajustar, cem: () => cem(),
    precisaOriginal: () => Z.z > 1.01,
    destruir: () => removeEventListener('resize', redimensiona),
  };
}

// ---------- EDITOR DE FOTOS (Luz, Curva e Cor; motor do LightCraft, como no app LightCraft) ----------
// A previa e revelada pelo proprio LightCraft (o que aparece e o que vai para o Drive). Ao trocar de foto ou concluir,
// a foto editada e salva em tamanho cheio em segundo plano; a original fica guardada (botao "Restaurar original").
// Tem zoom (com zoom a previa vem da original em tamanho cheio), curva de pontos, copiar/colar ajustes (inclusive em
// varias fotos), presets (os prontos que vem com o programa e os salvos aqui; um clique aplica, outro leva para todas
// as fotos) e desfazer/refazer.
const ED_SECOES = [['luz', 'Luz'], ['curva', 'Curva de tons'], ['cor', 'Cor']];
const ED_TRILHO = { 'wb.temp': 'trk-temp', 'wb.tint': 'trk-tint', 'color.vibrance': 'trk-vib', 'color.saturation': 'trk-sat' };
const ED_CANAIS = [['master', 'RGB', '#e8e8e8'], ['red', 'Vermelho', '#ff5a5a'], ['green', 'Verde', '#5ad06a'], ['blue', 'Azul', '#5a8cff']];
const T_MIN = Math.log(2000), T_MAX = Math.log(50000);           // temperatura em escala logaritmica (mais facil de ajustar)
const tPos = t => Math.round((Math.log(t) - T_MIN) / (T_MAX - T_MIN) * 1000), tVal = p => Math.round(Math.exp(T_MIN + p / 1000 * (T_MAX - T_MIN)) / 50) * 50;
const edGrupo = c => c.startsWith('wb.') || c.startsWith('color.') ? 'cor' : c.startsWith('curve.') ? 'curva' : 'luz';
const edCopia = { ajustes: null, grupos: ['luz', 'curva', 'cor'] };   // o corte so vai junto se marcar (cada foto tem o seu)
// proporcoes do corte: [id, nome, largura/altura em pixels; null = livre, 0 = a da propria foto]
const ED_PROPORCOES = [['livre', 'Livre', null], ['original', 'Original', 0], ['1x1', '1:1 quadrado', 1], ['4x5', '4:5', 4 / 5],
  ['2x3', '2:3', 2 / 3], ['3x4', '3:4', 3 / 4], ['16x9', '16:9', 16 / 9], ['9x16', '9:16 stories', 9 / 16]];

// curva suave que passa pelos pontos (monotona, como as curvas de tons dos editores de foto)
function curvaSuave(pts) {
  const n = pts.length, xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), d = [], m = [];
  for (let k = 0; k < n - 1; k++) d.push((ys[k + 1] - ys[k]) / ((xs[k + 1] - xs[k]) || 1e-6));
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let k = 1; k < n - 1; k++) m[k] = d[k - 1] * d[k] <= 0 ? 0 : (d[k - 1] + d[k]) / 2;
  for (let k = 0; k < n - 1; k++) {
    if (!d[k]) { m[k] = m[k + 1] = 0; continue; }
    const a = m[k] / d[k], b = m[k + 1] / d[k], h = a * a + b * b;
    if (h > 9) { const t = 3 / Math.sqrt(h); m[k] = t * a * d[k]; m[k + 1] = t * b * d[k]; }
  }
  return x => {
    if (x <= xs[0]) return ys[0]; if (x >= xs[n - 1]) return ys[n - 1];
    let k = 0; while (x > xs[k + 1]) k++;
    const h = xs[k + 1] - xs[k], t = (x - xs[k]) / h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[k] + (t3 - 2 * t2 + t) * h * m[k] + (-2 * t3 + 3 * t2) * ys[k + 1] + (t3 - t2) * h * m[k + 1];
  };
}

const edIc = n => ic(n);

async function abrirEditor(inicio = 0) {
  let info, pre; try { [info, pre] = await Promise.all([api('/api/editor'), api('/api/editor-predefinicoes')]); } catch (e) { return toast(e.message, true); }
  if (!info.disponivel) return alerta('Editor indisponível', 'O motor de edição (LightCraft) não está instalado neste computador.');
  if (!info.fotos.length) return alerta('Aviso', 'Não há fotos para editar.');
  pararPoll();
  const C = info.controles, v = Date.now(), fechadas = new Set(), historico = new Map();
  let fotos = info.fotos, i = Math.min(inicio, fotos.length - 1), aj = null, salvo = '', cf = { temp: 6500, tint: 0 }, canal = 'master';
  let antes = false, conta = false, emVoo = false, deNovo = false, urlBlob = null, versaoMini = {}, marcando = null;
  const el = document.createElement('div'); el.className = 'rev ed';
  // barra de cima: navegacao (esquerda), ferramentas de visualizacao (centro), situacao e Concluir (direita).
  // O que mexe nos ajustes (copiar, colar, redefinir, restaurar) fica junto do painel de ajustes.
  el.innerHTML = `<div class="ed-top">
      <div class="ed-nav"><button class="ib" id="e-ant" title="Foto anterior (←)">${edIc('ant')}</button>
        <div class="ed-titulo"><b id="e-num"></b><span id="e-nome"></span></div><button class="ib" id="e-prox" title="Próxima foto (→)">${edIc('prox')}</button></div>
      <div class="ed-ferr">
        <div class="ed-grupo-b"><button class="ib" id="e-un" title="Desfazer (Ctrl+Z)">${edIc('desfazer')}</button><button class="ib" id="e-re" title="Refazer (Ctrl+Shift+Z)">${edIc('refazer')}</button></div>
        <div class="ed-grupo-b"><button class="ib" id="e-zm" title="Diminuir zoom (−)">${edIc('menos')}</button><button class="ib txt" id="e-zt" title="Alternar entre tela inteira e 100% (duplo clique na foto)">Tela inteira</button><button class="ib" id="e-zp" title="Aumentar zoom (+)">${edIc('mais')}</button></div>
        <button class="ib rot" id="e-antes" title="Ver a foto sem os ajustes (tecla \\)">${edIc('comparar')}<span>Antes / Depois</span></button>
        <button class="ib rot" id="e-cortar" title="Cortar e endireitar (R)">${edIc('cortar')}<span>Cortar</span></button>
      </div>
      <div class="ed-dir"><span class="ed-estado" id="e-estado"></span><button class="ib" id="e-atalhos" title="Atalhos do teclado">${edIc('teclado')}</button>
        <button class="ed-concluir" id="e-fim">${edIc('ok')}<span>Concluir</span></button></div></div>
    <div class="ed-corpo"><div class="ed-foto stage" id="e-stage"><img id="e-img" alt="" draggable="false"><div class="ed-aviso hidden" id="e-selo"></div><div class="ed-antes hidden" id="e-tag">Antes</div>
        <div class="ed-corte hidden" id="e-corte"><div class="ed-cbox" id="e-cbox"><i class="t1"></i><i class="t2"></i><i class="t3"></i><i class="t4"></i>
          ${['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map(h => `<b class="h h-${h}" data-h="${h}"></b>`).join('')}</div></div>
        </div>
      <aside class="ed-lado">
        <div class="ed-acoes"><button class="ac" id="e-copiar" title="Copiar os ajustes desta foto (Ctrl+C)">${edIc('copiar')}<span>Copiar</span></button>
          <button class="ac" id="e-colar" title="Colar nesta foto (Ctrl+V)">${edIc('colar')}<span>Colar</span></button>
          <button class="ac" id="e-varias" title="Colar em várias fotos (Ctrl+Shift+V)">${edIc('varias')}<span>Colar em várias</span></button></div>
        <div class="ed-painel" id="e-painel"></div>
        <div class="ed-cpainel hidden" id="e-cbar"><h3>${edIc('cortar')} Cortar e endireitar</h3>
          <label for="e-prop">Proporção</label><div class="ed-clinha"><select id="e-prop">${ED_PROPORCOES.map(([id, n]) => `<option value="${id}">${n}</option>`).join('')}</select>
            <button class="ib borda" id="e-pgirar" title="Trocar entre horizontal e vertical">${edIc('orientacao')}</button></div>
          <label for="e-ang">Endireitar <span id="e-angv">0,0°</span></label><input type="range" id="e-ang" min="-45" max="45" step="0.1" value="0" title="Duplo clique: volta para 0°">
          <button class="ib borda larga" id="e-czerar" title="Volta para a foto inteira e reta">${edIc('zerar')}<span>Redefinir corte</span></button>
          <p class="ed-dica">Arraste os cantos para ajustar e o meio para mover.</p>
          <div class="ed-cbotoes"><button class="ib borda" id="e-ccancelar" title="Desfaz o que mudou no corte (Esc)">Cancelar</button>
          <button class="ed-concluir" id="e-caplicar" title="Aplicar o corte (Enter)">${edIc('ok')}<span>Aplicar corte</span></button></div></div>
        <div class="ed-rodape"><button class="rd" id="e-zerar" title="Zera todos os ajustes desta foto">${edIc('zerar')}<span>Redefinir</span></button>
          <button class="rd" id="e-rest" title="Desfaz tudo e volta a foto original guardada">${edIc('original')}<span>Restaurar original</span></button></div>
      </aside></div>
    <div class="ed-marcar hidden" id="e-marcar"></div><div class="strip" id="e-strip"></div>`;
  document.body.appendChild(el); document.body.classList.add('tela-cheia');   // o logo do topo para atras do editor
  const $ = s => el.querySelector(s), img = $('#e-img'), stage = $('#e-stage'), selo = $('#e-selo');
  const zoom = criarZoom(stage, img, t => { $('#e-zt').textContent = t; });
  const aviso = t => { selo.textContent = t; selo.classList.toggle('hidden', !t); };
  const fmt = (c, x) => c === 'wb.temp' ? String(Math.round(x)) : (x > 0 ? '+' : '') + x.toFixed(C[c].passo < 1 ? 2 : 0).replace('.', ',');
  const valor = c => c === 'wb.temp' ? aj.wb.temp : c === 'wb.tint' ? aj.wb.tint : aj.valores[c];
  const ajTexto = (a = aj) => JSON.stringify({ valores: a.valores, wb: a.wb, curva: a.curva, corte: a.corte || null, perfil: a.perfil || null });
  const zerados = () => ({ valores: Object.fromEntries(Object.keys(C).filter(c => !c.startsWith('wb.')).map(c => [c, C[c].padrao])), wb: { modo: 'asShot', ...cf }, curva: {}, corte: null, perfil: null });
  // ajustes de uma predefinicao/copia: o que nao veio fica no padrao; "Como fotografado" usa os numeros desta foto
  // predefinicao: o corte da foto fica como esta (enquadramento e de cada foto)
  // compara luz, curva e cor sem depender da ordem dos campos (a foto salva volta do servidor em outra ordem)
  const assinatura = a => JSON.stringify([Object.keys(C).filter(c => !c.startsWith('wb.')).map(c => a.valores[c] ?? C[c].padrao),
    a.wb.modo === 'asShot' ? 'asShot' : [a.wb.modo, Math.round(a.wb.temp), Math.round(a.wb.tint)], ED_CANAIS.map(([c]) => (a.curva || {})[c] || []),
    a.perfil ? [a.perfil.lut, +a.perfil.intensidade] : null]);
  const presetAtivo = () => { if (!aj) return null; const s = assinatura(aj); return pre.predefinicoes.find(p => assinatura(completar(p.ajustes)) === s) || null; };
  const completar = a => { const z = zerados(); return { valores: { ...z.valores, ...(a.valores || {}) }, wb: a.wb && a.wb.modo !== 'asShot' ? { ...a.wb } : z.wb, curva: JSON.parse(JSON.stringify(a.curva || {})), corte: aj ? aj.corte : null, perfil: a.perfil ? { ...a.perfil } : null }; };

  // --- desfazer / refazer (por foto, enquanto o editor estiver aberto) ---
  const hist = () => { if (!historico.has(i)) historico.set(i, { pilha: [ajTexto()], pos: 0 }); return historico.get(i); };
  function registrar() {
    const h = hist(), t = ajTexto(); if (h.pilha[h.pos] === t) return;
    h.pilha = h.pilha.slice(0, h.pos + 1); h.pilha.push(t); if (h.pilha.length > 200) h.pilha.shift(); h.pos = h.pilha.length - 1; botoesHist();
  }
  function passo(d) { const h = hist(), p = h.pos + d; if (p < 0 || p >= h.pilha.length) return; h.pos = p; aj = JSON.parse(h.pilha[p]); mostraValores(); agendar(); botoesHist(); toast(d < 0 ? 'Desfeito' : 'Refeito'); }
  function botoesHist() { const h = hist(), un = $('#e-un'), re = $('#e-re'); un.disabled = h.pos <= 0; re.disabled = h.pos >= h.pilha.length - 1;
    un.title = un.disabled ? 'Nada para desfazer nesta foto' : 'Desfazer (Ctrl+Z)'; re.title = re.disabled ? 'Nada para refazer' : 'Refazer (Ctrl+Shift+Z)'; }
  const mudou = () => { mostraValores(); agendar(); registrar(); };

  // --- painel ---
  function painel() {
    // presets em grade compacta (recolhivel, para nao empurrar Luz/Cor para baixo), separados em grupos;
    // a descricao inteira aparece embaixo: a do preset sob o mouse, ou a do que esta aplicado nesta foto
    const preds = pre.predefinicoes, aberto = !fechadas.has('presets');
    const grupos = [['Da casa', p => p.pronta && p.ajustes.perfil], ['Ajustes rápidos', p => p.pronta && !p.ajustes.perfil], ['Salvos aqui', p => !p.pronta]];
    const lista = grupos.map(([nome, f]) => {
      const ks = preds.map((p, k) => f(p) ? k : -1).filter(k => k >= 0);
      return ks.length ? `<div class="ed-sub">${nome}</div><div class="ed-presets">${ks.map(k => `<button class="ed-pc" data-k="${k}" title="Aplicar nesta foto">${esc(preds[k].nome)}</button>`).join('')}</div>` : '';
    }).join('');
    $('#e-painel').innerHTML = `<button class="ed-sec ${aberto ? '' : 'fechada'}" data-s="presets">${ic('baixo')}Presets</button>
      <div class="ed-grupo ed-pre ${aberto ? '' : 'hidden'}">${lista || '<p class="ed-dica">Nenhum preset ainda.</p>'}
      <p class="ed-pre-desc" id="e-pre-desc"></p>
      <button class="ib borda larga" id="e-pre-todas" title="Leva a luz e a cor do preset para todas as fotos (o corte de cada foto fica como está)" disabled>${edIc('varias')}<span>Aplicar em todas as fotos</span></button>
      <div class="ed-pre-b"><button class="ib borda" id="e-pre-salvar" title="Guarda os ajustes desta foto com um nome, para usar em outras fotos">${edIc('salvar')}<span>Salvar ajustes atuais</span></button>
      <button class="ib borda" id="e-pre-excluir" title="Excluir um preset salvo neste computador (os prontos vêm com o programa)" ${preds.some(p => !p.pronta) ? '' : 'disabled'}>${edIc('lixo')}</button></div></div>` +
      ED_SECOES.map(([s, nome]) => `<button class="ed-sec ${fechadas.has(s) ? 'fechada' : ''}" data-s="${s}">${ic('baixo')}${nome}</button>
      <div class="ed-grupo ${fechadas.has(s) ? 'hidden' : ''}">${s === 'curva' ? `<div class="ed-curva"><div class="ed-curva-top"><select id="e-canal">${ED_CANAIS.map(([c, n]) => `<option value="${c}" ${c === canal ? 'selected' : ''}>${n}</option>`).join('')}</select>
        <select id="e-cpronta"><option value="">Curva pronta…</option>${pre.curvas.map((c, k) => `<option value="${k}">${esc(c.nome)}</option>`).join('')}</select></div>
        <canvas id="e-cv"></canvas><div class="ed-dica">Clique cria um ponto · duplo clique remove</div><div class="ed-sub">Paramétrica</div></div>` : ''}
      ${s === 'cor' && info.perfis.length ? `<div class="ed-wb"><span>Perfil criativo</span><select id="e-perfil"><option value="">Nenhum</option>${info.perfis.map(p => `<option value="${esc(p.lut)}">${esc(p.nome)}</option>`).join('')}</select></div>
        <div class="ed-ctl" id="e-pint" title="Duplo clique: volta para 100%"><div class="ed-lin"><span>Intensidade do perfil</span><span class="ed-val"></span></div><input type="range" class="trk-centro" min="0" max="200" step="1"></div>` : ''}
      ${s === 'cor' ? `<div class="ed-wb"><span>Equilíbrio de branco</span><select id="e-wb">${Object.entries(info.modos_wb).map(([m, r]) => `<option value="${m}">${esc(r)}</option>`).join('')}</select><button class="ib" id="e-pick" title="Conta-gotas: clique num ponto que deveria ser cinza/branco (W)">${edIc('conta')}</button></div>` : ''}
      ${Object.keys(C).filter(c => C[c].secao === s).map(c => `<div class="ed-ctl" data-c="${c}" title="Duplo clique: volta ao padrão"><div class="ed-lin"><span>${esc(C[c].rotulo)}</span><span class="ed-val"></span></div>
        <input type="range" class="${ED_TRILHO[c] || 'trk-centro'}" ${c === 'wb.temp' ? 'min="0" max="1000" step="1"' : `min="${C[c].min}" max="${C[c].max}" step="${C[c].passo}"`}></div>`).join('')}</div>`).join('');
    $('#e-painel').querySelectorAll('.ed-sec').forEach(b => b.onclick = () => { const s = b.dataset.s; fechadas.has(s) ? fechadas.delete(s) : fechadas.add(s); painel(); if (aj) mostraValores(); });
    $('#e-painel').querySelectorAll('.ed-ctl[data-c]').forEach(d => {
      const c = d.dataset.c, r = d.querySelector('input');
      r.oninput = () => {
        if (!aj) return;
        const x = c === 'wb.temp' ? tVal(+r.value) : +r.value;
        if (c === 'wb.temp' || c === 'wb.tint') { aj.wb[c === 'wb.temp' ? 'temp' : 'tint'] = x; aj.wb.modo = 'custom'; } else aj.valores[c] = x;
        mostraValores(); agendar(true);
      };
      r.onchange = () => { registrar(); agendar(); };          // um passo do "desfazer" por movimento da regua
      d.ondblclick = () => {                                   // como no Lightroom: duplo clique zera
        if (!aj) return;
        if (c === 'wb.temp' || c === 'wb.tint') aj.wb = { modo: 'asShot', ...cf }; else aj.valores[c] = C[c].padrao;
        mudou();
      };
    });
    $('#e-wb').onchange = async e => {
      const modo = e.target.value;
      if (modo === 'asShot') aj.wb = { modo, ...cf };
      else if (modo !== 'custom') { try { const r = await api(`/api/editor/${i}/balanco`, { body: { modo, ajustes: aj } }); aj.wb = { modo, temp: r.temp, tint: r.tint }; } catch (er) { toast(er.message, true); } }
      else aj.wb.modo = 'custom';
      mudou();
    };
    $('#e-pick').onclick = () => contaGotas(!conta);
    // perfil criativo (tabela de cor dos presets da casa) e a intensidade dele, de 0 a 200%
    if ($('#e-perfil')) {
      const pint = $('#e-pint'), r = pint.querySelector('input');
      $('#e-perfil').onchange = e => { if (!aj) return; aj.perfil = e.target.value ? { lut: e.target.value, intensidade: aj.perfil ? aj.perfil.intensidade : 100 } : null; mudou(); };
      r.oninput = () => { if (!aj || !aj.perfil) return; aj.perfil.intensidade = +r.value; mostraValores(); agendar(true); };
      r.onchange = () => { registrar(); agendar(); };
      pint.ondblclick = () => { if (!aj || !aj.perfil) return; aj.perfil.intensidade = 100; mudou(); };
    }
    $('#e-painel').querySelectorAll('.ed-pc').forEach(b => {
      const p = pre.predefinicoes[+b.dataset.k];
      b.onclick = () => { if (!p || !aj) return; aj = completar(p.ajustes); mudou(); toast(`Preset "${p.nome}" aplicado nesta foto`); };
      b.onmouseenter = b.onfocus = () => descPreset(p);
      b.onmouseleave = b.onblur = () => descPreset(presetAtivo());
    });
    $('#e-pre-todas').onclick = async () => {
      const p = presetAtivo(); if (!p) return;
      const outras = fotos.map((_, k) => k).filter(k => k !== i);
      if (!outras.length) return toast('Só há esta foto.');
      if (!await confirmar('Aplicar em todas', `Aplicar o preset "${p.nome}" nas outras ${outras.length} foto(s)?\n\nA luz e a cor de cada foto são trocadas pelas do preset; o corte fica como está. A original continua guardada (dá para restaurar).`, 'Aplicar', 'Cancelar')) return;
      outras.forEach(k => { fotos[k].estado = 'salvando'; historico.delete(k); });
      try { await api('/api/editor/aplicar', { body: { indices: outras, ajustes: p.ajustes, grupos: ['luz', 'curva', 'cor'] } }); toast(`Preset "${p.nome}" aplicado em ${outras.length + 1} foto(s); salvando em segundo plano`); }
      catch (er) { toast(er.message, true); }
      tira();
    };
    $('#e-pre-salvar').onclick = async () => {
      const nome = prompt('Nome do preset (ex.: Louvor palco):'); if (!nome || !aj) return;
      try { pre.predefinicoes = (await api('/api/editor-predefinicoes', { body: { nome, ajustes: aj } })).predefinicoes; painel(); mostraValores(); toast(`Preset "${nome}" salvo`); } catch (er) { toast(er.message, true); }
    };
    $('#e-pre-excluir').onclick = async () => {
      const minhas = pre.predefinicoes.filter(p => !p.pronta); if (!minhas.length) return;
      const nomes = minhas.map((p, k) => `${k + 1}. ${p.nome}`).join('\n');
      const k = +prompt(`Qual preset excluir? Digite o número:\n\n${nomes}`) - 1, p = minhas[k]; if (!p) return;
      if (!await confirmar('Excluir preset', `Excluir o preset "${p.nome}"?`, 'Excluir', 'Cancelar', true)) return;
      pre.predefinicoes = (await api('/api/editor-predefinicoes?nome=' + encodeURIComponent(p.nome), { method: 'DELETE' })).predefinicoes; painel(); mostraValores();
    };
    const cv = $('#e-cv');
    if (cv) {
      $('#e-canal').onchange = e => { canal = e.target.value; curva(); };
      $('#e-cpronta').onchange = e => { const c = pre.curvas[+e.target.value]; e.target.value = ''; if (!c || !aj) return; aj.curva = JSON.parse(JSON.stringify(c.curva)); curva(); mudou(); };
      editorCurva(cv);
    }
  }
  // indicador na barra de cima: a pessoa sabe se o que fez ja esta gravado
  function situacao() {
    const s = $('#e-estado'), f = fotos[i]; if (!s || !f) return;
    const [cls, txt] = f.estado === 'salvando' ? ['salvando', 'Salvando…'] : f.estado.startsWith('erro') ? ['erro', 'Erro ao salvar']
      : aj && ajTexto() !== salvo ? ['alterado', 'Alterado'] : f.editada ? ['salvo', 'Salvo'] : ['', 'Sem ajustes'];
    s.className = 'ed-estado ' + cls; s.textContent = txt;
    s.title = f.estado.startsWith('erro') ? f.estado : cls === 'alterado' ? 'As alterações são salvas sozinhas ao trocar de foto ou ao concluir' : '';
  }
  function mostraValores() {
    $('#e-painel').querySelectorAll('.ed-ctl[data-c]').forEach(d => {
      const c = d.dataset.c, x = valor(c), r = d.querySelector('input');
      r.value = c === 'wb.temp' ? tPos(x) : x; d.querySelector('.ed-val').textContent = fmt(c, x);
      d.classList.toggle('mudou', c.startsWith('wb.') ? aj.wb.modo !== 'asShot' : x !== C[c].padrao);
    });
    const s = $('#e-wb'); if (s) s.value = aj.wb.modo;
    const sp = $('#e-perfil'), pint = $('#e-pint');
    if (sp) {
      sp.value = aj.perfil ? aj.perfil.lut : ''; pint.classList.toggle('hidden', !aj.perfil);
      if (aj.perfil) { pint.querySelector('input').value = aj.perfil.intensidade; pint.querySelector('.ed-val').textContent = Math.round(aj.perfil.intensidade) + '%'; pint.classList.toggle('mudou', aj.perfil.intensidade !== 100); }
    }
    const p = $('#e-pick'); if (p) p.classList.toggle('ativo', conta);
    // preset que bate com os ajustes desta foto fica destacado (e pode ser levado para todas)
    const ativo = presetAtivo();
    $('#e-painel').querySelectorAll('.ed-pc').forEach(b => b.classList.toggle('on', pre.predefinicoes[+b.dataset.k] === ativo));
    const todas = $('#e-pre-todas'); if (todas) { todas.disabled = !ativo; todas.querySelector('span').textContent = ativo ? `Aplicar "${ativo.nome}" em todas` : 'Aplicar em todas as fotos'; }
    descPreset(ativo); curva(); situacao();
  }
  function descPreset(p) {
    const d = $('#e-pre-desc'); if (!d) return;
    d.innerHTML = p ? `<b>${esc(p.nome)}</b>${p.descricao ? ' · ' + esc(p.descricao) : ''}` : 'Clique num preset para aplicar nesta foto.';
  }

  // --- curva de pontos (canvas) ---
  let cvDesenha = () => { };
  function curva() { cvDesenha(); }
  function editorCurva(cv) {
    const ctx = cv.getContext('2d'); let arrasto = -1;
    const pts = () => (aj && aj.curva[canal] && aj.curva[canal].length ? aj.curva[canal] : [[0, 0], [1, 1]]).map(p => [...p]);
    const tam = () => { const w = cv.clientWidth, r = window.devicePixelRatio || 1; if (cv.width !== Math.round(w * r)) { cv.width = cv.height = Math.round(w * r); } return { w, r }; };
    cvDesenha = () => {
      if (!document.body.contains(cv)) return;
      const { w, r } = tam(); ctx.setTransform(r, 0, 0, r, 0, 0); ctx.clearRect(0, 0, w, w);
      ctx.fillStyle = '#161616'; ctx.fillRect(0, 0, w, w); ctx.strokeStyle = '#2e2e2e'; ctx.lineWidth = 1;
      for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(k * w / 4, 0); ctx.lineTo(k * w / 4, w); ctx.moveTo(0, k * w / 4); ctx.lineTo(w, k * w / 4); ctx.stroke(); }
      ctx.strokeStyle = '#3a3a3a'; ctx.beginPath(); ctx.moveTo(0, w); ctx.lineTo(w, 0); ctx.stroke();
      // outros canais com curva, mais apagados
      ED_CANAIS.forEach(([c, , cor]) => {
        const p = aj && aj.curva[c]; if (c === canal || !p || !p.length) return;
        const f = curvaSuave(p); ctx.strokeStyle = cor + '55'; ctx.beginPath(); for (let k = 0; k <= 100; k++) ctx[k ? 'lineTo' : 'moveTo'](k / 100 * w, (1 - f(k / 100)) * w); ctx.stroke();
      });
      const p = pts(), f = curvaSuave(p), cor = ED_CANAIS.find(x => x[0] === canal)[2];
      ctx.strokeStyle = cor; ctx.lineWidth = 2; ctx.beginPath(); for (let k = 0; k <= 200; k++) { const y = Math.min(1, Math.max(0, f(k / 200))); ctx[k ? 'lineTo' : 'moveTo'](k / 200 * w, (1 - y) * w); } ctx.stroke();
      p.forEach(([x, y]) => { ctx.fillStyle = '#1e1e1e'; ctx.strokeStyle = cor; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x * w, (1 - y) * w, 5, 0, 7); ctx.fill(); ctx.stroke(); });
    };
    const local = e => { const b = cv.getBoundingClientRect(); return [Math.min(1, Math.max(0, (e.clientX - b.left) / b.width)), Math.min(1, Math.max(0, 1 - (e.clientY - b.top) / b.height))]; };
    const perto = (p, [x, y]) => p.findIndex(q => Math.hypot((q[0] - x) * cv.clientWidth, (q[1] - y) * cv.clientWidth) < 10);
    const grava = p => { aj.curva[canal] = (p.length === 2 && p[0][0] === 0 && p[0][1] === 0 && p[1][0] === 1 && p[1][1] === 1) ? [] : p; cvDesenha(); agendar(arrasto >= 0); };
    cv.onpointerdown = e => {
      if (!aj) return; cv.setPointerCapture(e.pointerId);
      const p = pts(), q = local(e); arrasto = perto(p, q);
      if (arrasto < 0 && p.length < 16) { p.push(q); p.sort((a, b) => a[0] - b[0]); arrasto = p.findIndex(z => z === q); grava(p); }
    };
    cv.onpointermove = e => {
      if (arrasto < 0) return;
      const p = pts(), [x, y] = local(e), ini = arrasto === 0, fim = arrasto === p.length - 1;
      const xmin = ini ? 0 : p[arrasto - 1][0] + 0.01, xmax = fim ? 1 : p[arrasto + 1][0] - 0.01;
      p[arrasto] = [Math.round(Math.min(xmax, Math.max(xmin, x)) * 1000) / 1000, Math.round(y * 1000) / 1000]; grava(p);
    };
    cv.onpointerup = () => { if (arrasto >= 0) { arrasto = -1; registrar(); agendar(); } };
    cv.ondblclick = e => { const p = pts(), k = perto(p, local(e)); if (k > 0 && k < p.length - 1) { p.splice(k, 1); grava(p); registrar(); } };
    cvDesenha();
  }

  // --- conta-gotas (o clique chega no palco: o zoom captura o ponteiro) ---
  function contaGotas(ligar) { conta = ligar; stage.classList.toggle('pick', conta); aviso(conta ? 'Clique num ponto que deveria ser branco ou cinza' : ''); if (aj) mostraValores(); }
  stage.addEventListener('click', async e => {
    if (!conta) return;
    const r = img.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
    let x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    if (aj.corte) { const [x0, y0, x1, y1] = aj.corte.rect; x = x0 + x * (x1 - x0); y = y0 + y * (y1 - y0); }
    contaGotas(false);
    try { const b = await api(`/api/editor/${i}/balanco`, { body: { x, y, ajustes: aj } }); aj.wb = { modo: 'custom', temp: b.temp, tint: b.tint }; mudou(); }
    catch (er) { toast(er.message, true); }
  });


  // --- corte e endireitar (o LightCraft confere o corte e corta na resolucao original) ---
  let cortando = null, arrCorte = null, tAng = null;
  const caixa = $('#e-cbox'), camada = $('#e-corte');
  const proporcao = () => {                                // largura/altura no sistema normalizado (0..1) da foto
    const p = ED_PROPORCOES.find(x => x[0] === cortando.proporcao); if (!p || p[2] === null) return null;
    const A = (img.naturalWidth || 3) / (img.naturalHeight || 2), px = p[2] === 0 ? A : p[2];
    return (cortando.girada ? 1 / px : px) / A;
  };
  function posCorte() {
    if (!cortando) return;
    Object.assign(camada.style, { left: img.style.left, top: img.style.top, width: img.style.width, height: img.style.height });
    const [m0, m1, m2, m3] = cortando.max, [x0, y0, x1, y1] = cortando.rect;
    Object.assign(caixa.style, { left: (x0 - m0) / (m2 - m0) * 100 + '%', top: (y0 - m1) / (m3 - m1) * 100 + '%',
      width: (x1 - x0) / (m2 - m0) * 100 + '%', height: (y1 - y0) / (m3 - m1) * 100 + '%' });
    $('#e-angv').textContent = cortando.angulo.toFixed(1).replace('.', ',') + '°';
  }
  img.addEventListener('load', () => setTimeout(posCorte, 0));
  const resCorte = () => setTimeout(posCorte, 50);
  addEventListener('resize', resCorte);
  // maior retangulo da proporcao escolhida, centrado no corte atual, dentro da area valida
  function encaixar() {
    const r = proporcao(); if (!r) return;
    const [m0, m1, m2, m3] = cortando.max, [x0, y0, x1, y1] = cortando.rect;
    let w = Math.min(m2 - m0, (m3 - m1) * r), h = w / r;
    const cx = Math.min(m2 - w / 2, Math.max(m0 + w / 2, (x0 + x1) / 2)), cy = Math.min(m3 - h / 2, Math.max(m1 + h / 2, (y0 + y1) / 2));
    cortando.rect = [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2]; posCorte();
  }
  async function validar(novaPrevia) {
    if (!cortando) return;
    try {
      const d = await api(`/api/editor/${i}/corte`, { body: { rect: cortando.rect, angulo: cortando.angulo } });
      if (!cortando) return;
      const mudouMax = JSON.stringify(d.maximo) !== JSON.stringify(cortando.max);
      // o corte fica dentro da area mostrada (com a foto girada o LightCraft aceitaria um pouco alem dela)
      const [m0, m1, m2, m3] = d.maximo, [x0, y0, x1, y1] = d.rect;
      cortando.max = d.maximo; cortando.rect = [Math.max(x0, m0), Math.max(y0, m1), Math.min(x1, m2), Math.min(y1, m3)];
      if (proporcao()) encaixar(); posCorte();
      if (mudouMax || novaPrevia) agendar();
    } catch (e) { toast(e.message, true); }
  }
  async function entrarCorte() {
    if (!aj || cortando) return;
    if (antes) alternarAntes(); contaGotas(false); zoom.ajustar();
    const c = aj.corte || { rect: [0, 0, 1, 1], angulo: 0, proporcao: 'livre' };
    cortando = { rect: [...c.rect], angulo: c.angulo || 0, proporcao: c.proporcao || 'livre', girada: false, max: [0, 0, 1, 1], antes: aj.corte };
    $('#e-prop').value = cortando.proporcao; $('#e-ang').value = cortando.angulo;
    $('#e-cortar').classList.add('ativo'); stage.classList.add('cortando'); el.classList.add('modo-corte'); camada.classList.remove('hidden'); $('#e-cbar').classList.remove('hidden');
    await validar(true);
  }
  function sairCorte(aplicar) {
    if (!cortando) return;
    const c = cortando; cortando = null;
    camada.classList.add('hidden'); $('#e-cbar').classList.add('hidden'); $('#e-cortar').classList.remove('ativo'); stage.classList.remove('cortando'); el.classList.remove('modo-corte');
    if (aplicar) {
      const inteiro = Math.abs(c.angulo) < 0.01 && c.rect.every((v, k) => Math.abs(v - [0, 0, 1, 1][k]) < 1e-4);
      aj.corte = inteiro ? null : { rect: c.rect.map(v => Math.round(v * 1e5) / 1e5), angulo: Math.round(c.angulo * 100) / 100, proporcao: c.proporcao };
      mudou();
    } else agendar();
  }
  camada.addEventListener('wheel', e => { e.preventDefault(); e.stopPropagation(); }, { passive: false });   // sem zoom enquanto corta
  // a barra do corte fica sobre a foto: o clique e dela (sem isso o zoom captura o ponteiro e o botao nao recebe o clique)
  ['pointerdown', 'dblclick', 'wheel'].forEach(t => $('#e-cbar').addEventListener(t, e => e.stopPropagation()));
  camada.addEventListener('dblclick', e => e.stopPropagation());
  camada.addEventListener('pointerdown', e => {
    if (!cortando) return; e.stopPropagation(); e.preventDefault();
    const h = e.target.dataset.h || (e.target.closest('#e-cbox') ? 'mover' : null); if (!h) return;
    camada.setPointerCapture(e.pointerId);
    arrCorte = { h, x: e.clientX, y: e.clientY, rect: [...cortando.rect], b: camada.getBoundingClientRect() };
  });
  camada.addEventListener('pointermove', e => {
    if (!arrCorte) return;
    const a = arrCorte, [m0, m1, m2, m3] = cortando.max, min = 0.03;
    const dx = (e.clientX - a.x) / a.b.width * (m2 - m0), dy = (e.clientY - a.y) / a.b.height * (m3 - m1);
    let [x0, y0, x1, y1] = a.rect; const r = proporcao();
    if (a.h === 'mover') {
      const w = x1 - x0, hh = y1 - y0; x0 = Math.min(m2 - w, Math.max(m0, x0 + dx)); y0 = Math.min(m3 - hh, Math.max(m1, y0 + dy)); x1 = x0 + w; y1 = y0 + hh;
    } else if (r && a.h.length === 2) {                   // canto com proporcao: o canto oposto fica parado
      const dir = a.h.includes('e') ? 1 : -1, ver = a.h.includes('s') ? 1 : -1;
      const ax = dir > 0 ? x0 : x1, ay = ver > 0 ? y0 : y1;
      let w = Math.max(Math.abs((dir > 0 ? x1 : x0) + dx - ax), Math.abs((ver > 0 ? y1 : y0) + dy - ay) * r, min);
      w = Math.min(w, (dir > 0 ? m2 - ax : ax - m0), (ver > 0 ? m3 - ay : ay - m1) * r);
      const hh = w / r;
      [x0, x1] = dir > 0 ? [ax, ax + w] : [ax - w, ax]; [y0, y1] = ver > 0 ? [ay, ay + hh] : [ay - hh, ay];
    } else {
      if (a.h.includes('w')) x0 = Math.min(x1 - min, Math.max(m0, x0 + dx));
      if (a.h.includes('e')) x1 = Math.max(x0 + min, Math.min(m2, x1 + dx));
      if (a.h.includes('n')) y0 = Math.min(y1 - min, Math.max(m1, y0 + dy));
      if (a.h.includes('s')) y1 = Math.max(y0 + min, Math.min(m3, y1 + dy));
      if (r) {                                          // borda com proporcao: ajusta o outro lado em volta do centro
        if (a.h === 'e' || a.h === 'w') { let hh = (x1 - x0) / r, c = (y0 + y1) / 2; hh = Math.min(hh, m3 - m1); const cy = Math.min(m3 - hh / 2, Math.max(m1 + hh / 2, c)); [y0, y1] = [cy - hh / 2, cy + hh / 2]; if ((x1 - x0) / r > hh + 1e-9) { a.h === 'e' ? x1 = x0 + hh * r : x0 = x1 - hh * r; } }
        else { let w = (y1 - y0) * r, c = (x0 + x1) / 2; w = Math.min(w, m2 - m0); const cx = Math.min(m2 - w / 2, Math.max(m0 + w / 2, c)); [x0, x1] = [cx - w / 2, cx + w / 2]; if ((y1 - y0) * r > w + 1e-9) { a.h === 's' ? y1 = y0 + w / r : y0 = y1 - w / r; } }
      }
    }
    cortando.rect = [x0, y0, x1, y1]; posCorte();
  });
  camada.addEventListener('pointerup', () => { if (arrCorte) { arrCorte = null; if (Math.abs(cortando.angulo) > 0.01) validar(); } });
  $('#e-cortar').onclick = () => cortando ? sairCorte(true) : entrarCorte();
  $('#e-caplicar').onclick = () => sairCorte(true);
  $('#e-ccancelar').onclick = () => sairCorte(false);
  $('#e-czerar').onclick = () => { if (!cortando) return; cortando.angulo = 0; cortando.rect = [0, 0, 1, 1]; cortando.proporcao = 'livre'; $('#e-prop').value = 'livre'; $('#e-ang').value = 0; validar(true); };
  $('#e-prop').onchange = e => { cortando.proporcao = e.target.value; cortando.girada = false; encaixar(); };
  $('#e-pgirar').onclick = () => { if (!cortando || !proporcao()) return; cortando.girada = !cortando.girada; encaixar(); };
  $('#e-ang').oninput = e => { if (!cortando) return; cortando.angulo = +e.target.value; posCorte(); clearTimeout(tAng); tAng = setTimeout(() => validar(true), 180); };
  $('#e-ang').ondblclick = () => { if (!cortando) return; cortando.angulo = 0; $('#e-ang').value = 0; validar(true); };

  // --- previa ao vivo (uma por vez; a ultima mudanca sempre e mostrada). Com zoom, a versao em tamanho cheio vem em seguida ---
  // rapido = enquanto arrasta uma regua: previa em metade do tamanho (revela bem mais rapido em PC fraco);
  // ao soltar a regua vem a previa em tamanho de tela
  let rapido = false;
  function agendar(r = false) { rapido = r; if (emVoo) { deNovo = true; return; } pedir(); }
  async function pedir() {
    emVoo = true; deNovo = false;
    const tela = Math.min(2048, Math.round(Math.max(stage.clientWidth, stage.clientHeight) * (window.devicePixelRatio || 1)));
    const alvo = i, texto = antes ? '{}' : cortando ? ajTexto({ ...aj, corte: { rect: cortando.max, angulo: cortando.angulo } }) : ajTexto(), leve = rapido, lado = leve ? Math.max(480, Math.round(tela / 2)) : tela;
    const t = setTimeout(() => aviso('Revelando…'), 600);
    try {
      const r = await fetch(`/api/editor/${i}/previa?lado=${lado}&aj=${encodeURIComponent(texto)}`);
      if (!r.ok) throw new Error(((await r.json().catch(() => ({}))).detail) || 'Erro ' + r.status);
      const b = await r.blob();
      // a previa leve nao pede a versao em tamanho cheio (ela e menor que a tela e o zoom acharia que precisa)
      if (alvo === i) { const u = URL.createObjectURL(b); zoom.foto(u, leve ? '' : `/api/editor/${i}/previa?lado=0&aj=${encodeURIComponent(texto)}`); if (urlBlob) setTimeout(URL.revokeObjectURL, 2000, urlBlob); urlBlob = u; }
      clearTimeout(t); if (!conta) aviso('');
    } catch (e) { clearTimeout(t); aviso('Não foi possível revelar: ' + e.message); }
    emVoo = false; if (deNovo) pedir();
  }

  // --- copiar / colar ---
  function copiar() {
    if (!aj) return;
    return new Promise(res => {
      const bg = document.createElement('div'); bg.className = 'modal-bg';
      bg.innerHTML = `<div class="modal" style="white-space:normal;max-width:400px"><h2>Copiar ajustes</h2><p class="mut mini">Depois cole com Ctrl+V em outra foto.</p>
        ${Object.entries(pre.grupos).map(([g, n]) => `<label style="font-weight:400;display:flex;gap:8px;align-items:center"><input type="checkbox" value="${g}" ${edCopia.grupos.includes(g) ? 'checked' : ''}> ${esc(n)}</label>`).join('')}
        <div class="btns"><button class="cinza" id="cp-x">Cancelar</button><button class="verde" id="cp-ok" data-foco>Copiar</button></div></div>`;
      $modal.appendChild(bg);
      const fecha = ok => {
        const g = [...bg.querySelectorAll('input:checked')].map(c => c.value); bg.remove();
        if (ok && g.length) { edCopia.ajustes = JSON.parse(ajTexto()); edCopia.grupos = g; toast(`Ajustes copiados: ${g.map(x => ED_SECOES.find(s => s[0] === x)[1]).join(', ')}`); }
        res();
      };
      bg.querySelector('#cp-x').onclick = () => fecha(false); bg.querySelector('#cp-ok').onclick = () => fecha(true);
      dialogo(bg, () => fecha(false));
    });
  }
  // mesma regra do servidor (editor.mesclar): so os grupos copiados mudam
  function mesclar(base, copia, grupos) {
    const n = JSON.parse(ajTexto(base));
    Object.keys(C).filter(c => !c.startsWith('wb.') && grupos.includes(edGrupo(c))).forEach(c => { n.valores[c] = copia.valores[c] !== undefined ? copia.valores[c] : C[c].padrao; });
    if (grupos.includes('cor')) { n.wb = copia.wb.modo === 'asShot' ? { modo: 'asShot', ...cf } : { ...copia.wb }; n.perfil = copia.perfil ? { ...copia.perfil } : null; }
    if (grupos.includes('curva')) n.curva = JSON.parse(JSON.stringify(copia.curva || {}));
    if (grupos.includes('corte')) n.corte = copia.corte ? JSON.parse(JSON.stringify(copia.corte)) : null;
    return n;
  }
  function colar() {
    if (!edCopia.ajustes) return toast('Copie os ajustes de uma foto primeiro (Copiar).', true);
    aj = mesclar(aj, edCopia.ajustes, edCopia.grupos); mudou(); toast('Ajustes colados');
  }
  function colarEmVarias() {
    if (!edCopia.ajustes) return toast('Copie os ajustes de uma foto primeiro (Copiar).', true);
    marcando = new Set(fotos.map((_, k) => k).filter(k => k !== i)); barraMarcar(); tira();
  }
  function barraMarcar() {
    const b = $('#e-marcar'); b.classList.toggle('hidden', !marcando); if (!marcando) return;
    b.innerHTML = `<span>Marque as fotos que vão receber os ajustes copiados (${edCopia.grupos.map(x => ED_SECOES.find(s => s[0] === x)[1]).join(', ')}):</span>
      <button class="pq cinza" id="m-todas">Todas</button><button class="pq cinza" id="m-nenhuma">Nenhuma</button>
      <button class="pq verde" id="m-ok" ${marcando.size ? '' : 'disabled'}>Colar em ${marcando.size} foto(s)</button><button class="pq cinza" id="m-x">Cancelar</button>`;
    b.querySelector('#m-todas').onclick = () => { marcando = new Set(fotos.map((_, k) => k)); barraMarcar(); tira(); };
    b.querySelector('#m-nenhuma').onclick = () => { marcando = new Set(); barraMarcar(); tira(); };
    b.querySelector('#m-x').onclick = () => { marcando = null; barraMarcar(); tira(); };
    b.querySelector('#m-ok').onclick = async () => {
      const alvos = [...marcando].sort((a, b) => a - b), outras = alvos.filter(k => k !== i);
      if (alvos.includes(i)) { aj = mesclar(aj, edCopia.ajustes, edCopia.grupos); mudou(); }
      marcando = null; barraMarcar();
      if (outras.length) {
        outras.forEach(k => { fotos[k].estado = 'salvando'; historico.delete(k); });
        try { await api('/api/editor/aplicar', { body: { indices: outras, ajustes: edCopia.ajustes, grupos: edCopia.grupos } }); toast(`Ajustes colados em ${alvos.length} foto(s); salvando em segundo plano`); }
        catch (e) { toast(e.message, true); }
      }
      tira();
    };
  }

  // --- fotos ---
  // a tira e montada uma vez e depois so atualiza o que mudou: refazer tudo a cada 1,5 s (enquanto salva)
  // recriava centenas de miniaturas e pesava em PC fraco
  let curTira = -1;
  function tira() {
    const s = $('#e-strip');
    if (s.children.length !== fotos.length) {
      s.innerHTML = fotos.map((_, k) => `<span class="tb" data-k="${k}"><img loading="lazy" alt=""><b class="ck hidden"></b><b class="bd hidden"></b></span>`).join('');
      s.querySelectorAll('.tb').forEach(t => t.onclick = () => {
        const k = +t.dataset.k;
        if (marcando) { marcando.has(k) ? marcando.delete(k) : marcando.add(k); barraMarcar(); tira(); } else ir(k);
      });
      curTira = -1;
    }
    fotos.forEach((f, k) => {
      const t = s.children[k], [im, ck, bd] = t.children;
      const src = `/api/revisor/imagem/${k}?lado=160&v=${v}${versaoMini[k] ? '&m=' + versaoMini[k] : ''}`;
      if (im.getAttribute('src') !== src) im.setAttribute('src', src);
      if (im.title !== f.nome) im.title = f.nome;
      t.classList.toggle('cur', k === i); t.classList.toggle('marcada', !!(marcando && marcando.has(k)));
      const marca = marcando ? (marcando.has(k) ? 'sim' : 'nao') : '';
      if (ck.dataset.m !== marca) { ck.dataset.m = marca; ck.classList.toggle('hidden', !marcando); ck.innerHTML = marca === 'sim' ? ic('ok') : ''; }
      const [cls, html, tit] = f.estado === 'salvando' ? ['bd', 'salvando…', ''] : f.estado.startsWith('erro') ? ['bd err', 'erro', f.estado]
        : f.editada ? ['bd', ic('lapis'), ''] : ['bd hidden', '', ''];
      if (bd.dataset.h !== cls + html) { bd.dataset.h = cls + html; bd.className = cls; bd.innerHTML = html; }
      bd.title = tit;
    });
    if (curTira !== i) { curTira = i; const cur = s.children[i]; if (cur) cur.scrollIntoView({ block: 'nearest', inline: 'center' }); }
    situacao();
  }
  async function atualizaLista() {
    try {
      const d = await api('/api/editor'), antesL = fotos;
      d.fotos.forEach((f, k) => { if (antesL[k] && antesL[k].estado === 'salvando' && f.estado !== 'salvando') versaoMini[k] = Date.now(); });
      fotos = d.fotos; tira(); return d.pendentes;
    } catch (e) { return 0; }
  }
  function salvarSeMudou() {
    if (!aj) return;
    const atual = ajTexto(); if (atual === salvo) return;
    salvo = atual; fotos[i].estado = 'salvando';
    api(`/api/editor/${i}/salvar`, { body: { ajustes: aj } }).catch(e => toast('Não foi possível salvar: ' + e.message, true));
  }
  async function carregar() {
    aj = null;
    $('#e-num').textContent = `Foto ${i + 1} de ${fotos.length}`; $('#e-nome').textContent = fotos[i].nome; situacao();
    zoom.foto(`/api/revisor/imagem/${i}?v=${v}${versaoMini[i] ? '&m=' + versaoMini[i] : ''}`, '');   // aparece na hora; a previa do LightCraft vem em seguida
    tira();
    try {
      const d = await api(`/api/editor/${i}`); cf = d.como_fotografado;
      const a = d.ajustes;
      aj = { valores: { ...a.valores }, wb: a.wb.modo === 'asShot' ? { modo: 'asShot', ...cf } : { ...a.wb }, curva: a.curva || {}, corte: a.corte || null, perfil: a.perfil || null };
      if (aj.wb.modo !== 'asShot' && aj.wb.modo !== 'custom' && aj.wb.temp === undefined) { try { const r = await api(`/api/editor/${i}/balanco`, { body: { modo: aj.wb.modo, ajustes: aj } }); aj.wb = { modo: aj.wb.modo, temp: r.temp, tint: r.tint }; } catch (e) { } }
      Object.keys(C).forEach(c => { if (!c.startsWith('wb.') && aj.valores[c] === undefined) aj.valores[c] = C[c].padrao; });
      salvo = ajTexto(); $('#e-rest').disabled = !d.editada; hist(); botoesHist(); mostraValores(); agendar();
    } catch (e) { aviso(e.message); }
  }
  function ir(k) { if (k < 0 || k >= fotos.length || k === i) return; sairCorte(true); salvarSeMudou(); i = k; antes = false; $('#e-tag').classList.add('hidden'); $('#e-antes').classList.remove('ativo'); contaGotas(false); carregar(); }
  function alternarAntes() { if (cortando) return; antes = !antes; $('#e-tag').classList.toggle('hidden', !antes); $('#e-antes').classList.toggle('ativo', antes); agendar(); }
  const vigia = setInterval(async () => { if (fotos.some(f => f.estado === 'salvando')) await atualizaLista(); }, 1500);
  async function concluir() {
    sairCorte(true); salvarSeMudou(); clearInterval(vigia);
    let n = await atualizaLista();
    while (n > 0) { aviso(`Salvando ${n} foto(s) editada(s)…`); await new Promise(r => setTimeout(r, 800)); n = await atualizaLista(); }
    const erros = fotos.filter(f => f.estado.startsWith('erro'));
    // solta tudo que prendia o editor na memoria (antes, cada vez que abria e fechava ficava um editor inteiro preso)
    document.removeEventListener('keydown', tecla); removeEventListener('resize', resCorte); removeEventListener('resize', resPrevia);
    clearTimeout(tRes); zoom.destruir(); el.remove(); document.body.classList.remove('tela-cheia'); if (urlBlob) { URL.revokeObjectURL(urlBlob); urlBlob = null; }
    if (erros.length) await alerta('Atenção', `${erros.length} foto(s) não puderam ser salvas e ficaram como estavam:\n${erros.map(f => f.nome).join(', ')}`);
    render();
  }
  function tecla(e) {
    if (document.querySelector('.modal-bg') || !document.body.contains(el)) return;
    const emControle = ['INPUT', 'SELECT'].includes(document.activeElement.tagName) && document.activeElement.type !== 'range';
    const ctrl = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
    if (cortando && e.key === 'Escape') { sairCorte(false); return; }
    if (cortando && e.key === 'Enter') { e.preventDefault(); sairCorte(true); return; }
    if (e.key === 'Escape') { if (conta) contaGotas(false); else if (marcando) { marcando = null; barraMarcar(); tira(); } else concluir(); return; }
    if (emControle) return;
    if (ctrl && k === 'z') { e.preventDefault(); passo(e.shiftKey ? 1 : -1); }
    else if (ctrl && k === 'y') { e.preventDefault(); passo(1); }
    else if (ctrl && k === 'c') { e.preventDefault(); copiar(); }
    else if (ctrl && k === 'v') { e.preventDefault(); e.shiftKey ? colarEmVarias() : colar(); }
    else if (ctrl) return;
    else if (document.activeElement.type === 'range' && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;   // setas ajustam a regua com foco
    else if (e.key === 'ArrowRight') ir(i + 1); else if (e.key === 'ArrowLeft') ir(i - 1);
    else if (e.key === '?') $('#e-atalhos').click();
    else if (e.key === '\\') alternarAntes(); else if (k === 'w') contaGotas(!conta);
    else if (k === 'r') cortando ? sairCorte(true) : entrarCorte();
    else if (e.key === '+' || e.key === '=') zoom.mais(); else if (e.key === '-' || e.key === '_') zoom.menos();
    else if (e.key === '0') zoom.ajustar(); else if (e.key === '1') zoom.cem();
  }
  document.addEventListener('keydown', tecla);
  $('#e-ant').onclick = () => ir(i - 1); $('#e-prox').onclick = () => ir(i + 1); $('#e-antes').onclick = alternarAntes; $('#e-fim').onclick = concluir;
  $('#e-un').onclick = () => passo(-1); $('#e-re').onclick = () => passo(1);
  $('#e-zm').onclick = zoom.menos; $('#e-zp').onclick = zoom.mais; $('#e-zt').onclick = zoom.alternar;
  $('#e-atalhos').onclick = () => modal(`<h2>Atalhos do editor</h2><table class="ed-atalhos">${[
    ['← →', 'Foto anterior / próxima'], ['Roda do mouse, + −', 'Zoom'], ['1 ou duplo clique', '100% (pixel real)'], ['0', 'Tela inteira'],
    ['\\', 'Antes / Depois'], ['R', 'Cortar e endireitar (Enter aplica, Esc cancela)'], ['W', 'Conta-gotas do equilíbrio de branco'], ['Ctrl+Z / Ctrl+Shift+Z', 'Desfazer / Refazer'],
    ['Ctrl+C', 'Copiar ajustes'], ['Ctrl+V', 'Colar nesta foto'], ['Ctrl+Shift+V', 'Colar em várias fotos'],
    ['Duplo clique na régua', 'Volta a régua ao padrão'], ['Esc', 'Concluir a edição']].map(([t, d]) => `<tr><td><kbd>${esc(t)}</kbd></td><td>${esc(d)}</td></tr>`).join('')}</table>`, [{ t: 'Fechar', v: true }]);
  $('#e-copiar').onclick = copiar; $('#e-colar').onclick = colar; $('#e-varias').onclick = colarEmVarias;
  $('#e-zerar').onclick = () => { if (!aj) return; aj = zerados(); mudou(); };
  $('#e-rest').onclick = async () => {
    if (!await confirmar('Restaurar original', `Desfazer todas as edições de "${fotos[i].nome}" e voltar à foto original?`, 'Restaurar original', 'Cancelar', true)) return;
    try { await api(`/api/editor/${i}/restaurar`, { body: {} }); versaoMini[i] = Date.now(); historico.delete(i); await atualizaLista(); carregar(); } catch (e) { toast(e.message, true); }
  };
  let tRes = null;
  const resPrevia = () => { cvDesenha(); clearTimeout(tRes); tRes = setTimeout(agendar, 250); };   // so revela de novo quando parar de redimensionar
  addEventListener('resize', resPrevia);
  painel(); carregar();
}

// ---------- REVISOR (selecao de fotos) ----------
async function abrirRevisor() {
  let lista; try { lista = (await api('/api/revisor')).arquivos; } catch (e) { return toast(e.message, true); }
  if (!lista.length) return alerta('Aviso', 'Não há fotos na lista de transferência para revisar.');
  pararPoll();
  const v = Date.now();   // muda a cada abertura: a URL so tem o indice, entao sem isso o navegador reaproveita fotos de descarregamentos anteriores
  const desc = new Set(); const ordemDesc = []; let i = 0; let tempo = null;
  const el = document.createElement('div'); el.className = 'rev';
  el.innerHTML = `<div class="bar"><button class="cinza" id="r-ant">${ic('ant')}Anterior</button><div class="info" id="r-info"></div><button class="cinza" id="r-prox">Próxima${ic('prox')}</button>
    <span class="zgrupo"><button class="cinza" id="r-zm" title="Diminuir zoom (−)">−</button><button class="cinza" id="r-zt" title="Alternar entre tela inteira e 100% (duplo clique na foto)">Tela inteira</button><button class="cinza" id="r-zp" title="Aumentar zoom (+)">+</button></span>
    <button class="verm" id="r-desc" title="Descartar (Del)">${ic('lixo')}Descartar</button><button class="cinza" id="r-undo" title="Desfazer (Ctrl+Z)">${ic('desfazer')}Desfazer</button><button class="verde" id="r-fim" title="Finalizar (Enter)">${ic('ok')}Finalizar seleção</button><button class="cinza so-ic" id="r-sair" title="Sair (Esc)" aria-label="Sair da seleção">${ic('x')}</button></div>
    <div class="stage" id="r-stage"><img id="r-img" alt=""><div class="stamp hidden" id="r-stamp">DESCARTADA</div></div>
    <div class="strip" id="r-strip"></div><div class="kbd">← → navegar · Del/Backspace/X descartar · Ctrl+Z desfazer · Enter finalizar · Esc sair<br>Zoom: roda do mouse ou pinça · arrastar move · duplo clique ou 1 = 100% · + − · 0 = tela inteira</div>`;
  document.body.appendChild(el); document.body.classList.add('tela-cheia');   // o logo do topo para atras da selecao
  const $ = s => el.querySelector(s); const img = $('#r-img');
  const zoom = criarZoom($('#r-stage'), img, t => { $('#r-zt').textContent = t; });
  $('#r-strip').innerHTML = lista.map((n, k) => `<img data-k="${k}" title="${esc(n)}" loading="lazy" src="/api/revisor/imagem/${k}?lado=160&v=${v}">`).join('');
  $('#r-strip').querySelectorAll('img').forEach(t => t.onclick = () => { i = +t.dataset.k; mostra(); });
  // com zoom, as proximas ja vem no tamanho original (o zoom continua ao trocar de foto)
  function precarrega() { [i + 1, i - 1, i + 2, i - 2].forEach(k => { if (k >= 0 && k < lista.length) new Image().src = `/api/revisor/imagem/${k}?${zoom.precisaOriginal() && k === i + 1 ? 'lado=0&' : ''}v=${v}`; }); }
  function mostra() {
    const d = desc.has(i);
    zoom.foto(`/api/revisor/imagem/${i}?v=${v}`, `/api/revisor/imagem/${i}?lado=0&v=${v}`); $('#r-stage').classList.toggle('desc', d); $('#r-stamp').classList.toggle('hidden', !d);
    const rest = lista.length - desc.size;
    $('#r-info').innerHTML = `<b>Foto ${i + 1}/${lista.length}</b> · ${esc(lista[i])}<br><span class="mini" style="color:#aaa">${desc.size} marcada(s) para descarte · ${rest} mantida(s)</span>`;
    $('#r-undo').disabled = !ordemDesc.length; $('#r-undo').title = ordemDesc.length ? 'Desfazer (Ctrl+Z)' : 'Nada para desfazer';
    $('#r-strip').querySelectorAll('img').forEach(t => { const k = +t.dataset.k; t.classList.toggle('cur', k === i); t.classList.toggle('desc', desc.has(k)); });
    const cur = $('#r-strip').querySelector('img.cur'); if (cur) cur.scrollIntoView({ block: 'nearest', inline: 'center' });
    precarrega();
  }
  const prox = () => { if (i < lista.length - 1) { i++; mostra(); } }, ant = () => { if (i > 0) { i--; mostra(); } };
  function descartar() { if (!desc.has(i)) { desc.add(i); ordemDesc.push(i); } if (i < lista.length - 1) i++; mostra(); }
  function desfazer() { if (!ordemDesc.length) return; const k = ordemDesc.pop(); desc.delete(k); i = k; mostra(); toast(`Desfeito: a foto ${k + 1} volta a ser mantida`); }
  async function fechar() { document.removeEventListener('keydown', tecla); zoom.destruir(); el.remove(); document.body.classList.remove('tela-cheia'); await render(); }
  async function finalizar() {
    let msg = 'Revisão terminada! Nenhuma foto foi apagada.';
    if (desc.size) {
      if (!await confirmar('Apagar fotos', `Você marcou ${desc.size} foto(s) para apagar.\n\nElas serão apagadas permanentemente do computador.`, `Apagar ${desc.size} foto(s)`, 'Voltar', true)) return;
    }
    try {
      const r = await api('/api/revisor/finalizar', { body: { descartar: [...desc] } });
      if (desc.size) msg = `Limpeza concluída! ${r.apagadas} foto(s) foram apagadas.` + (r.erros ? `\n(Erro ao apagar ${r.erros} foto(s).)` : '');
      document.removeEventListener('keydown', tecla); zoom.destruir(); el.remove(); document.body.classList.remove('tela-cheia');
      await alerta(desc.size ? 'Sucesso' : 'Concluído', msg);
      api('/api/revisor/abrir-pasta', { body: {} }).catch(() => { });
      render();
    } catch (e) { toast(e.message, true); }
  }
  async function sair() {
    // cada botao diz o que faz; apagar fica em vermelho e a opcao com foco (e do Esc) e continuar revisando
    const r = await modal(`<h2>Sair da seleção</h2>${esc(desc.size ? `Você marcou ${desc.size} foto(s) para descartar.` : 'Nenhuma foto foi marcada para descartar.')}`,
      [{ t: 'Continuar revisando', v: null, c: 'cinza' }, { t: 'Sair e manter todas', v: false, c: 'cinza' }, { t: desc.size ? 'Apagar as descartadas e sair' : 'Finalizar seleção', v: true, c: desc.size ? 'verm' : '' }]);
    if (r === true) finalizar(); else if (r === false) fechar();
  }
  function tecla(e) {
    if (document.querySelector('.modal-bg')) return;
    if (e.key === 'ArrowRight') prox(); else if (e.key === 'ArrowLeft') ant();
    else if (['Delete', 'Backspace', 'x', 'X'].includes(e.key)) { e.preventDefault(); descartar(); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); desfazer(); }
    else if (e.key === 'Enter') finalizar(); else if (e.key === 'Escape') sair();
    else if (e.key === '?') alerta('Atalhos da seleção', '← →  foto anterior / próxima\nDel, Backspace ou X  descartar\nCtrl+Z  desfazer\nEnter  finalizar\nEsc  sair\n+ −  zoom · 0 tela inteira · 1 ou duplo clique 100%');
    else if (e.key === '+' || e.key === '=') zoom.mais(); else if (e.key === '-' || e.key === '_') zoom.menos();
    else if (e.key === '0') zoom.ajustar(); else if (e.key === '1') zoom.cem();
  }
  document.addEventListener('keydown', tecla);
  $('#r-ant').onclick = ant; $('#r-prox').onclick = prox; $('#r-desc').onclick = descartar; $('#r-undo').onclick = desfazer;
  $('#r-fim').onclick = finalizar; $('#r-sair').onclick = sair;
  $('#r-zm').onclick = zoom.menos; $('#r-zp').onclick = zoom.mais; $('#r-zt').onclick = zoom.alternar;
  mostra();
}

// ---------- HISTORICO ----------
async function vHistorico() {
  const [h, dias] = await Promise.all([api('/api/historico'), api('/api/servir').catch(() => [])]);
  // registros antigos nao guardavam o Servir: procura um Servir conhecido no caminho; senao, a pasta acima do
  // fotografo (pulando a da categoria, que termina com a data); a pasta padrao do programa = sem Servir
  const padrao = (S.st.destino_padrao || '').split(/[\\/]/).filter(Boolean).pop();
  const servirDe = x => {
    if (x.servir !== undefined) return x.servir;
    const partes = (x.destino || '').split(/[\\/]/).filter(Boolean), conhecido = dias.find(d => partes.includes(d.nome));
    if (conhecido) return conhecido.nome;
    let k = partes.length - 2; if (/\d{4}-\d{2}-\d{2}$/.test(partes[k] || '')) k--;
    return partes[k] && partes[k] !== padrao ? partes[k] : '';
  };
  h.forEach(x => { x.servir = servirDe(x); });
  const dataBR = d => { const p = (d || '').split('-'); return p.length === 3 ? `${p[2]}/${p[1]}` : d; };
  $app.innerHTML = `<div class="wrap"><div class="topbar"><h1>Histórico</h1><div class="acts"><button class="cinza" id="h-v">${ic('voltar')}Voltar</button></div></div>
   ${h.length ? `<div class="busca">${ic('lupa')}<input type="text" id="h-busca" aria-label="Filtrar por fotógrafo" placeholder="Filtrar por fotógrafo"></div><div id="h-lista"></div>
   <div class="rodape-lista"><button class="link-perigo" id="h-limpar">${ic('lixo')}Limpar histórico</button></div>`
   : `<div class="card vazio">${mascote('dormindo', 56)}<p class="mut">Nenhum descarregamento registrado ainda.</p></div>`}</div>`;
  const q = s => $app.querySelector(s);
  q('#h-v').onclick = voltar;
  if (!h.length) return;
  // agrupado por Dia de Servir e data, com o total do grupo; o filtro so redesenha a lista (o campo de busca fica)
  function desenha() {
    const termo = q('#h-busca').value.trim().toLocaleLowerCase('pt-BR');
    const vis = h.filter(x => !termo || normNome(x.fotografo).toLocaleLowerCase('pt-BR').includes(termo));
    const grupos = [];
    vis.forEach(x => { const k = (x.servir || '') + '|' + x.data; let g = grupos.find(g => g.k === k); if (!g) grupos.push(g = { k, servir: x.servir, data: x.data, itens: [] }); g.itens.push(x); });
    q('#h-lista').innerHTML = grupos.map(g => {
      const fotos = g.itens.reduce((a, x) => a + (x.descarregadas || 0), 0), pessoas = new Set(g.itens.map(x => normNome(x.fotografo).toLocaleLowerCase('pt-BR'))).size;
      return `<section class="h-grupo"><h3>${esc(g.servir || 'Sem Dia de Servir')} · ${esc(dataBR(g.data))} · ${fmtNum(fotos)} foto(s) · ${pessoas} fotógrafo(s)</h3>
        ${g.itens.map(x => { const fora = x.descarregadas - x.selecionadas;
          return `<div class="item"><span class="t"><span><b>${esc(normNome(x.fotografo))}</b> <span class="mut">· ${esc(x.hora)}</span></span>
            <span class="numeros"><b>${fmtNum(x.descarregadas)}</b> copiadas · <b>${fmtNum(x.selecionadas)}</b> selecionadas${fora > 0 ? ` <span class="chip mini menos">−${fmtNum(fora)} descartadas</span>` : ''}</span>
            <span class="mut mini" title="${esc(x.destino)}">${caminhoHtml(encurtaCaminho(x.destino))}</span></span>
            <button class="pq cinza so-ic" data-c="${esc(x.destino)}" title="Copiar caminho" aria-label="Copiar caminho">${ic('copiar')}</button><button class="pq cinza" data-p="${esc(x.destino)}">${ic('pasta')}Abrir pasta</button></div>`; }).join('')}</section>`;
    }).join('') || '<p class="mut">Nenhum fotógrafo com esse nome.</p>';
    $app.querySelectorAll('[data-p]').forEach(b => b.onclick = () => api('/api/fs/abrir', { body: { path: b.dataset.p } }).catch(() => alertaErro('Pasta não encontrada', `A pasta '${b.dataset.p}' não existe ou foi movida.`)));
    $app.querySelectorAll('[data-c]').forEach(b => b.onclick = async () => { try { await navigator.clipboard.writeText(b.dataset.c); toast('Caminho copiado.'); } catch (e) { toast('Não foi possível copiar.', true); } });
  }
  q('#h-busca').oninput = desenha; desenha();
  q('#h-limpar').onclick = async () => { if (await confirmar('Limpar histórico', 'Apagar todo o histórico de descarregamentos?\n\nAs fotos não são apagadas.', 'Limpar histórico', 'Cancelar', true)) { await api('/api/historico', { method: 'DELETE' }); vHistorico(); } };
}

// ---------- CONFIG DRIVE / PASTAS LOCAIS ----------
// cada mudanca ja e salva; "Concluir" so volta
async function vDrive() {
  const cfg = S.cfg || (S.cfg = await api('/api/config'));
  const grava = async () => { try { await api('/api/config', { method: 'PUT', body: cfg }); toast('Salvo.'); } catch (e) { toast(e.message, true); } };
  $app.innerHTML = `<div class="wrap"><div class="topbar"><h1>Configuração de pastas</h1><div class="acts"><button class="cinza" data-go="google">${ic('chave')}Conta Google</button><button class="cinza" id="d-v">${ic('voltar')}Voltar</button></div></div>
  <div class="aviso-info">${ic('info')}<span>Estas pastas valem <b>só para hoje</b> (${new Date().toLocaleDateString('pt-BR')}). Amanhã a lista começa vazia.</span></div>
  <div class="grid"><div class="card"><h2>Pastas do Google Drive</h2>
   <input type="text" id="d-link" aria-label="Link ou ID da pasta do Drive" placeholder="Link ou ID da pasta">${campoErro('d-link')}
   <div class="row"><input type="text" id="d-nome" aria-label="Nome de exibição da pasta do Drive" placeholder="Nome de exibição (opcional)"><button class="fix" id="d-add">Adicionar</button></div>
   ${cfg.pastas.map((p, i) => `<div class="item"><span class="t">${esc(p.nome)}<br><span class="mut mini">${esc(p.link)}</span></span><a href="https://drive.google.com/drive/folders/${encodeURIComponent(p.link.split('/folders/').pop().split('?')[0])}" target="_blank" rel="noopener noreferrer"><button class="pq cinza">Abrir</button></a><button class="verm pq" data-rd="${i}">Remover</button></div>`).join('') || '<p class="mut mini">Nenhuma pasta.</p>'}</div>
  <div class="card"><h2>Pastas locais de destino</h2>
   <div class="row"><input type="text" id="l-cam" aria-label="Caminho da pasta local" placeholder="Caminho da pasta"><button class="fix cinza" id="l-proc">Procurar</button></div>${campoErro('l-cam')}
   <div class="row" style="margin-top:8px"><input type="text" id="l-nome" aria-label="Nome de exibição da pasta local" placeholder="Nome de exibição (opcional)"><button class="fix" id="l-add">Adicionar</button></div>
   ${cfg.pastas_local.map((p, i) => `<div class="item"><span class="t">${esc(p.nome)}<br><span class="mut mini" title="${esc(p.caminho)}">${caminhoHtml(encurtaCaminho(p.caminho))}</span></span><button class="pq cinza" data-ol="${i}">Abrir</button><button class="verm pq" data-rl="${i}">Remover</button></div>`).join('') || '<p class="mut mini">Nenhuma pasta.</p>'}</div></div>
  <button class="verde medio" id="d-salvar">${ic('ok')}Concluir</button></div>`;
  const q = s => $app.querySelector(s);
  $app.querySelectorAll('[data-go]').forEach(b => b.onclick = () => ir(b.dataset.go));
  const sai = () => { S.cfg = null; voltar(); };
  q('#d-v').onclick = sai; q('#d-salvar').onclick = sai;
  q('#d-add').onclick = async () => {
    const link = q('#d-link').value.trim(); let nome = q('#d-nome').value.trim();
    if (!link) return erroCampo(q('#d-link'), 'Cole o link ou o ID da pasta do Drive.');
    if (!nome) { try { nome = (await api('/api/drive/nome-pasta?link=' + encodeURIComponent(link))).nome || ''; } catch (e) { } }
    cfg.pastas.push({ nome: nome || 'Pasta do Google Drive', link }); await grava(); vDrive();
  };
  q('#l-proc').onclick = async () => { const p = await escolherPasta('Pasta local de destino', q('#l-cam').value); if (p) q('#l-cam').value = p; };
  q('#l-add').onclick = async () => { const c = q('#l-cam').value.trim(); if (!c) return erroCampo(q('#l-cam'), 'Escolha ou digite o caminho da pasta.'); cfg.pastas_local.push({ nome: q('#l-nome').value.trim() || c.split(/[\\/]/).filter(Boolean).pop() || c, caminho: c }); await grava(); vDrive(); };
  $app.querySelectorAll('[data-rd]').forEach(b => b.onclick = async () => { cfg.pastas.splice(b.dataset.rd, 1); await grava(); vDrive(); });
  $app.querySelectorAll('[data-rl]').forEach(b => b.onclick = async () => { cfg.pastas_local.splice(b.dataset.rl, 1); await grava(); vDrive(); });
  $app.querySelectorAll('[data-ol]').forEach(b => b.onclick = () => api('/api/fs/abrir', { body: { path: cfg.pastas_local[b.dataset.ol].caminho } }).catch(e => toast(e.message, true)));
}

// ---------- CONTA GOOGLE ----------
// a tela segue o estado: sem credenciais o passo 2 fica travado; sem login nao ha "Desconectar" e o teste diz por que esta parado
async function vGoogle() {
  const g = await api('/api/google/status');
  const cred = g.tem_credenciais, tok = g.tem_token;
  $app.innerHTML = `<div class="wrap"><div class="topbar"><h1>Conta Google</h1><div class="acts"><button class="cinza" id="g-v">${ic('voltar')}Voltar</button></div></div>
  ${g.disponivel ? '' : '<div class="aviso-info erro">' + ic('alerta') + '<span>As bibliotecas do Google não estão instaladas (pip install -r requirements.txt).</span></div>'}
  <div class="grid"><div class="card"><h2>1. Credenciais OAuth</h2>
    <p>Status: <b class="${cred ? 'ok' : 'warn'}">${cred ? pt('ok') + 'credentials.json configurado' : pt('aviso') + 'não configurado'}</b></p>
    <label for="g-id">Client ID</label><input type="text" id="g-id">${campoErro('g-id')}
    <label for="g-sec">Client Secret</label><div class="campo-senha"><input type="password" id="g-sec"><button type="button" class="so-ic" id="g-show" title="Mostrar segredo" aria-label="Mostrar segredo" aria-pressed="false">${ic('olho')}</button></div>
    <button id="g-salvar" style="margin-top:12px">Salvar credenciais</button>
    <h3>Ou importe o arquivo JSON do Google Cloud</h3>
    <div class="arquivo"><input type="file" id="g-file" class="hidden" accept=".json"><button class="cinza" id="g-file-b">${ic('enviar')}Importar JSON</button><span class="mut mini" id="g-file-n">Nenhum arquivo</span></div></div>
   <div class="card ${cred ? '' : 'travado'}" ${cred ? '' : 'aria-disabled="true"'}><h2>2. Login e conexão</h2>
    ${cred ? '' : '<p class="motivo" id="g-trava">Configure as credenciais no passo 1.</p>'}
    <p>Conta: <b class="${tok ? 'ok' : 'warn'}">${tok ? pt('ok') + 'conectada' : pt('aviso') + 'sem login'}</b></p>
    <p class="mut mini">O login abre no navegador do computador que roda o programa.</p>
    <div class="row"><button class="${tok ? 'cinza' : 'verde'}" id="g-login">${ic('chave')}${tok ? 'Fazer login de novo' : 'Fazer login no Google'}</button><button class="cinza" id="g-test">${ic('pulso')}Testar conexão</button></div>
    ${tok ? `<button class="verm" id="g-desc" style="margin-top:8px">Desconectar conta</button>` : ''}
    <p id="g-msg" class="${g.login.estado === 'erro' ? 'bad' : 'mut'}">${esc(g.login.msg)}</p><p id="g-conta" class="ok conta-ok"></p></div></div></div>`;
  const q = s => $app.querySelector(s);
  q('#g-v').onclick = voltar;
  if (!cred) ['#g-login', '#g-test'].forEach(s => { const b = q(s); b.disabled = true; b.title = 'Configure as credenciais no passo 1.'; b.setAttribute('aria-describedby', 'g-trava'); });
  else if (!tok) travar(q('#g-test'), 'Faça login primeiro para testar a conexão.');
  q('#g-show').onclick = () => { const v = q('#g-sec').type === 'password'; q('#g-sec').type = v ? 'text' : 'password'; q('#g-show').innerHTML = ic(v ? 'olhoX' : 'olho'); q('#g-show').setAttribute('aria-pressed', v); q('#g-show').title = v ? 'Esconder segredo' : 'Mostrar segredo'; };
  q('#g-salvar').onclick = async () => {
    if (!q('#g-id').value.trim()) return erroCampo(q('#g-id'), 'Cole o Client ID.');
    try { await api('/api/google/credenciais', { body: { client_id: q('#g-id').value, client_secret: q('#g-sec').value } }); toast('Credenciais salvas!'); vGoogle(); } catch (e) { toast(e.message, true); }
  };
  q('#g-file-b').onclick = () => q('#g-file').click();
  q('#g-file').onchange = async e => { const f = e.target.files[0]; if (!f) return; q('#g-file-n').textContent = f.name; try { await api('/api/google/importar', { body: { conteudo: await f.text() } }); toast('Arquivo importado!'); vGoogle(); } catch (er) { toast(er.message, true); } };
  // conectado: mostra o e-mail com um check (o teste tambem e o que confirma a conexao)
  const testar = async () => {
    q('#g-msg').className = 'mut'; q('#g-msg').textContent = 'Testando a conexão com o Google Drive…';
    try { const c = await api('/api/google/testar', { body: {} }); q('#g-conta').innerHTML = `${ic('ok')}${esc(c.email)}${c.nome ? ` <span class="mut">(${esc(c.nome)})</span>` : ''}`; q('#g-msg').textContent = 'Conexão funcionando.'; }
    catch (e) { q('#g-msg').className = 'bad'; q('#g-msg').textContent = e.message; }
  };
  q('#g-login').onclick = async () => {
    try { await api('/api/google/login', { body: {} }); q('#g-msg').textContent = 'Aguardando autorização no navegador...';
      iniciarPoll(async () => { const s = await api('/api/google/status'); q('#g-msg').textContent = s.login.msg;
        if (s.login.estado !== 'aguardando') { pararPoll(); if (s.login.estado === 'ok') { toast('Login efetuado!'); await vGoogle(); const t = $app.querySelector('#g-test'); if (t && !t.disabled) t.click(); } else q('#g-msg').className = 'bad'; } }, 1500);
    } catch (e) { toast(e.message, true); }
  };
  q('#g-test').onclick = testar;
  if (q('#g-desc')) q('#g-desc').onclick = async () => { if (await confirmar('Desconectar conta', 'Desconectar a conta do Google e remover o token.json?', 'Desconectar', 'Cancelar', true)) { await api('/api/google/desconectar', { body: {} }); toast('Conta desconectada.'); vGoogle(); } };
}

// ---------- painel de envios ao Drive (segundo plano, visivel em qualquer tela) ----------
const $up = document.createElement('div'); $up.id = 'uploads'; $up.className = 'hidden'; document.body.appendChild($up);
let upMin = false, upUlt = '';
function uploadsDesenha(lista) {
  const chave = JSON.stringify(lista) + upMin;
  if (chave === upUlt) return; upUlt = chave;
  document.body.classList.toggle('com-uploads', lista.length > 0);
  if (!lista.length) { $up.classList.add('hidden'); return; }
  $up.classList.remove('hidden');
  // a moldura (cabecalho, mascote, botoes) e montada uma vez; os polls so trocam textos, barras e classes
  if (!$up.firstChild) {
    $up.innerHTML = `<div class="uphead"><b>${mascote('parado', 24)}<span id="up-tit"></span></b><span><button class="pq cinza" id="up-min"></button><button class="pq cinza" id="up-x" title="Fechar" aria-label="Fechar">${ic('x')}</button></span></div>
      <progress id="up-tot" max="1"></progress><div id="up-jobs"></div>
      <div class="up-todos hidden"><button class="pq verm" id="up-parar-todos">${ic('parar')}Parar todos os envios</button></div>`;
    $up.querySelector('#up-parar-todos').onclick = () => pararEnvio(null);
    $up.querySelector('#up-min').onclick = () => { upMin = !upMin; upUlt = ''; uploadsAtualiza(); };
    $up.querySelector('#up-x').onclick = async () => { await api('/api/uploads/limpar', { body: {} }); upUlt = ''; uploadsAtualiza(); };
  }
  const $ = s => $up.querySelector(s);
  const ativos = lista.filter(j => j.estado === 'fila' || j.estado === 'rodando');
  const feitos = lista.reduce((a, j) => a + j.feitos, 0), total = lista.reduce((a, j) => a + j.total, 0);
  $('#up-tit').textContent = ativos.length ? `Enviando ao Drive · ${ativos.length} em andamento` : 'Envios ao Drive concluídos';
  const bm = $('#up-min'), novoIc = upMin ? 'maximizar' : 'minimizar';
  if (bm.dataset.ic !== novoIc) { bm.dataset.ic = novoIc; bm.innerHTML = ic(novoIc); bm.title = upMin ? 'Expandir' : 'Minimizar'; bm.setAttribute('aria-label', bm.title); }
  $('#up-x').classList.toggle('hidden', !!ativos.length);
  $('.up-todos').classList.toggle('hidden', upMin || ativos.length < 2);
  $('#up-tot').classList.toggle('hidden', !upMin); $('#up-tot').value = total ? feitos / total : 0;
  const caixa = $('#up-jobs'); caixa.classList.toggle('hidden', upMin);
  // mascote: fotos subindo enquanto envia; terminou tudo: pula de alegria uma vez e fica parado
  const m = $('.mascote'), estado = ativos.length ? 'enviando' : 'parado';
  const festa = lista[lista.length - 1].estado === 'concluido';
  if (m.dataset.e !== estado) { const antes = m.dataset.e; m.dataset.e = estado; if (antes === 'enviando' && estado === 'parado' && festa) mascoteEstado(m, 'feliz-pula', 'parado'); else mascoteEstado(m, estado); }
  // um bloco por envio, reaproveitado entre os polls (o mais novo em cima)
  const vivos = new Set();
  lista.slice().reverse().forEach((j, pos) => {
    const id = 'upj-' + j.id; vivos.add(id);
    let el = caixa.querySelector('#' + id);
    if (!el) {
      el = document.createElement('div'); el.id = id;
      el.innerHTML = `<div class="uprow"><span><i class="st"></i><b></b></span><span class="mini numeros"></span></div><progress max="1"></progress><div class="upfiles"></div>
        <div class="up-pe"><span class="mini mut msg"></span><button class="pq cinza up-parar" title="Parar este envio">${ic('parar')}Parar</button></div>`;
      el.querySelector('.up-parar').onclick = () => pararEnvio(j.id, el.querySelector('b').textContent);
    }
    el.querySelector('b').textContent = j.fotografo;
    if (caixa.children[pos] !== el) caixa.insertBefore(el, caixa.children[pos] || null);
    el.className = 'upjob ' + j.estado;
    const icone = j.estado === 'concluido' ? 'ok' : j.estado === 'erro' ? 'alerta' : j.estado === 'parado' ? 'parar' : j.estado === 'fila' ? 'relogio' : 'enviar';
    const bp = el.querySelector('.up-parar'), andando = j.estado === 'fila' || j.estado === 'rodando';
    bp.classList.toggle('hidden', !andando); bp.disabled = !!j.parar; bp.lastChild.textContent = j.parar ? 'Parando…' : 'Parar';
    const st = el.querySelector('.st'); if (st.dataset.ic !== icone) { st.dataset.ic = icone; st.innerHTML = ic(icone, 'st'); }
    el.querySelector('.numeros').textContent = `${j.feitos}/${j.total}`;
    el.querySelector('progress').value = j.progresso;
    const arqs = j.estado === 'rodando' ? (j.atuais || []) : [], fs = el.querySelector('.upfiles');
    if (fs.dataset.v !== arqs.join('|')) { fs.dataset.v = arqs.join('|'); fs.innerHTML = arqs.map(n => `<div title="${esc(n)}">${esc(n)}</div>`).join(''); }
    el.querySelector('.msg').innerHTML = esc(j.estado === 'concluido' || j.estado === 'erro' || j.estado === 'parado' || j.parar ? j.msg : j.estado === 'fila' ? 'Na fila de envio...' : 'Enviando para ' + j.destino) + (j.erros ? ` · <span class="bad">${j.erros} com erro</span>` : '');
  });
  [...caixa.children].forEach(el => { if (!vivos.has(el.id)) el.remove(); });
}
// parar um envio (ou todos, com id null): o que ja subiu fica no Drive; mandar de novo depois sobe so o que faltou
async function pararEnvio(id, quem) {
  const titulo = id === null ? 'Parar todos os envios' : `Parar o envio de ${quem}`;
  if (!await confirmar(titulo, 'As fotos que já subiram ficam no Drive. Se mandar de novo depois, sobe só o que faltou.', 'Parar envio', 'Continuar enviando', true)) return;
  try { await api('/api/uploads/parar', { body: id === null ? {} : { id } }); upUlt = ''; uploadsAtualiza(); } catch (e) { toast(e.message, true); }
}
// arrastar pelo cabecalho (mouse ou toque); a posicao fica salva no navegador
function upPosiciona(x, y) {
  const w = $up.offsetWidth, h = $up.offsetHeight;
  x = Math.max(0, Math.min(x, innerWidth - w)); y = Math.max(0, Math.min(y, innerHeight - Math.min(h, 60)));
  $up.style.left = x + 'px'; $up.style.top = y + 'px'; $up.style.right = 'auto';
  return { x, y };
}
try { const pos = JSON.parse(localStorage.getItem('uploadsPos') || 'null'); if (pos) upPosiciona(pos.x, pos.y); } catch (e) { }
let upDrag = null;
$up.addEventListener('pointerdown', e => {
  if (!e.target.closest('.uphead') || e.target.closest('button')) return;
  const r = $up.getBoundingClientRect(); upDrag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
  $up.setPointerCapture(e.pointerId); $up.classList.add('arrastando'); e.preventDefault();
});
$up.addEventListener('pointermove', e => { if (upDrag) upPosiciona(e.clientX - upDrag.dx, e.clientY - upDrag.dy); });
const upSolta = () => {
  if (!upDrag) return; upDrag = null; $up.classList.remove('arrastando');
  try { const r = $up.getBoundingClientRect(); localStorage.setItem('uploadsPos', JSON.stringify({ x: r.left, y: r.top })); } catch (e) { }
};
$up.addEventListener('pointerup', upSolta); $up.addEventListener('pointercancel', upSolta);
addEventListener('resize', () => { if ($up.style.left) { const r = $up.getBoundingClientRect(); upPosiciona(r.left, r.top); } });
let upAtivosAntes = 0;
async function uploadsAtualiza() {
  try {
    const l = await api('/api/uploads'); uploadsDesenha(l);
    const ativos = l.filter(j => j.estado === 'fila' || j.estado === 'rodando').length;
    if (ativos < upAtivosAntes) { const ult = l.filter(j => ['concluido', 'erro', 'parado'].includes(j.estado)).pop(); if (ult) toast(ult.estado === 'erro' ? `Envio de ${ult.fotografo} terminou com erros` : ult.estado === 'parado' ? `Envio de ${ult.fotografo} parado` : `Envio de ${ult.fotografo} concluído`, ult.estado === 'erro'); }
    upAtivosAntes = ativos;
  } catch (e) { }
}
// aba escondida ou janela minimizada: nao fica perguntando ao servidor (volta na hora quando a tela aparece)
setInterval(() => { if (!document.hidden) uploadsAtualiza(); }, 1500); uploadsAtualiza();

// ---------- atualizacao automatica (programa instalado) ----------
// o programa fecha e reabre na versao nova sozinho; a tela mostra o andamento e recarrega quando ele volta
const $atu = document.createElement('div'); $atu.className = 'banner hidden'; document.body.prepend($atu);
let verVista = null, instalando = false, semConexao = false;
function bannerAtualizacao(a) {
  const mostrar = a && ['pronta', 'instalando', 'manual'].includes(a.estado);
  $atu.classList.toggle('hidden', !mostrar); if (!mostrar) return;
  $atu.style.background = a.estado === 'instalando' ? 'var(--lar)' : '';
  $atu.innerHTML = (a.estado === 'instalando' ? ic('girar', 'gira') + ' ' : a.estado === 'pronta' ? ic('baixar') + ' ' : '') + esc(a.msg) +
    (a.estado === 'manual' && a.url ? ' <button id="atu-baixar">' + ic('baixar') + 'Baixar</button>' : '');
  const b = $atu.querySelector('#atu-baixar'); if (b) b.onclick = () => window.open(a.url, '_blank');
}
async function vigiaAtualizacao() {
  if (S.encerrado) return;
  try {
    const st = await api('/api/state');
    if (verVista && st.versao !== verVista) {         // voltou na versao nova: recarrega a tela
      try { if (S.entrou) sessionStorage.setItem('voltarDescarregar', '1'); } catch (e) { }
      return location.reload();
    }
    verVista = st.versao; instalando = st.atualizacao && st.atualizacao.estado === 'instalando';
    bannerAtualizacao(st.atualizacao);
    if (semConexao) { semConexao = false; render(); }  // o programa voltou (mesma versao, se a instalacao falhou)
  } catch (e) {
    semConexao = true;
    if (instalando) bannerAtualizacao({ estado: 'instalando', msg: 'Atualizando o programa… a tela volta sozinha em instantes.' });
  }
}
setInterval(() => { if (!document.hidden) vigiaAtualizacao(); }, 4000); vigiaAtualizacao();
document.addEventListener('visibilitychange', () => { if (!document.hidden) { uploadsAtualiza(); vigiaAtualizacao(); } });
try { if (sessionStorage.getItem('voltarDescarregar')) { sessionStorage.removeItem('voltarDescarregar'); S.entrou = true; } } catch (e) { }

// ---------- olhinhos do simbolo seguem o mouse; com o mouse parado por 3s voltam a olhar em volta ----------
// O pulinho do logo para depois de 3 ciclos (21 s) sem ninguem mexer na tela, e volta com qualquer movimento.
(() => {
  const sim = document.querySelector('.simbolo');
  if (!sim || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let x = 0, y = 0, pedido = 0, parado = 0, quieto = 0, ultimo = 0;
  const acorda = () => { const t = Date.now(); if (t - ultimo < 1000) return; ultimo = t; sim.classList.remove('quieto'); clearTimeout(quieto); quieto = setTimeout(() => sim.classList.add('quieto'), 21000); };
  addEventListener('keydown', acorda); addEventListener('pointerdown', acorda); acorda();
  // clique: pula de novo a cada clique, mesmo no meio de um pulo (tira a classe, forca o reflow e poe de volta)
  sim.addEventListener('click', () => { sim.classList.remove('pula'); void sim.getBoundingClientRect(); sim.classList.add('pula'); });
  sim.querySelector('.dh-caixa').addEventListener('animationend', e => { if (e.animationName === 'dh-pulinho') sim.classList.remove('pula'); });
  let ret = null;                                  // posicao do logo, guardada: medir a cada quadro forca layout
  const remede = () => { ret = null; };
  addEventListener('resize', remede, { passive: true }); addEventListener('scroll', remede, { passive: true });
  const mira = () => {
    pedido = 0;
    const r = ret || (ret = sim.getBoundingClientRect());
    const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height * .68), d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 200);
    sim.style.setProperty('--ox', (dx / d * 5.2 * k).toFixed(2) + '%');
    sim.style.setProperty('--oy', (dy / d * 3.8 * k).toFixed(2) + '%');
    sim.classList.add('segue');
  };
  addEventListener('pointermove', e => {
    x = e.clientX; y = e.clientY; acorda();
    if (!pedido) pedido = requestAnimationFrame(mira);
    clearTimeout(parado); parado = setTimeout(() => sim.classList.remove('segue'), 3000);
  }, { passive: true });
})();

render();
