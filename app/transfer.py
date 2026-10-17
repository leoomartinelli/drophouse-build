"""Deteccao de cartao, planejamento e copia de fotos (equivale a processar_copia)."""
import concurrent.futures
import os
import threading
import time

import psutil

from . import core, lan, painel, raw, stats
from .core import E


# ---------- origem (cartao SD / pasta manual) ----------

_part = {"t": 0.0, "lista": []}
_lock_part = threading.Lock()


def _listar_particoes():
    """psutil.disk_partitions reaproveitado por 1 s: a vigia do cartao (1,5 s) e a tela de origem (2 s) dividem a
    mesma leitura. No Windows ela passa por cada unidade e pode acordar leitor de CD/DVD."""
    with _lock_part:
        if time.monotonic() - _part["t"] > 1.0:
            _part.update(t=time.monotonic(), lista=psutil.disk_partitions())
        return _part["lista"]


def _particoes():
    return {p.device: p.mountpoint for p in _listar_particoes() if p.mountpoint}


def _candidatos():
    """Pontos de montagem que parecem midia removivel."""
    saida = []
    for p in _listar_particoes():
        mp = p.mountpoint
        if not mp:
            continue
        removivel = ('removable' in p.opts) or mp.startswith(('/media/', '/run/media/', '/Volumes/'))
        if os.name == 'nt' and p.device and not p.device.upper().startswith('C:'):
            removivel = True
        if removivel and os.path.isdir(mp):
            saida.append({"device": p.device, "mountpoint": mp})
    return saida


def monitorar_cartao():
    iniciais = _particoes()
    while True:
        time.sleep(1.5)
        atuais = _particoes()
        novos = [d for d in atuais if d not in iniciais]
        if novos:
            E.drive_path = atuais[novos[0]]
            E.cartao_detectado = True
            E.origem_manual = False
            iniciais = atuais
        elif len(atuais) < len(iniciais):
            if E.origem_manual:
                iniciais = atuais
            else:
                E.drive_path = ""
                E.cartao_detectado = False
                iniciais = atuais


def definir_origem(pasta):
    E.drive_path = pasta
    E.cartao_detectado = True
    E.origem_manual = True


def listar_pastas_origem():
    """Itens do checklist: pasta completa + subpastas de DCIM (ou pastas da raiz)."""
    drive = E.drive_path
    itens = [{"valor": ".", "rotulo": "[Pasta Completa] Importar tudo desta pasta principal"}]
    if not drive or not os.path.isdir(drive):
        return itens
    dcim = os.path.join(drive, "DCIM")
    try:
        if os.path.isdir(dcim):
            for sub in sorted(os.listdir(dcim)):
                if os.path.isdir(os.path.join(dcim, sub)):
                    itens.append({"valor": f"DCIM/{sub}", "rotulo": f"DCIM/{sub}"})
        else:
            for item in sorted(os.listdir(drive)):
                if os.path.isdir(os.path.join(drive, item)) and not item.startswith('$'):
                    itens.append({"valor": item, "rotulo": item})
    except Exception as e:
        print(f"Erro ao ler cartao: {e}")
    return itens


# ---------- coleta de arquivos ----------

def _ordenar_por_data(arquivos):
    try:
        arquivos.sort(key=lambda x: os.path.getmtime(x))
    except Exception:
        arquivos.sort()


def _ler_marker(marker):
    nome, mtime = None, None
    try:
        with open(marker, 'r', encoding='utf-8') as f:
            for linha in f:
                if linha.startswith("Último arquivo importado:"):
                    nome = linha.split(":", 1)[1].strip()
                elif linha.startswith("Timestamp do último arquivo:"):
                    mtime = float(linha.split(":", 1)[1].strip())
    except Exception as e:
        print(f"Erro ao ler marker em {marker}: {e}")
    if mtime is None:
        try:
            mtime = os.path.getmtime(marker)
        except Exception:
            pass
    return nome, mtime


def _fotos_por_pasta(origem):
    """(pasta, [(nome, mtime)]) de cada pasta com fotos, recursivo. os.scandir traz a data junto da listagem
    (no Windows sem acesso extra ao disco): no cartao SD, que e lento, isso pesa."""
    pilha = [origem]
    while pilha:
        pasta = pilha.pop()
        try:
            it = os.scandir(pasta)
        except OSError:
            continue
        fotos = []
        with it:
            for e in it:
                try:
                    if e.is_dir(follow_symlinks=False):
                        pilha.append(e.path)
                        continue
                except OSError:
                    continue
                if e.name.lower().endswith(core.EXT_TODAS) and e.name != core.MARKER_NAME:
                    try:
                        mt = e.stat().st_mtime
                    except OSError:
                        mt = None
                    fotos.append((e.name, mt))
        if fotos:
            yield pasta, fotos


