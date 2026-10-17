"""Testes do painel de acompanhamento (issue #1). Rodar: .venv/bin/python -m pytest tests -q"""
import os
import sys
import tempfile
import time

TMP = tempfile.mkdtemp(prefix="descarregar-teste-")
os.environ["DATA_DIR"] = os.path.join(TMP, "data")
os.environ["FOTOS_DIR"] = os.path.join(TMP, "fotos")
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app import core, drive, painel  # noqa: E402
from app.core import E  # noqa: E402
from app.main import app  # noqa: E402

# sem "with": o startup (rede UDP, monitor do cartao, git fetch) nao roda nos testes
# a tela manda o cabecalho X-DropHouse em todo pedido; os testes fazem o mesmo
local = TestClient(app, headers={"X-DropHouse": "1"})
celular = TestClient(app, client=("192.168.0.77", 40000))   # outro aparelho da rede local


@pytest.fixture(autouse=True)
def estado_limpo(monkeypatch):
    E.network_mode = "lider"
    E.auxiliar_stations.clear()
    E.lider_detectado = None
    E.transfer = {"estado": "idle", "progresso": 0, "total": 0, "feitos": 0, "msg": ""}
    core.ativar_servir(None)
    painel.limpar_cache()
    monkeypatch.setattr(painel.platform, "node", lambda: "PC-IGREJA")
    yield
    painel.limpar_cache()


def criar_servir(nome="Culto Teste", vols=("Samuel", "Ana", "Bia")):
    r = local.post("/api/servir", json={"nome": f"{nome} {time.time_ns()}", "voluntarios": list(vols),
                                        "pastas_predefinidas": ["Louvor"]})
    assert r.status_code == 200, r.text
    return r.json()


def cartao(n):
    pasta = tempfile.mkdtemp(dir=TMP, prefix="cartao-")
    os.makedirs(os.path.join(pasta, "DCIM", "100CANON"))
    for i in range(n):
        with open(os.path.join(pasta, "DCIM", "100CANON", f"IMG_{i:04d}.JPG"), "wb") as f:
            f.write(b"\xff\xd8\xff\xd9")
    return pasta


def descarregar(fotografo, n, categoria="Louvor"):
    assert local.post("/api/origem", json={"path": cartao(n)}).status_code == 200
    assert local.post("/api/atividade", json={"acao": "ocupar"}).status_code == 200
    r = local.post("/api/transferencia/iniciar", json={
        "fotografo": fotografo, "destino_base": E.destino_base, "pastas": ["."], "categoria": categoria})
    assert r.status_code == 200, r.text
    for _ in range(100):
        if E.transfer["estado"] != "rodando":
            break
        time.sleep(0.05)
    assert E.transfer["estado"] == "concluido", E.transfer
    painel.limpar_cache()


def dados():
    painel.limpar_cache()
    r = celular.get("/painel/dados")
    assert r.status_code == 200
    return r.json()


def test_celular_acessa_so_o_painel():
    assert celular.get("/painel").status_code == 200
    assert "Painel do Servir" in celular.get("/painel").text
    assert celular.get("/painel/dados").status_code == 200
    assert celular.get("/atividade").status_code == 200
    # o resto da interface continua so na propria maquina
    assert celular.get("/api/state").status_code == 403
    assert celular.post("/api/atividade", json={"acao": "liberar"}).status_code == 403
    assert celular.get("/api/painel/qr.svg").status_code == 403


def test_sem_servir_ativo():
    assert dados() == {"modo": "lider", "servir": None}


def test_qr_code_aponta_para_o_painel():
    criar_servir()
    info = local.get("/api/painel/info").json()
    assert info["urls"][0] == f"http://{info['ips'][0]}:{E.local_port}/painel"
    r = local.get("/api/painel/qr.svg", params={"ip": info["ips"][0]})
    assert r.status_code == 200 and r.headers["content-type"].startswith("image/svg+xml")
    assert b"<svg" in r.content
    # ip invalido cai no ip principal em vez de gerar um QR qualquer
    assert local.get("/api/painel/qr.svg", params={"ip": "<script>"}).status_code == 200


