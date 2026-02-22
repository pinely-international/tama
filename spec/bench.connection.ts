import "./dom"
import { bench, group, run } from 'mitata';


const observer = createObserver();
// --- Group 1: Shallow Operations (Single <div>) ---
group('Shallow Elements (<div>)', () => {
  // Create two containers: one with observer, one without
  const containerNoObserver = document.createElement('section');
  document.body.appendChild(containerNoObserver);

  const containerWithObserver = document.createElement('section');
  document.body.appendChild(containerWithObserver);


  observer.observe(containerWithObserver, {
    childList: true,
    subtree: true,
  });

  // A. Create & Append
  bench('Create: No Observer', async () => {
    const el = document.createElement('div');
    containerNoObserver.appendChild(el);
    await Promise.resolve(); // Flush microtasks
    el.remove();
  });

  bench('Create: With Observer', async () => {
    const el = document.createElement('div');
    containerWithObserver.appendChild(el);
    await Promise.resolve(); // Trigger observer
    el.remove();
  });

  // B. Edit (Attributes)
  // Setup persistent elements for editing
  const editTargetNoObserver = document.createElement('div');
  containerNoObserver.appendChild(editTargetNoObserver);

  const editTargetWithObserver = document.createElement('div');
  containerWithObserver.appendChild(editTargetWithObserver);

  bench('Edit: No Observer', async () => {
    editTargetNoObserver.setAttribute('data-bench', 'test');
    await Promise.resolve();
  });

  bench('Edit: With Observer', async () => {
    editTargetWithObserver.setAttribute('data-bench', 'test');
    await Promise.resolve();
  });
});

// --- Group 2: Nested Elements (Tree of 3 depth) ---
group('Nested Elements (<div><span><b>...</b></span>)', () => {
  // Create two containers: one with observer, one without
  const containerNoObserver = document.createElement('section');
  document.body.appendChild(containerNoObserver);

  const containerWithObserver = document.createElement('section');
  document.body.appendChild(containerWithObserver);

  observer.observe(containerWithObserver, {
    childList: true,
    subtree: true,
  });


  // A. Create & Append Nested
  bench('Create Nested: No Observer', async () => {
    const el = createNestedTree();
    containerNoObserver.appendChild(el);
    await Promise.resolve();
    el.remove();
  });

  bench('Create Nested: With Observer', async () => {
    const el = createNestedTree();
    containerWithObserver.appendChild(el);
    await Promise.resolve();
    el.remove();
  });

  // B. Edit Nested (Deep Attribute)
  const nestedTargetNoObserver = createNestedTree();
  containerNoObserver.appendChild(nestedTargetNoObserver);
  const deepNodeNoObserver = nestedTargetNoObserver.firstChild!.firstChild! as HTMLElement;

  const nestedTargetWithObserver = createNestedTree();
  containerWithObserver.appendChild(nestedTargetWithObserver);
  const deepNodeWithObserver = nestedTargetWithObserver.firstChild!.firstChild! as HTMLElement;

  bench('Edit Nested: No Observer', async () => {
    deepNodeNoObserver.setAttribute('data-deep', 'true');
    await Promise.resolve();
  });

  bench('Edit Nested: With Observer', async () => {
    deepNodeWithObserver.setAttribute('data-deep', 'true');
    await Promise.resolve();
  });
});

await run()


function createObserver() {
  return new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const _ = mutation.target.isConnected;
    }
  });
}

function createTree() {
  const root = document.createElement('div');
  const child = document.createElement('span');
  const leaf = document.createElement('b');
  leaf.textContent = 'benchmark';
  child.appendChild(leaf);
  root.appendChild(child);

  return root;
}

function createNestedTree(length = 1_000) {
  const root = document.createElement('div')
  let nested = root
  Array.from({ length }).forEach(() => {
    const next = createTree()
    nested.append(next)
    nested = next
  })
  return root
}
