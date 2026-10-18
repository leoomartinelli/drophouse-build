"""Marca do DropHouse nos metadados das fotos (issue #34). Rodar: .venv/bin/python -m pytest tests -q

Confere com o Pillow os campos gravados e que a imagem comprimida (do SOS ao fim) continua byte a byte igual."""
import os
import struct
import time

import test_painel  # noqa: F401  (configura DATA_DIR/FOTOS_DIR temporarios antes de importar o app)
from test_painel import TMP, criar_servir, estado_limpo, local  # noqa: F401 (fixture)
from test_editor import motor, esperar_salvar

import numpy as np
from PIL import Image

from app import metadados
from app.core import E
from app.versao import VERSAO

EXIF, GPS = 0x8769, 0x8825


def foto_de_camera(caminho, copyright_="Foto: Ana Souza"):
    img = Image.fromarray((np.random.default_rng(7).random((120, 160, 3)) * 255).astype("uint8"))
    ex = Image.Exif()
    ex[0x010F], ex[0x0110], ex[0x0131] = "Canon", "Canon EOS R6", "Firmware 1.8.1"
    if copyright_:
        ex[0x8298] = copyright_
    sub = ex.get_ifd(EXIF)
    sub[36867], sub[0xA434] = "2026:10:18 09:30:12", "RF24-105mm F4 L IS USM"
    g = ex.get_ifd(GPS)
    g[1], g[2] = "S", (23.0, 32.0, 10.0)
    img.save(caminho, exif=ex, quality=90)
    return caminho


def imagem_comprimida(caminho):
    dados = open(caminho, "rb").read()
    return dados[dados.index(b"\xff\xda"):]


def xmp(caminho):
    dados = open(caminho, "rb").read()
    i = dados.index(metadados.XMP_ID)
    n = struct.unpack(">H", dados[i - 2:i])[0]
    return dados[i + len(metadados.XMP_ID):i - 2 + n].decode("utf-8")


def test_foto_de_camera_ganha_a_marca_sem_mudar_a_imagem_nem_os_dados_da_camera(tmp_path):
    origem = foto_de_camera(str(tmp_path / "camera.jpg"))
    destino = str(tmp_path / "marcada.jpg")
    assert metadados.copiar_marcando(origem, destino, {"voluntario": "Ana", "servir": "Domingo", "categoria": "Louvor"})
    ex = Image.open(destino).getexif()
    assert ex[0x0131] == f"DropHouse {VERSAO}"
    assert ex[0x8298] == "Foto: Ana Souza - Processado por DropHouse - House de Criatividade"   # acrescenta
    assert (ex[0x010F], ex[0x0110]) == ("Canon", "Canon EOS R6")
    assert ex.get_ifd(EXIF)[36867] == "2026:10:18 09:30:12" and ex.get_ifd(EXIF)[0xA434] == "RF24-105mm F4 L IS USM"
    assert ex.get_ifd(GPS)[1] == "S"
    assert imagem_comprimida(destino) == imagem_comprimida(origem)               # sem recomprimir
    assert (np.asarray(Image.open(destino)) == np.asarray(Image.open(origem))).all()
    x = xmp(destino)
    assert f"<xmp:CreatorTool>DropHouse {VERSAO}</xmp:CreatorTool>" in x
    assert "<drophouse:Voluntario>Ana</drophouse:Voluntario>" in x and "<drophouse:Categoria>Louvor" in x
    assert os.path.getmtime(destino) == os.path.getmtime(origem)                 # a data do arquivo fica


def test_foto_sem_exif_e_sem_copyright(tmp_path):
    origem = str(tmp_path / "simples.jpg")
    Image.new("RGB", (40, 30), (10, 120, 200)).save(origem)
    destino = str(tmp_path / "marcada.jpg")
    assert metadados.copiar_marcando(origem, destino)
    ex = Image.open(destino).getexif()
    assert ex[0x0131] == f"DropHouse {VERSAO}" and ex[0x8298] == metadados.COPYRIGHT
    assert "DropHouse" in xmp(destino) and imagem_comprimida(destino) == imagem_comprimida(origem)


