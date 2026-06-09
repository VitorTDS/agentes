# AI Agent Office

Extensao do VS Code que abre um escritorio pixel art de agentes de IA em uma aba Webview.

Nao usa navegador externo, localhost, React, Vite ou servidor web.

## Como executar

```bash
npm install
npm run compile
```

Depois:

1. Abra esta pasta no VS Code.
2. Pressione `F5` para abrir o **Extension Development Host**.
3. No novo VS Code, abra a paleta de comandos com `Ctrl+Shift+P`.
4. Execute `AI Agent Office: Abrir Escritório`.

## Funcionalidades

- Sala 2D estilo pixel art dentro de Webview.
- Piso de madeira, piso azul, piso xadrez, paredes, mesas, monitores, cadeiras, sofa, plantas, estantes, quadro e relogio.
- Agentes iniciais: Pesquisador, Programador, Designer, Revisor e Gestor.
- Clique em um agente para abrir o painel lateral com prompt, tarefa, status, progresso e logs.
- Botao `Executar tarefa` simula trabalho em tempo real.
- Menu inferior com `+ Agent`, `Logout` e `Settings`.
- Modal para criar novos agentes.
- Zoom com botoes `+` e `-`.
- Persistencia via `localStorage` da Webview.

## Estrutura

```text
package.json
src/
  extension.js
media/
  office.html
  office.css
  office.js
  office-icon.svg
.vscode/
  launch.json
```

## Validacao

```bash
npm run compile
```
