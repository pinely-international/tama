import { serve } from 'bun';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';

function App(props) {
  // use render function style to avoid single-file component build step
  return h('div', { id: 'app' }, [
    h('p', `Server time: ${props.time}`),
    h('ul', props.items.map((it) => h('li', it)))
  ]);
}
const app = createSSRApp({ render: () => h(App, { time: new Date().toISOString(), items: Array.from({ length: 200 }).map((_, i) => `data-${i}`) }) });

serve({
  port: 3000,
  async fetch() {
    const html = await renderToString(app);
    const body = `<!doctype html><html><head></head><body>${html}</body></html>`;
    return new Response(body, { headers: { 'content-type': 'text/html; charset=utf-8' } });
  }
});

console.log('Vue SSR listening on http://127.0.0.1:3001');
