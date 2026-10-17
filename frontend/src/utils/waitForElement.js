
// utils/waitForElement.js

/**
 * Waits for a DOM element to exist and (optionally) be visible, then resolves with it.
 * Includes timeout, optional root container, and layout settle via requestAnimationFrame.
 *
 * @param {string} selector
 * @param {object} [options]
 * @param {number} [options.timeout=15000]
 * @param {boolean} [options.mustBeVisible=true]
 * @param {ParentNode} [options.root=document.body]
 * @returns {Promise<HTMLElement>}
 */
export default function waitForElement(selector, options = {}) {
  if (typeof selector !== 'string' || !selector.trim()) {
    return Promise.reject(new Error('waitForElement: "selector" must be a non-empty string.'));
  }

  // Guard for SSR / non-browser environments
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('waitForElement requires a browser environment.'));
  }

  const {
    timeout = 15000,
    mustBeVisible = true,
    root = document.body,
  } = options;

  const isVisible = (el) => {
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();

    const hasSize = rect.width > 0 && rect.height > 0;
    const notHidden = style.visibility !== 'hidden' && style.display !== 'none';

    // offsetParent === null catches many hidden-by-ancestor cases; allow position:fixed
    const shownByLayout = el.offsetParent !== null || style.position === 'fixed';

    return hasSize && notHidden && shownByLayout;
  };

  const find = () => {
    const node = (root instanceof Document ? root : document).querySelector(selector);
    return node instanceof HTMLElement ? node : null;
  };

  return new Promise((resolve, reject) => {
    let done = false;
    let rafId = null;
    let timerId = null;
    let observer = null;

    const cleanup = () => {
      if (observer) observer.disconnect();
      if (timerId !== null) clearTimeout(timerId);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };

    const finish = (el) => {
      if (done) return;
      done = true;
      cleanup();
      resolve(el);
    };

    // Fast path: already present (and visible if required)
    const existing = find();
    if (existing && (!mustBeVisible || isVisible(existing))) {
      rafId = requestAnimationFrame(() => finish(existing));
      return;
    }

    // Observe for the element to appear (or become visible)
    observer = new MutationObserver(() => {
      const el = find();
      if (el && (!mustBeVisible || isVisible(el))) {
        rafId = requestAnimationFrame(() => finish(el));
      }
    });

    const observeTarget = root instanceof Node ? root : document.body;
    observer.observe(observeTarget, {
      childList: true,
      subtree: true,
      attributes: mustBeVisible, // watch class/style changes when visibility matters
    });

    // Safety timeout
    timerId = window.setTimeout(() => {
      if (done) return;
      done = true;
      cleanup();
      reject(new Error(`Timed out waiting for "${selector}" after ${timeout}ms.`));
    }, timeout);
  });
}
