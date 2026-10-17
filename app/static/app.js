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
  alerta: '<path d="M10.3 4.3L2.6 17.5A2 2 0 004.3 20.5h15.4a2 2 0 001.7-3L13.7 4.3a2 2 0 00-3.4 0z"/><path d="M12 10v3.5M12 17h.01"/>',
  arquivo: '<path d="M14 3H8a3 3 0 00-3 3v12a3 3 0 003 3h8a3 3 0 003-3V8z"/><path d="M14 3v5h5"/>', pin: '<path d="M12 21s7-6.2 7-12a7 7 0 00-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  rede: '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v4M12 11.5l-5.5 5.5M12 11.5l5.5 5.5"/>',
};
const ic = (n, c = '') => `<svg class="ic ${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;
// bolinha de estado (ok, aviso, procurando...) no lugar dos emojis de status
const pt = c => `<i class="pt ${c || ''}"></i>`;
async function api(url, opts = {}) {
  const o = { method: opts.method || 'GET', headers: {} };
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
  if (S.st.precisa_reiniciar) { b.classList.remove('hidden'); b.style.background = 'var(--lar)'; b.innerHTML = ic('alerta') + ' O programa foi atualizado. <b>Feche o servidor (Ctrl+C no terminal) e abra de novo</b> (rodar.sh / rodar.bat) para aplicar as mudanças.'; }
  else if (u && u.disponivel && u.url) { b.style.background = ''; b.classList.remove('hidden');   // programa instalado: baixa o novo instalador
    b.innerHTML = `${esc(u.msg)} <button id="b-up">${ic('baixar')}Baixar nova versão</button>`; document.getElementById('b-up').onclick = () => window.open(u.url, '_blank'); }
  else if (u && u.disponivel) { b.style.background = ''; b.classList.remove('hidden'); b.innerHTML = `${esc(u.msg)} <button id="b-up">Atualizar agora</button>`;
    document.getElementById('b-up').onclick = async () => { try { const r = await api('/api/update/aplicar', { body: {} }); toast(r.msg); b.classList.add('hidden'); } catch (e) { toast(e.message, true); } };
  } else b.classList.add('hidden'); }
function ir(v) { S.view = v; pararPoll(); render(); }
function pararPoll() { if (S.poll) { clearInterval(S.poll); S.poll = null; } }
function iniciarPoll(fn, ms) { pararPoll(); S.poll = setInterval(fn, ms); }
async function render() {
  try { await carregar(); } catch (e) { $app.innerHTML = `<div class="wrap"><p class="bad">Servidor indisponível: ${esc(e.message)}</p></div>`; return; }
  if (S.st.servir_finalizado_remotamente) {
    await api('/api/ack-finalizado', { body: {} }); S.st.active_servir = null;
    await alerta('Servir Finalizado', 'O computador Líder finalizou o Dia de Servir.\nSua estação foi desconectada automaticamente.'); S.view = 'home';
  }
  if (S.view === 'home' && (S.st.active_servir || S.avulso) && S.entrou) S.view = 'descarregar';
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
  let lista = cache; if (!lista) { try { lista = await api('/api/predefinicoes'); } catch (e) { return alerta('Erro', e.message); } }
  const ed = S.pdEd || null;
  const salvar = async nova => { try { await api('/api/predefinicoes', { method: 'PUT', body: nova }); return true; } catch (e) { toast(e.message, true); return false; } };
  $app.innerHTML = `<div class="wrap" style="max-width:760px"><div class="topbar"><h1>Predefinições de categorias</h1><div class="acts"><button class="cinza" id="pr-v">${ic('voltar')}Voltar</button></div></div>
  <p class="mut">Grupos de pastas de categoria para adicionar de uma vez (ex.: <b>ELEVE</b> → Voltz, Bold, Burn, A3).</p>
  ${ed ? `<div class="card"><h2>${ed.i === null ? 'Nova predefinição' : 'Editar predefinição'}</h2>
     <label for="pd-t">Título</label><input type="text" id="pd-t" value="${esc(ed.titulo)}" placeholder="Ex.: ELEVE">
     <label for="pd-n">Nomes das pastas</label><div class="row"><input type="text" id="pd-n" placeholder="Nome da pasta"><button class="fix" id="pd-add">Adicionar</button></div>
     <div class="chips">${ed.pastas.map((n, k) => `<span class="chip">${esc(n)} <button type="button" class="chip-x" data-r="${k}" title="Remover" aria-label="Remover">${ic('x')}</button></span>`).join('') || '<span class="mut mini">Nenhuma pasta</span>'}</div>
     <div class="nav"><button class="cinza" id="pd-cancel">Cancelar</button><button class="verde" id="pd-save">Salvar predefinição</button></div></div>`
  : `${lista.map((p, i) => `<div class="pd"><div class="pd-h"><b>${esc(p.titulo)}</b><span><button class="pq cinza" data-e="${i}">Editar</button> <button class="pq verm" data-x="${i}">Excluir</button></span></div>
      <div class="chips">${p.pastas.map(n => `<span class="chip">${esc(n)}</span>`).join('')}</div></div>`).join('') || '<p class="mut">Nenhuma predefinição criada.</p>'}
     <button class="verde grande" id="pd-new" style="margin-top:12px">${ic('add')}Nova predefinição</button>`}</div>`;
  const q = x => $app.querySelector(x);
  q('#pr-v').onclick = () => { S.pdEd = null; ir('home'); };
  if (ed) {
    const add = () => { ed.titulo = q('#pd-t').value; const v = q('#pd-n').value.trim(); if (v && !ed.pastas.includes(v)) ed.pastas.push(v); vPredef(lista); };
    q('#pd-add').onclick = add; q('#pd-n').onkeydown = e => { if (e.key === 'Enter') add(); };
    $app.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { ed.titulo = q('#pd-t').value; ed.pastas.splice(+b.dataset.r, 1); vPredef(lista); });
    q('#pd-cancel').onclick = () => { S.pdEd = null; vPredef(lista); };
    q('#pd-save').onclick = async () => {
      ed.titulo = q('#pd-t').value; const pend = q('#pd-n').value.trim(); if (pend && !ed.pastas.includes(pend)) ed.pastas.push(pend);
      const nova = lista.map(x => ({ ...x })), item = { titulo: ed.titulo.trim(), pastas: ed.pastas };
      if (ed.i === null) nova.push(item); else nova[ed.i] = item;
      if (await salvar(nova)) { S.pdEd = null; toast('Predefinição salva!'); vPredef(); }
    };
  } else {
    q('#pd-new').onclick = () => { S.pdEd = { i: null, titulo: '', pastas: [] }; vPredef(lista); };
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
function formVazio() { return { nome: '', voluntarios: [], pastas: [], drives: [], local: '', criarDrive: false }; }
async function vHome() {
  const st = S.st; S.entrou = false; S.avulso = false;
  if (!S.form) S.form = formVazio();
  const dias = await api('/api/servir'); const f = S.form; const editando = !!S.editId;
  const r = st.rede;
  const aux = r.modo === 'auxiliar';   // estacao auxiliar: o Dia de Servir e criado so no Lider e chega por "Conectar e sincronizar"
  if (aux) S.editId = null;
  $app.innerHTML = `<div class="wrap">
  <div class="topbar"><div><h1>Painel inicial</h1><div class="mut mini">versão ${esc(st.versao)}</div></div>
   <div class="acts"><button class="cinza" data-go="google">${ic('chave')}Login Google</button><button class="cinza" data-go="predef">${ic('lista')}Predefinições</button><button class="cinza" data-go="historico">${ic('relogio')}Histórico</button><button class="cinza" data-go="drive">${ic('ajustes')}Config Drive</button><button class="verm" id="b-sair" title="Fecha o programa neste computador">${ic('power')}Encerrar</button></div></div>
  <div class="grid"><div>
    ${aux ? `<div class="card"><h2>Estação auxiliar</h2>
     <p class="mut">O Dia de Servir é criado na <b>estação Líder</b>. Quando ela aparecer em "Rede local", clique em <b>Conectar e sincronizar</b>.</p>
     <button class="cinza pq avulso" id="b-avulso">Modo avulso (sem Dia de Servir)</button></div>`
    : `<div class="card"><h2 class="${editando ? 'warn' : 'ok'}">${editando ? 'Editando Dia do Servir' : 'Criar Novo Dia do Servir'}</h2>
     <label for="f-nome">Nome do Servir</label><input type="text" id="f-nome" value="${esc(f.nome)}" placeholder="Ex.: Culto de Domingo">
     <label for="f-vol">Voluntários (fotógrafos)</label>
     <div class="row">${campoTags('f-vol', 'rv', f.voluntarios, 'Nome do voluntário')}<button class="fix" id="a-vol">Adicionar</button></div>
     <label for="f-pasta">Pastas de categoria (opcional)</label>
     <div class="row">${campoTags('f-pasta', 'rp', f.pastas, 'Ex.: Louvor, Pregação')}<button class="fix" id="a-pasta">Adicionar</button><button class="fix cinza" id="a-pred" title="Adicionar um grupo de categorias pronto">${ic('lista')}Predefinições</button></div>
     <label for="f-dl">Pastas do Google Drive (opcional)</label>
     <div class="row"><input type="text" id="f-dl" placeholder="Link da pasta"><input type="text" id="f-dn" aria-label="Nome da pasta do Drive (opcional)" placeholder="Nome (opcional)"><button class="fix" id="a-dr">Adicionar</button></div>
     ${f.drives.map((d, i) => `<div class="item"><span class="t">${esc(d.nome)}${d.auto ? ' <span class="chip mini">criada automaticamente</span>' : ''}<br><span class="mut mini">${esc(d.link)}</span></span><button class="verm pq" data-rd="${i}">Remover</button></div>`).join('')}
     <label style="font-weight:400;display:flex;gap:8px;align-items:flex-start;margin-top:10px"><input type="checkbox" id="f-cdrive" style="margin-top:4px" ${f.criarDrive ? 'checked' : ''}><span>Criar as pastas de categoria dentro da pasta do Drive ao iniciar o Servir</span></label>
     <label for="f-local">Pasta local do evento (opcional)</label>
     <div class="row"><input type="text" id="f-local" value="${esc(f.local)}" placeholder="Padrão: pasta do aplicativo"><button class="fix cinza" id="p-local">Procurar</button></div>
     <div style="margin-top:14px" class="row"><button class="verde medio fix" id="b-salvar">${editando ? 'Salvar alterações' : 'Criar e ativar novo Servir'}</button>${editando ? '<button class="cinza medio fix" id="b-canc">Cancelar</button>' : ''}</div>
     <button class="cinza pq avulso" id="b-avulso">Modo avulso (sem Dia de Servir)</button>
    </div>`}
  </div><div>
    <div class="card"><h2>Dias de Servir Anteriores</h2>
     ${dias.slice().reverse().map(d => `<div class="item"><span class="t"><b>${esc(d.nome)}</b><br><span class="mut mini">${esc(d.data_criacao || '')} · ${d.voluntarios.length} voluntário(s)</span></span>
       <button class="verde pq" data-at="${esc(d.id)}">Ativar</button>${aux ? '' : `<button class="pq" data-ed="${esc(d.id)}">Editar</button>`}<button class="verm pq" data-ex="${esc(d.id)}">Excluir</button></div>`).join('') || '<p class="mut">Nenhum dia de servir criado ainda.</p>'}
    </div>
    <div class="card"><h2>Rede local (várias estações)</h2>
     <div class="row"><select id="n-modo" aria-label="Papel deste computador na rede"><option value="lider" ${r.modo === 'lider' ? 'selected' : ''}>Estação Líder</option><option value="auxiliar" ${r.modo === 'auxiliar' ? 'selected' : ''}>Estação Auxiliar</option></select><button class="fix cinza" id="n-rein">Reiniciar rede</button></div>
     <p class="mut mini">Este computador: ${esc(r.ip)}:${r.porta}</p>
     ${r.modo === 'lider' ? `<h3>Estações conectadas</h3>${r.auxiliares.map(a => `<div class="item"><span>${ic('pc')} ${esc(a.nome)} (${esc(a.ip)}) <span class="mini ${a.versao === st.versao ? 'mut' : 'warn'}">${a.versao ? 'v' + esc(a.versao) : 'versão desconhecida'}${a.versao === st.versao ? '' : ' · diferente deste PC (v' + esc(st.versao) + ') — atualize'}</span></span><span class="ok mini">${pt('ok')}Conectado</span></div>`).join('') || '<p class="mut mini">Nenhuma estação conectada.</p>'}`
      : (r.lider ? `<p class="ok">${pt('ok')}Líder encontrado</p><p>Evento: <b>${esc(r.lider.nome_evento)}</b><br><span class="mut mini">Líder IP: ${esc(r.lider.ip)}:${r.lider.port}</span></p><button class="verde" id="n-sync">${ic('link')}Conectar e sincronizar</button>`
        : `<p class="warn">${pt('busca')}Procurando o Líder na rede local…</p>`)}
    </div></div></div></div>`;
  const q = s => $app.querySelector(s), qa = s => $app.querySelectorAll(s);
  const ler = () => { if (aux) return; f.nome = q('#f-nome').value; f.local = q('#f-local').value; f.criarDrive = q('#f-cdrive').checked; };
  qa('[data-go]').forEach(b => b.onclick = () => ir(b.dataset.go));
  if (!aux) {   // formulario de criar/editar Servir (nao existe na estacao auxiliar)
  const tags = (id, lista) => {
    const adicionar = async () => { ler(); const v = q('#' + id).value.trim(); if (v && !lista.includes(v)) lista.push(v); await vHome(); q('#' + id).focus(); };
    q('#' + id).onkeydown = async e => {
      if (e.key === 'Enter') { e.preventDefault(); adicionar(); }
      else if (e.key === 'Backspace' && !e.target.value && lista.length) { ler(); lista.pop(); await vHome(); q('#' + id).focus(); }
    };
    q('#' + id).closest('.tags').onclick = e => { if (e.target.classList.contains('tags')) q('#' + id).focus(); };
    return adicionar;
  };
  q('#a-vol').onclick = tags('f-vol', f.voluntarios);
  q('#a-pasta').onclick = tags('f-pasta', f.pastas);
  q('#a-pred').onclick = async () => { ler(); const novas = await abrirPredefinicoes(f.pastas); if (novas) novas.forEach(n => { if (!f.pastas.includes(n)) f.pastas.push(n); }); vHome(); };
  q('#a-dr').onclick = async () => {
    ler(); const link = q('#f-dl').value.trim(); let nome = q('#f-dn').value.trim(); if (!link) return;
    if (!nome) { try { nome = (await api('/api/drive/nome-pasta?link=' + encodeURIComponent(link))).nome || ''; } catch (e) { } }
    f.drives.push({ link, nome: nome || 'Pasta do Google Drive' }); vHome();
  };
  qa('[data-rv]').forEach(b => b.onclick = () => { ler(); f.voluntarios.splice(b.dataset.rv, 1); vHome(); });
  qa('[data-rp]').forEach(b => b.onclick = () => { ler(); f.pastas.splice(b.dataset.rp, 1); vHome(); });
  qa('[data-rd]').forEach(b => b.onclick = () => { ler(); f.drives.splice(b.dataset.rd, 1); vHome(); });
  q('#p-local').onclick = async () => { ler(); const p = await escolherPasta('Pasta local do evento', f.local); if (p) { f.local = p; vHome(); } };
  q('#b-salvar').onclick = async () => {
    ler(); const pend = q('#f-dl').value.trim();
    if (pend && !f.drives.some(d => d.link === pend)) f.drives.push({ link: pend, nome: q('#f-dn').value.trim() || 'Pasta do Google Drive' });
    const body = { nome: f.nome, voluntarios: f.voluntarios, pastas_predefinidas: f.pastas, drive_folders: f.drives, local_path: f.local, drive_criar_categorias: f.criarDrive };
    try {
      const querDrive = f.criarDrive && f.drives.length && f.pastas.length;
      if (f.criarDrive && !querDrive) toast('Para criar as pastas no Drive, informe a pasta do Drive e ao menos uma pasta de categoria.', true);
      const sv = editando ? await api('/api/servir/' + S.editId, { method: 'PUT', body }) : await api('/api/servir', { body });
      criarPastasDriveAuto(sv);
      if (editando) { toast('Dia do Servir editado com sucesso!'); S.editId = null; S.form = formVazio(); vHome(); }
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
  q('#b-sair').onclick = async () => {
    if (!await confirmar('Encerrar programa', 'Fechar o Descarregador de Fotos neste computador?\n\nEnvios ao Drive em andamento serão interrompidos. Para abrir de novo, clique no ícone do programa.', 'Encerrar', 'Cancelar', true)) return;
    try { await api('/api/encerrar', { body: {} }); } catch (e) { }
    pararPoll(); $app.innerHTML = '<div class="wrap"><div class="card"><h2>Programa encerrado</h2><p class="mut">Pode fechar esta aba. Para abrir de novo, clique no ícone do Descarregador de Fotos.</p></div></div>';
    S.encerrado = true;
  };
  q('#b-avulso').onclick = async () => { await api('/api/avulso', { body: {} }); S.avulso = true; S.entrou = true; ir('descarregar'); };
  q('#n-modo').onchange = async e => { ler(); await api('/api/rede/modo', { body: { modo: e.target.value } }); await carregar(); vHome(); };
  q('#n-rein').onclick = async () => { await api('/api/rede/reiniciar', { body: {} }); toast('Serviços de rede local reiniciados com sucesso!'); await carregar(); vHome(); };
  const sync = q('#n-sync'); if (sync) sync.onclick = async () => { try { await api('/api/rede/sincronizar', { body: {} }); S.entrou = true; ir('descarregar'); } catch (e) { alerta('Erro de Sincronização', e.message); } };
  // atualiza lista de auxiliares / lider detectado sem perder o formulario
  iniciarPoll(async () => { if (S.view !== 'home' || document.activeElement.tagName === 'INPUT') return;
    const n = await api('/api/state'); const chave = JSON.stringify([n.rede.lider, n.rede.auxiliares.length, n.servir_finalizado_remotamente]);
    if (S.chave !== undefined && S.chave !== chave) { const fm = S.form; ler(); render(); } S.chave = chave; }, 3000);
}

// ---------- DESCARREGAMENTO (assistente passo a passo) ----------
const PASSOS = ['Origem', 'Fotógrafo', 'Destino', 'Copiando', 'Finalizar'];
async function vDescarregar() {
  const st = S.st, sv = st.active_servir;
  S.entrou = true; S.avulso = !sv;
  const W = S.wiz || (S.wiz = { step: 1, pastas: [] });
  const tr = await api('/api/transferencia/status');
  if (tr.estado === 'rodando') W.step = 4;
  else if (tr.estado === 'concluido' || st.transferidas > 0) W.step = 5;
  else if (W.step >= 4) W.step = sv ? 2 : 3;
  if (sv && W.step === 3) W.step = 2;
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

  const nomeFot = () => (sv ? (S.sel.fot === 'Outro...' ? (S.sel.outro || '') : S.sel.fot) : (S.sel.nome || '')).trim();
  const nomeOk = () => { const n = nomeFot(); return n && !/[\\/:*?"<>|]/.test(n) && n !== '.' && n !== '..'; };
  const catAtual = () => sv ? S.sel.cat : 'Raiz (Nenhuma)';
  const subpasta = () => sv ? true : !!S.sel.sub;
  const resumoOrigem = () => `${ic('cartao')}<span>${[esc(S.oCam || ''), `${W.pastas.length} pasta(s) selecionada(s)`].filter(Boolean).join(' · ')}</span>`;

  // --- cabecalho + indicador de passos ---
  const passosVis = sv ? PASSOS.filter((_, i) => i !== 2) : PASSOS, atual = nP(W.step);
  const stepper = `<div class="stepper">${passosVis.map((n, i) => { const k = i + 1; return `<div class="stp ${k < atual ? 'done' : k === atual ? 'cur' : ''}"><span>${k < atual ? ic('ok') : k}</span><small>${n}</small></div>`; }).join('<i></i>')}</div>`;
  const resumos = [];
  if (W.step > 1) resumos.push({ k: 1, t: resumoOrigem() });
  if (W.step > 2) resumos.push({ k: 2, t: `${ic('pessoa')}<span><b>${esc(nomeFot())}</b>${sv ? ' · ' + esc(catAtual()) : ''}</span>` });
  if (W.step > 3) resumos.push({ k: 3, t: `${ic('pasta')}<span class="mini">${esc(S.finalPath || S.sel.destP)}</span>` });
  const editavel = W.step <= 3;

  let corpo = '';
  if (W.step === 1) corpo = `<h2>Passo 1 · De onde vêm as fotos?</h2><p class="mut">Insira o cartão SD no computador.</p>
    <div id="o-status"></div><div class="checks" id="o-lista" style="margin-top:8px"></div>
    <div class="row" style="margin-top:8px"><button class="cinza" id="o-man">${ic('pasta')}Escolher outra pasta de origem</button><button class="cinza fix" id="o-open">Abrir cartão</button></div><div id="o-cand" class="chips"></div>
    <div class="nav"><span></span><button class="verde" id="w-next" disabled>Continuar${ic('seguir')}</button></div>`;
  else if (W.step === 2) corpo = `<h2>Passo 2 · Quem está descarregando?</h2>
    ${sv ? `<label for="s-fot">Fotógrafo (voluntário)</label><select id="s-fot">${sv.voluntarios.map(v => `<option ${S.sel.fot === v ? 'selected' : ''}>${esc(v)}</option>`).join('')}<option ${S.sel.fot === 'Outro...' ? 'selected' : ''}>Outro...</option></select>
      <input type="text" id="s-outro" aria-label="Nome do fotógrafo" placeholder="Digite o nome do fotógrafo" value="${esc(S.sel.outro || '')}" class="${S.sel.fot === 'Outro...' ? '' : 'hidden'}" style="margin-top:6px">
      <label for="s-cat">Em qual categoria salvar?</label><select id="s-cat">${cats.map(c => `<option ${S.sel.cat === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>`
      : `<label for="s-nome">Nome do fotógrafo</label><input type="text" id="s-nome" value="${esc(S.sel.nome || '')}" placeholder="Digite o nome do fotógrafo">
      <label style="font-weight:400;display:flex;gap:8px;align-items:center"><input type="checkbox" id="s-sub" ${S.sel.sub ? 'checked' : ''}> Criar subpasta com o nome do fotógrafo</label>`}
    ${sv ? '<label>As fotos serão salvas em</label><div class="path" id="s-final">…</div>' : ''}
    <p id="s-erro" class="bad mini"></p>
    <div class="nav"><button class="cinza" id="w-back">${ic('voltar')}Voltar</button><button class="verde" id="w-next">${sv ? 'Iniciar descarregamento' + ic('seguir') : 'Continuar' + ic('seguir')}</button></div>`;
  else if (W.step === 3) corpo = `<h2>Passo 3 · Onde salvar no computador?</h2>
    <select id="s-dest" aria-label="Onde salvar no computador">${optsDest.map(o => `<option ${S.sel.destR === o.r ? 'selected' : ''}>${esc(o.r)}</option>`).join('')}<option ${S.sel.destR === 'Escolher pasta personalizada...' ? 'selected' : ''}>Escolher pasta personalizada...</option></select>
    <label>As fotos serão salvas em</label><div class="path" id="s-final">…</div>
    <div class="nav"><button class="cinza" id="w-back">${ic('voltar')}Voltar</button><button class="verde" id="b-iniciar">Iniciar descarregamento${ic('seguir')}</button></div>`;
  else if (W.step === 4) corpo = `<h2>Passo ${nP(4)} · Copiando fotos…</h2><p class="mut">Não feche esta página nem remova o cartão.</p>
    <progress id="pg" value="${tr.progresso || 0}" max="1"></progress><div id="pg-t" class="mut" style="margin-top:6px">${esc(tr.msg || '')}</div>`;
  else corpo = `<h2 class="ok feito">${ic('ok', 'desenha')}Descarregamento concluído</h2><p class="mut">${esc(tr.msg || '')}${st.transferidas ? ` · ${st.transferidas} foto(s) disponíveis para revisão` : ''}</p>
    <button class="grande verde" id="b-sel" ${st.transferidas ? '' : 'disabled'}>${ic('fotos')}Selecionar fotos</button>
    ${st.editor_disponivel ? `<button class="grande roxo" id="b-edit" style="margin-top:8px" ${st.transferidas ? '' : 'disabled'}>${ic('luz')}Editar fotos</button>` : ''}
    ${presets.length ? `<div class="preset-todas"><label for="s-pre">Preset em todas as fotos</label>
      <div class="row"><select id="s-pre"><option value="">Escolha um preset…</option>${presets.map((p, k) => `<option value="${k}">${esc(p.nome)}</option>`).join('')}</select>
      <button class="fix" id="b-pre" disabled>${ic('varias')}Aplicar</button></div>
      <p class="mut mini" id="pre-st">O corte e a foto original são mantidos.</p></div>` : ''}
    <div class="row" style="margin-top:8px"><button class="cinza" id="b-abrir">${ic('pasta')}Abrir pasta</button><button class="cinza" id="b-novo">${ic('girar')}Novo descarregamento</button></div>
    <h3>Enviar para o Google Drive (opcional)</h3><select id="s-drive" aria-label="Pasta de destino no Google Drive">${optsDrive.map(o => `<option ${S.sel.drive === o.r ? 'selected' : ''}>${esc(o.r)}</option>`).join('')}</select>
    <button class="lar" id="b-up" style="margin-top:8px;width:100%" ${st.transferidas ? '' : 'disabled'}>${ic('enviar')}Enviar fotos para o Drive</button>`;

  $app.innerHTML = `<div class="wrap" style="max-width:760px">
  <div class="topbar"><div><h1>${sv ? esc(sv.nome) : 'Modo avulso'}</h1>${sv ? '<div class="mut mini">Dia do Servir ativo</div>' : ''}</div>
   <div class="acts">${sv && st.rede.modo === 'lider' ? '<button class="pq cinza" id="b-qr">' + ic('celular') + 'Painel (QR)</button>' : ''}${sv ? '<button class="lar pq" id="b-raiz">' + ic('pasta') + 'Pasta do Servir</button><button class="verm pq" id="b-fin">' + ic('bandeira') + 'Finalizar Servir</button>' : ''}<button class="cinza pq" id="b-voltar">${ic('voltar')}Início</button></div></div>
  ${stepper}
  ${resumos.map(r => `<div class="resumo"><span>${r.t}</span>${editavel ? `<button class="pq cinza" data-ed="${r.k}">Alterar</button>` : ''}</div>`).join('')}
  <div class="card passo">${corpo}</div></div>`;

  const q = s => $app.querySelector(s);
  q('#b-voltar').onclick = async () => { await api('/api/avulso', { body: {} }); S.entrou = false; S.avulso = false; S.wiz = null; ir('home'); };
  if (sv) {
    q('#b-raiz').onclick = () => api('/api/fs/abrir', { body: { path: S.sel.destP + '/' + sv.nome } }).catch(() => alerta('Informação', `A pasta raiz do servir '${sv.nome}' ainda não foi criada localmente.`));
    q('#b-fin').onclick = () => finalizarServir();
    if (st.rede.modo === 'lider') { q('#b-qr').onclick = mostrarQR; if (S.qr) { S.qr = false; mostrarQR(); } }
  }
  S.qr = false;
  $app.querySelectorAll('[data-ed]').forEach(b => b.onclick = () => { W.step = +b.dataset.ed; vDescarregar(); });
  const ir_ = n => { W.step = n; vDescarregar(); };

  async function atualizaFinal() {
    const el = q('#s-final'); if (!el) return;
    if (!S.sel.destP) { el.textContent = 'Selecione a pasta de destino acima...'; return; }
    try { const d = await api(`/api/destino/preview?base=${encodeURIComponent(S.sel.destP)}&fotografo=${encodeURIComponent(nomeFot())}&categoria=${encodeURIComponent(catAtual())}&subpasta=${subpasta()}`); S.finalPath = d.caminho; el.textContent = d.caminho; } catch (e) { }
  }
  async function iniciar() {
      const body = { fotografo: nomeFot(), destino_base: S.sel.destP, pastas: W.pastas, categoria: catAtual(), subpasta: subpasta() };
      try {
        const plano = await api('/api/transferencia/plano', { body });
        if (plano.total_encontrados === 0) return alerta('Informação', 'Nenhuma imagem encontrada nas pastas selecionadas.');
        let modo = 'novas';
        if (plano.novas === 0 && plano.ja_descarregados > 0) {
          if (!await confirmar('Fotos Já Descarregadas', `Atenção: Todas as ${plano.ja_descarregados} fotos encontradas já foram descarregadas anteriormente!\n\nDeseja descarregá-las novamente?`)) return;
          modo = 'todas';
        } else if (plano.novas > 0 && plano.ja_descarregados > 0) {
          if (!await confirmar('Fotos Já Descarregadas', `Atenção: Foram detectadas ${plano.ja_descarregados} fotos já descarregadas anteriormente nesta pasta.\n\nDeseja descarregar apenas as ${plano.novas} novas fotos tiradas após o último descarregamento?\n(Se selecionar 'Não', todas as ${plano.todas} fotos serão copiadas).`)) modo = 'todas';
        }
        const temRaw = modo === 'novas' ? plano.tem_raw_novas : plano.tem_raw;
        let converter_raw = false;
        if (temRaw && plano.pode_converter_raw) {
          const r = await modal(`<h2>Fotos em RAW Detectadas</h2>${esc('Tem fotos em RAW (.cr3, .cr2, .nef, .arw) no meio das selecionadas.\n\nDeseja transformar RAW em JPEG?\n\nOs JPEGs saem na resolução total. No computador fica só o JPEG (o RAW copiado é apagado depois de convertido). O cartão não é alterado.')}`,
            [{ t: 'Cancelar', v: null, c: 'cinza' }, { t: 'Manter em RAW', v: false, c: 'cinza' }, { t: 'Transformar em JPEG', v: true }]);
          if (r === null) return;
          converter_raw = r;
        } else if (temRaw && !await confirmar('Fotos em RAW Detectadas', 'Atenção: Foram detectadas fotos em formato RAW (.cr3, .cr2, .nef, .arw) nas pastas selecionadas.\n\nElas serão copiadas no formato original. Deseja prosseguir com o descarregamento?')) return;
        await api('/api/transferencia/iniciar', { body: { ...body, modo, converter_raw } });
        ir_(4);
      } catch (e) { toast(e.message, true); }
  }

  // ---- passo 1 ----
  if (W.step === 1) {
    const marcarProx = () => { W.pastas = [...document.querySelectorAll('#o-lista input:checked')].map(i => i.value); q('#w-next').disabled = !(S.oOk && W.pastas.length); };
    async function atualizaOrigem() {
      if (S.view !== 'descarregar' || W.step !== 1 || !q('#o-status')) return;
      const o = await api('/api/origem'); S.oOk = o.detectada; S.oCam = o.caminho;
      const chave = JSON.stringify([o.caminho, o.detectada, o.pastas.length, o.candidatos]);
      if (S.oChave !== chave) {
        S.oChave = chave;
        q('#o-status').innerHTML = o.detectada ? `<span class="${o.manual ? 'az' : 'ok'}">${pt('ok')}${o.manual ? 'Origem manual' : 'Cartão detectado'}: ${esc(o.caminho)}</span>` : `<span class="warn">${pt('busca')}Aguardando o cartão SD…</span>`;
        const marc = new Set(W.pastas);
        q('#o-lista').innerHTML = o.detectada ? o.pastas.map(p => `<label><input type="checkbox" value="${esc(p.valor)}" ${marc.has(p.valor) ? 'checked' : ''}> ${esc(p.rotulo)}</label>`).join('') : '<p class="mut">Nenhum cartão detectado.</p>';
        q('#o-lista').querySelectorAll('input').forEach(i => i.onchange = marcarProx);
        q('#o-cand').innerHTML = o.candidatos.map((c, i) => `<button type="button" class="chip" data-c="${i}">${ic('cartao')}${esc(c.mountpoint)}</button>`).join('');
        q('#o-cand').querySelectorAll('[data-c]').forEach(e => e.onclick = async () => { await api('/api/origem', { body: { path: o.candidatos[e.dataset.c].mountpoint } }); S.oChave = null; W.pastas = []; atualizaOrigem(); });
      }
      marcarProx();
    }
    S.oChave = null; await atualizaOrigem();
    q('#o-man').onclick = async () => { const p = await escolherPasta('Selecione a pasta de origem das fotos (cartão ou pasta)', S.oUlt); if (p) { S.oUlt = p; try { await api('/api/origem', { body: { path: p } }); S.oChave = null; W.pastas = []; atualizaOrigem(); } catch (e) { toast(e.message, true); } } };
    q('#o-open').onclick = async () => { const o = await api('/api/origem'); if (o.caminho) api('/api/fs/abrir', { body: { path: o.caminho } }).catch(e => toast(e.message, true)); };
    q('#w-next').onclick = () => { avisarAtividade(); ir_(2); };
    iniciarPoll(atualizaOrigem, 2000);
  }
  // ---- passo 2 ----
  if (W.step === 2) {
    if (sv) {
      avisarAtividade(nomeFot());
      q('#s-fot').onchange = e => { S.sel.fot = e.target.value; if (e.target.value !== 'Outro...') avisarAtividade(nomeFot()); q('#s-outro').classList.toggle('hidden', e.target.value !== 'Outro...'); if (e.target.value === 'Outro...') q('#s-outro').focus(); atualizaFinal(); };
      q('#s-outro').oninput = e => { S.sel.outro = e.target.value; atualizaFinal(); };
      q('#s-cat').onchange = e => { S.sel.cat = e.target.value; atualizaFinal(); };
    } else { q('#s-nome').oninput = e => { S.sel.nome = e.target.value; }; q('#s-sub').onchange = e => { S.sel.sub = e.target.checked; }; q('#s-nome').focus(); }
    const avancar = () => { if (!nomeOk()) { q('#s-erro').textContent = nomeFot() ? 'O nome não pode conter / \\ : * ? " < > |' : 'Selecione ou digite o nome do fotógrafo.'; return; } avisarAtividade(nomeFot()); if (sv) iniciar(); else ir_(3); };
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
    iniciarPoll(async () => {
      const t = await api('/api/transferencia/status'); const pg = q('#pg'); if (!pg) return;
      pg.value = t.progresso; q('#pg-t').textContent = `${t.fase === 'convertendo' ? 'Convertendo RAW para JPEG · ' : ''}${Math.round(t.progresso * 100)}% (${t.feitos}/${t.total})`;
      if (t.estado === 'concluido' || t.estado === 'erro') {
        pararPoll();
        if (t.estado === 'erro') { await alerta('Erro', t.msg); W.step = 3; return vDescarregar(); }
        if (t.aviso) await alerta('Atenção', t.aviso);
        W.step = 5; await render();
        if (t.revisaveis > 0 && await confirmar('Transferência Finalizada', `Foram transferidas ${t.revisaveis} foto(s) com sucesso!${t.falhas ? `\n(${t.falhas} arquivo(s) com erro de cópia — veja o log do servidor.)` : ''}${t.falhas_raw ? `\n(${t.falhas_raw} RAW não puderam ser convertidos e ficaram em RAW — veja o log do servidor.)` : ''}\n\nDeseja iniciar a tela de seleção agora para revisar e apagar as fotos indesejadas?`)) abrirRevisor();
        else if (t.revisaveis === 0) alerta('Concluído', 'A cópia foi finalizada, mas nenhuma imagem compatível com revisão foi transferida.');
      }
    }, 600);
  }
  // ---- passo 5 ----
  if (W.step === 5) {
    q('#b-sel').onclick = abrirRevisor;
    if (q('#b-edit')) q('#b-edit').onclick = () => abrirEditor();
    q('#b-abrir').onclick = () => api('/api/revisor/abrir-pasta', { body: {} }).catch(e => toast(e.message, true));
    q('#b-novo').onclick = async () => { await api('/api/transferencia/nova', { body: {} }); S.sel.nome = ''; S.sel.outro = ''; S.sel.driveManual = false; W.step = 1; W.pastas = []; S.oChave = null; await carregar(); vDescarregar(); };
    q('#s-drive').onchange = e => { S.sel.drive = e.target.value; S.sel.driveManual = true; };
    // preset em todas as fotos: salva em segundo plano pela fila do editor; o envio ao Drive espera terminar
    const acompanharPreset = async () => {
      let t; try { t = await api('/api/transferencia/status'); } catch (e) { return; }
      const el = q('#pre-st'); if (!el) return pararPoll();
      if (t.edicoes_pendentes) { el.textContent = `Aplicando o preset… faltam ${t.edicoes_pendentes} foto(s).`; return; }
      pararPoll(); if (S.presetAplicado) { el.textContent = `Preset "${S.presetAplicado}" aplicado em todas as fotos.`; S.presetAplicado = ''; }
      const b = q('#b-pre'), s = q('#s-pre'); if (b && s) b.disabled = !s.value;          // da para aplicar outro em seguida
    };
    if (tr.edicoes_pendentes && q('#pre-st')) { acompanharPreset(); iniciarPoll(acompanharPreset, 1500); }
    if (q('#s-pre')) {
      q('#s-pre').onchange = e => { q('#b-pre').disabled = !e.target.value; };
      q('#b-pre').onclick = async ev => {
        const btn = ev.currentTarget, p = presets[+q('#s-pre').value]; if (!p) return;
        if (!await confirmar('Preset em todas as fotos', `Aplicar o preset "${p.nome}" nas ${st.transferidas} foto(s)?\n\nA luz e a cor de cada foto são trocadas pelas do preset; o corte fica como está. A original continua guardada (dá para restaurar no editor).`, 'Aplicar em todas', 'Cancelar')) return;
        btn.disabled = true;
        try {
          await api('/api/editor/aplicar', { body: { indices: [...Array(st.transferidas).keys()], ajustes: p.ajustes, grupos: ['luz', 'curva', 'cor'] } });
          S.presetAplicado = p.nome; toast(`Aplicando o preset "${p.nome}" em ${st.transferidas} foto(s)`);
          acompanharPreset(); iniciarPoll(acompanharPreset, 1500);
        } catch (er) { toast(er.message, true); btn.disabled = false; }
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
      } catch (e) { alerta('Upload', e.message); }
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
      if (await confirmar('Erro de Comunicação LAN', `Não foi possível obter dados das seguintes estações:\n${r.estacoes_com_erro.join(', ')}\n\nDeseja finalizar o Servir mesmo assim (ignorando estas estações)?`)) return finalizarServir(true);
      return;
    }
    await alerta('Sucesso', 'Servir finalizado com sucesso! Todos os dados foram enviados para o webhook.'); S.entrou = false; S.wiz = null; ir('home');
  } catch (e) { if (b) { b.disabled = false; b.innerHTML = ic('bandeira') + 'Finalizar Servir'; } alerta('Erro ao Finalizar', 'Não foi possível enviar os dados ao webhook:\n' + e.message); }
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
  document.body.appendChild(el);
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
  function passo(d) { const h = hist(), p = h.pos + d; if (p < 0 || p >= h.pilha.length) return; h.pos = p; aj = JSON.parse(h.pilha[p]); mostraValores(); agendar(); botoesHist(); }
  function botoesHist() { const h = hist(); $('#e-un').disabled = h.pos <= 0; $('#e-re').disabled = h.pos >= h.pilha.length - 1; }
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
    clearTimeout(tRes); zoom.destruir(); el.remove(); if (urlBlob) { URL.revokeObjectURL(urlBlob); urlBlob = null; }
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
  document.body.appendChild(el);
  const $ = s => el.querySelector(s); const img = $('#r-img');
  const zoom = criarZoom($('#r-stage'), img, t => { $('#r-zt').textContent = t; });
  $('#r-strip').innerHTML = lista.map((n, k) => `<img data-k="${k}" title="${esc(n)}" loading="lazy" src="/api/revisor/imagem/${k}?lado=160&v=${v}">`).join('');
  $('#r-strip').querySelectorAll('img').forEach(t => t.onclick = () => { i = +t.dataset.k; mostra(); });
  // com zoom, as proximas ja vem no tamanho original (o zoom continua ao trocar de foto)
  function precarrega() { [i + 1, i - 1, i + 2].forEach(k => { if (k >= 0 && k < lista.length) new Image().src = `/api/revisor/imagem/${k}?${zoom.precisaOriginal() && k === i + 1 ? 'lado=0&' : ''}v=${v}`; }); }
  function mostra() {
    const d = desc.has(i);
    zoom.foto(`/api/revisor/imagem/${i}?v=${v}`, `/api/revisor/imagem/${i}?lado=0&v=${v}`); $('#r-stage').classList.toggle('desc', d); $('#r-stamp').classList.toggle('hidden', !d);
    const rest = lista.length - desc.size;
    $('#r-info').innerHTML = `<b>Foto ${i + 1}/${lista.length}</b> · ${esc(lista[i])}<br><span class="mini" style="color:#aaa">${desc.size} marcada(s) para descarte · ${rest} mantida(s)</span>`;
    $('#r-undo').disabled = !ordemDesc.length;
    $('#r-strip').querySelectorAll('img').forEach(t => { const k = +t.dataset.k; t.classList.toggle('cur', k === i); t.classList.toggle('desc', desc.has(k)); });
    const cur = $('#r-strip').querySelector('img.cur'); if (cur) cur.scrollIntoView({ block: 'nearest', inline: 'center' });
    precarrega();
  }
  const prox = () => { if (i < lista.length - 1) { i++; mostra(); } }, ant = () => { if (i > 0) { i--; mostra(); } };
  function descartar() { if (!desc.has(i)) { desc.add(i); ordemDesc.push(i); } if (i < lista.length - 1) i++; mostra(); }
  function desfazer() { if (!ordemDesc.length) return; const k = ordemDesc.pop(); desc.delete(k); i = k; mostra(); }
  async function fechar() { document.removeEventListener('keydown', tecla); zoom.destruir(); el.remove(); await render(); }
  async function finalizar() {
    let msg = 'Revisão terminada! Nenhuma foto foi apagada.';
    if (desc.size) {
      if (!await confirmar('Apagar fotos', `Você marcou ${desc.size} foto(s) para apagar.\n\nElas serão apagadas permanentemente do computador.`, `Apagar ${desc.size} foto(s)`, 'Voltar', true)) return;
    }
    try {
      const r = await api('/api/revisor/finalizar', { body: { descartar: [...desc] } });
      if (desc.size) msg = `Limpeza concluída! ${r.apagadas} foto(s) foram apagadas.` + (r.erros ? `\n(Erro ao apagar ${r.erros} foto(s).)` : '');
      document.removeEventListener('keydown', tecla); zoom.destruir(); el.remove();
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
  const h = await api('/api/historico');
  $app.innerHTML = `<div class="wrap"><div class="topbar"><h1>Histórico de descarregamentos</h1><div class="acts"><button class="verm" id="h-limpar">${ic('lixo')}Limpar histórico</button><button class="cinza" id="h-v">${ic('voltar')}Voltar</button></div></div>
  ${h.map(x => { const d = (x.data || '').split('-'); const dt = d.length === 3 ? `${d[2]}/${d[1]}/${d[0]}` : x.data;
    return `<div class="item"><span class="t"><b>${esc(x.fotografo)}</b> <span class="mut">· ${esc(dt)} às ${esc(x.hora)}</span><br>${x.descarregadas} copiadas · ${x.selecionadas} selecionadas<br><span class="mut mini">${esc(x.destino)}</span></span><button class="pq cinza" data-p="${esc(x.destino)}">${ic('pasta')}Abrir pasta</button></div>`; }).join('') || '<p class="mut">Nenhum registro de descarregamento encontrado.</p>'}</div>`;
  $app.querySelector('#h-v').onclick = () => ir('home');
  $app.querySelector('#h-limpar').onclick = async () => { if (await confirmar('Limpar histórico', 'Apagar todo o histórico de descarregamentos?\n\nAs fotos não são apagadas.', 'Limpar histórico', 'Cancelar', true)) { await api('/api/historico', { method: 'DELETE' }); vHistorico(); } };
  $app.querySelectorAll('[data-p]').forEach(b => b.onclick = () => api('/api/fs/abrir', { body: { path: b.dataset.p } }).catch(() => alerta('Pasta Não Encontrada', `A pasta '${b.dataset.p}' não existe ou foi movida/deletada.`)));
}

// ---------- CONFIG DRIVE / PASTAS LOCAIS ----------
async function vDrive() {
  const cfg = S.cfg || (S.cfg = await api('/api/config'));
  $app.innerHTML = `<div class="wrap"><div class="topbar"><h1>Configuração de pastas</h1><div class="acts"><button class="cinza" data-go="google">${ic('chave')}Conta Google</button><button class="cinza" id="d-v">${ic('voltar')}Voltar</button></div></div>
  <p class="mut">Valem só para hoje (${new Date().toLocaleDateString('pt-BR')}).</p>
  <div class="grid"><div class="card"><h2>Pastas do Google Drive</h2>
   <input type="text" id="d-nome" aria-label="Nome de exibição da pasta do Drive" placeholder="Nome de exibição (opcional)" style="margin-bottom:6px"><div class="row"><input type="text" id="d-link" aria-label="Link ou ID da pasta do Drive" placeholder="Link ou ID da pasta"><button class="fix" id="d-add">Adicionar</button></div>
   ${cfg.pastas.map((p, i) => `<div class="item"><span class="t">${esc(p.nome)}<br><span class="mut mini">${esc(p.link)}</span></span><a href="https://drive.google.com/drive/folders/${encodeURIComponent(p.link.split('/folders/').pop().split('?')[0])}" target="_blank"><button class="pq cinza">Abrir</button></a><button class="verm pq" data-rd="${i}">Remover</button></div>`).join('') || '<p class="mut mini">Nenhuma pasta.</p>'}</div>
  <div class="card"><h2>Pastas locais de destino</h2>
   <input type="text" id="l-nome" aria-label="Nome de exibição da pasta local" placeholder="Nome de exibição (opcional)" style="margin-bottom:6px"><div class="row"><input type="text" id="l-cam" aria-label="Caminho da pasta local" placeholder="Caminho da pasta"><button class="fix cinza" id="l-proc">Procurar</button><button class="fix" id="l-add">Adicionar</button></div>
   ${cfg.pastas_local.map((p, i) => `<div class="item"><span class="t">${esc(p.nome)}<br><span class="mut mini">${esc(p.caminho)}</span></span><button class="pq cinza" data-ol="${i}">Abrir</button><button class="verm pq" data-rl="${i}">Remover</button></div>`).join('') || '<p class="mut mini">Nenhuma pasta.</p>'}</div></div>
  <button class="verde grande" id="d-salvar">Salvar e fechar</button></div>`;
  const q = s => $app.querySelector(s);
  $app.querySelectorAll('[data-go]').forEach(b => b.onclick = () => ir(b.dataset.go));
  q('#d-v').onclick = () => { S.cfg = null; ir('home'); };
  q('#d-add').onclick = async () => {
    const link = q('#d-link').value.trim(); let nome = q('#d-nome').value.trim(); if (!link) return;
    if (!nome) { try { nome = (await api('/api/drive/nome-pasta?link=' + encodeURIComponent(link))).nome || ''; } catch (e) { } }
    cfg.pastas.push({ nome: nome || 'Pasta do Google Drive', link }); vDrive();
  };
  q('#l-proc').onclick = async () => { const p = await escolherPasta('Pasta local de destino', q('#l-cam').value); if (p) q('#l-cam').value = p; };
  q('#l-add').onclick = () => { const c = q('#l-cam').value.trim(); if (!c) return; cfg.pastas_local.push({ nome: q('#l-nome').value.trim() || c.split(/[\\/]/).filter(Boolean).pop() || c, caminho: c }); vDrive(); };
  $app.querySelectorAll('[data-rd]').forEach(b => b.onclick = () => { cfg.pastas.splice(b.dataset.rd, 1); vDrive(); });
  $app.querySelectorAll('[data-rl]').forEach(b => b.onclick = () => { cfg.pastas_local.splice(b.dataset.rl, 1); vDrive(); });
  $app.querySelectorAll('[data-ol]').forEach(b => b.onclick = () => api('/api/fs/abrir', { body: { path: cfg.pastas_local[b.dataset.ol].caminho } }).catch(e => toast(e.message, true)));
  q('#d-salvar').onclick = async () => { await api('/api/config', { method: 'PUT', body: cfg }); S.cfg = null; toast('Configurações salvas!'); ir('home'); };
}

// ---------- CONTA GOOGLE ----------
async function vGoogle() {
  const g = await api('/api/google/status');
  $app.innerHTML = `<div class="wrap"><div class="topbar"><h1>Conta Google</h1><div class="acts"><button class="cinza" id="g-v">${ic('voltar')}Voltar</button></div></div>
  ${g.disponivel ? '' : '<p class="bad">As bibliotecas do Google não estão instaladas (pip install -r requirements.txt).</p>'}
  <div class="grid"><div class="card"><h2>1. Credenciais OAuth</h2>
    <p>Status: <b class="${g.tem_credenciais ? 'ok' : 'warn'}">${g.tem_credenciais ? pt('ok') + 'credentials.json configurado' : pt('aviso') + 'não configurado'}</b></p>
    <label for="g-id">Client ID</label><input type="text" id="g-id"><label for="g-sec">Client Secret</label><input type="password" id="g-sec">
    <label style="font-weight:400"><input type="checkbox" id="g-show"> mostrar segredo</label>
    <button id="g-salvar" style="margin-top:8px">Salvar credenciais</button>
    <h3>Ou importe o arquivo JSON do Google Cloud</h3><input type="file" id="g-file" aria-label="Arquivo JSON de credenciais do Google Cloud" accept=".json"></div>
   <div class="card"><h2>2. Login e conexão</h2>
    <p>Token: <b class="${g.tem_token ? 'ok' : 'warn'}">${g.tem_token ? pt('ok') + 'token.json gerado' : pt('aviso') + 'sem login'}</b></p>
    <p class="mut mini">O login abre no navegador do computador que roda o programa.</p>
    <div class="row"><button class="verde" id="g-login">${ic('chave')}Fazer login no Google</button><button class="cinza" id="g-test">${ic('pulso')}Testar conexão</button></div>
    <button class="verm" id="g-desc" style="margin-top:8px">Desconectar conta</button>
    <p id="g-msg" class="${g.login.estado === 'erro' ? 'bad' : 'mut'}">${esc(g.login.msg)}</p><p id="g-conta" class="ok"></p></div></div></div>`;
  const q = s => $app.querySelector(s);
  q('#g-v').onclick = () => ir('home');
  q('#g-show').onchange = e => { q('#g-sec').type = e.target.checked ? 'text' : 'password'; };
  q('#g-salvar').onclick = async () => { try { await api('/api/google/credenciais', { body: { client_id: q('#g-id').value, client_secret: q('#g-sec').value } }); toast('Credenciais salvas!'); vGoogle(); } catch (e) { toast(e.message, true); } };
  q('#g-file').onchange = async e => { const f = e.target.files[0]; if (!f) return; try { await api('/api/google/importar', { body: { conteudo: await f.text() } }); toast('Arquivo importado!'); vGoogle(); } catch (er) { toast(er.message, true); } };
  q('#g-login').onclick = async () => {
    try { await api('/api/google/login', { body: {} }); q('#g-msg').textContent = 'Aguardando autorização no navegador...';
      iniciarPoll(async () => { const s = await api('/api/google/status'); q('#g-msg').textContent = s.login.msg;
        if (s.login.estado !== 'aguardando') { pararPoll(); if (s.login.estado === 'ok') { toast('Login efetuado!'); vGoogle(); } else q('#g-msg').className = 'bad'; } }, 1500);
    } catch (e) { toast(e.message, true); }
  };
  q('#g-test').onclick = async () => { q('#g-msg').textContent = 'Testando a conexão com o Google Drive…'; try { const c = await api('/api/google/testar', { body: {} }); q('#g-conta').textContent = `${c.nome} (${c.email})`; q('#g-msg').textContent = `Conexão funcionando. Logado como ${c.email}`; } catch (e) { q('#g-msg').className = 'bad'; q('#g-msg').textContent = e.message; } };
  q('#g-desc').onclick = async () => { if (await confirmar('Desconectar conta', 'Desconectar a conta do Google e remover o token.json?', 'Desconectar', 'Cancelar', true)) { await api('/api/google/desconectar', { body: {} }); toast('Conta desconectada.'); vGoogle(); } };
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
  const ativos = lista.filter(j => j.estado === 'fila' || j.estado === 'rodando');
  const feitos = lista.reduce((a, j) => a + j.feitos, 0), total = lista.reduce((a, j) => a + j.total, 0);
  const titulo = ativos.length ? `Enviando ao Drive · ${ativos.length} em andamento` : 'Envios ao Drive concluídos';
  $up.innerHTML = `<div class="uphead"><b>${ic('nuvem')}${titulo}</b><span><button class="pq cinza" id="up-min" title="${upMin ? 'Expandir' : 'Minimizar'}" aria-label="${upMin ? 'Expandir' : 'Minimizar'}">${ic(upMin ? 'maximizar' : 'minimizar')}</button>${ativos.length ? '' : `<button class="pq cinza" id="up-x" title="Fechar" aria-label="Fechar">${ic('x')}</button>`}</span></div>
    ${upMin ? `<progress value="${total ? feitos / total : 0}" max="1"></progress>` : lista.slice().reverse().map(j => `<div class="upjob ${j.estado}">
      <div class="uprow"><span>${ic(j.estado === 'concluido' ? 'ok' : j.estado === 'erro' ? 'alerta' : j.estado === 'fila' ? 'relogio' : 'enviar', 'st')}<b>${esc(j.fotografo)}</b></span><span class="mini">${j.feitos}/${j.total}</span></div>
      <progress value="${j.progresso}" max="1"></progress>
      ${j.estado === 'rodando' && (j.atuais || []).length ? `<div class="upfiles">${j.atuais.map(n => `<div title="${esc(n)}">${esc(n)}</div>`).join('')}</div>` : ''}
      <div class="mini mut">${esc(j.estado === 'concluido' || j.estado === 'erro' ? j.msg : j.estado === 'fila' ? 'Na fila de envio...' : 'Enviando para ' + j.destino)}${j.erros ? ` · <span class="bad">${j.erros} com erro</span>` : ''}</div></div>`).join('')}`;
  $up.querySelector('#up-min').onclick = () => { upMin = !upMin; upUlt = ''; uploadsAtualiza(); };
  const x = $up.querySelector('#up-x'); if (x) x.onclick = async () => { await api('/api/uploads/limpar', { body: {} }); upUlt = ''; uploadsAtualiza(); };
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
    if (ativos < upAtivosAntes) { const ult = l.filter(j => j.estado === 'concluido' || j.estado === 'erro').pop(); if (ult) toast(ult.estado === 'erro' ? `Envio de ${ult.fotografo} terminou com erros` : `Envio de ${ult.fotografo} concluído`, ult.estado === 'erro'); }
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
(() => {
  const sim = document.querySelector('.simbolo');
  if (!sim || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let x = 0, y = 0, pedido = 0, parado = 0;
  // clique: pula de novo a cada clique, mesmo no meio de um pulo (tira a classe, forca o reflow e poe de volta)
  sim.addEventListener('click', () => { sim.classList.remove('pula'); void sim.getBoundingClientRect(); sim.classList.add('pula'); });
  sim.querySelector('.dh-caixa').addEventListener('animationend', e => { if (e.animationName === 'dh-pulinho') sim.classList.remove('pula'); });
  const mira = () => {
    pedido = 0;
    const r = sim.getBoundingClientRect();
    const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height * .68), d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 200);
    sim.style.setProperty('--ox', (dx / d * 36 * k).toFixed(1) + 'px');
    sim.style.setProperty('--oy', (dy / d * 26 * k).toFixed(1) + 'px');
    sim.classList.add('segue');
  };
  addEventListener('pointermove', e => {
    x = e.clientX; y = e.clientY;
    if (!pedido) pedido = requestAnimationFrame(mira);
    clearTimeout(parado); parado = setTimeout(() => sim.classList.remove('segue'), 3000);
  }, { passive: true });
})();

render();
