---
name: DropHouse
description: Descarregador de fotos da House de Criatividade, do cartão SD ao Google Drive.
colors:
  lime-house: "#70D068"
  lime-house-claro: "#8FDE88"
  lime-house-veu: "rgba(112,208,104,.13)"
  lime-house-traco: "rgba(112,208,104,.48)"
  tinta-verde: "#0A2E2B"
  menta-simbolo: "#DDFDE6"
  teal-simbolo: "#0B6D67"
  preto-house: "#111513"
  preto-fundo-campo: "#0D0D0D"
  grafite-card: "#1A1A1A"
  grafite-elevado: "#212121"
  linha: "#2B2B2B"
  linha-forte: "#3C3C3C"
  papel: "#F4F4EF"
  cinza-texto: "#A3A39C"
  cinza-fraco: "#86867F"
  vermelho-alerta: "#FF5A47"
  vermelho-veu: "rgba(255,90,71,.13)"
  ambar-aviso: "#FFB020"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "2.15rem"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "0.005em"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.12rem"
    fontWeight: 800
    letterSpacing: "0.04em"
  body:
    fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 700
    letterSpacing: "0.16em"
  wordmark:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "-0.045em"
rounded:
  campo: "12px"
  card: "20px"
  janela: "24px"
  checkbox: "7px"
  pilula: "999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "18px"
  xl: "22px"
  xxl: "28px"
components:
  button-primary:
    backgroundColor: "{colors.lime-house}"
    textColor: "{colors.preto-house}"
    rounded: "{rounded.pilula}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.lime-house-claro}"
    textColor: "{colors.preto-house}"
  button-secondary:
    backgroundColor: "{colors.grafite-elevado}"
    textColor: "{colors.papel}"
    rounded: "{rounded.pilula}"
    padding: "10px 18px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.papel}"
    rounded: "{rounded.pilula}"
    padding: "10px 18px"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.vermelho-alerta}"
    rounded: "{rounded.pilula}"
    padding: "10px 18px"
  button-outline-lime:
    backgroundColor: "transparent"
    textColor: "{colors.lime-house}"
    rounded: "{rounded.pilula}"
    padding: "10px 18px"
  button-hero:
    backgroundColor: "{colors.lime-house}"
    textColor: "{colors.preto-house}"
    typography: "{typography.title}"
    rounded: "{rounded.pilula}"
    padding: "16px 22px"
  input:
    backgroundColor: "{colors.preto-fundo-campo}"
    textColor: "{colors.papel}"
    rounded: "{rounded.campo}"
    padding: "11px 14px"
  card:
    backgroundColor: "{colors.grafite-card}"
    textColor: "{colors.papel}"
    rounded: "{rounded.card}"
    padding: "22px"
  list-item:
    backgroundColor: "{colors.grafite-elevado}"
    textColor: "{colors.papel}"
    rounded: "{rounded.campo}"
    padding: "12px 14px"
  chip:
    backgroundColor: "{colors.grafite-elevado}"
    textColor: "{colors.papel}"
    rounded: "{rounded.pilula}"
    padding: "5px 13px"
  toast:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.preto-house}"
    rounded: "{rounded.pilula}"
    padding: "12px 22px"
  toast-erro:
    backgroundColor: "{colors.vermelho-alerta}"
    textColor: "{colors.preto-house}"
---

# Design System: DropHouse

## Overview

**Creative North Star: "O Visor da Câmera"**

A interface é o visor de uma câmera: um fundo escuro e neutro que não compete com a foto, e uma única cor viva, o Lime House, marcando onde está a ação. O voluntário olha para a tela no fim do culto, muitas vezes num auditório com pouca luz, e precisa achar o próximo passo de relance. Tudo que não é o próximo passo fica em grafite e cinza.

