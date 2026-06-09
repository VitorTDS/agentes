const blessed = require('blessed');
const { databasePath } = require('./database');
const { getTaskLabel } = require('./tasks');

const EXECUTION_LOGS = [
  'Analisando solicitação...',
  'Planejando solução...',
  'Executando tarefa...',
  'Revisando resultado...',
  'Finalizando...',
  'Tarefa concluída.'
];

function createUi(handlers) {
  const screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true,
    title: 'Escritório de Agentes de IA'
  });

  const title = blessed.box({
    top: 0,
    left: 0,
    width: '100%',
    height: 3,
    align: 'center',
    valign: 'middle',
    tags: true,
    content: '{bold}{cyan-fg}ESCRITÓRIO DE AGENTES DE IA{/cyan-fg}{/bold}',
    style: {
      bg: 'black'
    }
  });

  const office = blessed.box({
    top: 3,
    left: 0,
    width: '100%',
    height: '70%-3',
    tags: true,
    scrollable: true,
    alwaysScroll: true,
    keys: true,
    vi: true,
    style: {
      bg: 'black'
    }
  });

  const bottom = blessed.box({
    bottom: 2,
    left: 0,
    width: '100%',
    height: '30%',
    border: 'line',
    label: ' Console do escritório ',
    tags: true,
    scrollable: true,
    alwaysScroll: true,
    keys: true,
    vi: true,
    style: {
      border: { fg: 'cyan' },
      fg: 'white',
      bg: 'black'
    }
  });

  const shortcuts = blessed.box({
    bottom: 0,
    left: 0,
    width: '100%',
    height: 2,
    tags: true,
    content: '{bold}A{/bold} Novo agente  {bold}T{/bold} Nova tarefa  {bold}R{/bold} Atribuir tarefa  {bold}E{/bold} Executar tarefa  {bold}D{/bold} Detalhes  {bold}Q{/bold} Sair',
    style: {
      fg: 'black',
      bg: 'cyan'
    }
  });

  screen.append(title);
  screen.append(office);
  screen.append(bottom);
  screen.append(shortcuts);

  screen.key(['a', 'A'], handlers.onNewAgent);
  screen.key(['t', 'T'], handlers.onNewTask);
  screen.key(['r', 'R'], handlers.onAssignTask);
  screen.key(['e', 'E'], handlers.onExecuteTask);
  screen.key(['d', 'D'], handlers.onAgentDetails);
  screen.key(['q', 'Q', 'C-c'], handlers.onQuit);

  function render(state) {
    office.setContent(renderOffice(state));
    bottom.setContent(renderConsole(state));
    screen.render();
  }

  function ask(label, initialValue = '') {
    return new Promise((resolve) => {
      const prompt = blessed.prompt({
        parent: screen,
        top: 'center',
        left: 'center',
        width: '60%',
        height: 8,
        border: 'line',
        label: ` ${label} `,
        tags: true,
        keys: true,
        vi: true,
        style: {
          border: { fg: 'yellow' },
          bg: 'black',
          fg: 'white'
        }
      });

      prompt.input(label, initialValue, (error, value) => {
        prompt.destroy();
        screen.render();
        resolve(error ? '' : String(value || '').trim());
      });
    });
  }

  function choose(titleText, items) {
    return new Promise((resolve) => {
      if (!items.length) {
        showMessage('Nada disponível para selecionar.');
        resolve(null);
        return;
      }

      const list = blessed.list({
        parent: screen,
        top: 'center',
        left: 'center',
        width: '70%',
        height: Math.min(16, items.length + 4),
        border: 'line',
        label: ` ${titleText} `,
        keys: true,
        vi: true,
        mouse: true,
        items: items.map((item) => item.label),
        style: {
          border: { fg: 'yellow' },
          selected: {
            bg: 'cyan',
            fg: 'black',
            bold: true
          },
          bg: 'black',
          fg: 'white'
        }
      });

      list.focus();
      list.key(['escape', 'q'], () => {
        list.destroy();
        screen.render();
        resolve(null);
      });
      list.on('select', (_, index) => {
        const selected = items[index] || null;
        list.destroy();
        screen.render();
        resolve(selected ? selected.value : null);
      });
      screen.render();
    });
  }

  function showMessage(message) {
    blessed.message({
      parent: screen,
      top: 'center',
      left: 'center',
      width: '60%',
      height: 7,
      border: 'line',
      label: ' Aviso ',
      tags: true,
      keys: true,
      style: {
        border: { fg: 'yellow' },
        bg: 'black',
        fg: 'white'
      }
    }).display(message, 3, () => {});
    screen.render();
  }

  function showDetails(agent, task) {
    const content = [
      `{bold}${agent.icon} ${agent.name}{/bold}`,
      '',
      `Função: ${agent.role}`,
      `Status: ${agent.status}`,
      `Tarefa atual: ${getTaskLabel(task)}`,
      `Progresso: ${agent.progress}%`,
      `Último log: ${agent.lastLog}`,
      '',
      `ID: ${agent.id}`,
      '',
      '{gray-fg}Pressione ESC, Q ou Enter para voltar.{/gray-fg}'
    ].join('\n');

    const box = blessed.box({
      parent: screen,
      top: 'center',
      left: 'center',
      width: '70%',
      height: 16,
      border: 'line',
      label: ' Detalhes do agente ',
      tags: true,
      keys: true,
      vi: true,
      content,
      style: {
        border: { fg: 'cyan' },
        bg: 'black',
        fg: 'white'
      }
    });

    box.focus();
    box.key(['escape', 'q', 'enter'], () => {
      box.destroy();
      screen.render();
    });
    screen.render();
  }

  function close() {
    screen.destroy();
  }

  return {
    ask,
    choose,
    close,
    render,
    showDetails,
    showMessage
  };
}