def test_status_livre_ocupado_e_tempo():
    criar_servir()
    d = dados()
    assert d["estacoes"][0]["papel"] == "lider" and d["estacoes"][0]["atividade"]["estado"] == "livre"
    assert d["agora"] == [] and d["gerais"]["pcs_livres"] == 1

    local.post("/api/atividade", json={"acao": "ocupar"})            # escolheu as fotos do cartao
    local.post("/api/atividade", json={"acao": "ocupar", "voluntario": "Samuel"})
    E.atividade["inicio_ts"] -= 65                                   # comecou ha 1 min 05 s
    d = dados()
    agora = d["agora"][0]
    assert agora["voluntario"] == "Samuel" and agora["papel"] == "lider" and agora["estacao"] == "PC-IGREJA"
    assert 65 <= agora["segundos"] < 70
    assert d["gerais"]["pcs_ocupados"] == 1 and d["gerais"]["pcs_livres"] == 0
    assert d["faltam"][0] == {"voluntario": "Samuel", "descarregando_agora": True}

    # o tempo nao zera quando so muda o voluntario escolhido
    local.post("/api/atividade", json={"acao": "ocupar", "voluntario": "Ana"})
    assert dados()["agora"][0]["segundos"] >= 65

    local.post("/api/atividade", json={"acao": "liberar"})
    assert dados()["agora"] == []


def test_ja_descarregou_e_quem_falta():
    sv = criar_servir()
    descarregar("Samuel", 5)
    d = dados()
    # depois da copia o PC continua ocupado (revisao/envio) ate o "Novo Descarregamento"
    assert d["agora"][0]["fase"] == "concluido" and d["agora"][0]["voluntario"] == "Samuel"
    assert local.post("/api/transferencia/nova").status_code == 200
    descarregar("samuel", 3, categoria="Raiz (Nenhuma)")   # mesma pessoa, outra caixa e outra categoria
    local.post("/api/transferencia/nova")

    d = dados()
    assert d["servir"]["id"] == sv["id"]
    assert d["agora"] == []
    assert [(v["voluntario"], v["fotos"], v["vezes"]) for v in d["ja_descarregaram"]] == [("Samuel", 8, 2)]
    assert d["ja_descarregaram"][0]["categorias"] == {"Louvor": 5}
    assert [f["voluntario"] for f in d["faltam"]] == ["Ana", "Bia"]
    g = d["gerais"]
    assert (g["total_fotos"], g["ja_descarregaram"], g["faltam"], g["voluntarios"]) == (8, 1, 2, 3)


def test_progresso_da_copia_aparece():
    criar_servir()
    E.atividade = {"estado": "ocupado", "fase": "copiando", "voluntario": "Bia", "inicio_ts": time.time()}
    E.transfer.update(feitos=40, total=100)
    a = dados()["agora"][0]
    assert (a["fase"], a["feitos"], a["total"]) == ("copiando", 40, 100)


class Resp:
    def __init__(self, codigo, corpo=None):
        self.status_code, self._corpo = codigo, corpo

    def json(self):
        return self._corpo


