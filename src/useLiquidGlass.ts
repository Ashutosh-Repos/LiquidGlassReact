/**
 * @module useLiquidGlass
 *
 * Core React hook that bridges the imperative liquidGL library with
 * React's declarative model. Handles initialization, reactive option
 * updates, and full cleanup on unmount.
 *
 * @example
 * ```tsx
 * function GlassPanel() {
 *   const ref = useLiquidGlass<HTMLDivElement>({
 *     refraction: 0.05,
 *     frost: 2,
 *     onReady: (lens) => console.log('Glass ready!', lens),
 *   });
 *
 *   return <div ref={ref} className="panel">Content</div>;
 * }
 * ```
 */

import { useContext, useEffect, useRef } from 'react';

import { DEFAULT_CONFIG, DEFAULT_OPTIONS } from './constants';
import { LiquidGlassContext } from './context';
import { destroyLens, destroyRendererIfEmpty } from './lens-cleanup';
import { PRESETS } from './presets';
import type {
  LiquidGlassLensInternal,
  ResolvedGlassOptions,
  UseLiquidGlassOptions,
} from './types';

/* ==========================================================================
 *  Module-level helpers
 * ========================================================================== */

/** Auto-incrementing counter for unique per-instance identifiers. */
let _nextId = 0;

/** Generate a unique ID for a glass component instance. */
function generateId(): string {
  return `lgl-${++_nextId}`;
}

/**
 * Resolve the final set of glass options by layering:
 *   1. Library defaults
 *   2. Preset values (if a preset is selected)
 *   3. Explicit prop values (highest priority)
 */
function resolveOptions(options: UseLiquidGlassOptions): ResolvedGlassOptions {
  const preset = options.preset ? PRESETS[options.preset] : undefined;

  return {
    refraction: options.refraction ?? preset?.refraction ?? DEFAULT_OPTIONS.refraction,
    bevelDepth: options.bevelDepth ?? preset?.bevelDepth ?? DEFAULT_OPTIONS.bevelDepth,
    bevelWidth: options.bevelWidth ?? preset?.bevelWidth ?? DEFAULT_OPTIONS.bevelWidth,
    frost: options.frost ?? preset?.frost ?? DEFAULT_OPTIONS.frost,
    shadow: options.shadow ?? preset?.shadow ?? DEFAULT_OPTIONS.shadow,
    specular: options.specular ?? preset?.specular ?? DEFAULT_OPTIONS.specular,
    tilt: options.tilt ?? preset?.tilt ?? DEFAULT_OPTIONS.tilt,
    tiltFactor: options.tiltFactor ?? preset?.tiltFactor ?? DEFAULT_OPTIONS.tiltFactor,
    magnify: options.magnify ?? preset?.magnify ?? DEFAULT_OPTIONS.magnify,
    reveal: options.reveal ?? preset?.reveal ?? DEFAULT_OPTIONS.reveal,
  };
}

/**
 * Synchronise a live lens instance with updated option values.
 *
 * Most options can be written directly to `lens.options.*` since the
 * renderer reads them each frame. `shadow` and `tilt` have DOM side
 * effects and must go through their dedicated setter methods.
 */
function syncLensOptions(
  lens: LiquidGlassLensInternal,
  resolved: ResolvedGlassOptions,
): void {
  const opts = lens.options as Record<string, unknown>;

  // Simple value updates — no DOM side effects
  const simpleKeys = [
    'refraction',
    'bevelDepth',
    'bevelWidth',
    'frost',
    'specular',
    'tiltFactor',
    'magnify',
    'reveal',
  ] as const;

  for (const key of simpleKeys) {
    if (opts[key] !== resolved[key]) {
      opts[key] = resolved[key];
    }
  }

  // Side-effect updates — must use setter methods
  if (opts.shadow !== resolved.shadow) {
    lens.setShadow(resolved.shadow);
  }
  if (opts.tilt !== resolved.tilt) {
    lens.setTilt(resolved.tilt);
  }
}

/* ==========================================================================
 *  Hook
 * ========================================================================== */

