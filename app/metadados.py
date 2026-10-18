"""Marca nos metadados que a foto passou pelo DropHouse (EXIF Software/Copyright e XMP).

Sem tocar na imagem: so os blocos de metadados do comeco do JPEG mudam; a imagem comprimida (do SOS ate o fim) e
copiada byte a byte, sem recomprimir. No EXIF nada e movido: um IFD0 novo e anexado no fim do bloco TIFF (com as
mesmas entradas do antigo, mais Software e Copyright) e o cabecalho passa a apontar para ele. Os IFDs do Exif, do GPS,
a miniatura e as MakerNotes do fabricante continuam no mesmo lugar, entao seus deslocamentos continuam validos.

So JPEG e marcado (RAW e video ficam como estao: gravar dentro deles e arriscado). Qualquer surpresa no arquivo
levanta MetadadosInvalidos e quem chamou copia/mantem a foto sem a marca: nunca se perde uma foto por causa disso."""
import os
import re
import shutil
import struct
import time
from xml.sax.saxutils import escape, unescape

from .versao import VERSAO

TAG_SOFTWARE, TAG_COPYRIGHT = 0x0131, 0x8298
ASCII = 2
EXIF_ID = b"Exif\x00\x00"
XMP_ID = b"http://ns.adobe.com/xap/1.0/\x00"
NS_DROPHOUSE = "https://github.com/HOUSE-DE-CRIATIVIDADE/DropHouse/ns/1.0/"
COPYRIGHT = "Processado por DropHouse - House de Criatividade"     # EXIF e ASCII: sem "·"
LIMITE_SEGMENTO = 65533                                              # tamanho maximo dos dados de um APP1


class MetadadosInvalidos(Exception):
    pass


def e_jpeg(caminho):
    return caminho.lower().endswith((".jpg", ".jpeg"))


def software():
    return f"DropHouse {VERSAO}"


# ---------- leitura dos segmentos do JPEG ----------

def _segmentos(f):
    """[(marcador, dados)] do SOI ate o SOS (exclusive) e o deslocamento do SOS no arquivo."""
    if f.read(2) != b"\xff\xd8":
        raise MetadadosInvalidos("não é JPEG")
    segs = []
    while True:
        if f.read(1) != b"\xff":
            raise MetadadosInvalidos("marcador esperado")
        m = f.read(1)
        while m == b"\xff":                       # bytes de preenchimento antes do marcador
            m = f.read(1)
        if not m:
            raise MetadadosInvalidos("arquivo truncado")
        marcador = m[0]
        if marcador == 0xDA:                      # SOS: daqui para frente e a imagem comprimida
            return segs, f.tell() - 2
        if marcador in (0xD8, 0x01) or 0xD0 <= marcador <= 0xD7:
            continue                              # marcadores sem tamanho
        tam = f.read(2)
        if len(tam) < 2:
            raise MetadadosInvalidos("arquivo truncado")
        n = struct.unpack(">H", tam)[0]
        if n < 2:
            raise MetadadosInvalidos("segmento inválido")
        dados = f.read(n - 2)
        if len(dados) < n - 2:
            raise MetadadosInvalidos("arquivo truncado")
        segs.append((marcador, dados))
        if len(segs) > 500:
            raise MetadadosInvalidos("segmentos demais")


def _seg(marcador, dados):
    if len(dados) > LIMITE_SEGMENTO:
        raise MetadadosInvalidos("segmento grande demais")
    return bytes([0xFF, marcador]) + struct.pack(">H", len(dados) + 2) + dados


# ---------- EXIF: IFD0 novo anexado no fim do bloco TIFF ----------

def _texto_ascii(texto):
    return texto.encode("ascii", "replace") + b"\x00"


def _ler_ascii(tiff, fmt, entrada):
    """Valor de uma entrada ASCII do IFD (ou None)."""
    tag, tipo, conta, valor = struct.unpack(fmt + "HHI4s", entrada)
    if tipo != ASCII or conta == 0:
        return None
    if conta <= 4:
        bruto = valor[:conta]
    else:
        ofs = struct.unpack(fmt + "I", valor)[0]
        if ofs + conta > len(tiff):
            return None
        bruto = tiff[ofs:ofs + conta]
    return bruto.split(b"\x00")[0].decode("latin-1").strip()


