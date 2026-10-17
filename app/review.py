"""Geracao de imagens (JPEG redimensionado) para a tela de selecao."""
import io
import os
import threading
from collections import OrderedDict

from PIL import Image, ImageOps

from . import core

_cache = OrderedDict()
_lock = threading.Lock()
_MAX_CACHE = 40
_cache_mini = OrderedDict()       # miniaturas da tira (~5 KB cada): cabem muitas, sem tirar as grandes do cache
_MAX_MINI = 800
LADO_MINI = 400
_cache_original = OrderedDict()   # fotos em tamanho cheio para o zoom: grandes, entao poucas na memoria
_MAX_ORIGINAL = 3


def _abrir(path, lado=None):
    """lado: o tamanho que vai ser usado. JPEG ja e decodificado reduzido (draft: 1/2, 1/4 ou 1/8), o que deixa
    as miniaturas e previas muito mais leves que abrir a foto inteira de 24 MP."""
    if path.lower().endswith(core.EXT_RAW):
        import rawpy
        with rawpy.imread(path) as raw:
            try:
                thumb = raw.extract_thumb()
                if thumb.format == rawpy.ThumbFormat.JPEG:
                    img = Image.open(io.BytesIO(thumb.data))
                    if lado:
                        img.draft("RGB", (lado, lado))
                    img.load()
                    if max(img.size) >= min(1600, lado or 1600):
                        return ImageOps.exif_transpose(img)
            except Exception:
                pass
            rgb = raw.postprocess(use_camera_wb=True, half_size=True, no_auto_bright=True)
            return Image.fromarray(rgb)
    img = Image.open(path)
    if lado and img.format == "JPEG":
        img.draft("RGB", (lado, lado))
    img = ImageOps.exif_transpose(img)
    img.load()
    return img


def original(path):
    """(bytes, tipo) da foto no tamanho original, para o zoom da tela de selecao. JPEG e PNG vao como estao no
    disco (sem recompactar: qualidade maxima; o navegador aplica a rotacao do EXIF). RAW e revelado em tamanho cheio."""
    ext = os.path.splitext(path)[1].lower()
    if ext in (".jpg", ".jpeg", ".png"):
        with open(path, "rb") as f:
            return f.read(), "image/png" if ext == ".png" else "image/jpeg"
    chave = (path, os.path.getmtime(path))
    with _lock:
        if chave in _cache_original:
            _cache_original.move_to_end(chave)
            return _cache_original[chave], "image/jpeg"
    import rawpy
    with rawpy.imread(path) as raw:
        img = None
        try:
            thumb = raw.extract_thumb()        # a previa embutida costuma ter a resolucao cheia e sai na hora
            if thumb.format == rawpy.ThumbFormat.JPEG:
                img = ImageOps.exif_transpose(Image.open(io.BytesIO(thumb.data)))
                if max(img.size) < 3000:
                    img = None
        except Exception:
            img = None
        if img is None:
            img = Image.fromarray(raw.postprocess(use_camera_wb=True, no_auto_bright=True))
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=92)
    with _lock:
        _cache_original[chave] = buf.getvalue()
        while len(_cache_original) > _MAX_ORIGINAL:
            _cache_original.popitem(last=False)
        return _cache_original[chave], "image/jpeg"


def renderizar(path, lado):
    """Retorna bytes JPEG com o maior lado limitado a `lado`."""
    chave = (path, lado, os.path.getmtime(path))
    cache, maximo = (_cache_mini, _MAX_MINI) if lado <= LADO_MINI else (_cache, _MAX_CACHE)
    with _lock:
        if chave in cache:
            cache.move_to_end(chave)
            return cache[chave]
    img = _abrir(path, lado)
    img.thumbnail((lado, lado))
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=85 if lado > 400 else 75)
    dados = buf.getvalue()
    with _lock:
        cache[chave] = dados
        while len(cache) > maximo:
            cache.popitem(last=False)
    return dados
