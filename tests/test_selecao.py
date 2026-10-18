"""Selecao de varias fotos na tela de selecao (Shift, Ctrl, Ctrl+A e Delete), issue #28.

A logica da selecao fica em app/static/selecao.js (o mesmo arquivo que o navegador carrega) e e testada aqui com o
Node; sem o Node esses testes sao pulados. O descarte em lote no servidor usa o mesmo /api/revisor/finalizar."""
import json
import os
import shutil
import subprocess
import time

import test_painel  # noqa: F401  (configura DATA_DIR/FOTOS_DIR temporarios antes de importar o app)
from test_painel import TMP, criar_servir, estado_limpo, local  # noqa: F401 (fixture)

import pytest
from PIL import Image

from app.core import E

SELECAO = os.path.join(os.path.dirname(__file__), "..", "app", "static", "selecao.js")
node = pytest.mark.skipif(not shutil.which("node"), reason="Node.js não instalado")


def selecao(script):
    """Roda `script` no Node com `S` = selecao.js e `lista(set)` = indices em ordem; devolve o JSON impresso."""
    codigo = f"""const S = require({json.dumps(os.path.abspath(SELECAO))});
const lista = s => [...s].sort((a, b) => a - b);
console.log(JSON.stringify((() => {{ {script} }})()));"""
    r = subprocess.run(["node", "-e", codigo], capture_output=True, text=True, timeout=30)
    assert r.returncode == 0, r.stderr
    return json.loads(r.stdout)


@node
def test_clique_simples_seleciona_so_ela_e_vira_a_ancora():
    assert selecao("const r = S.clique(new Set([1, 2, 3]), 1, 5); return [lista(r.sel), r.ancora];") == [[5], 5]


@node
def test_shift_clique_seleciona_o_intervalo_nos_dois_sentidos():
    assert selecao("return lista(S.clique(new Set([2]), 2, 6, { shift: true }).sel);") == [2, 3, 4, 5, 6]
    assert selecao("return lista(S.clique(new Set([6]), 6, 3, { shift: true }).sel);") == [3, 4, 5, 6]
    # o intervalo substitui a selecao anterior e a ancora fica onde estava
    assert selecao("const r = S.clique(new Set([0, 9]), 4, 6, { shift: true }); return [lista(r.sel), r.ancora];") == [[4, 5, 6], 4]


@node
def test_ctrl_clique_soma_e_tira_sem_perder_as_outras():
    assert selecao("return lista(S.clique(new Set([1, 4]), 4, 7, { ctrl: true }).sel);") == [1, 4, 7]
    assert selecao("const r = S.clique(new Set([1, 4, 7]), 7, 4, { ctrl: true }); return [lista(r.sel), r.ancora];") == [[1, 7], 4]
    # Ctrl + Shift soma o intervalo ao que ja estava selecionado
    assert selecao("return lista(S.clique(new Set([0]), 3, 5, { shift: true, ctrl: true }).sel);") == [0, 3, 4, 5]


@node
def test_ctrl_a_seleciona_todas():
    assert selecao("return lista(S.tudo(5));") == [0, 1, 2, 3, 4]
    assert selecao("return lista(S.tudo(0));") == []


@node
def test_delete_descarta_so_as_selecionadas_ainda_nao_descartadas():
    assert selecao("return S.aDescartar(new Set([7, 2, 5, 3]), new Set([5]));") == [2, 3, 7]
    assert selecao("return S.aDescartar(new Set([1, 2]), new Set([1, 2]));") == []


def test_finalizar_apaga_o_lote_descartado():
    """Depois de Shift/Ctrl/Ctrl+A + Delete, as marcadas vao juntas para o servidor ao finalizar a selecao."""
    criar_servir()
    pasta = os.path.join(TMP, f"cartao-lote-{time.time_ns()}", "DCIM", "100CANON")
    os.makedirs(pasta)
    for k in range(6):
        Image.new("RGB", (40, 30), (30 * k, 90, 160)).save(os.path.join(pasta, f"IMG_{k:04d}.JPG"))
    local.post("/api/origem", json={"path": os.path.dirname(os.path.dirname(pasta))})
    r = local.post("/api/transferencia/iniciar", json={"fotografo": "Ana", "destino_base": E.destino_base,
                                                      "pastas": ["."], "categoria": "Louvor"})
    assert r.status_code == 200, r.text
    for _ in range(200):
        if E.transfer["estado"] != "rodando":
            break
        time.sleep(0.05)
    fotos = list(E.arquivos_transferidos)
    assert len(fotos) == 6
    r = local.post("/api/revisor/finalizar", json={"descartar": [1, 2, 3, 5]}).json()   # intervalo 1-3 + a 5 avulsa
    assert r == {"apagadas": 4, "erros": 0, "restantes": 2}
    assert [os.path.exists(f) for f in fotos] == [True, False, False, False, True, False]
    assert local.get("/api/revisor").json()["arquivos"] == [os.path.basename(fotos[0]), os.path.basename(fotos[4])]
