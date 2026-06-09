(function () {
  const storageKey = 'ai-agent-office-state-v1';
  const vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : null;
  const roomScale = document.getElementById('roomScale');
  const agentsLayer = document.getElementById('agentsLayer');
  const workstationsLayer = document.getElementById('workstations');
  const officeStatus = document.getElementById('officeStatus');
  const agentPanel = document.getElementById('agentPanel');
  const addAgentButton = document.getElementById('addAgentButton');
  const logoutButton = document.getElementById('logoutButton');
  const settingsButton = document.getElementById('settingsButton');
  const zoomInButton = document.getElementById('zoomIn');
  const zoomOutButton = document.getElementById('zoomOut');
  const modal = document.getElementById('agentModal');
  const form = document.getElementById('agentForm');
  const closeModalButton = document.getElementById('closeAgentModal');
  const toast = document.getElementById('toast');

  const statusColors = {
    Ocioso: '#45e0ff',
    Pensando: '#ffd76a',
    Executando: '#7dff9e',
    Revisando: '#b88cff',
    Finalizado: '#8fb8ff',
    Erro: '#ff647c'
  };

  const palette = ['#45e0ff', '#7dff9e', '#ffd76a', '#b88cff', '#ff8a65', '#8fb8ff', '#f0749b'];
  const workstations = [
    { x: 118, y: 148 },
    { x: 334, y: 148 },
    { x: 118, y: 344 },
    { x: 334, y: 344 },
    { x: 668, y: 158 },
    { x: 756, y: 318 },
    { x: 526, y: 292 },
    { x: 604, y: 92 },
    { x: 208, y: 470 },
    { x: 732, y: 80 }
  ];

  const defaultAgents = [
    {
      name: 'Pesquisador',
      role: 'Pesquisa e contexto',
      prompt: 'Investigar fontes, organizar contexto e reduzir incerteza.',
      task: 'Mapear requisitos do projeto',
      status: 'Ocioso',
      progress: 0,
      logs: ['Aguardando nova pesquisa.']
    },
    {
      name: 'Programador',
      role: 'Implementacao',
      prompt: 'Criar codigo limpo, revisar integracoes e corrigir falhas.',
      task: 'Construir funcionalidade principal',
      status: 'Ocioso',
      progress: 0,
      logs: ['Ambiente pronto para codar.']
    },
    {
      name: 'Designer',
      role: 'UI e experiencia',
      prompt: 'Projetar interfaces claras, bonitas e utilizaveis.',
      task: 'Ajustar visual pixel art',
      status: 'Ocioso',
      progress: 0,
      logs: ['Mesa de design preparada.']
    },
    {
      name: 'Revisor',
      role: 'Qualidade',
      prompt: 'Revisar codigo, comportamento e riscos antes da entrega.',
      task: 'Validar criterios de aceite',
      status: 'Ocioso',
      progress: 0,
      logs: ['Checklist carregado.']
    },
    {
      name: 'Gestor',
      role: 'Coordenacao',
      prompt: 'Priorizar tarefas, acompanhar progresso e destravar decisoes.',
      task: 'Organizar fila dos agentes',
      status: 'Ocioso',
      progress: 0,
      logs: ['Quadro de gestao atualizado.']
    }
  ];

  let state = loadState();
  let selectedAgentId = state.agents[0] ? state.agents[0].id : null;
  let zoom = state.zoom || 1;
  let runningAgentId = null;

  renderAll();
  wireEvents();
  vscode?.postMessage({ type: 'ready' });

  function wireEvents() {
    addAgentButton.addEventListener('click', openAgentModal);
    closeModalButton.addEventListener('click', closeAgentModal);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeAgentModal();
    });
    form.addEventListener('submit', handleAgentSubmit);
    zoomInButton.addEventListener('click', () => setZoom(zoom + 0.1));
    zoomOutButton.addEventListener('click', () => setZoom(zoom - 0.1));
    logoutButton.addEventListener('click', () => showToast('Sessao local encerrada apenas visualmente.'));
    settingsButton.addEventListener('click', () => showToast('Configuracoes locais salvas automaticamente no Webview.'));

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeAgentModal();
      }
    });
  }

  function loadState() {
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.agents) && parsed.agents.length) {
          return parsed;
        }
      } catch (error) {
        localStorage.removeItem(storageKey);
      }
    }

    return {
      zoom: 1,
      agents: defaultAgents.map((agent, index) => createAgent(agent, index))
    };
  }

  function saveState() {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function createAgent(input, index) {
    const position = workstations[index % workstations.length];
    return {
      id: `agent-${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`,
      name: input.name.trim(),
      role: input.role.trim(),
      prompt: input.prompt.trim(),
      task: input.task.trim(),
      status: input.status || 'Ocioso',
      progress: input.progress || 0,
      logs: input.logs && input.logs.length ? input.logs : ['Agente criado e pronto para trabalhar.'],
      color: palette[index % palette.length],
      stationIndex: index % workstations.length,
      x: position.x + 54,
      y: position.y + 76
    };
  }

  function renderAll() {
    renderZoom();
    renderWorkstations();
    renderAgents();
    renderPanel();
    officeStatus.textContent = `${state.agents.length} agente${state.agents.length === 1 ? '' : 's'} online`;
    saveState();
  }

  function renderZoom() {
    roomScale.style.transform = `scale(${zoom.toFixed(2)})`;
  }

  function renderWorkstations() {
    workstationsLayer.innerHTML = '';
    workstations.forEach((station, index) => {
      const element = document.createElement('div');
      element.className = 'workstation';
      element.style.left = `${station.x}px`;
      element.style.top = `${station.y}px`;
      element.innerHTML = '<div class="monitor"></div><div class="desk"></div><div class="chair"></div>';
      element.setAttribute('aria-hidden', index >= state.agents.length ? 'true' : 'false');
      workstationsLayer.appendChild(element);
    });
  }

  function renderAgents() {
    agentsLayer.innerHTML = '';
    state.agents.forEach((agent) => {
      const element = document.createElement('button');
      element.type = 'button';
      element.className = `agent ${agent.id === selectedAgentId ? 'active' : ''} ${agent.status === 'Executando' ? 'running' : ''}`;
      element.style.left = `${agent.x}px`;
      element.style.top = `${agent.y}px`;
      element.style.setProperty('--agent-color', agent.color);
      element.setAttribute('aria-label', `${agent.name}, ${agent.status}, ${agent.progress}%`);
      element.title = `${agent.name}\n${agent.role}\n${agent.status} - ${agent.progress}%`;

      if (agent.status === 'Executando' || agent.status === 'Pensando' || agent.status === 'Revisando') {
        const bubble = document.createElement('span');
        bubble.className = 'agent-bubble';
        bubble.textContent = agent.status === 'Executando' ? '...' : agent.status;
        element.appendChild(bubble);
      }

      element.addEventListener('click', () => {
        selectedAgentId = agent.id;
        renderAll();
      });

      agentsLayer.appendChild(element);
    });
  }

  function renderPanel() {
    const agent = getSelectedAgent();
    if (!agent) {
      agentPanel.innerHTML = '<div class="empty-panel"><span class="panel-icon">▣</span><h2>Selecione um agente</h2><p>Clique em um personagem no escritorio.</p></div>';
      return;
    }

    const statusColor = statusColors[agent.status] || statusColors.Ocioso;
    agentPanel.innerHTML = `
      <div class="detail-panel">
        <div class="detail-header">
          <div>
            <h2>${escapeHtml(agent.name)}</h2>
            <p>${escapeHtml(agent.role)}</p>
          </div>
          <span class="status-pill" style="--status-color: ${statusColor}">${escapeHtml(agent.status)}</span>
        </div>

        <div class="meta-list">
          <p><span>Prompt</span>${escapeHtml(agent.prompt)}</p>
          <p><span>Tarefa atual</span>${escapeHtml(agent.task)}</p>
          <p><span>Progresso</span>${agent.progress}%</p>
        </div>

        <div class="progress-shell" aria-label="Progresso da tarefa">
          <div class="progress-fill" style="width: ${agent.progress}%"></div>
        </div>

        <button class="pixel-button primary" id="runTaskButton" type="button">
          Executar tarefa
        </button>

        <div class="log-box">
          ${agent.logs.map((log) => `<div>${escapeHtml(log)}</div>`).join('')}
        </div>
      </div>
    `;

    document.getElementById('runTaskButton').addEventListener('click', () => runTask(agent.id));
  }

  function openAgentModal() {
    form.reset();
    modal.classList.remove('hidden');
    document.getElementById('agentName').focus();
  }

  function closeAgentModal() {
    modal.classList.add('hidden');
    addAgentButton.focus();
  }

  function handleAgentSubmit(event) {
    event.preventDefault();

    const formData = new FormData(form);
    const index = state.agents.length;
    const agent = createAgent({
      name: formData.get('agentName'),
      role: formData.get('agentRole'),
      prompt: formData.get('agentPrompt'),
      task: formData.get('agentTask'),
      status: 'Ocioso',
      progress: 0,
      logs: ['Agente criado no escritorio.']
    }, index);

    state.agents.push(agent);
    selectedAgentId = agent.id;
    closeAgentModal();
    showToast(`${agent.name} entrou no escritorio.`);
    renderAll();
  }

  async function runTask(agentId) {
    if (runningAgentId) {
      showToast('Ja existe uma tarefa em execucao.');
      return;
    }

    const agent = state.agents.find((item) => item.id === agentId);
    if (!agent) return;

    runningAgentId = agent.id;
    agent.status = 'Pensando';
    agent.progress = 0;
    agent.logs = ['Analisando solicitacao...'];
    renderAll();
    await wait(500);

    const steps = [
      ['Planejando execucao...', 'Pensando', 18],
      ['Consultando contexto...', 'Executando', 36],
      ['Produzindo resultado...', 'Executando', 62],
      ['Revisando resposta...', 'Revisando', 84],
      ['Tarefa concluida.', 'Finalizado', 100]
    ];

    for (const [message, status, target] of steps) {
      await animateProgress(agent, status, message, target);
    }

    runningAgentId = null;
    showToast(`${agent.name} finalizou a tarefa.`);
    renderAll();
  }

  async function animateProgress(agent, status, message, target) {
    agent.status = status;
    agent.logs.push(message);

    while (agent.progress < target) {
      agent.progress = Math.min(target, agent.progress + 2);
      renderAll();
      await wait(70);
    }
  }

  function getSelectedAgent() {
    return state.agents.find((agent) => agent.id === selectedAgentId) || state.agents[0];
  }

  function setZoom(nextZoom) {
    zoom = Math.max(0.65, Math.min(1.45, nextZoom));
    state.zoom = zoom;
    renderAll();
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.classList.add('hidden');
    }, 2600);
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
}());