def test_junta_os_pcs_auxiliares(monkeypatch):
    sv = criar_servir()
    descarregar("Samuel", 2)
    local.post("/api/transferencia/nova")
    E.auxiliar_stations.update({
        "10.0.0.2": {"nome": "PC-AUX-1", "port": 50007, "last_seen": time.time()},
        "10.0.0.3": {"nome": "PC-AUX-2", "port": 50007, "last_seen": time.time()},
        "10.0.0.4": {"nome": "PC-DESKTOP", "port": 50007, "last_seen": time.time()},
        "10.0.0.5": {"nome": "PC-OUTRO-SERVIR", "port": 50007, "last_seen": time.time()},
    })
    respostas = {
        "10.0.0.2": Resp(200, {"servir_id": sv["id"], "atividade": {
            "estado": "ocupado", "fase": "copiando", "voluntario": "Ana", "segundos": 30, "feitos": 1, "total": 9},
            "descarregados": [{"voluntario": "Samuel", "categoria": "Louvor", "fotos": 4, "vezes": 1, "ultimo": ""},
                              {"voluntario": "Bia", "categoria": None, "fotos": 7, "vezes": 1, "ultimo": ""}]}),
        "10.0.0.4": Resp(404),
        "10.0.0.5": Resp(200, {"servir_id": "outro", "atividade": {"estado": "livre"},
                               "descarregados": [{"voluntario": "Ana", "fotos": 99, "vezes": 1}]}),
    }

    def get(url, timeout):
        ip = url.split("//")[1].split(":")[0]
        if ip not in respostas:
            raise painel.requests.ConnectionError("sem rede")
        return respostas[ip]
    monkeypatch.setattr(painel.requests, "get", get)

    d = dados()
    est = {e["nome"]: e for e in d["estacoes"]}
    assert est["PC-AUX-1"]["online"] and est["PC-AUX-1"]["atividade"]["estado"] == "ocupado"
    assert not est["PC-AUX-2"]["online"]
    assert est["PC-DESKTOP"]["online"] and est["PC-DESKTOP"]["sem_suporte"]
    assert d["agora"] == [{"estacao": "PC-AUX-1", "papel": "auxiliar", "voluntario": "Ana", "fase": "copiando",
                           "segundos": 30, "feitos": 1, "total": 9}]
    fotos = {v["voluntario"]: v["fotos"] for v in d["ja_descarregaram"]}
    assert fotos == {"Samuel": 6, "Bia": 7}            # o auxiliar de outro Servir nao entra na conta
    samuel = next(v for v in d["ja_descarregaram"] if v["voluntario"] == "Samuel")
    assert sorted(samuel["estacoes"]) == ["PC-AUX-1", "PC-IGREJA"]
    assert d["faltam"] == [{"voluntario": "Ana", "descarregando_agora": True}]
    g = d["gerais"]
    assert (g["pcs"], g["pcs_ocupados"], g["pcs_livres"], g["pcs_offline"], g["total_fotos"]) == (5, 1, 2, 1, 13)


def test_estacao_auxiliar_indica_o_lider():
    criar_servir()
    E.network_mode = "auxiliar"
    E.lider_detectado = {"ip": "10.0.0.1", "port": 50007, "nome_evento": "X", "evento_id": "1"}
    d = dados()
    assert d["modo"] == "auxiliar" and d["lider"]["ip"] == "10.0.0.1"


def test_atividade_do_auxiliar_para_o_lider():
    sv = criar_servir()
    descarregar("Bia", 3)
    a = celular.get("/atividade").json()
    assert a["servir_id"] == sv["id"] and a["nome"] == "PC-IGREJA"
    assert a["atividade"]["estado"] == "ocupado" and a["atividade"]["voluntario"] == "Bia"
    assert "inicio_ts" not in a["atividade"]
    assert a["descarregados"] == [{"voluntario": "Bia", "categoria": "Louvor", "fotos": 3, "vezes": 1,
                                   "ultimo": a["descarregados"][0]["ultimo"]}]


def test_finalizar_ou_trocar_servir_libera_o_pc():
    criar_servir()
    local.post("/api/atividade", json={"acao": "ocupar", "voluntario": "Ana"})
    local.post("/api/avulso")                      # botao "Início"
    assert E.atividade == {"estado": "livre"}


def test_enviar_ao_drive_libera_o_pc(monkeypatch):
    criar_servir()
    descarregar("Samuel", 2)
    assert dados()["agora"][0]["voluntario"] == "Samuel"
    monkeypatch.setattr(drive, "iniciar_upload", lambda link, fot: {"id": 1, "total": 2, "ignoradas": 0})
    assert local.post("/api/upload/iniciar", json={"link": ""}).status_code == 200
    d = dados()
    assert d["agora"] == [] and d["estacoes"][0]["atividade"]["estado"] == "livre"


def test_envio_com_erro_nao_libera_o_pc(monkeypatch):
    criar_servir()
    descarregar("Samuel", 2)

    def falha(link, fot):
        raise RuntimeError("Você não está logado no Google.")
    monkeypatch.setattr(drive, "iniciar_upload", falha)
    assert local.post("/api/upload/iniciar", json={"link": ""}).status_code == 400
    assert dados()["agora"][0]["voluntario"] == "Samuel"