def _varrer(pastas):
    """Uma passada pelo cartao: [(subpasta, [(nome, mtime)] em ordem de data)]."""
    grupos = []
    for rel in pastas:
        origem = os.path.join(E.drive_path, os.path.normpath(rel))
        if not os.path.isdir(origem):
            continue
        for subdir, fotos in _fotos_por_pasta(origem):
            if any(mt is None for _, mt in fotos):
                fotos.sort(key=lambda x: x[0])         # sem a data de alguma: ordem do nome, como antes
            else:
                fotos.sort(key=lambda x: x[1])
            grupos.append((subdir, fotos))
    return grupos


def _separar(grupos, so_novas):
    """so_novas=True descarta o que ja foi importado segundo o arquivo marcador de cada subpasta."""
    arquivos, ja, total = [], 0, 0
    for subdir, fotos in grupos:
        total += len(fotos)
        nomes = [n for n, _ in fotos]
        marker = os.path.join(subdir, core.MARKER_NAME)
        if not (so_novas and os.path.exists(marker)):
            arquivos.extend(os.path.join(subdir, n) for n in nomes)
            continue
        ultimo_nome, ultimo_mtime = _ler_marker(marker)
        if ultimo_nome and ultimo_nome in nomes:
            idx = nomes.index(ultimo_nome)
            ja += idx + 1
            arquivos.extend(os.path.join(subdir, n) for n in nomes[idx + 1:])
        else:
            for n, mt in fotos:
                if ultimo_mtime is None or (mt or 0) > ultimo_mtime:
                    arquivos.append(os.path.join(subdir, n))
                else:
                    ja += 1
    return arquivos, ja, total


def coletar(pastas, so_novas):
    """Retorna (arquivos, ja_descarregados, total_encontrados)."""
    return _separar(_varrer(pastas), so_novas)


def planejar(pastas):
    grupos = _varrer(pastas)                           # uma varredura so para as duas contagens
    novas, ja, total = _separar(grupos, so_novas=True)
    todas, _, _ = _separar(grupos, so_novas=False)
    return {
        "total_encontrados": total,
        "ja_descarregados": ja,
        "novas": len(novas),
        "todas": len(todas),
        "tem_raw": any(f.lower().endswith(core.EXT_RAW) for f in todas),
        "tem_raw_novas": any(f.lower().endswith(core.EXT_RAW) for f in novas),
        "pode_converter_raw": raw.disponivel(),
    }


# ---------- copia ----------

def iniciar(fotografo, destino_base, pastas, categoria, criar_subpasta, modo, converter_raw=False):
    """modo: 'novas' (apenas apos o ultimo marcador) ou 'todas'.

    converter_raw: depois de copiar, transforma as copias RAW do PC em JPEG e apaga essas copias RAW."""
    if E.transfer["estado"] == "rodando":
        raise RuntimeError("Ja existe uma transferencia em andamento.")
    destino = core.calcular_caminho_final(destino_base, fotografo, categoria, criar_subpasta)
    base_fotografo = os.path.dirname(destino) if os.path.basename(destino).startswith(f"{fotografo}_") \
        and os.path.basename(destino) != fotografo and core.tem_midia(os.path.dirname(destino)) else destino
    arquivos, _, _ = coletar(pastas, so_novas=(modo == "novas"))
    if not arquivos:
        raise RuntimeError("Nenhuma imagem encontrada nas pastas selecionadas.")
    if converter_raw and not raw.disponivel():
        raise RuntimeError("O conversor de RAW para JPEG não está instalado neste computador.")
    E.arquivos_transferidos = []
    E.transfer = {"estado": "rodando", "progresso": 0, "total": len(arquivos), "feitos": 0,
                  "msg": "Copiando...", "destino": destino}
    painel.copiando(fotografo)
    threading.Thread(target=_copiar, args=(fotografo, destino, base_fotografo, arquivos, converter_raw),
                     daemon=True).start()
    return {"total": len(arquivos), "destino": destino}