def _novo_exif(exif):
    """Bloco APP1 do EXIF com Software e Copyright do DropHouse (exif=None: cria um EXIF so com essas duas tags)."""
    if exif is None:
        fmt, tiff = "<", bytearray(b"II*\x00" + struct.pack("<I", 8) + struct.pack("<HI", 0, 0))
    else:
        tiff = bytearray(exif[len(EXIF_ID):])
        if tiff[:4] not in (b"II*\x00", b"MM\x00*"):
            raise MetadadosInvalidos("EXIF sem cabeçalho TIFF")
        fmt = "<" if tiff[:2] == b"II" else ">"
    ifd0 = struct.unpack(fmt + "I", tiff[4:8])[0]
    if ifd0 + 2 > len(tiff):
        raise MetadadosInvalidos("IFD0 fora do EXIF")
    n = struct.unpack(fmt + "H", tiff[ifd0:ifd0 + 2])[0]
    fim_entradas = ifd0 + 2 + 12 * n
    if fim_entradas + 4 > len(tiff):
        raise MetadadosInvalidos("IFD0 truncado")
    entradas = {}
    for k in range(n):
        e = bytes(tiff[ifd0 + 2 + 12 * k: ifd0 + 14 + 12 * k])
        entradas[struct.unpack(fmt + "H", e[:2])[0]] = e
    proximo = tiff[fim_entradas:fim_entradas + 4]                  # IFD1 (miniatura): continua onde esta

    # copyright: mantem o do fotografo e acrescenta o do DropHouse (uma vez so)
    antigo = _ler_ascii(tiff, fmt, entradas[TAG_COPYRIGHT]) if TAG_COPYRIGHT in entradas else None
    copyright_ = antigo if antigo and COPYRIGHT in antigo else (f"{antigo} - {COPYRIGHT}" if antigo else COPYRIGHT)
    novos = {TAG_SOFTWARE: _texto_ascii(software()), TAG_COPYRIGHT: _texto_ascii(copyright_)}

    tags = sorted(set(entradas) | set(novos))                        # IFD em ordem crescente de tag (TIFF)
    if len(tiff) % 2:
        tiff.append(0)
    inicio = len(tiff)
    dados_ofs = inicio + 2 + 12 * len(tags) + 4
    corpo, extra = bytearray(struct.pack(fmt + "H", len(tags))), bytearray()
    for tag in tags:
        if tag in novos:
            valor = novos[tag]
            if len(valor) <= 4:
                campo = valor.ljust(4, b"\x00")
            else:
                campo = struct.pack(fmt + "I", dados_ofs + len(extra))
                extra += valor + (b"\x00" if len(valor) % 2 else b"")
            corpo += struct.pack(fmt + "HHI", tag, ASCII, len(valor)) + campo
        else:
            corpo += entradas[tag]                                   # entrada antiga: deslocamentos continuam validos
    corpo += proximo
    tiff += corpo + extra
    tiff[4:8] = struct.pack(fmt + "I", inicio)                       # o cabecalho passa a apontar para o IFD0 novo
    return EXIF_ID + bytes(tiff)


# ---------- XMP ----------

def _xmp_drophouse(info):
    agora = time.strftime("%Y-%m-%dT%H:%M:%S")
    campos = [("Versao", VERSAO), ("Descarregado", agora)]
    for chave, nome in (("voluntario", "Voluntario"), ("servir", "Servir"), ("categoria", "Categoria")):
        if info.get(chave):
            campos.append((nome, str(info[chave])))
    props = "".join(f"<drophouse:{n}>{escape(v)}</drophouse:{n}>" for n, v in campos)
    return (f'<rdf:Description rdf:about="" xmlns:drophouse="{NS_DROPHOUSE}">{props}</rdf:Description>')


def _novo_xmp(xmp, info):
    """APP1 do XMP com xmp:CreatorTool = DropHouse e os dados do descarregamento (cria o XMP se nao houver)."""
    dh = _xmp_drophouse(info)
    ferramenta = (f'<rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/">'
                  f'<xmp:CreatorTool>DropHouse {escape(VERSAO)}</xmp:CreatorTool></rdf:Description>')
    if xmp is None:
        texto = ('<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>'
                 '<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">'
                 f'{ferramenta}{dh}</rdf:RDF></x:xmpmeta><?xpacket end="w"?>')
        return XMP_ID + texto.encode("utf-8")
    try:
        texto = xmp[len(XMP_ID):].decode("utf-8")
    except UnicodeDecodeError:
        raise MetadadosInvalidos("XMP não é UTF-8")
    if "</rdf:RDF>" not in texto:
        raise MetadadosInvalidos("XMP sem rdf:RDF")
    # editada depois (ou marcada de novo sem os dados): o voluntario, o Servir e a categoria da marca anterior ficam
    anterior = re.search(r'<rdf:Description rdf:about="" xmlns:drophouse="[^"]*">(.*?)</rdf:Description>', texto, flags=re.S)
    if anterior:
        for chave, nome in (("voluntario", "Voluntario"), ("servir", "Servir"), ("categoria", "Categoria")):
            achou = re.search(rf"<drophouse:{nome}>(.*?)</drophouse:{nome}>", anterior.group(1), flags=re.S)
            if achou and not info.get(chave):
                info = {**info, chave: unescape(achou.group(1))}
        dh = _xmp_drophouse(info)
    # descarregado de novo / editado: a marca anterior do DropHouse sai e entra a nova
    texto = re.sub(r'<rdf:Description rdf:about="" xmlns:drophouse="[^"]*">.*?</rdf:Description>', "", texto, flags=re.S)
    # CreatorTool de outro programa (ex.: LightCraft na foto editada) vira DropHouse; sem CreatorTool, entra um
    novo, trocas = re.subn(r'(xmp:CreatorTool=")[^"]*(")', rf"\g<1>DropHouse {VERSAO}\g<2>", texto)
    if not trocas:
        novo, trocas = re.subn(r"(<xmp:CreatorTool>)[^<]*(</xmp:CreatorTool>)", rf"\g<1>DropHouse {VERSAO}\g<2>", texto)
    insercao = dh if trocas else ferramenta + dh
    novo = novo.replace("</rdf:RDF>", insercao + "</rdf:RDF>", 1)
    return XMP_ID + novo.encode("utf-8")