def test_envios_ao_drive_de_todos_os_pcs(monkeypatch):
    sv = criar_servir()
    E.uploads[:] = [
        {"id": 1, "fotografo": "Rafael Soler", "total": 41, "feitos": 41, "progresso": 1, "erros": 0,
         "estado": "concluido", "destino": "a pasta 'A3'", "atuais": [], "servir_id": sv["id"],
         "msg": "41 de 41 fotos enviadas para a pasta 'A3'."},
        {"id": 2, "fotografo": "Velho", "total": 1, "feitos": 1, "progresso": 1, "erros": 0, "estado": "concluido",
         "destino": "x", "atuais": [], "servir_id": "servir-de-ontem", "msg": ""},
    ]
    E.auxiliar_stations["10.0.0.2"] = {"nome": "PC-AUX-1", "port": 50007, "last_seen": time.time()}
    job_aux = {"id": 7, "fotografo": "Ana", "total": 10, "feitos": 3, "progresso": 0.3, "erros": 0,
               "estado": "rodando", "destino": "a pasta 'Louvor'", "atuais": ["Ana_004.JPG"], "servir_id": sv["id"],
               "msg": "Enviando 3/10..."}
    monkeypatch.setattr(painel.requests, "get", lambda url, timeout: Resp(200, {
        "servir_id": sv["id"], "atividade": {"estado": "livre"}, "descarregados": [], "uploads": [job_aux]}))
    try:
        ups = dados()["uploads"]
    finally:
        E.uploads.clear()
    assert [(u["fotografo"], u["estacao"], u["papel"], u["estado"]) for u in ups] == [
        ("Rafael Soler", "PC-IGREJA", "lider", "concluido"), ("Ana", "PC-AUX-1", "auxiliar", "rodando")]
    assert ups[1]["atuais"] == ["Ana_004.JPG"] and ups[0]["msg"].startswith("41 de 41")


def test_broadcast_em_cada_rede_local(monkeypatch):
    # 255.255.255.255 sai por uma placa so (macOS, Windows com VPN): o lider anuncia tambem em cada rede
    monkeypatch.setattr(painel, "interfaces_locais", lambda: [
        ("192.168.15.100", "255.255.255.0"), ("10.1.2.3", "255.255.0.0"), ("172.16.0.5", None), ("10.9.9.9", "255.255.255.255")])
    assert painel.enderecos_broadcast() == ["192.168.15.255", "10.1.255.255", "172.16.0.255"]


def test_auxiliar_explica_firewall_do_lider(monkeypatch):
    # o anuncio UDP chega mas a conexao TCP nao: mensagem clara em vez do erro tecnico do requests
    from app import lan
    E.lider_detectado = {"ip": "192.168.15.100", "port": 50007, "nome_evento": "X", "evento_id": "1"}

    def bloqueado(*a, **k):
        raise lan.requests.exceptions.ConnectTimeout("timed out")
    monkeypatch.setattr(lan.requests, "post", bloqueado)
    try:
        lan.sincronizar_com_lider()
        raise AssertionError("deveria falhar")
    except RuntimeError as e:
        assert "firewall" in str(e) and "sudo ufw allow 50007/tcp" in str(e)


def test_trocar_de_servir_zera_a_copia_concluida():
    """Voltar ao inicio e entrar no avulso nao pode reabrir a tela de concluido sem fotos."""
    from app import core
    E.transfer = {"estado": "concluido", "progresso": 1, "total": 3, "feitos": 3, "msg": "3 arquivo(s) copiados"}
    E.arquivos_transferidos = ["a.jpg", "b.jpg", "c.jpg"]
    core.ativar_servir(None)
    assert E.transfer["estado"] == "idle" and E.arquivos_transferidos == []


def test_previa_conta_fotos_bytes_e_formatos():
    assert local.post("/api/origem", json={"path": cartao(5)}).status_code == 200
    for pastas in ([".", "DCIM/100CANON"], ["DCIM/100CANON", "."], ["DCIM", "DCIM/100CANON"]):
        p = local.post("/api/origem/previa", json={"pastas": pastas}).json()
        assert p == {"fotos": 5, "bytes": 20, "tipos": ["JPG"], "parcial": False}, pastas   # nada conta duas vezes


