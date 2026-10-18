/* Selecao de varias fotos na tira da tela de selecao, como no explorador de arquivos do sistema.
   Funcoes puras (sem tela): a tela de selecao (app.js) usa e tests/test_selecao.py testa com o Node. */
const Selecao = {
  // clique numa miniatura. Simples: so ela (e vira a ancora). Ctrl: liga/desliga ela sem perder as outras (vira a
  // ancora). Shift: da ancora ate ela (Ctrl+Shift soma esse intervalo ao que ja estava selecionado).
  clique(sel, ancora, k, { shift = false, ctrl = false } = {}) {
    if (shift && ancora !== null && ancora !== undefined) {
      const s = ctrl ? new Set(sel) : new Set();
      for (let x = Math.min(ancora, k); x <= Math.max(ancora, k); x++) s.add(x);
      return { sel: s, ancora };
    }
    if (ctrl) {
      const s = new Set(sel);
      if (s.has(k)) s.delete(k); else s.add(k);
      return { sel: s, ancora: k };
    }
    return { sel: new Set([k]), ancora: k };
  },
  // Ctrl+A
  tudo(total) {
    return new Set(Array.from({ length: total }, (_, k) => k));
  },
  // Delete: as selecionadas que ainda nao estao descartadas, em ordem
  aDescartar(sel, descartadas) {
    return [...sel].filter(k => !descartadas.has(k)).sort((a, b) => a - b);
  },
};
if (typeof module !== 'undefined') module.exports = Selecao;
