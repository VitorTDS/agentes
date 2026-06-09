const { createAgent, createInitialAgents } = require('./agents');
const { assignTask, createTask } = require('./tasks');
const { loadDatabase, saveDatabase } = require('./database');
const { EXECUTION_LOGS, createUi } = require('./ui');

const DEFAULT_DATA = {
  agents: createInitialAgents(),
  tasks: [],
  logs: []
};

function startApp() {
  const state = loadDatabase(DEFAULT_DATA);
  let ui;
  let runningTask = false;

  function persist() {
    saveDatabase(state);
  }

  function log(message) {
    state.logs.push({
      time: new Date().toLocaleTimeString('pt-BR', { hour12: false }),
      message
    });

    if (state.logs.length > 200) {
      state.logs.splice(0, state.logs.length - 200);
    }
  }

  function refresh() {
    persist();
    ui.render(state);
  }

  async function onNewAgent() {
    const name = await ui.ask('Nome do novo agente');
    if (!name) return;

    const role = await ui.ask('Função do agente', 'Agente especialista');
    if (!role) return;

    const agent = createAgent(name, role);
    state.agents.push(agent);
    log(`Novo agente criado: ${agent.name}.`);
    refresh();
  }

  async function onNewTask() {
    const title = await ui.ask('Título da nova tarefa');
    if (!title) return;

    const description = await ui.ask('Descrição da tarefa', '');
    const task = createTask(title, description);
    state.tasks.push(task);
    log(`Nova tarefa criada: ${task.title}.`);
    refresh();
  }

  async function onAssignTask() {
    const task = await chooseTask('Escolha uma tarefa pendente ou atribuída', (item) => item.status !== 'Concluída');
    if (!task) return;

    const agent = await chooseAgent('Escolha o agente responsável');
    if (!agent) return;

    assignTask(task, agent.id);
    agent.currentTaskId = task.id;
    agent.status = 'Aguardando';
    agent.progress = task.progress;
    agent.lastLog = `Tarefa atribuída: ${task.title}.`;
    log(`${task.title} atribuída para ${agent.name}.`);
    refresh();
  }

  async function onExecuteTask() {
    if (runningTask) {
      ui.showMessage('Já existe uma tarefa em execução.');
      return;
    }

    const executableTasks = state.tasks.filter((task) => task.assignedAgentId && task.status !== 'Concluída');
    const task = await chooseTask('Escolha uma tarefa para executar', (item) => executableTasks.includes(item));
    if (!task) return;

    const agent = state.agents.find((item) => item.id === task.assignedAgentId);
    if (!agent) {
      ui.showMessage('Esta tarefa não possui agente válido.');
      return;
    }

    await executeTask(agent, task);
  }

  async function onAgentDetails() {
    const agent = await chooseAgent('Escolha um agente para ver detalhes');
    if (!agent) return;

    const task = state.tasks.find((item) => item.id === agent.currentTaskId);
    ui.showDetails(agent, task);
  }

  function onQuit() {
    persist();
    ui.close();
    process.exit(0);
  }

  async function executeTask(agent, task) {
    runningTask = true;
    task.status = 'Executando';
    task.progress = 0;
    task.completedAt = null;
    agent.status = 'Executando';
    agent.currentTaskId = task.id;
    agent.progress = 0;
    agent.lastLog = EXECUTION_LOGS[0];
    log(`${agent.name} iniciou: ${task.title}.`);
    refresh();

    for (let step = 0; step <= 20; step += 1) {
      const progress = Math.min(100, step * 5);
      const logIndex = Math.min(EXECUTION_LOGS.length - 1, Math.floor((progress / 100) * EXECUTION_LOGS.length));
      const message = EXECUTION_LOGS[logIndex];

      task.progress = progress;
      agent.progress = progress;
      agent.lastLog = message;

      if (step % 4 === 0 || progress === 100) {
        log(`${agent.name}: ${message}`);
      }

      refresh();
      await wait(250);
    }

    task.status = 'Concluída';
    task.completedAt = new Date().toISOString();
    agent.status = 'Concluído';
    agent.progress = 100;
    agent.lastLog = 'Tarefa concluída.';
    log(`${agent.name} concluiu: ${task.title}.`);
    runningTask = false;
    refresh();
  }

  function chooseAgent(title) {
    return ui.choose(title, state.agents.map((agent) => ({
      label: `${agent.icon} ${agent.name} - ${agent.status} - ${agent.role}`,
      value: agent
    })));
  }

  function chooseTask(title, filter = () => true) {
    const tasks = state.tasks.filter(filter);
    return ui.choose(title, tasks.map((task) => {
      const agent = state.agents.find((item) => item.id === task.assignedAgentId);
      return {
        label: `${task.status} - ${task.title} (${agent ? agent.name : 'sem agente'})`,
        value: task
      };
    }));
  }

  ui = createUi({
    onAgentDetails,
    onAssignTask,
    onExecuteTask,
    onNewAgent,
    onNewTask,
    onQuit
  });

  log('Sistema iniciado.');
  refresh();
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

module.exports = {
  startApp
};
