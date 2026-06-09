const crypto = require('crypto');

function createTask(title, description = '') {
  return {
    id: crypto.randomUUID(),
    title: title.trim(),
    description: description.trim(),
    status: 'Pendente',
    assignedAgentId: null,
    progress: 0,
    createdAt: new Date().toISOString(),
    completedAt: null
  };
}

function assignTask(task, agentId) {
  task.assignedAgentId = agentId;
  task.status = 'Atribuída';
}

function getTaskLabel(task) {
  if (!task) {
    return 'Nenhuma tarefa atribuída';
  }

  return task.title;
}

module.exports = {
  assignTask,
  createTask,
  getTaskLabel
};
