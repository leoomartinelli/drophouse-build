"""Converte um perfil criativo do Lightroom/Camera Raw (.xmp com tabela de cor, "Look") em LUT .cube para o editor.

Uso: python packaging/converter_perfil_lightroom.py PERFIL.xmp app/luts/nome-novo.cube "Nome Novo"

O LightCraft importa os .xmp do Lightroom mas ignora a tabela de cor (crs:RGBTable), que e o que da o efeito do
perfil. Este script decodifica a tabela (formato do DNG SDK: base85 da Adobe + zlib, deltas uint16 sobre a
identidade) e grava o .cube, que o LightCraft aplica como perfil. Depois de converter, crie o preset em
app/predefinicoes_prontas.json com "perfil": {"lut": "nome-novo.cube", "intensidade": 100}."""
import re
import struct
import sys
import zlib

import numpy as np

ALFABETO = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?`'|()[]{}@%$#"
VALOR = {c: i for i, c in enumerate(ALFABETO)}


def _base85(texto):
    """Base85 da Adobe: 5 caracteres -> 4 bytes little-endian (digito menos significativo primeiro)."""
    saida = bytearray()
    for k in range(0, len(texto), 5):
        grupo, v = texto[k:k + 5], 0
        for c in reversed(grupo):
            v = v * 85 + VALOR[c]
        saida += struct.pack("<I", v & 0xFFFFFFFF)[:4 if len(grupo) == 5 else len(grupo) - 1]
    return bytes(saida)


def tabela_do_xmp(caminho):
    """Tabela 3D (n, n, n, 3) de 0 a 1, indice [r][g][b], entrada e saida em sRGB."""
    with open(caminho, encoding="utf-8") as f:
        xmp = f.read()
    achado = re.search(r'crs:Table_[0-9A-F]+="([^"]*)"', xmp)
    if not achado:
        raise ValueError("este .xmp não tem tabela de cor (crs:RGBTable): não é um perfil criativo")
    texto = achado.group(1)
    for ent, c in (("&quot;", '"'), ("&lt;", "<"), ("&gt;", ">"), ("&apos;", "'"), ("&amp;", "&")):
        texto = texto.replace(ent, c)
    bruto = _base85(texto)
    dados = zlib.decompress(bruto[4:])
    if len(dados) != struct.unpack("<I", bruto[:4])[0]:
        raise ValueError("tabela corrompida")
    tipo, _versao, dimensoes, n = struct.unpack("<4I", dados[:16])
    if (tipo, dimensoes) != (1, 3):
        raise ValueError(f"tabela não suportada (tipo {tipo}, {dimensoes} dimensões)")
    fim = 16 + n ** 3 * 6
    primarias, gama = struct.unpack("<2I", dados[fim:fim + 8])
    if (primarias, gama) != (0, 1):
        raise ValueError("só tabelas em sRGB são suportadas")
    identidade = (np.arange(n) * 0xFFFF + (n - 1) // 2) // (n - 1)
    r, g, b = np.meshgrid(identidade, identidade, identidade, indexing="ij")
    deltas = np.frombuffer(dados[16:fim], "<u2").astype(np.int64).reshape(n, n, n, 3)
    return ((deltas + np.stack([r, g, b], -1)) & 0xFFFF) / 65535


def gravar_cube(tabela, destino, titulo):
    n = tabela.shape[0]
    with open(destino, "w", encoding="utf-8") as f:
        f.write(f'TITLE "{titulo}"\nLUT_3D_SIZE {n}\nDOMAIN_MIN 0 0 0\nDOMAIN_MAX 1 1 1\n')
        for b in range(n):                       # no .cube o vermelho varia mais rapido
            for g in range(n):
                for r in range(n):
                    f.write("%.6f %.6f %.6f\n" % tuple(tabela[r, g, b]))


if __name__ == "__main__":
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    gravar_cube(tabela_do_xmp(sys.argv[1]), sys.argv[2], sys.argv[3])
    print(f"OK: {sys.argv[2]}")