def info_de(caminho):
    """Voluntario, Servir e categoria que o DropHouse gravou numa foto (para levar a marca para a copia editada)."""
    try:
        with open(caminho, "rb") as f:
            segs, _ = _segmentos(f)
    except (OSError, MetadadosInvalidos):
        return {}
    xmp = next((d for m, d in segs if m == 0xE1 and d.startswith(XMP_ID)), b"")[len(XMP_ID):].decode("utf-8", "replace")
    info = {}
    for chave, nome in (("voluntario", "Voluntario"), ("servir", "Servir"), ("categoria", "Categoria")):
        achou = re.search(rf"<drophouse:{nome}>(.*?)</drophouse:{nome}>", xmp, flags=re.S)
        if achou:
            info[chave] = unescape(achou.group(1))
    return info


# ---------- gravar ----------

def _cabecalho_marcado(segs, info):
    """Segmentos do cabecalho com o EXIF e o XMP do DropHouse (o resto na mesma ordem)."""
    exif = next((d for m, d in segs if m == 0xE1 and d.startswith(EXIF_ID)), None)
    xmp = next((d for m, d in segs if m == 0xE1 and d.startswith(XMP_ID)), None)
    novo_exif, novo_xmp = _seg(0xE1, _novo_exif(exif)), _seg(0xE1, _novo_xmp(xmp, info))
    saida, pos_exif, pos_xmp = [], None, None
    for m, d in segs:
        if m == 0xE1 and d.startswith(EXIF_ID) and pos_exif is None:
            pos_exif = len(saida)
            saida.append(novo_exif)
        elif m == 0xE1 and d.startswith(XMP_ID) and pos_xmp is None:
            pos_xmp = len(saida)
            saida.append(novo_xmp)
        else:
            saida.append(_seg(m, d))
    # sem EXIF/XMP: entram logo depois do JFIF (APP0), como os programas costumam gravar
    depois_app0 = 1 if segs and segs[0][0] == 0xE0 else 0
    if pos_xmp is None:
        saida.insert(depois_app0 if pos_exif is None else pos_exif + 1, novo_xmp)
    if pos_exif is None:
        saida.insert(depois_app0, novo_exif)
    return b"\xff\xd8" + b"".join(saida)


def copiar_marcando(origem, destino, info=None):
    """Copia a foto gravando a marca do DropHouse num passe so (sem ler/escrever o arquivo duas vezes).
    JPEG que nao der para marcar, ou outro formato: copia como esta. Mantem a data do arquivo (copy2/copystat).
    Devolve True se a marca foi gravada."""
    if e_jpeg(origem):
        try:
            with open(origem, "rb") as f:
                segs, sos = _segmentos(f)
                cabecalho = _cabecalho_marcado(segs, info or {})
                f.seek(sos)
                with open(destino, "wb") as g:
                    g.write(cabecalho)
                    shutil.copyfileobj(f, g, 1 << 20)
            shutil.copystat(origem, destino)
            return True
        except MetadadosInvalidos as e:
            print(f"Metadados: {os.path.basename(origem)} copiada sem a marca ({e})")
    shutil.copy2(origem, destino)
    return False


def marcar(caminho, info=None):
    """Grava a marca numa foto que ja esta no PC (editada ou convertida de RAW), mantendo a data do arquivo.
    Devolve True se marcou; False se nao era JPEG ou nao deu (a foto fica como estava)."""
    if not e_jpeg(caminho):
        return False
    temporario = caminho + ".marcando"
    try:
        ok = copiar_marcando(caminho, temporario, info)
        if ok:
            os.replace(temporario, caminho)
        return ok
    finally:
        if os.path.exists(temporario):
            os.remove(temporario)