/**
 * Hook that applies the liquidGL glass effect to a DOM element.
 *
 * Returns a `RefObject` that must be attached to the target element.
 * The glass effect initializes after mount and cleans up on unmount.
 * Option changes are applied reactively without re-initializing the lens.
 *
 * @typeParam T - The HTML element type (e.g. `HTMLDivElement`, `HTMLButtonElement`)
 * @param options - Glass effect options (including optional `preset` and `onReady`)
 * @returns A `RefObject` to attach to the target element
 *
 * @example
 * ```tsx
 * const ref = useLiquidGlass<HTMLDivElement>({ preset: 'frost' });
 * return <div ref={ref}>Frosted glass content</div>;
 * ```
 */
export function useLiquidGlass<T extends HTMLElement = HTMLDivElement>(
  options: UseLiquidGlassOptions = {},
): React.RefObject<T | null> {
  const elementRef = useRef<T | null>(null);
  const lensRef = useRef<LiquidGlassLensInternal | null>(null);

  // Stable instance ID — generated once, never changes
  const instanceIdRef = useRef('');
  if (instanceIdRef.current === '') {
    instanceIdRef.current = generateId();
  }
  const instanceId = instanceIdRef.current;

  // Always-fresh reference to the latest options (avoids stale closures)
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Read renderer config from context (if a Provider is present)
  const config = useContext(LiquidGlassContext);

  /* ------------------------------------------------------------------
   *  Initialize the glass effect on mount, destroy on unmount
   * ---------------------------------------------------------------- */
  useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof window === 'undefined') return;

    // Tag the element so liquidGL can find it via CSS selector
    element.setAttribute('data-liquidgl-id', instanceId);

    // Save and resolve z-index to avoid effectiveZ - 1 returning -1 (which hides the glass on hover/tilt)
    const computedStyle = window.getComputedStyle(element);
    const originalZIndex = element.style.zIndex;
    if (computedStyle.zIndex === 'auto' || computedStyle.zIndex === '') {
      element.style.zIndex = '1';
    }

    let lens: LiquidGlassLensInternal | null = null;
    let cancelled = false;

    // Dynamic import ensures the library is never evaluated during SSR
    // and the module is loaded once then cached by the browser/bundler.
    import('liquid-gl')
      .then((module) => {
        if (cancelled) return;

        const liquidGL = module.default;
        const resolved = resolveOptions(optionsRef.current);

        try {
          const result = liquidGL({
            target: `[data-liquidgl-id="${instanceId}"]`,
            snapshot: config?.snapshot ?? DEFAULT_CONFIG.snapshot,
            resolution: config?.resolution ?? DEFAULT_CONFIG.resolution,
            ...resolved,
            on: {
              init(instance: unknown) {
                // Fire user callback with the latest onReady ref
                optionsRef.current.onReady?.(instance as LiquidGlassLensInternal);
              },
            },
          });

          if (cancelled) {
            // Component unmounted while the import was in-flight
            if (result) {
              const lensToClean = (
                Array.isArray(result) ? result[0] : result
              ) as unknown as LiquidGlassLensInternal;
              destroyLens(lensToClean);
              destroyRendererIfEmpty();
            }
            return;
          }

          lens = (
            Array.isArray(result) ? result[0] : result
          ) as unknown as LiquidGlassLensInternal;
          lensRef.current = lens;
        } catch (err) {
          console.error('liquidgl-react: Failed to initialize glass effect.', err);
        }
      })
      .catch((err) => {
        console.error('liquidgl-react: Failed to load liquid-gl module.', err);
      });

    // Cleanup on unmount (or re-run in Strict Mode)
    return () => {
      cancelled = true;
      if (lensRef.current) {
        destroyLens(lensRef.current);
        destroyRendererIfEmpty();
        lensRef.current = null;
      }
      element.removeAttribute('data-liquidgl-id');
      element.style.zIndex = originalZIndex;
    };
    // Intentionally empty deps — this effect runs exactly once per mount.
    // The dynamic import is cached, so re-mounts (e.g. Strict Mode) are fast.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------------------------------------------
   *  React to option changes (without re-initializing the lens)
   * ---------------------------------------------------------------- */
  useEffect(() => {
    const lens = lensRef.current;
    if (!lens) return;

    const resolved = resolveOptions(options);
    syncLensOptions(lens, resolved);
  }, [
    options.preset,
    options.refraction,
    options.bevelDepth,
    options.bevelWidth,
    options.frost,
    options.shadow,
    options.specular,
    options.tilt,
    options.tiltFactor,
    options.magnify,
    options.reveal,
  ]);

  return elementRef;
}
