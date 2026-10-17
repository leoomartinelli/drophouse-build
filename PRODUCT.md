# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dois públicos com o mesmo peso nas decisões de tela:

- **Voluntário fotógrafo**: descarrega o próprio cartão SD no fim do culto (o "Dia de Servir"), em um dos PCs da equipe. Costuma estar com pressa, nem sempre tem familiaridade com o programa e muitas vezes usa notebook.
- **Líder da equipe de foto**: cria e ativa o Dia de Servir na estação Líder, cadastra voluntários e categorias, acompanha pelo celular quem está descarregando e quem falta, e finaliza o Servir.

## Product Purpose

O DropHouse leva as fotos do cartão SD até o Google Drive da igreja, organizadas por Servir, categoria e fotógrafo. Ele descarrega, deixa apagar as fotos ruins e envia ao Drive em segundo plano.

**Sucesso:** as fotos certas chegam ao Drive, na pasta certa, rápido e sem erro, sem que o voluntário precise de ajuda.

## Positioning

É um sistema de **descarregar**, feito para o ritual do Servir da House: vários PCs na mesma rede (um Líder e Auxiliares), numeração contínua entre estações, painel ao vivo no celular por QR code e pastas do Drive criadas por categoria e data. A edição de fotos fica **fora** do núcleo: a ideia é o DropHouse se conectar depois a um sistema de edição separado, que a equipe ainda vai criar (no estilo do LightCraft).

## Operating Context

- Uso no fim do culto, com vários voluntários querendo descarregar ao mesmo tempo e PCs disputados.
- Servidor local em Python; a interface abre no navegador do próprio PC (`localhost`). Funciona sem internet, exceto o envio ao Drive.
- Rede local: uma **Estação Líder** e **Estações Auxiliares**. Só o Líder cria o Dia de Servir; os Auxiliares conectam e sincronizam com ele.
- O painel de acompanhamento abre no celular de quem está na mesma rede (QR code) e só enxerga `/painel`.
- Instalado em Windows, macOS e Linux, com atualização automática: cada mudança na `main` vira versão e todos os PCs se atualizam sozinhos.

## Capabilities and Constraints

- Fluxo de descarregar em passos: origem (cartão detectado ou pasta) → fotógrafo e categoria → destino → cópia → finalizar.
- Conversão de RAW para JPEG na cópia (motor LightCraft, opcional).
- Seleção de fotos (descartar as ruins) com zoom para conferir foco.
- Envio ao Google Drive em segundo plano, com progresso visível em qualquer tela.
- Predefinições de categorias, histórico de descarregamentos, configuração de pastas do Drive e locais, login Google.
- Finalizar o Servir envia os dados a um webhook.
- Existe hoje um editor de fotos embutido (Luz, Curva, Cor, corte) com o motor LightCraft. **Em aberto:** se ele continua no DropHouse ou migra para o futuro sistema de edição.
- Interface em JavaScript puro, sem build; o PyInstaller empacota a pasta `app/static` como está.
- Nomes: o produto se chama **DropHouse** (antes LightHouse). "Descarregador de Fotos" continua nos instaladores, na pasta de dados (`~/Descarregador de Fotos`) e na atualização automática; trocar esses nomes quebra caminhos e exige decisão própria.

## Brand Commitments

- Produto da **House de Criatividade** (equipe criativa da igreja: design, vídeo, copy, foto e social). Assinaturas: "creative minds for the kingdom", "love&serve".
- Identidade da House: preto e lime, símbolo de oito raios com a casa no centro. O manual da marca está no PDF "HOUSE Design System".
- Idioma da interface: português do Brasil, direto e simples, falando com o voluntário.

## Evidence on Hand

- Manual da marca da House (PDF e imagens enviados pelo time), mascote "Housinho" em `app/static/housinho.png`.
- Não há depoimentos, métricas de uso nem estudos com usuários. Não inventar.

## Product Principles

1. **O voluntário termina sozinho.** Cada passo deixa claro o que fazer agora e o que vem depois.
2. **Nada se perde.** Copiar antes de apagar, confirmar o que é irreversível, mostrar onde cada foto foi parar.
3. **Rápido no fim do culto.** Menos cliques e menos espera; o que pode rodar em segundo plano roda em segundo plano.
4. **O líder enxerga tudo.** Estado de cada PC, de cada voluntário e de cada envio, ao vivo.
5. **Descarregar é o núcleo.** Recursos de edição não atrapalham o fluxo do cartão ao Drive.

## Accessibility & Inclusion

- Voluntários com níveis diferentes de familiaridade com computador: textos simples, nada que dependa de saber atalhos.
- Notebooks de tela pequena (1366×768) e celulares (painel) precisam funcionar sem quebrar.
- Meta: WCAG AA (contraste, teclado, rótulos).
