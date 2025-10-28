import { Life } from "@/Life";

const elementLifecycleMap = new WeakMap<Element, Life>();

/**
 * Registers a DOM element to have its lifecycle managed by a Life instance.
 * @param element The DOM element to track.
 * @param life The Life instance that controls it.
 */
export function trackElementLifecycle(element: Element, life: Life): void {
  elementLifecycleMap.set(element, life);
}

function processNode(node: Node, action: "enter" | "exit") {
  if (!(node instanceof Element)) return;

  const life = elementLifecycleMap.get(node);
  if (life) {
    life[action]();
  }

  const descendants = node.querySelectorAll("*");
  for (const element of descendants) {
    const descendantLife = elementLifecycleMap.get(element);
    if (descendantLife) {
      descendantLife[action]();
    }
  }
}

const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    for (const addedNode of mutation.addedNodes) {
      processNode(addedNode, "enter");
    }
    for (const removedNode of mutation.removedNodes) {
      processNode(removedNode, "exit");
    }
  }
});

/**
 * Starts observing the DOM for element connections and disconnections.
 * This should be called once when your application initializes.
 */
export function startDOMObserver(): void {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
