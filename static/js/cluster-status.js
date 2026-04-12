(function () {
  var grid    = document.getElementById('cs-grid');
  var updated = document.getElementById('cs-updated');
  if (!grid) return;

  function syncClass(s) {
    if (s === 'Synced')    return 'cs-synced';
    if (s === 'OutOfSync') return 'cs-outofsync';
    return 'cs-unknown';
  }

  function healthClass(h) {
    if (h === 'Healthy')     return 'cs-healthy';
    if (h === 'Degraded')    return 'cs-degraded';
    if (h === 'Progressing') return 'cs-progressing';
    return 'cs-unknown';
  }

  function syncIcon(s) {
    if (s === 'Synced')    return '● Synced';
    if (s === 'OutOfSync') return '◐ OutOfSync';
    return '○ ' + s;
  }

  function healthIcon(h) {
    if (h === 'Healthy')     return '✓ Healthy';
    if (h === 'Degraded')    return '✗ Degraded';
    if (h === 'Progressing') return '⟳ Progressing';
    return '○ ' + h;
  }

  function timeAgo(ts) {
    if (!ts) return '';
    var s = Math.floor(Date.now() / 1000 - ts);
    if (s < 60)  return 'refreshed ' + s + 's ago';
    if (s < 3600) return 'refreshed ' + Math.floor(s / 60) + 'm ago';
    return 'refreshed ' + Math.floor(s / 3600) + 'h ago';
  }

  function render(data) {
    if (data.error) {
      grid.innerHTML = '<div class="cs-loading">error: ' + data.error + '</div>';
      return;
    }
    if (!data.apps || !data.apps.length) {
      grid.innerHTML = '<div class="cs-loading">no applications found</div>';
      return;
    }
    grid.innerHTML = data.apps.map(function (app) {
      return '<div class="cs-row">' +
        '<span class="cs-name">' + app.name + '</span>' +
        '<span class="cs-sync '  + syncClass(app.sync)     + '">' + syncIcon(app.sync)     + '</span>' +
        '<span class="cs-health ' + healthClass(app.health) + '">' + healthIcon(app.health) + '</span>' +
        '</div>';
    }).join('');
    if (updated) updated.textContent = timeAgo(data.updated);
  }

  function poll() {
    fetch('/api/status')
      .then(function (r) { return r.json(); })
      .then(render)
      .catch(function () {
        grid.innerHTML = '<div class="cs-loading">cluster unreachable</div>';
      });
  }

  poll();
  setInterval(poll, 30000);
  setInterval(function () {
    if (updated && updated.textContent.startsWith('refreshed')) {
      poll();
    }
  }, 1000);
})();