def test_pastas_fora_do_cartao_sao_ignoradas():
    """'../..' ou caminho absoluto nao saem da pasta de origem (nem na previa, nem no plano, nem na copia)."""
    from app import transfer
    pasta = cartao(3)
    assert local.post("/api/origem", json={"path": pasta}).status_code == 200
    fora = tempfile.mkdtemp(dir=TMP)
    open(os.path.join(fora, "SEGREDO.JPG"), "wb").write(b"x")
    rel = os.path.relpath(fora, pasta)
    assert transfer._pastas_seguras([rel, fora, "../../..", "DCIM/100CANON"]) == [os.path.realpath(os.path.join(pasta, "DCIM", "100CANON"))]
    assert local.post("/api/origem/previa", json={"pastas": [rel]}).json()["fotos"] == 0


def test_previa_para_no_teto_e_quando_chega_pedido_novo():
    from app import transfer
    assert local.post("/api/origem", json={"path": cartao(50)}).status_code == 200
    p = transfer.previa(["."], teto_itens=10)
    assert p["parcial"] and p["fotos"] < 50
    # um pedido mais novo encerra o anterior: simula a geracao mudando no meio da varredura
    orig = transfer.os.scandir

    def scandir_que_atropela(caminho):
        transfer._previa_geracao += 1
        return orig(caminho)
    transfer.os.scandir = scandir_que_atropela
    try:
        assert transfer.previa(["."]) is None
    finally:
        transfer.os.scandir = orig


def test_copia_com_pasta_inteira_e_subpasta_nao_duplica():
    criar_servir()
    pasta = cartao(4)
    assert local.post("/api/origem", json={"path": pasta}).status_code == 200
    r = local.post("/api/transferencia/plano", json={"fotografo": "Ana", "destino_base": E.destino_base,
                                                     "pastas": [".", "DCIM/100CANON"], "categoria": "Louvor"})
    assert r.json()["total_encontrados"] == 4


def test_status_traz_resumo_e_bytes_da_copia():
    criar_servir()
    descarregar("Ana", 3)
    t = local.get("/api/transferencia/status").json()
    assert t["resumo"]["fotografo"] == "Ana" and t["resumo"]["pastas"] == ["."]
    assert t["bytes_total"] == 12 and t["bytes_feitos"] == 12
    assert local.get("/api/historico").json()[0]["servir"].startswith("Culto Teste")


def test_cancelar_sem_copia_em_andamento_da_erro():
    assert local.post("/api/transferencia/cancelar").status_code == 400


def test_cancelar_para_a_copia_sem_gravar_marcador(monkeypatch):
    from app import transfer
    pasta = cartao(6)
    assert local.post("/api/origem", json={"path": pasta}).status_code == 200
    import shutil
    original = shutil.copy2

    def devagar(a, b):           # cancela no meio: o primeiro arquivo pede o cancelamento
        transfer.cancelar()
        return original(a, b)
    monkeypatch.setattr(shutil, "copy2", devagar)
    r = local.post("/api/transferencia/iniciar", json={"fotografo": "Bia", "destino_base": E.destino_base, "pastas": ["."]})
    assert r.status_code == 200, r.text
    for _ in range(100):
        if E.transfer["estado"] != "rodando":
            break
        time.sleep(0.05)
    assert E.transfer["estado"] == "cancelado", E.transfer
    assert E.transfer["feitos"] < 6
    assert not os.path.exists(os.path.join(pasta, "DCIM", "100CANON", core.MARKER_NAME))


def test_destino_preview_informa_espaco_livre():
    r = local.get("/api/destino/preview", params={"base": os.path.join(TMP, "nao-existe", "ainda"), "fotografo": "Ana"}).json()
    assert r["livre"] and r["livre"] > 0


