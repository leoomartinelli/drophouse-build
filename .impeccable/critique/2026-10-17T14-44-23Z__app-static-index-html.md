---
target: interface web do DropHouse
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 5
target_identity: "file:/Users/camillojoao/Documents/CLAUDE CODE/LIGHTHOUSE/LightHouse/app/static/index.html"
target_fingerprint: "sha256:19d8ec9163e13c78940187659765aaf0be29a96210298e382e22b65d3d540cf4"
target_path: /Users/camillojoao/Documents/CLAUDE CODE/LIGHTHOUSE/LightHouse/app/static/index.html
timestamp: 2026-10-17T14-44-23Z
slug: app-static-index-html
---
Method: dual-agent (A: design review · B: detector + browser)

## Design Health Score
| # | Heurística | Nota | Problema principal |
|---|---|---|---|
| 1 | Visibilidade do estado | 3 | Painel inicial não mostra que há Servir ativo; "Selecionar fotos" desabilitado após cópia (visto 2x) |
| 2 | Linguagem do mundo real | 3 | "webhook", "[Pasta Completa]", "Raiz (Nenhuma)", jargão OAuth |
| 3 | Controle e liberdade | 2 | Janelas não fecham com Esc; sem cancelar a cópia |
| 4 | Consistência | 2 | "Dia do/de Servir", "Config Drive" abre "Configuração de pastas", confirmações destrutivas em lime |
| 5 | Prevenção de erros | 2 | "Salvar" (apaga) em lime e "Sair sem salvar" (seguro) em vermelho; Enter empilha confirmação |
| 6 | Reconhecer em vez de lembrar | 3 | Para entrar no Servir ativo é preciso saber clicar "Ativar" em "Anteriores" |
| 7 | Flexibilidade e eficiência | 3 | Atalhos fortes na seleção, envio em segundo plano |
| 8 | Estético e minimalista | 2 | 5 ações no topo + formulário de 6 campos; caminho completo 3x no passo 5 |
| 9 | Recuperação de erros | 2 | Erros em avisos que somem, "veja o log do servidor" |
| 10 | Ajuda | 2 | Configuração do Google aponta para um .md |
| **Total** | | **24/40** | **Aceitável** |

## Design Specificity
Passa no assistente, na seleção de fotos e no painel do celular; Painel inicial, Config Drive, Conta Google e Histórico são formulário de admin genérico com a pele da marca. Detector: 14 achados (3 broken-image falsos, 1 bug de parser de fonte, pulsing-dot ligado a dado real, 8 desvios de tokens no painel.html + 1 declaração morta); browser: nested-cards em listas dentro de card, overflow de 413px no passo 1 do celular.

## Priority Issues
1. [P1] Painel inicial é do líder; voluntário em aba nova não vê o Servir ativo. Fix: card de destaque "Servir ativo · Descarregar meu cartão", item ativo marcado, formulário recolhido. (layout, onboard)
2. [P1] Confirmações destrutivas em lime e com sentido invertido (revisor: "Salvar" apaga; "Apagar" lime; Finalizar Servir "Sim"). Fix: botão vermelho para destrutivo, textos com o verbo real. (clarify, harden)
3. [P1] Janelas não são diálogos: sem role/aria-modal, foco não entra, sem Esc, Enter empilha segunda confirmação; avisos sem aria-live. Fix: helper único de diálogo. (harden)
4. [P1] Passo 1 no celular: indicador de passos com 413px numa tela de 390px e botão "Escolher outra pasta" vira bolha de 4 linhas. (adapt)
5. [P1] Fim do fluxo: "Selecionar fotos" desabilitado após cópia bem-sucedida (estado lido cedo; visto 2x) e a pasta do sistema abre sozinha por cima ao finalizar a seleção. (harden)
6. [P2] Painel do celular: pill "Sem resposta" branco sobre vermelho (3,1:1), raio 14px fora da escala; "Faltam descarregar" no fim. (polish)

## Persona Red Flags
- Jordan (primeira vez): cai no formulário de criar Servir; botão Continuar desabilitado sem explicação; diálogo "Já descarregadas" com Sim/Não invertido.
- Casey (líder no celular): lista "Faltam" lá embaixo; pill offline com contraste baixo; "serviço" em vez de "Servir".
- Sam (teclado): diálogos sem foco nem Esc; avisos não anunciados; miniaturas da seleção são <img> clicáveis.
- Voluntário com fila: ~10 interrupções até o Drive; nenhum "pronto, pode liberar o PC".

## Minor
Plural "(s)", títulos em Title Case, datas ISO e BR misturadas, "Desconectar conta" sem login, zoom da seleção em texto, .kbd visível no celular, favicon 404 no /painel.

## Nota do teste
Os dois agentes rodaram em paralelo no mesmo servidor: o "Modo avulso" da avaliação B desativou o Servir no meio da avaliação A. A "perda do Servir ativo" relatada por A é artefato do teste, não defeito.
