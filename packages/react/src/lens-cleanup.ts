/**
 * @module lens-cleanup
 *
 * Safe teardown logic for liquidGL lens instances and the shared renderer.
 *
 * The core liquidGL library does not expose a `destroy()` method on lenses.
 * This module implements proper cleanup by directly managing the internal
 * state — removing DOM elements, disconnecting observers, unbinding handlers,
 * restoring original styles, and (when the last lens unmounts) tearing down
 * the entire WebGL renderer.
 *
 * @internal — Not part of the public API.
 */

import type { LiquidGlassLensInternal } from './types';

/**
 * Safely destroy a single lens instance.
 *
 * This reverses everything that `liquidGLLens` constructor does:
 * 1. Disconnects the per-lens ResizeObserver
 * 2. Removes the shadow `<div>` from the document
 * 3. Destroys the mirror canvas (used by the tilt effect)
 * 4. Unbinds tilt event handlers from document-level listeners
 * 5. Restores all inline styles that the lens modified on the target element
 * 6. Removes the lens from the shared renderer's tracking array
 */
export function destroyLens(lens: LiquidGlassLensInternal): void {
  if (!lens || !lens.el) return;

  const { el, renderer } = lens;

  /* ------------------------------------------------------------------
   *  1. Disconnect per-lens ResizeObserver
   * ---------------------------------------------------------------- */
  if (lens._sizeObs) {
    lens._sizeObs.disconnect();
    lens._sizeObs = null;
  }

  /* ------------------------------------------------------------------
   *  2. Remove shadow element from the document
   * ---------------------------------------------------------------- */
  if (lens._shadowEl) {
    // Remove the window resize listener that keeps the shadow in sync
    if (lens._shadowSyncFn) {
      window.removeEventListener('resize', lens._shadowSyncFn);
      lens._shadowSyncFn = null;
    }
    lens._shadowEl.remove();
    lens._shadowEl = null;
  }

  /* ------------------------------------------------------------------
   *  3. Clear any pending smooth-reset timeout
   *     The tilt system uses a 350ms timeout to destroy the mirror canvas
   *     after the reset animation. If we unmount during that window,
   *     the timer would fire on a destroyed lens → null-pointer crash.
   * ---------------------------------------------------------------- */
  if (lens._resetCleanupTimer) {
    clearTimeout(lens._resetCleanupTimer);
    lens._resetCleanupTimer = null;
  }

  /* ------------------------------------------------------------------
   *  4. Tear down the mirror canvas (used during 3D tilt)
   * ---------------------------------------------------------------- */
  if (typeof lens._destroyMirrorCanvas === 'function') {
    lens._destroyMirrorCanvas();
  }

  /* ------------------------------------------------------------------
   *  5. Unbind tilt event handlers
   *     The core's _unbindTiltHandlers removes document-level pointermove
   *     and restores the element's transform/transformStyle.
   * ---------------------------------------------------------------- */
  if (lens._tiltHandlersBound && typeof lens._unbindTiltHandlers === 'function') {
    lens._unbindTiltHandlers();
  }

  /* ------------------------------------------------------------------
   *  6. Restore the target element's original inline styles
   * ---------------------------------------------------------------- */
  el.style.opacity = lens.originalOpacity ?? '';
  el.style.transition = lens.originalTransition ?? '';
  el.style.boxShadow = lens.originalShadow ?? '';
  el.style.backdropFilter = '';
  (el.style as unknown as Record<string, unknown>).webkitBackdropFilter = '';
  el.style.backgroundImage = '';
  el.style.background = '';
  el.style.pointerEvents = '';

  // Restore the original background color if it was made transparent
  if (lens._bgColorComponents) {
    const { r, g, b, a } = lens._bgColorComponents;
    el.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  /* ------------------------------------------------------------------
   *  7. Remove lens from the renderer's tracking array
   * ---------------------------------------------------------------- */
  if (renderer && Array.isArray(renderer.lenses)) {
    renderer.lenses = renderer.lenses.filter((l) => l !== lens);
  }
}

/**
 * Destroy the shared WebGL renderer if no lenses remain.
 *
 * Called after `destroyLens()` — checks whether any lenses are still active.
 * If the renderer is empty, it:
 * - Cancels the animation frame loop
 * - Terminates the inline web worker (used for dynamic compositing)
 * - Removes the injected `<style>` element
 * - Removes the shared `<canvas>` from the DOM
 * - Releases WebGL resources (texture, program, context)
 * - Cleans up global references (`window.__liquidGLRenderer__`, etc.)
 */
export function destroyRendererIfEmpty(): void {
  const renderer = window.__liquidGLRenderer__;
  if (!renderer) return;

  // Don't destroy if lenses still exist
  if (renderer.lenses && renderer.lenses.length > 0) return;

  /* ------------------------------------------------------------------
   *  Cancel the rAF render loop
   * ---------------------------------------------------------------- */
  if (renderer._rafId) {
    cancelAnimationFrame(renderer._rafId);
    renderer._rafId = null;
  }

  /* ------------------------------------------------------------------
   *  Terminate the inline web worker
   * ---------------------------------------------------------------- */
  if (renderer._dynWorker) {
    renderer._dynWorker.terminate();
    renderer._dynWorker = null;
  }

  /* ------------------------------------------------------------------
   *  Remove the injected <style> element for dynamic hover styles
   * ---------------------------------------------------------------- */
  const styleEl = document.getElementById('liquid-gl-dynamic-styles');
  if (styleEl) {
    styleEl.remove();
  }

  /* ------------------------------------------------------------------
   *  Remove the shared <canvas> from the DOM
   * ---------------------------------------------------------------- */
  if (renderer.canvas && renderer.canvas.parentNode) {
    renderer.canvas.remove();
  }

  /* ------------------------------------------------------------------
   *  Release WebGL resources
   * ---------------------------------------------------------------- */
  if (renderer.gl) {
    if (renderer.texture) {
      renderer.gl.deleteTexture(renderer.texture);
      renderer.texture = null;
    }
    if (renderer.program) {
      renderer.gl.deleteProgram(renderer.program);
      renderer.program = null;
    }

    // Force-lose the WebGL context to free GPU memory
    const loseCtx = renderer.gl.getExtension('WEBGL_lose_context');
    if (loseCtx) {
      loseCtx.loseContext();
    }
  }

  /* ------------------------------------------------------------------
   *  Clean up global references
   * ---------------------------------------------------------------- */
  delete window.__liquidGLRenderer__;
  delete window.__liquidGLNoWebGL__;
}