def _copiar(fotografo, destino, base_fotografo, arquivos, converter_raw=False):
    import shutil
    t0 = time.time()
    try:
        os.makedirs(destino, exist_ok=True)
        _ordenar_por_data(arquivos)
        total = len(arquivos)
        inicio, aviso = 1, None
        try:
            if E.active_servir:
                inicio, aviso = lan.numero_inicial(core.raiz_servir(E.active_servir), base_fotografo, fotografo, total)
            else:
                inicio = core.maior_numero(base_fotografo, fotografo) + 1
        except Exception as e:
            print(f"Erro ao calcular offset de numeracao: {e}")
        if aviso:
            E.transfer["aviso"] = aviso
        digitos = max(3, len(str(inicio + total)))

        lock = threading.Lock()
        copiados = []
        transferidos = []

        def processar(item):
            idx, origem = item
            nome_orig = os.path.basename(origem)
            ext = os.path.splitext(nome_orig)[1].lower()
            novo = f"{fotografo}_{idx + inicio:0{digitos}d}{ext}"
            alvo = os.path.join(destino, novo)
            c = 1
            while os.path.exists(alvo):
                base, e2 = os.path.splitext(novo)
                alvo = os.path.join(destino, f"{base}_{c}{e2}")
                c += 1
            try:
                shutil.copy2(origem, alvo)
                with lock:
                    copiados.append(origem)
                    if alvo.lower().endswith(core.EXT_IMG):
                        transferidos.append(alvo)
            except Exception as e:
                print(f"Erro ao processar {nome_orig}: {e}")
            with lock:
                E.transfer["feitos"] += 1
                E.transfer["progresso"] = E.transfer["feitos"] / total

        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
            list(ex.map(processar, enumerate(arquivos)))

        _gravar_markers(copiados)
        if copiados and E.active_servir:
            try:
                E.descarregamento_atual = core.registrar_descarregamento(
                    core.raiz_servir(E.active_servir), base_fotografo, len(copiados), time.time() - t0)
            except Exception as e:
                print(f"Erro ao registrar tempo de descarregamento: {e}")
        falhas_raw = []
        if converter_raw:
            transferidos, falhas_raw = _converter_raws(destino, transferidos)
        # as copias terminam fora de ordem (4 threads): ordena pelo nome para o revisor
        transferidos.sort(key=lambda p: os.path.basename(p).lower())
        E.arquivos_transferidos = transferidos
        if transferidos:
            core.registrar_historico(fotografo, base_fotografo, len(transferidos))
        falhas = total - len(copiados)
        msg = f"{len(copiados)} arquivo(s) copiados" + (f", {falhas} com erro (veja o log)" if falhas else "")
        if falhas_raw:
            msg += f" · {len(falhas_raw)} RAW não convertido(s), ficaram em RAW (veja o log)"
        E.transfer.update(estado="concluido", progresso=1, msg=msg,
                          revisaveis=len(transferidos), falhas=falhas, falhas_raw=len(falhas_raw))
        painel.concluido()
        stats.atualizar_voluntarios_em_segundo_plano()
    except Exception as e:
        E.transfer.update(estado="erro", msg=str(e))
        painel.erro_copia()


def _converter_raws(destino, transferidos):
    """Troca as copias RAW do PC por JPEG. Devolve (lista atualizada, RAWs que nao converteram)."""
    raws = [p for p in transferidos if p.lower().endswith(core.EXT_RAW)]
    if not raws:
        return transferidos, []

    def avancar(feitos, total):
        E.transfer.update(feitos=feitos, total=total, progresso=feitos / total)

    E.transfer.update(fase="convertendo", feitos=0, total=len(raws), progresso=0,
                      msg="Convertendo RAW para JPEG...")
    convertidos, falhas = raw.converter_todos(raws, destino, avancar)
    return [convertidos.get(p, p) for p in transferidos], falhas


def _gravar_markers(copiados):
    por_dir = {}
    for p in copiados:
        por_dir.setdefault(os.path.dirname(p), []).append(p)
    for subdir, paths in por_dir.items():
        _ordenar_por_data(paths)
        ultimo = paths[-1]
        try:
            mtime = os.path.getmtime(ultimo)
        except Exception:
            mtime = time.time()
        marker = os.path.join(subdir, core.MARKER_NAME)
        try:
            with open(marker, 'w', encoding='utf-8') as f:
                f.write("=====================================================\n")
                f.write(" FOTOS DESCARREGADAS ATÉ ESTE PONTO\n")
                f.write("=====================================================\n")
                f.write("Este arquivo indica que as fotos anteriores a ele\n")
                f.write("já foram importadas para o computador.\n\n")
                f.write(f"Último arquivo importado: {os.path.basename(ultimo)}\n")
                f.write(f"Data do descarregamento: {time.strftime('%d/%m/%Y %H:%M:%S')}\n")
                f.write(f"Timestamp do último arquivo: {mtime}\n")
                f.write("=====================================================\n")
            os.utime(marker, (mtime + 1.0, mtime + 1.0))
        except Exception as e:
            print(f"Erro ao criar marker em {subdir}: {e}")