function renderOffice(state) {
  const cards = state.agents.map((agent) => renderAgentCard(agent, state));
  const rows = [];

  for (let index = 0; index < cards.length; index += 2) {
    const left = cards[index];
    const right = cards[index + 1];
    rows.push(joinCards(left, right));
  }

  return rows.join('\n');
}

function renderAgentCard(agent, state) {
  const task = state.tasks.find((item) => item.id === agent.currentTaskId);
  const statusColor = getStatusColor(agent.status);
  const progress = renderProgress(agent.progress);
  const lines = [
    `${agent.icon} ${agent.name}`,
    `Função: ${agent.role}`,
    `Status: {${statusColor}-fg}${agent.status}{/${statusColor}-fg}`,
    `Tarefa: ${truncate(getTaskLabel(task), 32)}`,
    `Progresso: ${progress} ${String(agent.progress).padStart(3, ' ')}%`,
    `Log: ${truncate(agent.lastLog, 35)}`
  ];

  return drawCard(lines, 46);
}

function drawCard(lines, width) {
  const inner = width - 2;
  const top = `┌${'─'.repeat(inner)}┐`;
  const bottom = `└${'─'.repeat(inner)}┘`;
  const body = lines.map((line) => `│ ${pad(stripTags(line), inner - 1, line)}│`);

  return [top, ...body, bottom];
}

function joinCards(left, right) {
  const empty = ' '.repeat(left[0].length);
  const rightCard = right || left.map(() => empty);
  return left.map((line, index) => `${line}  ${rightCard[index]}`).join('\n');
}

function renderProgress(value) {
  const total = 12;
  const filled = Math.round((value / 100) * total);
  return `{green-fg}${'█'.repeat(filled)}{/green-fg}{gray-fg}${'░'.repeat(total - filled)}{/gray-fg}`;
}

function renderConsole(state) {
  const taskLines = state.tasks.slice(-5).map((task) => {
    const agent = state.agents.find((item) => item.id === task.assignedAgentId);
    const owner = agent ? agent.name : 'Sem agente';
    return `{yellow-fg}${task.status.padEnd(10)}{/yellow-fg} ${truncate(task.title, 38)} -> ${owner}`;
  });

  const logLines = state.logs.slice(-8).map((log) => `{gray-fg}${log.time}{/gray-fg} ${log.message}`);

  return [
    `{bold}Banco local:{/bold} ${databasePath}`,
    '',
    '{bold}{cyan-fg}Tarefas recentes{/cyan-fg}{/bold}',
    ...(taskLines.length ? taskLines : ['Nenhuma tarefa criada.']),
    '',
    '{bold}{cyan-fg}Logs{/cyan-fg}{/bold}',
    ...(logLines.length ? logLines : ['Nenhum log ainda.'])
  ].join('\n');
}

function getStatusColor(status) {
  if (status === 'Executando') return 'yellow';
  if (status === 'Concluído') return 'green';
  if (status === 'Erro') return 'red';
  return 'cyan';
}

function pad(plainText, size, taggedText) {
  const visibleLength = plainText.length;
  const spaces = Math.max(0, size - visibleLength);
  return `${taggedText}${' '.repeat(spaces)}`;
}

function stripTags(value) {
  return String(value).replace(/\{\/?[a-z-]+(?:-fg)?\}/g, '');
}

function truncate(value, maxLength) {
  const text = String(value || '');
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1)}…`;
}

module.exports = {
  EXECUTION_LOGS,
  createUi
};
