"""Cartao com fotos de dias diferentes (issue #29): agrupar por dia e descarregar so os dias escolhidos.
Rodar: .venv/bin/python -m pytest tests -q"""
import os
import time

import test_painel  # noqa: F401  (configura DATA_DIR/FOTOS_DIR temporarios antes de importar o app)
from test_painel import TMP, criar_servir, estado_limpo, local  # noqa: F401 (fixture)

from PIL import Image

from app.core import E


def _segundos(data, hora=12):
    a, m, d = (int(x) for x in data.split("-"))
    return time.mktime((a, m, d, hora, 0, 0, 0, 0, -1))


def cartao(fotos):
    """fotos: [(nome, data do EXIF ou None, data do arquivo)]. Devolve a pasta do cartao (com DCIM/100CANON)."""
    raiz = os.path.join(TMP, f"cartao-datas-{time.time_ns()}")
    pasta = os.path.join(raiz, "DCIM", "100CANON")
    os.makedirs(pasta)
    for nome, exif_data, arquivo_data in fotos:
        caminho = os.path.join(pasta, nome)
        exif = Image.Exif()
        if exif_data:
            exif.get_ifd(0x8769)[36867] = exif_data.replace("-", ":") + " 09:30:00"
        Image.new("RGB", (40, 30), (90, 120, 160)).save(caminho, exif=exif)
        t = _segundos(arquivo_data)
        os.utime(caminho, (t, t))
    local.post("/api/origem", json={"path": raiz})
    return raiz


def corpo(**extra):
    return {"fotografo": "Ana", "destino_base": E.destino_base, "pastas": ["."], "categoria": "Louvor", **extra}


def plano():
    r = local.post("/api/transferencia/plano", json=corpo())
    assert r.status_code == 200, r.text
    return r.json()


def resumo(dias):
    return [(d["data"], d["fotos"]) for d in dias]


def esperar_copia():
    for _ in range(200):
        if E.transfer["estado"] != "rodando":
            break
        time.sleep(0.05)


def test_um_dia_so_nao_pede_para_escolher():
    criar_servir()
    cartao([(f"IMG_{k}.JPG", "2026-10-18", "2026-10-18") for k in range(4)])
    p = plano()
    assert resumo(p["dias_todas"]) == [("2026-10-18", 4)] and resumo(p["dias_novas"]) == [("2026-10-18", 4)]


def test_varios_dias_lista_cada_dia_com_quantidade_e_exemplo():
    criar_servir()
    cartao([(f"OLD_{k}.JPG", "2026-10-12", "2026-10-12") for k in range(3)]
           + [(f"NEW_{k}.JPG", "2026-10-18", "2026-10-18") for k in range(2)])
    dias = plano()["dias_todas"]
    assert resumo(dias) == [("2026-10-12", 3), ("2026-10-18", 2)]          # do mais antigo ao mais recente
    for d in dias:                                       # cada dia traz a miniatura de uma foto dele
        r = local.get("/api/origem/miniatura", params={"caminho": d["exemplo"]})
        assert r.status_code == 200 and r.headers["content-type"] == "image/jpeg"


def test_foto_sem_exif_usa_a_data_do_arquivo():
    criar_servir()
    cartao([("COM_EXIF.JPG", "2026-10-12", "2026-10-18"),     # EXIF manda: a data do arquivo pode ter mudado
            ("SEM_EXIF.JPG", None, "2026-09-30")])
    assert resumo(plano()["dias_todas"]) == [("2026-09-30", 1), ("2026-10-12", 1)]


def test_so_as_mais_recentes_copia_apenas_o_ultimo_dia():
    criar_servir()
    cartao([(f"OLD_{k}.JPG", "2026-10-12", "2026-10-12") for k in range(3)]
           + [(f"NEW_{k}.JPG", "2026-10-18", "2026-10-18") for k in range(2)])
    r = local.post("/api/transferencia/iniciar", json=corpo(dias=["2026-10-18"]))
    assert r.status_code == 200 and r.json()["total"] == 2
    esperar_copia()
    assert len(E.arquivos_transferidos) == 2


def test_escolher_dias_manualmente_e_todas():
    criar_servir()
    cartao([("A.JPG", "2026-10-01", "2026-10-01"), ("B.JPG", "2026-10-12", "2026-10-12"),
            ("C.JPG", "2026-10-12", "2026-10-12"), ("D.JPG", "2026-10-18", "2026-10-18")])
    r = local.post("/api/transferencia/iniciar", json=corpo(dias=["2026-10-01", "2026-10-18"]))
    assert r.json()["total"] == 2
    esperar_copia()
    local.post("/api/transferencia/nova", json={})
    r = local.post("/api/transferencia/iniciar", json=corpo(modo="todas", dias=[]))   # [] = todas as datas
    assert r.json()["total"] == 4
    esperar_copia()


def test_dia_sem_fotos_e_recusado():
    criar_servir()
    cartao([("A.JPG", "2026-10-18", "2026-10-18")])
    r = local.post("/api/transferencia/iniciar", json=corpo(dias=["2020-01-01"]))
    assert r.status_code == 400 and "datas escolhidas" in r.json()["detail"]


def test_miniatura_so_serve_foto_de_dentro_do_cartao():
    criar_servir()
    raiz = cartao([("A.JPG", "2026-10-18", "2026-10-18")])
    fora = os.path.join(TMP, "fora.jpg")
    Image.new("RGB", (10, 10)).save(fora)
    for caminho in ("../fora.jpg", os.path.relpath(fora, raiz), fora, "DCIM/100CANON/nao_existe.jpg"):
        assert local.get("/api/origem/miniatura", params={"caminho": caminho}).status_code == 404, caminho
