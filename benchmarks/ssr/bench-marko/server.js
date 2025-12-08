import Bun from 'bun';

import template from './template.marko.js';


Bun.serve({
  port: 3000,
  async fetch() {
    const items = Array.from({ length: 200 }).map((_, i) => `data-${i}`);
    const html = await template.renderToString({ time: new Date().toISOString(), items });
    const body = `<!doctype html><html><head></head><body>${html}</body></html>`;
    return new Response(body, { headers: { 'content-type': 'text/html; charset=utf-8' } });
  }
})

console.log('Marko SSR listening on http://127.0.0.1:3000');
