const crypto = require('crypto');

const INITIAL_AGENTS = [
  {
    name: 'Agente Pesquisador',
    role: 'Pesquisa e coleta de contexto',
    icon: '🔎'
  },
  {
    name: 'Agente Programador',
    role: 'Implementação de código',
    icon: '💻'
  },
  {
    name: 'Agente Designer',
    role: 'Experiência visual e interface',
    icon: '🎨'
  },
  {
    name: 'Agente Revisor',
    role: 'Qualidade, testes e revisão',
    icon: '✅'
  },
  {
    name: 'Agente Gestor',
    role: 'Planejamento e coordenação',
    icon: '📋'
  }
];

function createInitialAgents() {
  return INITIAL_AGENTS.map((agent) => createAgent(agent.name, agent.role, agent.icon));
}

function createAgent(name, role, icon = '🤖') {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    role: role.trim(),
    icon,
    status: 'Aguardando',
    currentTaskId: null,
    progress: 0,
    lastLog: 'Pronto para receber tarefas.',
    createdAt: new Date().toISOString()
  };
}

function resetAgentExecution(agent) {
  agent.status = 'Aguardando';
  agent.progress = 0;
  agent.currentTaskId = null;
  agent.lastLog = 'Pronto para receber tarefas.';
}

module.exports = {
  createAgent,
  createInitialAgents,
  resetAgentExecution
};