def test_parar_envio_ao_drive(monkeypatch):
    """Parar no meio: as fotos que ainda nao comecaram sao puladas e o envio termina como 'parado'."""
    class Pedido:
        def next_chunk(self):
            drive.parar_envio()          # a primeira foto que sobe pede para parar
            return None, {"id": "x"}

    class Servico:
        def files(self):
            return self

        def create(self, **k):
            return Pedido()
    monkeypatch.setattr(drive, "build", lambda *a, **k: Servico(), raising=False)
    monkeypatch.setattr(drive, "MediaFileUpload", lambda *a, **k: None, raising=False)
    pasta = tempfile.mkdtemp(dir=TMP)
    fotos = []
    for i in range(30):
        f = os.path.join(pasta, f"F_{i:03d}.jpg")
        open(f, "wb").write(b"x")
        fotos.append(f)
    job = {"id": 999, "fotografo": "Ana", "total": len(fotos), "feitos": 0, "progresso": 0, "erros": 0,
           "estado": "fila", "destino": "teste", "atuais": [], "msg": ""}
    E.uploads.append(job)
    try:
        drive._enviar(job, None, "root", fotos)
        assert job["estado"] == "parado", job
        assert job["feitos"] < len(fotos)
        assert "Envio parado" in job["msg"]
        assert local.post("/api/uploads/parar", json={}).status_code == 400   # nada mais em andamento
    finally:
        E.uploads.remove(job)


def test_parar_envio_na_fila_nem_comeca():
    job = {"id": 998, "fotografo": "Leo", "total": 3, "feitos": 0, "progresso": 0, "erros": 0,
           "estado": "fila", "destino": "teste", "atuais": [], "msg": ""}
    E.uploads.append(job)
    try:
        assert local.post("/api/uploads/parar", json={"id": 998}).status_code == 200
        drive._enviar(job, None, "root", ["a.jpg", "b.jpg", "c.jpg"])
        assert job["estado"] == "parado" and job["feitos"] == 0
    finally:
        E.uploads.remove(job)


def test_pedido_de_outro_site_e_recusado():
    """CSRF: um site aberto no navegador sai de 127.0.0.1 mas nao manda o cabecalho X-DropHouse."""
    de_fora = TestClient(app)
    for rota in ("/api/transferencia/cancelar", "/api/uploads/parar", "/api/encerrar", "/api/avulso"):
        r = de_fora.post(rota, content="x", headers={"Content-Type": "text/plain", "Origin": "https://site-malicioso.example"})
        assert r.status_code == 403, rota
    assert de_fora.get("/api/state").status_code == 200          # leitura pela propria tela continua normal


def test_host_de_fora_e_recusado():
    """DNS rebinding: um dominio que passou a apontar para 127.0.0.1 nao fala com a API."""
    assert local.get("/api/state", headers={"Host": "attacker.example:50007"}).status_code == 403
    assert local.get("/api/state", headers={"Host": "localhost:50007"}).status_code == 200
    assert local.get("/api/state", headers={"Host": "127.0.0.1:50007"}).status_code == 200


def test_rotas_da_rede_local_continuam_abertas():
    """O protocolo Lider/Auxiliar (outras maquinas) nao usa o cabecalho da tela."""
    assert celular.get("/painel/dados").status_code == 200


def test_cancelar_depois_da_ultima_foto_conta_como_concluida(monkeypatch):
    """Pedido de cancelar que chega com tudo ja copiado nao apaga o registro: grava marcador e historico."""
    import shutil
    import threading
    from app import transfer
    pasta = cartao(4)
    assert local.post("/api/origem", json={"path": pasta}).status_code == 200
    original, vistos, trava = shutil.copy2, [0], threading.Lock()

    def ultima_cancela(a, b):
        with trava:
            vistos[0] += 1
            ultima = vistos[0] == 4
        if ultima:
            transfer.cancelar()
        return original(a, b)
    monkeypatch.setattr(shutil, "copy2", ultima_cancela)
    r = local.post("/api/transferencia/iniciar", json={"fotografo": "Bia", "destino_base": E.destino_base, "pastas": ["."]})
    assert r.status_code == 200, r.text
    for _ in range(100):
        if E.transfer["estado"] != "rodando":
            break
        time.sleep(0.05)
    assert E.transfer["estado"] == "concluido", E.transfer
    assert os.path.exists(os.path.join(pasta, "DCIM", "100CANON", core.MARKER_NAME))
