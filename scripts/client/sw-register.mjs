// Service-worker registration plus the user-initiated update prompt.

export const swRegisterJs = `if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    var prompt = document.getElementById('sw-update');
    var apply = document.getElementById('sw-update-apply');
    var dismiss = document.getElementById('sw-update-dismiss');
    var waitingWorker = null;
    var shouldRefresh = false;
    var refreshing = false;
    function showUpdate(worker) {
      waitingWorker = worker;
      if (prompt) prompt.hidden = false;
    }
    function hideUpdate() {
      if (prompt) prompt.hidden = true;
    }
    if (dismiss) dismiss.addEventListener('click', hideUpdate);
    if (apply) {
      apply.addEventListener('click', function () {
        if (!waitingWorker) return;
        shouldRefresh = true;
        hideUpdate();
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      });
    }
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      waitingWorker = null;
      hideUpdate();
      if (!shouldRefresh || refreshing) return;
      refreshing = true;
      window.location.reload();
    });
    navigator.serviceWorker.register('/sw.js').then(function (registration) {
      function watch(worker) {
        if (!worker) return;
        worker.addEventListener('statechange', function () {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdate(worker);
        });
      }
      if (registration.waiting) showUpdate(registration.waiting);
      if (registration.installing) watch(registration.installing);
      registration.addEventListener('updatefound', function () {
        watch(registration.installing);
      });
    }).catch(function () {});
  });
}
`
