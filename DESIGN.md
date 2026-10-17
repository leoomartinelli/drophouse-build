---
name: DropHouse
description: Descarregador de fotos da House de Criatividade, do cartão SD ao Google Drive.
colors:
  lime-house: "#C1FF00"
  lime-house-claro: "#D4FF4D"
  lime-house-veu: "rgba(193,255,0,.12)"
  lime-house-traco: "rgba(193,255,0,.45)"
  preto-house: "#131313"
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
    fontFamily: "Anton, 'Arial Narrow', sans-serif"
    fontSize: "2.15rem"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "0.005em"
  headline:
    fontFamily: "Anton, 'Arial Narrow', sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "0.02em"
  title:
    fontFamily: "Anton, 'Arial Narrow', sans-serif"
    fontSize: "1.12rem"
    fontWeight: 400
    letterSpacing: "0.04em"
  body:
    fontFamily: "'Inter Tight', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Inter Tight', system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 700
    letterSpacing: "0.16em"
  wordmark:
    fontFamily: "'Inter Tight', system-ui, sans-serif"
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

A identidade vem da House de Criatividade: preto e lime, títulos condensados em caixa alta (Anton) e o símbolo de oito raios com a casa no centro. Do manual da marca vem também o canto de enquadramento, aqui usado como cantos lime no cartão do passo atual, como um visor que enquadra o que importa agora. Os componentes são macios e decididos: pílulas e cantos arredondados, um botão lime por tela e uma resposta tátil a cada clique.

O sistema é escuro por decisão, não por moda: a foto é julgada sobre fundo neutro, como num editor, e o ambiente de uso é escuro. Não há tema claro.

**Key Characteristics:**
- Fundo preto da House com camadas de grafite; uma só cor de destaque.
- Títulos em Anton, caixa alta; texto em Inter Tight.
- Botões em pílula, cards de 20px, campos de 12px.
- Ícones de traço fino (1,75), nunca emoji.
- Movimento curto com desaceleração suave; nada elástico, nada brilhando.

## Colors

Preto e lime da House, com uma escada de grafites para as camadas e dois sinais de estado.

### Primary
- **Lime House** (`lime-house`): a ação principal da tela (um botão por tela), o passo atual, o que deu certo (conectado, concluído), o foco de campos. Texto sobre ele é sempre Preto House.
- **Lime House claro** (`lime-house-claro`): só o hover do botão principal.
- **Véu lime** (`lime-house-veu`): fundo de seleção e hover em listas, chips e itens marcados.
- **Traço lime** (`lime-house-traco`): contornos lime discretos (botão de contorno, grupo selecionado).

### Neutral
- **Preto House** (`preto-house`): fundo da página e texto sobre o lime.
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

**Display Font:** Anton (com Arial Narrow)
**Body Font:** Inter Tight (com system-ui)

**Character:** A Anton traz a voz gráfica da House, condensada e em caixa alta; a Inter Tight é a voz de trabalho, firme e legível em tamanhos pequenos, e também desenha o wordmark "drop**house**" no mesmo estilo de "**house** de criatividade". As duas fontes ficam dentro do app (`app/static/fonts`), porque o programa roda offline.

### Hierarchy
- **Display** (Anton 400, 2,15rem, 0,98): título de cada tela ("Painel inicial", nome do Servir). O título do passo atual sobe para 1,6rem.
- **Headline** (Anton 400, 1,25rem, 1,1): títulos de cards e janelas.
- **Title** (Anton 400, 1,12rem, +0,04em): botões grandes de ação (criar Servir, selecionar fotos, modo avulso).
- **Body** (Inter Tight 400, 15px, 1,5): todo o texto corrido, botões (600, 0,92rem) e rótulos de campo (600, 0,88rem).
- **Label** (Inter Tight 700, 0,72rem, +0,16em, caixa alta): subtítulos de seção em cinza ("Estações conectadas", "Enviar para o Google Drive") e nomes dos passos.

### Named Rules
**The Anton Only Shouts Rule.** Anton só em títulos e no botão grande; nunca em parágrafo, campo ou lista.

## Layout

Conteúdo centralizado em até 1100px, com 18px de margem; o assistente de descarregar estreita para 760px, porque é uma tarefa de uma coluna. O Painel inicial usa duas colunas (criar Servir à esquerda; Servir anteriores e rede à direita) e vira uma coluna abaixo de 820px. Abaixo de 520px, campos e botões de uma linha quebram: o campo ocupa a linha inteira e os botões descem; itens de lista põem o texto em cima e os botões embaixo. O topo de cada tela tem título à esquerda e ações à direita, separados do conteúdo por uma linha. Ritmo: 6, 8, 12, 18, 22 e 28px.

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
- **Grande:** largura total, Anton em caixa alta, para a ação central de uma tela.
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

### Navigation
- **Cabeçalho:** símbolo da House em lime (gira 45° no hover) e o wordmark "drop**house**". Sem menu: cada tela tem seu título e um botão Voltar em pílula discreta.

### Indicador de passos (Signature Component)
Círculos de 36px ligados por linhas. Passo atual: círculo lime cheio com número em Anton e um anel lime fino afastado 4px. Passos concluídos: contorno lime com ícone de check, e a linha até o próximo passo fica lime. Os passos já preenchidos aparecem como resumos acima do cartão, cada um com ícone lime.

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
- **Don't** usar Anton em texto corrido.
