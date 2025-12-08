import "../dom"

import Bun from 'bun';
import WebJSXSerializer from '../../../src/jsx/JSXSerializer';

function App({ time, items }) {
  return (
    <div id="app">
      <p>Server time: {time}</p>
      <ul>
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  )
}

const jsxSerializer = new WebJSXSerializer
const server = Bun.serve({
  port: 3000,
  async fetch() {
    const app = <App time={new Date().toISOString()} items={Array.from({ length: 200 }).map((_, i) => `data-${i}`)} />
    const html = jsxSerializer.toString(app);

    const body = `<!doctype html><html><head></head><body>${html}</body></html>`;
    return new Response(body, { headers: { 'content-type': 'text/html; charset=utf-8' } });
  }
});

console.log('React SSR listening on http://127.0.0.1:3000');