def test_exif_big_endian_tambem(tmp_path):
    """Algumas cameras (ex.: Nikon) gravam o EXIF em big-endian ("MM")."""
    marca = b"NIKON CORPORATION\x00"
    tiff = (b"MM\x00*" + struct.pack(">I", 8) + struct.pack(">H", 1)
            + struct.pack(">HHII", 0x010F, 2, len(marca), 26) + struct.pack(">I", 0) + marca)
    app1 = metadados.EXIF_ID + tiff
    base = str(tmp_path / "base.jpg")
    Image.new("RGB", (40, 30)).save(base)
    dados = open(base, "rb").read()
    origem = str(tmp_path / "nikon.jpg")
    open(origem, "wb").write(dados[:2] + b"\xff\xe1" + struct.pack(">H", len(app1) + 2) + app1 + dados[2:])
    destino = str(tmp_path / "marcada.jpg")
    assert metadados.copiar_marcando(origem, destino)
    ex = Image.open(destino).getexif()
    assert ex[0x010F] == "NIKON CORPORATION" and ex[0x0131] == f"DropHouse {VERSAO}"


def test_marcar_de_novo_nao_duplica_e_mantem_os_dados(tmp_path):
    origem = foto_de_camera(str(tmp_path / "camera.jpg"))
    destino = str(tmp_path / "marcada.jpg")
    metadados.copiar_marcando(origem, destino, {"voluntario": "Ana & Bia", "servir": "Domingo", "categoria": "Louvor"})
    assert metadados.marcar(destino)                                             # como na foto editada, sem os dados
    ex = Image.open(destino).getexif()
    assert ex[0x8298].count("DropHouse") == 1
    x = xmp(destino)
    assert x.count("xmlns:drophouse") == 1 and x.count("<xmp:CreatorTool>") == 1
    assert metadados.info_de(destino) == {"voluntario": "Ana & Bia", "servir": "Domingo", "categoria": "Louvor"}
    assert imagem_comprimida(destino) == imagem_comprimida(origem)


def test_outro_formato_e_jpeg_estranho_sao_copiados_como_estao(tmp_path):
    raw = str(tmp_path / "IMG_0001.CR2")
    open(raw, "wb").write(b"II*\x00" + os.urandom(500))
    quebrado = str(tmp_path / "quebrado.jpg")
    open(quebrado, "wb").write(b"\xff\xd8\xff\xe1\x00")                         # cabecalho cortado no meio
    for origem in (raw, quebrado):
        destino = origem + ".copia"
        assert metadados.copiar_marcando(origem, destino) is False
        assert open(destino, "rb").read() == open(origem, "rb").read()            # nunca se perde uma foto
    assert metadados.marcar(quebrado) is False and open(quebrado, "rb").read() == b"\xff\xd8\xff\xe1\x00"


def test_descarregar_marca_todas_as_fotos(tmp_path):
    criar_servir("Culto Marca")
    pasta = os.path.join(TMP, f"cartao-marca-{time.time_ns()}", "DCIM", "100CANON")
    os.makedirs(pasta)
    for k in range(3):
        foto_de_camera(os.path.join(pasta, f"IMG_{k:04d}.JPG"))
    local.post("/api/origem", json={"path": os.path.dirname(os.path.dirname(pasta))})
    r = local.post("/api/transferencia/iniciar", json={"fotografo": "Ana", "destino_base": E.destino_base,
                                                      "pastas": ["."], "categoria": "Louvor"})
    assert r.status_code == 200, r.text
    for _ in range(200):
        if E.transfer["estado"] != "rodando":
            break
        time.sleep(0.05)
    assert len(E.arquivos_transferidos) == 3
    for foto in E.arquivos_transferidos:
        assert Image.open(foto).getexif()[0x0131] == f"DropHouse {VERSAO}"
        info = metadados.info_de(foto)
        assert info["voluntario"] == "Ana" and info["categoria"] == "Louvor" and info["servir"].startswith("Culto Marca")


@motor
def test_foto_editada_e_a_original_guardada_levam_a_marca(tmp_path):
    from test_editor import descarregar
    fotos = descarregar(1)
    antes = metadados.info_de(fotos[0])
    assert antes.get("voluntario") == "Ana"
    local.post("/api/editor/0/salvar", json={"ajustes": {"valores": {"light.exposure": 0.4}}})
    esperar_salvar()
    editada = E.arquivos_transferidos[0]
    assert Image.open(editada).getexif()[0x0131] == f"DropHouse {VERSAO}"
    assert metadados.info_de(editada) == antes                                   # os dados do descarregamento vao junto
    original = os.path.join(os.path.dirname(editada), ".originais", os.path.basename(fotos[0]))
    assert Image.open(original).getexif()[0x0131] == f"DropHouse {VERSAO}"
