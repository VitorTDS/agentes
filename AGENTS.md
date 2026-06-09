# AI Agent Office

Extensao do VS Code com Webview pixel art para simular um escritorio de agentes de IA.

Stack:
- Node.js
- VS Code Extension API
- Webview com HTML, CSS e JavaScript puro
- Persistencia via `localStorage` da Webview
- Sem React, sem navegador externo, sem localhost, sem Vite e sem servidor web

## Como Rodar

```bash
npm install
npm run compile
```

Depois abrir no VS Code, pressionar F5 e executar o comando `AI Agent Office: Abrir Escritório`.

## Convenções Do Projeto

- A aplicacao roda exclusivamente dentro do VS Code como Webview.
- A entrada da extensao fica em `src/extension.js`.
- A interface fica em `media/office.html`, `media/office.css` e `media/office.js`.
- Nao criar servidor local.
- Nao abrir navegador externo.
- Nao adicionar React/Vite para esta versao.
- Não versionar `node_modules/`.
- Manter `package-lock.json` versionado.

## Skills Agnostic-Core Para Usar Com Codex

Antes de implementar mudanças relevantes, consultar as skills aplicáveis em `.agnostic-core/`.

Qualidade e revisão:
- `.agnostic-core/skills/audit/validation-checklist.md`
- `.agnostic-core/skills/audit/systematic-debugging.md`
- `.agnostic-core/skills/testing/unit-testing.md`
- `.agnostic-core/skills/testing/integration-testing.md`

Node.js:
- `.agnostic-core/skills/nodejs/nodejs-patterns.md`

UX/Webview e interface:
- `.agnostic-core/skills/frontend/ux-guidelines.md`
- `.agnostic-core/skills/frontend/accessibility.md`

Git:
- `.agnostic-core/skills/git/commit-conventions.md`
- `.agnostic-core/skills/git/branching-strategy.md`

Planejamento:
- `.agnostic-core/skills/behavioral/goal-backward-planning.md`
- `.agnostic-core/skills/behavioral/project-workflow.md`
- `.agnostic-core/skills/behavioral/context-management.md`

IA/LLM, quando aplicável:
- `.agnostic-core/skills/ai/ai-integration-patterns.md`
- `.agnostic-core/skills/behavioral/prompt-engineering.md`

## Checklist Antes De Finalizar

- Rodar `node --check` nos arquivos alterados.
- Rodar `npm run compile` quando a mudanca afetar inicializacao ou UI.
- Conferir `git status --short`.
- Nao commitar arquivos gerados sem necessidade explicita.
