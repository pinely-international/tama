import Bun from 'bun';
import { renderToString } from 'react-dom/server';

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

const server = Bun.serve({
  port: 3000,
  async fetch(request) {
    const html = renderToString(<App time={new Date().toISOString()} items={Array.from({ length: 200 }).map((_, i) => `data-${i}`)} />);

    const body = `<!doctype html><html><head></head><body>${html}</body></html>`;
    return new Response(body, { headers: { 'content-type': 'text/html; charset=utf-8' } });
  }
});

console.log('React SSR listening on http://127.0.0.1:3000');
