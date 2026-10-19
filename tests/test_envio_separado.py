"""'Enviar separado' (issue #30): cada grupo de fotos vai para a pasta da sua categoria no Drive.
O Google e simulado (login e pastas); o que cada envio mandaria e capturado. Rodar: .venv/bin/python -m pytest tests -q"""
import os
import time

import test_painel  # noqa: F401  (configura DATA_DIR/FOTOS_DIR temporarios antes de importar o app)
from test_painel import TMP, criar_servir, descarregar, estado_limpo, local  # noqa: F401 (fixture)

import pytest

from app import core, drive, editor
from app.core import E

PASTA_X = "https://drive.google.com/drive/folders/1CultoDasNoveXYZ"
PASTA_Y = "https://drive.google.com/drive/folders/2CultoDasOnzeABC"


@pytest.fixture
def drive_falso(monkeypatch):
    """Google simulado: login ok, toda pasta existe (menos as "QUEBRADA") e cada envio so e anotado."""
    enviados = []
    cred = os.path.join(TMP, "credentials-teste.json")
    open(cred, "w").write("{}")
    monkeypatch.setattr(core, "PATH_CRED", cred)
    monkeypatch.setattr(drive, "DISPONIVEL", True)
    monkeypatch.setattr(drive, "_credenciais", lambda: "credenciais")

    def destino(creds, link):
        if "QUEBRADA" in link:
            raise RuntimeError("Não foi possível acessar a pasta no Google Drive.")
        fid = drive.extrair_id_pasta(link)
        return fid, "a raiz do Google Drive" if fid == "root" else f"a pasta '{fid}'"

    def enviar(job, creds, folder_id, arquivos, raiz=None):
        enviados.append((folder_id, sorted(os.path.basename(a) for a in arquivos)))
        job.update(estado="concluido", feitos=len(arquivos), progresso=1)
        drive._em_envio.difference_update(arquivos)
    monkeypatch.setattr(drive, "_destino", destino)
    monkeypatch.setattr(drive, "_enviar", enviar)
    return enviados


def esperar(enviados, quantos):
    for _ in range(100):
        if len(enviados) >= quantos:
            return
        time.sleep(0.05)
    raise AssertionError(f"esperava {quantos} envio(s), veio {enviados}")


def nomes(*indices):
    return sorted(os.path.basename(E.arquivos_transferidos[i]) for i in indices)


def test_cada_grupo_vai_para_a_pasta_da_sua_categoria(drive_falso):
    criar_servir()
    descarregar("Ana", 5)
    r = local.post("/api/upload/separado", json={"grupos": [{"link": PASTA_X, "indices": [0, 1, 2]},
                                                            {"link": PASTA_Y, "indices": [3, 4]}]})
    assert r.status_code == 200, r.text
    assert r.json()["total"] == 5 and len(r.json()["envios"]) == 2
    esperar(drive_falso, 2)
    assert sorted(drive_falso) == sorted([("1CultoDasNoveXYZ", nomes(0, 1, 2)), ("2CultoDasOnzeABC", nomes(3, 4))])


def test_todas_as_fotos_precisam_de_categoria(drive_falso):
    criar_servir()
    descarregar("Ana", 4)
    r = local.post("/api/upload/separado", json={"grupos": [{"link": PASTA_X, "indices": [1, 2]}]})
    assert r.status_code == 400 and "faltam 2" in r.json()["detail"]
    time.sleep(0.2)
    assert drive_falso == []                                   # nada foi enviado


def test_envio_normal_continua_igual(drive_falso):
    criar_servir()
    descarregar("Ana", 3)
    r = local.post("/api/upload/iniciar", json={"link": PASTA_X})
    assert r.status_code == 200 and r.json()["total"] == 3
    esperar(drive_falso, 1)
    assert drive_falso == [("1CultoDasNoveXYZ", nomes(0, 1, 2))]


