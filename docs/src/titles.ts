export async function getH1Titles(files: Record<string, () => Promise<string>>) {
  const decoder = new TextDecoder();
  const results = [];

  // small helper to read until we find a "# " heading1 then abort
  async function readFirstH1(url) {
    const controller = new AbortController();
    const res = await fetch(url, { signal: controller.signal });

    // If streaming not available, fallback to full text fetch
    if (!res.body) {
      const text = await res.text();
      const m = text.match(/^\s*#\s+(.+)$/m);
      return m ? m[1].trim() : null;
    }

    const reader = res.body.getReader();
    let buf = '';
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        // Try to find an H1 in the accumulated buffer
        const m = buf.match(/^\s*#\s+(.+)$/m);
        if (m) {
          controller.abort(); // stop downloading the rest
          return m[1].trim();
        }

        // keep buffer from growing indefinitely: keep last 1KB
        if (buf.length > 1024) buf = buf.slice(-1024);
      }
    } catch (e) {
      // fetch was aborted intentionally, ignore
      if (e.name !== 'AbortError') throw e;
    } finally {
      try { reader.releaseLock?.(); } catch { }
    }

    // final attempt if stream ended without match
    const finalMatch = buf.match(/^\s*#\s+(.+)$/m);
    return finalMatch ? finalMatch[1].trim() : null;
  }

  // iterate files (not loading whole file)
  for (const path in files) {
    try {
      const url = await files[path](); // returns the file URL
      const title = await readFirstH1(url);
      results.push({ path, title });
    } catch (e) {
      results.push({ path, title: null, error: e.message });
    }
  }

  return results;
}

