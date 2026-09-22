import { chromium } from 'playwright';

const url = process.argv[2] || 'http://127.0.0.1:4321';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const client = await page.context().newCDPSession(page);
await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
await page.addInitScript(() => {
  window.__artMetrics = { longTasks: [], rafDeltas: [] };
  try {
    const obs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__artMetrics.longTasks.push({ start: entry.startTime, duration: entry.duration, name: entry.name });
      }
    });
    obs.observe({ type: 'longtask', buffered: true });
  } catch {}
  let last = 0;
  const until = 2500;
  function tick(ts) {
    if (!window.__artMetrics.start) window.__artMetrics.start = ts;
    if (last) window.__artMetrics.rafDeltas.push(ts - last);
    last = ts;
    if (ts - window.__artMetrics.start < until) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
});
const start = Date.now();
await page.goto(url, { waitUntil: 'load' });
await page.waitForTimeout(2600);
const result = await page.evaluate(() => {
  const deltas = window.__artMetrics.rafDeltas;
  const sorted = [...deltas].sort((a,b) => a-b);
  const p95 = sorted.length ? sorted[Math.floor(sorted.length * 0.95)] : 0;
  const max = sorted.length ? sorted[sorted.length - 1] : 0;
  const longTasks = window.__artMetrics.longTasks;
  const maxLongTask = longTasks.reduce((m, e) => Math.max(m, e.duration), 0);
  const hero = document.querySelector('svg[viewBox="0 0 560 440"]');
  return {
    all: document.querySelectorAll('*').length,
    svgs: document.querySelectorAll('svg, svg *').length,
    heroCount: hero ? hero.querySelectorAll('*').length + 1 : 0,
    rafSamples: deltas.length,
    rafP95: Number(p95.toFixed(2)),
    rafMax: Number(max.toFixed(2)),
    longTaskCount: longTasks.length,
    maxLongTask: Number(maxLongTask.toFixed(2))
  };
});
console.log(JSON.stringify({ elapsedMs: Date.now() - start, ...result }, null, 2));
await browser.close();
