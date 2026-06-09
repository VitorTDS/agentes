# Escritório de Agentes de IA

Projeto Node.js de terminal/TUI para simular um escritório de agentes de IA.

Stack:
- Node.js
- blessed
- JSON local em `data/database.json`
- Sem React, sem navegador, sem Vite e sem servidor web

## Como Rodar

```bash
npm install
npm start
```

## Convenções Do Projeto

- A aplicação roda exclusivamente no terminal.
- A entrada principal é `index.js`.
- A orquestração fica em `src/app.js`.
- A interface TUI fica em `src/ui.js`.
- Agentes ficam em `src/agents.js`.
- Tarefas ficam em `src/tasks.js`.
- Persistência fica em `src/database.js`.
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

UX/TUI e interface:
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
- Rodar `npm start` quando a mudança afetar inicialização ou UI.
- Conferir `git status --short`.
- Não commitar alterações de runtime em `data/database.json` sem necessidade explícita.
