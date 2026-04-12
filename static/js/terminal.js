(function () {
  'use strict';

  // ── State ────────────────────────────────────────────────────────────────
  let history = [];
  let historyIndex = -1;
  let overlay, body, output, input;

  // ── Commands ─────────────────────────────────────────────────────────────
  const COMMANDS = {

    help: () => table([
      ['Command', 'Description'],
      ['whoami',           'Who is running this cluster'],
      ['uname -a',         'Kernel and cluster info'],
      ['kubectl get nodes','Cluster node status'],
      ['kubectl get ns',   'All namespaces'],
      ['kubectl get pods', 'Running workloads'],
      ['kubectl get certs','Certification stack'],
      ['argocd app list',  'GitOps application status'],
      ['cat roadmap.txt',  'Learning arc 2025–2026'],
      ['cat contact.txt',  'Get in touch'],
      ['ls',               'List available files'],
      ['clear',            'Clear terminal'],
      ['exit',             'Close terminal'],
    ]),

    whoami: () => lines([
      '<span class="t-green">Azzeddine Lachgar</span>',
      'DevOps Engineer · Casablanca, Morocco',
      '',
      'Currently: Omnishore (Medtech) — infrastructure automation, K8s ops',
      'Certs: KCNA · KCSA · CKA · CKAD · CKS · ICA (in progress)',
      'Homelab: RKE2 on bare metal, GitOps-driven, production-grade',
      '',
      '<span class="t-dim">Built and broke everything you see here.</span>',
    ]),

    'uname -a': () => lines([
      'Linux homelab-rke2 6.6.x #1 SMP x86_64 GNU/Linux',
      'Kubernetes v1.34 · RKE2 · Canal CNI',
      'Hypervisor: Proxmox VE · Hardware: Dell OptiPlex 7020 MFF',
      'Uptime: ask Uptime Kuma',
    ]),

    'kubectl get nodes': () => table([
      ['NAME',      'STATUS', 'ROLES',         'VERSION'],
      ['server-1',  '<span class="t-green">Ready</span>',  'control-plane',  'v1.34.x'],
      ['agent-1',   '<span class="t-green">Ready</span>',  'worker',         'v1.34.x'],
      ['agent-2',   '<span class="t-green">Ready</span>',  'worker',         'v1.34.x'],
    ]),

    'kubectl get ns': () => table([
      ['NAMESPACE',        'STATUS'],
      ['argocd',           '<span class="t-green">Active</span>'],
      ['cert-manager',     '<span class="t-green">Active</span>'],
      ['cloudflared',      '<span class="t-green">Active</span>'],
      ['datadog',          '<span class="t-green">Active</span>'],
      ['istio-system',     '<span class="t-green">Active</span>'],
      ['longhorn-system',  '<span class="t-green">Active</span>'],
      ['metallb-system',   '<span class="t-green">Active</span>'],
      ['portfolio',        '<span class="t-green">Active</span>'],
      ['vault',            '<span class="t-green">Active</span>'],
    ]),

    'kubectl get pods': () => table([
      ['NAMESPACE',       'NAME',                    'STATUS',                            'RESTARTS'],
      ['portfolio',       'portfolio-xxxxxx',        '<span class="t-green">Running</span>',  '0'],
      ['argocd',          'argocd-server-xxxxxx',    '<span class="t-green">Running</span>',  '0'],
      ['vault',           'vault-0',                 '<span class="t-green">Running</span>',  '0'],
      ['istio-system',    'istiod-xxxxxx',           '<span class="t-green">Running</span>',  '0'],
      ['longhorn-system', 'longhorn-manager-xxxxxx', '<span class="t-green">Running</span>',  '0'],
      ['cloudflared',     'cloudflared-xxxxxx',      '<span class="t-green">Running</span>',  '0'],
      ['datadog',         'datadog-agent-xxxxxx',    '<span class="t-green">Running</span>',  '0'],
    ]),

    'kubectl get certs': () => table([
      ['CERTIFICATION',  'ISSUER',  'LEVEL',    'STATUS'],
      ['KCNA',  'CNCF', 'Associate',  '<span class="t-green">✓ Earned</span>'],
      ['KCSA',  'CNCF', 'Associate',  '<span class="t-green">✓ Earned</span>'],
      ['CKA',   'CNCF', 'Professional', '<span class="t-green">✓ Earned</span>'],
      ['CKAD',  'CNCF', 'Professional', '<span class="t-green">✓ Earned</span>'],
      ['CKS',   'CNCF', 'Professional', '<span class="t-green">✓ Earned</span>'],
      ['ICA',   'Linux Foundation', 'Professional', '<span class="t-yellow">⟳ In progress</span>'],
    ]),

    'argocd app list': () => table([
      ['APPLICATION',  'SYNC',                               'HEALTH',                             'REPO'],
      ['argocd',       '<span class="t-green">Synced</span>',  '<span class="t-green">Healthy</span>', 'homelab-gitops'],
      ['cert-manager', '<span class="t-green">Synced</span>',  '<span class="t-green">Healthy</span>', 'homelab-gitops'],
      ['cloudflared',  '<span class="t-green">Synced</span>',  '<span class="t-green">Healthy</span>', 'homelab-gitops'],
      ['istio',        '<span class="t-green">Synced</span>',  '<span class="t-green">Healthy</span>', 'homelab-gitops'],
      ['longhorn',     '<span class="t-green">Synced</span>',  '<span class="t-green">Healthy</span>', 'homelab-gitops'],
      ['metallb',      '<span class="t-green">Synced</span>',  '<span class="t-green">Healthy</span>', 'homelab-gitops'],
      ['portfolio',    '<span class="t-green">Synced</span>',  '<span class="t-green">Healthy</span>', 'homelab-gitops'],
      ['vault',        '<span class="t-green">Synced</span>',  '<span class="t-green">Healthy</span>', 'homelab-gitops'],
    ]),

    'cat roadmap.txt': () => lines([
      '<span class="t-yellow">Learning arc 2025–2026</span>',
      '',
      '  Phase 1  eBPF              kernel-level observability & networking',
      '  Phase 2  SPIFFE/SPIRE      workload identity at the infrastructure layer',
      '  Phase 3  Tetragon          runtime security enforcement via eBPF',
      '  Phase 4  Sigstore          supply chain integrity & artifact signing',
      '  Phase 5  OPA/Gatekeeper    policy as code, admission control',
      '  Phase 6  Crossplane        infrastructure as Kubernetes resources',
      '  Phase 7  Cluster API       Kubernetes-native cluster lifecycle',
      '  Phase 8  WASM runtimes     next-generation workload isolation',
      '',
      '<span class="t-dim">Full breakdown at /roadmap/</span>',
    ]),

    'cat contact.txt': () => lines([
      '<span class="t-green">azzlachgar99@gmail.com</span>',
      'github.com/lachgar-Azzeddine',
      'linkedin.com/in/lachgar-azzeddine',
      'azzhomelab.tech',
    ]),

    ls: () => lines([
      '<span class="t-cyan">about.txt</span>     <span class="t-cyan">contact.txt</span>     <span class="t-cyan">roadmap.txt</span>',
      '<span class="t-blue">homelab/</span>      <span class="t-blue">posts/</span>          <span class="t-blue">certs/</span>',
    ]),

    pwd: () => lines(['/home/azzeddine']),

    date: () => lines([new Date().toString()]),

    clear: () => { output.innerHTML = ''; return null; },

    exit: () => { closeTerminal(); return null; },
    q:    () => { closeTerminal(); return null; },

    // ── Easter eggs ──────────────────────────────────────────────────────
    'sudo rm -rf /': () => lines([
      '<span class="t-red">Permission denied.</span>',
      '<span class="t-dim">Nice try. The cluster is fine.</span>',
    ]),

    'sudo rm -rf /*': () => lines([
      '<span class="t-red">Permission denied.</span>',
      '<span class="t-dim">Nice try. The cluster is fine.</span>',
    ]),

    hack: () => typewriter([
      'Initializing exploit framework...',
      'Scanning open ports........... none found.',
      'Trying Cloudflare Tunnel bypass... blocked.',
      'Attempting Tailscale intercept.. not on the mesh.',
      '<span class="t-red">All vectors exhausted.</span>',
      '<span class="t-dim">The architecture held. That was the point.</span>',
    ]),

    'cat /etc/passwd': () => lines([
      '<span class="t-red">Access denied.</span>',
      '<span class="t-dim">CKS certified. Did you expect otherwise?</span>',
    ]),

    vim: () => lines([
      '<span class="t-dim">You are in vim. Good luck getting out.</span>',
      '<span class="t-dim">(hint: :q! — but seriously, use the exit command)</span>',
    ]),

    'kubectl delete ns production': () => lines([
      '<span class="t-red">Error: namespace "production" not found.</span>',
      '<span class="t-dim">No production here. Just a homelab. Breathe.</span>',
    ]),
  };

  // ── Render helpers ───────────────────────────────────────────────────────
  function lines(arr) {
    return arr.join('<br>');
  }

  function table(rows) {
    if (!rows.length) return '';
    const widths = rows[0].map((_, ci) =>
      Math.max(...rows.map(r => stripTags(r[ci] || '').length))
    );
    return rows.map((row, ri) => {
      const cells = row.map((cell, ci) => {
        const pad = widths[ci] - stripTags(cell).length;
        return cell + ' '.repeat(pad + 2);
      }).join('');
      return ri === 0
        ? '<span class="t-dim">' + cells + '</span>'
        : cells;
    }).join('<br>');
  }

  function typewriter(arr) {
    return new Promise(resolve => {
      let i = 0;
      const el = document.createElement('div');
      output.appendChild(el);
      const tick = () => {
        if (i >= arr.length) { resolve(null); return; }
        el.innerHTML += (i > 0 ? '<br>' : '') + arr[i++];
        scrollBottom();
        setTimeout(tick, 300);
      };
      tick();
    });
  }

  function stripTags(s) {
    return s.replace(/<[^>]*>/g, '');
  }

  function scrollBottom() {
    body.scrollTop = body.scrollHeight;
  }

  // ── Core ─────────────────────────────────────────────────────────────────
  function buildDOM() {
    overlay = document.createElement('div');
    overlay.id = 'terminal-overlay';
    overlay.innerHTML = `
      <div class="t-window" id="t-window">
        <div class="t-header">
          <span class="t-dot t-dot-red"   onclick="window.__terminal.close()"></span>
          <span class="t-dot t-dot-yellow"></span>
          <span class="t-dot t-dot-green"></span>
          <span class="t-title">azzeddine@homelab:~</span>
        </div>
        <div class="t-body" id="t-body">
          <div id="t-output"></div>
          <div class="t-input-row">
            <span class="t-prompt">azzeddine@homelab:~$&nbsp;</span>
            <input id="t-input" type="text" autocomplete="off" spellcheck="false" />
          </div>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    body   = overlay.querySelector('#t-body');
    output = overlay.querySelector('#t-output');
    input  = overlay.querySelector('#t-input');

    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeTerminal();
    });

    input.addEventListener('keydown', onKey);
  }

  function printWelcome() {
    appendOutput(lines([
      '<span class="t-green">azzhomelab.tech</span> — Azzeddine Lachgar',
      '<span class="t-dim">Type <span class="t-white">help</span> to see available commands · ESC to close</span>',
      '',
    ]));
  }

  function appendOutput(html) {
    if (html === null) return;
    if (html instanceof Promise) {
      html.then(r => { if (r !== null) scrollBottom(); });
      return;
    }
    const el = document.createElement('div');
    el.innerHTML = html;
    output.appendChild(el);
    scrollBottom();
  }

  function appendCommand(cmd) {
    const el = document.createElement('div');
    el.innerHTML = '<span class="t-prompt">azzeddine@homelab:~$</span> ' + escHtml(cmd);
    output.appendChild(el);
  }

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function run(cmd) {
    cmd = cmd.trim();
    if (!cmd) return;

    if (history[history.length - 1] !== cmd) history.push(cmd);
    historyIndex = history.length;

    appendCommand(cmd);

    const fn = COMMANDS[cmd];
    if (fn) {
      appendOutput(fn());
    } else if (cmd.startsWith('sudo ') && !COMMANDS[cmd]) {
      appendOutput(lines(['<span class="t-red">Permission denied.</span>']));
    } else if (cmd.startsWith('kubectl ') && !COMMANDS[cmd]) {
      appendOutput(lines(['<span class="t-red">error:</span> unknown command. Try <span class="t-white">kubectl get nodes</span>, <span class="t-white">kubectl get pods</span>, or <span class="t-white">kubectl get certs</span>']));
    } else {
      appendOutput(lines([
        '<span class="t-red">command not found:</span> ' + escHtml(cmd),
        '<span class="t-dim">Type <span class="t-white">help</span> for available commands.</span>',
      ]));
    }

    appendOutput('');
  }

  function onKey(e) {
    if (e.key === 'Enter') {
      run(input.value);
      input.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) input.value = history[--historyIndex];
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        input.value = history[++historyIndex];
      } else {
        historyIndex = history.length;
        input.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const partial = input.value.trim();
      const matches = Object.keys(COMMANDS).filter(c => c.startsWith(partial));
      if (matches.length === 1) input.value = matches[0];
    }
  }

  function openTerminal() {
    if (!overlay) { buildDOM(); printWelcome(); }
    overlay.classList.add('t-visible');
    setTimeout(() => input.focus(), 50);
  }

  function closeTerminal() {
    if (overlay) overlay.classList.remove('t-visible');
  }

  // ── Global keyboard trigger ──────────────────────────────────────────────
  document.addEventListener('keydown', e => {
    const tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement.isContentEditable) return;
    if (e.key === '/' || (e.key === '`' && !e.ctrlKey)) {
      e.preventDefault();
      openTerminal();
    }
    if (e.key === 'Escape') closeTerminal();
  });

  // ── Expose for inline onclick ────────────────────────────────────────────
  window.__terminal = { open: openTerminal, close: closeTerminal };

})();