def test_pasta_quebrada_nao_deixa_envio_pela_metade(drive_falso):
    criar_servir()
    descarregar("Ana", 3)
    antes = len(E.uploads)
    r = local.post("/api/upload/separado", json={"grupos": [{"link": PASTA_X, "indices": [0]},
                                                            {"link": PASTA_X + "QUEBRADA", "indices": [1, 2]}]})  # todas
    assert r.status_code == 400 and "acessar a pasta" in r.json()["detail"]
    time.sleep(0.2)
    assert drive_falso == [] and len(E.uploads) == antes      # nem o grupo da pasta boa foi enfileirado


def test_grupos_invalidos_sao_recusados(drive_falso):
    criar_servir()
    descarregar("Ana", 3)
    casos = [
        ({"grupos": [{"link": PASTA_X, "indices": [0, 1]}, {"link": PASTA_Y, "indices": [1, 2]}]}, "uma categoria"),
        ({"grupos": [{"link": PASTA_X, "indices": [0, 1, 2, 9]}]}, "inexistente"),
        ({"grupos": [{"link": PASTA_X, "indices": []}]}, "pelo menos uma foto"),
        ({"grupos": []}, "pelo menos uma foto"),
    ]
    for corpo, motivo in casos:
        r = local.post("/api/upload/separado", json=corpo)
        assert r.status_code == 400 and motivo in r.json()["detail"], (corpo, r.text)
    assert drive_falso == []


def test_proximo_voluntario_nao_interrompe_o_envio(drive_falso, monkeypatch):
    """Issue #38: limpar a sessao libera o PC para o proximo cartao, e o envio anterior termina com as fotos dele."""
    import threading
    criar_servir()
    descarregar("Ana", 2)
    caminhos = list(E.arquivos_transferidos)
    fotos = [os.path.basename(p) for p in caminhos]
    servir_id = E.active_servir["id"]
    segurar = threading.Event()

    def devagar(job, creds, folder_id, arquivos, raiz=None):
        assert job["fotografo"] == "Ana"
        segurar.wait(5)
        drive_falso.append((folder_id, sorted(os.path.basename(a) for a in arquivos)))
        job.update(estado="concluido", feitos=len(arquivos), progresso=1, msg="enviado")
        drive._em_envio.difference_update(arquivos)
    monkeypatch.setattr(drive, "_enviar", devagar)

    assert local.post("/api/upload/iniciar", json={"link": PASTA_X}).status_code == 200
    assert local.post("/api/transferencia/nova").status_code == 200
    assert E.arquivos_transferidos == [] and E.sessao_fotografo is None and E.transfer["estado"] == "idle"
    assert E.active_servir["id"] == servir_id          # culto, pasta base e link do Drive continuam
    assert any(j["estado"] in ("fila", "rodando") and j["fotografo"] == "Ana" for j in E.uploads)
    descarregar("Bia", 1)                              # o proximo voluntario ja copia, com o envio da Ana parado no meio
    segurar.set()
    esperar(drive_falso, 1)
    assert drive_falso[0][1] == sorted(fotos)
    for p in caminhos:                                 # trocar de voluntario nao apaga as fotos que ja estavam no computador
        assert os.path.exists(p)


def test_envio_separado_espera_o_preset_terminar(drive_falso, monkeypatch):
    criar_servir()
    descarregar("Ana", 2)
    monkeypatch.setattr(editor, "pendentes", lambda: 2)
    r = local.post("/api/upload/separado", json={"grupos": [{"link": PASTA_X, "indices": [0, 1]}]})
    assert r.status_code == 400 and "salvando" in r.json()["detail"]


def test_lista_traz_a_hora_de_cada_foto():
    criar_servir()
    descarregar("Ana", 3)
    r = local.get("/api/revisor").json()
    assert len(r["momentos"]) == len(r["arquivos"]) == 3
    assert r["momentos"] == [int(os.path.getmtime(p)) for p in E.arquivos_transferidos]