A identidade vem da House de Criatividade, com o símbolo próprio do DropHouse: uma caixa verde com olhinhos (degradê do #70D068 ao #0B6D67, sobre um quadrado menta #DDFDE6). O verde do símbolo é a cor de ação da interface; os nomes `lime-house*` ficaram por compatibilidade, mas hoje apontam para esse verde. Os grafites têm um leve tom esverdeado para conversar com o símbolo. Tudo em Inter, com títulos pesados em caixa alta. Do manual da marca vem também o canto de enquadramento, aqui usado como cantos lime no cartão do passo atual, como um visor que enquadra o que importa agora. Os componentes são macios e decididos: pílulas e cantos arredondados, um botão lime por tela e uma resposta tátil a cada clique.

O sistema é escuro por decisão, não por moda: a foto é julgada sobre fundo neutro, como num editor, e o ambiente de uso é escuro. Não há tema claro.

**Key Characteristics:**
- Fundo preto da House com camadas de grafite; uma só cor de destaque.
- Tudo em Inter: títulos em Inter 800 em caixa alta; texto em Inter normal; caminhos e nomes de arquivo na fonte mono do sistema.
- Botões em pílula, cards de 20px, campos de 12px.
- Ícones de traço fino (1,75), nunca emoji.
- Movimento curto com desaceleração suave; nada elástico, nada brilhando.

## Colors

Preto e lime da House, com uma escada de grafites para as camadas e dois sinais de estado.

### Primary
- **Lime House** (`lime-house`): a ação principal da tela (um botão por tela), o passo atual, o que deu certo (conectado, concluído), o foco de campos. Texto sobre ele é sempre a Tinta verde (`tinta-verde`).
- **Lime House claro** (`lime-house-claro`): só o hover do botão principal.
- **Véu lime** (`lime-house-veu`): fundo de seleção e hover em listas, chips e itens marcados.
- **Traço lime** (`lime-house-traco`): contornos lime discretos (botão de contorno, grupo selecionado).

### Neutral
- **Preto House** (`preto-house`): fundo da página (grafite com um toque de verde).
- **Preto de campo** (`preto-fundo-campo`): fundo de campos, listas de seleção e caminhos de pasta; um degrau abaixo do fundo, para o campo parecer "escavado".
- **Grafite card** (`grafite-card`): cards, janelas, quadro de envios.
- **Grafite elevado** (`grafite-elevado`): itens dentro de cards, chips, botão secundário.
- **Linha** e **Linha forte** (`linha`, `linha-forte`): bordas de 1px; a forte para controles e janelas.
- **Papel** (`papel`): texto principal, um branco levemente quente.
- **Cinza texto** (`cinza-texto`): texto secundário (6,4 a 7,3:1 sobre os grafites).
- **Cinza fraco** (`cinza-fraco`): placeholder, rodapé e rótulos de passos ainda não alcançados (4,75 a 5,3:1).

### Estados
- **Vermelho alerta** (`vermelho-alerta`): excluir, descartar, encerrar, erro. Em botão é contorno e texto; em fundo cheio (aviso de erro, carimbo "DESCARTADA") o texto é Preto House.
- **Âmbar aviso** (`ambar-aviso`): aguardando, versão diferente, PC ocupado.

### Named Rules
**The One Lime Rule.** Cada tela tem no máximo um botão lime cheio: o próximo passo. Os demais são secundários, de contorno ou discretos.

**The Dark Ink Rule.** Texto sobre lime ou sobre vermelho cheio é sempre Preto House, nunca branco (branco sobre o vermelho dá 3,1:1).

## Typography

**Display Font:** Inter, peso 800 (com system-ui)
**Body Font:** Inter (com system-ui)
**Mono:** fonte mono do sistema

**Character:** Uma família só. A Inter pesada, em caixa alta, é a voz de título; a Inter normal é a voz de trabalho, firme e legível em tamanhos pequenos. É variável (peso e tamanho óptico: nos títulos grandes ela assume o desenho da Inter Display) e fica local em `/static/fonts`, porque o programa roda offline. No CSS, as regras de título usam `--f-titulo` e `--p-titulo` (peso).

### Hierarchy
- **Display** (Inter 800, 2,15rem, 0,98, caixa alta): título de cada tela ("Painel inicial", nome do Servir). É o único texto grande em caixa alta.
- **Headline** (Inter 700, 1,125rem, 1,25, frase normal): títulos de cards e janelas ("Dias de Servir anteriores"). O título do passo atual sobe para 1,4rem.
- **Title** (Inter 700, 0,98 a 1,05rem, frase normal): botões de ação ("Criar e ativar Servir", "Selecionar fotos").
- **Body** (Inter 400, 15px, 1,5): todo o texto corrido, botões (600, 0,92rem) e rótulos de campo (600, 0,88rem).
- **Label** (Inter 700, 0,72rem, +0,16em, caixa alta): subtítulos de seção em cinza ("Estações conectadas", "Enviar para o Google Drive") e nomes dos passos.

### Named Rules
**The Caps Only Shouts Rule.** Caixa alta só no título da tela (h1) e nos rótulos pequenos (h3, eyebrow, nomes dos passos). Títulos de card e botões ficam em frase normal, para o título da tela se destacar.

## Layout

Conteúdo centralizado em até 1100px (`--wrap-largo`), com 18px de margem; o assistente de descarregar e as Predefinições estreitam para 760px (`--wrap-estreito`). O logo do cabeçalho e o rodapé acompanham a largura da tela atual (`body[data-largura]`), para ficarem sempre alinhados com o título. O Painel inicial usa duas colunas (criar Servir à esquerda; Servir anteriores e rede à direita) e vira uma coluna abaixo de 820px. Abaixo de 520px, campos e botões de uma linha quebram: o campo ocupa a linha inteira e os botões descem; itens de lista põem o texto em cima e os botões embaixo. O topo de cada tela tem título à esquerda e ações à direita, separados do conteúdo por uma linha. Ritmo: 6, 8, 12, 18, 22 e 28px.

## Elevation & Depth

O sistema é plano por camadas de tom: fundo preto, cards em grafite, itens em grafite elevado, campos um degrau abaixo do fundo. Sombra só aparece no que flutua sobre a página, sempre neutra e com deslocamento para baixo.

### Shadow Vocabulary
- **Janela** (`box-shadow: 0 30px 70px -20px rgba(0,0,0,.8)`): janelas de confirmação e seletor de pasta, sobre um véu escuro com desfoque de 5px.
- **Quadro flutuante** (`box-shadow: 0 22px 50px -16px rgba(0,0,0,.8)`): quadro de envios ao Drive.
- **Aviso** (`box-shadow: 0 14px 34px -10px rgba(0,0,0,.7)`): avisos rápidos no rodapé.
- **Botão principal no hover** (`box-shadow: 0 6px 16px -8px rgba(0,0,0,.7)`): o botão lime sobe 1px e ganha sombra.

### Named Rules
**The No Glow Rule.** Nenhuma sombra ou halo colorido. Destaque vem de cor de fundo e contorno, não de brilho.

## Shapes

Formas macias. Botões, chips, avisos e selos são pílulas (999px). Cards e quadros têm 20px, janelas 24px, campos e itens de lista 12px, checkbox 7px. O passo atual do assistente e o step ativo usam círculos. Bordas de 1px em Linha; controles em Linha forte. A assinatura da marca é o canto de visor: só os quatro cantos de uma borda lime de 2px, arredondados, no cartão do passo atual.

## Components

### Buttons
- **Shape:** pílula (999px), ícone de 18px à esquerda do texto, 8px de espaço.
- **Primary:** Lime House com texto Preto House; é o próximo passo e aparece uma vez por tela.
- **Hover / Focus:** sobe 1px; ao clicar afunda (escala 0,97). Foco por teclado: contorno lime de 2px afastado 2px.
- **Secundário:** grafite elevado com texto Papel. **Discreto:** transparente com contorno Linha forte. **Perigo:** transparente, contorno e texto vermelhos. **Contorno lime:** ações importantes que não são o passo principal (enviar ao Drive, pasta do Servir).
- **Grande:** largura total, Inter 700 em frase normal, para a ação central de uma tela (só "Selecionar fotos" hoje).
- **Fantasma:** só texto e ícone em cinza, para ações terciárias ("Abrir pasta", "Novo descarregamento").
- **Desabilitado:** sempre com o motivo visível numa linha cinza logo abaixo (`travar(btn, motivo)` no `app.js`), também no `title` e no `aria-describedby`.
- **Encerrar:** só ícone, na ponta direita do topo, separado das outras ações; no celular vai para o menu "⋯".
- **Menu "⋯":** ações secundárias e perigosas de um item (Editar, Excluir) ficam num menu, longe do botão principal.
- **Toque:** em telas de toque, todo botão tem pelo menos 44px de altura.

### Chips
- **Style:** pílula em grafite elevado com borda Linha; voluntários, categorias, atalhos de pasta e cartões detectados.
- **State:** clicáveis ganham contorno lime no hover; selecionado fica com véu lime e texto lime. O "remover" é um botão redondo com ícone de x que fica vermelho no hover.

### Cards / Containers
- **Corner Style:** 20px.
- **Background:** grafite card, borda Linha, 22px de respiro interno.
- **Shadow Strategy:** sem sombra (ver Elevation & Depth).
- **Internal Padding:** 22px; o cartão do passo, 28px.

### Inputs / Fields
- **Style:** fundo Preto de campo, borda Linha, 12px de canto, 11px por 14px de respiro. Select com seta própria em cinza.
- **Focus:** borda Lime House; por teclado, também um contorno de 3px em véu lime.
- **Disabled:** opacidade 0,38.
- **Erro:** a mensagem aparece logo abaixo do campo (`erroCampo`), o campo ganha borda vermelha e `aria-invalid`, e o foco vai para ele. A linha do erro já existe vazia com altura reservada (`campoErro`), então nada pula. Botões "Continuar" ficam sempre habilitados e validam no clique.
- **Lista no campo:** voluntários, categorias e pastas de predefinição viram chips dentro da própria caixa; Enter ou vírgula adicionam, colar "Ana, Leo, Bia" cria três, Backspace no vazio tira o último. Nomes de pessoas são normalizados ("leo" → "Leo").

### Navigation
- **Cabeçalho:** a caixa com olhinhos e o wordmark "drop**house**". A caixa é animada de leve num ciclo de 7s: os olhos olham para os lados e piscam, e ela dá um pulinho que esbarra no nome. No hover o ciclo acelera; depois de 3 ciclos sem ninguém mexer na tela, tudo para (volta com qualquer movimento); dentro do editor e da seleção fica parada; com `prefers-reduced-motion` nada se mexe.
- **Voltar:** volta sempre para a tela de onde veio (pilha em `ir()` / `voltar()`). "Início" é o atalho fixo para o Painel.

### Mascote
A mesma caixa do logo, em estados (`mascote(estado, tamanho)` no `app.js`): **espera** (olha em volta e pisca: esperando o cartão), **achou** (pulinho e olhos arregalados: cartão detectado), **recebendo** (fotos caem dentro dela: copiando), **feliz** / **feliz-pula** (fim da cópia, com 6 confetes), **enviando** (fotos sobem: envio ao Drive, no painel de envios), **erro** (treme, olhos tristes: janelas de erro), **dormindo** (cinza, olhos fechados, respirando: estados vazios).
- **Regra de desempenho:** só `transform` e `opacity`, em `@keyframes`, e só em elementos de HTML (corpo, olhos e fotos ficam por cima de um SVG parado). Assim tudo roda na composição, sem layout nem pintura por quadro. O nó é criado uma vez; os polls só trocam a classe (`mascoteEstado`). Para quando a aba fica escondida (`body.pausado`) e com `prefers-reduced-motion`.

### Indicador de passos (Signature Component)
Círculos de 36px ligados por linhas. Passo atual: círculo lime cheio com número em Inter pesada e um anel lime fino afastado 4px. Passos concluídos: contorno lime com ícone de check, e a linha até o próximo passo fica lime. Os passos já preenchidos aparecem como resumos acima do cartão, cada um com ícone lime.

### Seleção de fotos
Tela cheia sobre fundo quase preto (#0B0B0B), barra de ações no topo, tira de miniaturas embaixo com a atual contornada em lime e as descartadas em vermelho apagado. A foto descartada fica cinza e ganha o selo "DESCARTADA" em pílula vermelha.

## Do's and Don'ts

### Do:
- **Do** usar um único botão Lime House por tela, para o próximo passo.
- **Do** usar os ícones do conjunto `IC` do `app.js` (traço 1,75, cantos arredondados) e a bolinha de estado (`pt`) para status.
- **Do** escrever texto sobre lime ou vermelho cheio em Preto House.
- **Do** manter cards em 20px, campos em 12px e botões em pílula.
- **Do** usar a desaceleração suave da casa (`cubic-bezier(.16,1,.3,1)`) para entradas e respostas.

### Don't:
- **Don't** usar emoji como ícone ou enfeite.
- **Don't** usar brilho ou halo colorido (sombra lime, glow).
- **Don't** usar curva elástica ou de quique.
- **Don't** colocar molduras ou cantos sobre a foto na seleção de fotos.
- **Don't** criar tema claro sem decisão da equipe; o sistema é escuro por escolha.
- **Don't** usar caixa alta pesada em texto corrido.
