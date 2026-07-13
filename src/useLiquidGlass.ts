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

const convertOklabToRGB = (L: number, a: number, b: number, alpha?: number) => {
  // oklab -> linear LMS
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  
  let r_val = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let g_val = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let b_val = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  
  const gammaEncode = (c: number) => {
    return c >= 0.0031308 ? 1.055 * Math.pow(c, 1 / 2.4) - 0.055 : 12.92 * c;
  };
  
  r_val = Math.round(Math.max(0, Math.min(1, gammaEncode(r_val))) * 255);
  g_val = Math.round(Math.max(0, Math.min(1, gammaEncode(g_val))) * 255);
  b_val = Math.round(Math.max(0, Math.min(1, gammaEncode(b_val))) * 255);
  
  return alpha !== undefined ? `rgba(${r_val}, ${g_val}, ${b_val}, ${alpha})` : `rgb(${r_val}, ${g_val}, ${b_val})`;
};

const convertModernColorToRGB = (colorStr: string): string => {
  if (!colorStr || typeof colorStr !== 'string') return colorStr;
  
  // Parse oklab(L a b) or oklab(L a b / alpha) or color(oklab L a b / alpha)
  if (colorStr.includes('oklab')) {
    const match = colorStr.match(/(?:oklab|color\(oklab)\s+([0-9.-]+)%?\s+([0-9.-]+)%?\s+([0-9.-]+)%?(?:\s*\/\s*([0-9.-]+)%?)?/i) ||
                  colorStr.match(/oklab\(\s*([0-9.-]+)%?\s+([0-9.-]+)%?\s+([0-9.-]+)%?(?:\s*\/\s*([0-9.-]+)%?)?\s*\)/i);
    if (match) {
      let L = parseFloat(match[1]);
      if (match[1].includes('%')) L /= 100;
      const a = parseFloat(match[2]);
      const b = parseFloat(match[3]);
      let alpha: number | undefined = undefined;
      if (match[4]) {
        alpha = parseFloat(match[4]);
        if (match[4].includes('%')) alpha /= 100;
      }
      return convertOklabToRGB(L, a, b, alpha);
    }
  }
  
  // Parse oklch(L C H) or oklch(L C H / alpha) or color(oklch L C H / alpha)
  if (colorStr.includes('oklch')) {
    const match = colorStr.match(/(?:oklch|color\(oklch)\s+([0-9.-]+)%?\s+([0-9.-]+)%?\s+([0-9.-]+)(?:\s*\/\s*([0-9.-]+)%?)?/i) ||
                  colorStr.match(/oklch\(\s*([0-9.-]+)%?\s+([0-9.-]+)%?\s+([0-9.-]+)(?:\s*\/\s*([0-9.-]+)%?)?\s*\)/i);
    if (match) {
      let L = parseFloat(match[1]);
      if (match[1].includes('%')) L /= 100;
      const C = parseFloat(match[2]);
      const H = parseFloat(match[3]);
      let alpha: number | undefined = undefined;
      if (match[4]) {
        alpha = parseFloat(match[4]);
        if (match[4].includes('%')) alpha /= 100;
      }
      
      const hRad = (H * Math.PI) / 180;
      const a = C * Math.cos(hRad);
      const b = C * Math.sin(hRad);
      return convertOklabToRGB(L, a, b, alpha);
    }
  }
  
  // Fallback block to strip unsupported oklch / oklab / lab functions to transparent
  if (colorStr.includes('oklab') || colorStr.includes('oklch') || colorStr.includes('lab(')) {
    return 'rgba(0, 0, 0, 0)';
  }
  
  return colorStr;
};

/** Temporarily polyfills window.getComputedStyle to translate modern oklch/oklab colors. */
function applyComputedStylePolyfill(): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const originalGetComputedStyle = window.getComputedStyle;
  
  window.getComputedStyle = function (el, pseudo) {
    const style = originalGetComputedStyle.call(this, el, pseudo);
    
    return new Proxy(style, {
      get(target, prop) {
        if (typeof prop === 'string') {
          if (prop === 'getPropertyValue') {
            return function (propertyName: string) {
              const val = target.getPropertyValue(propertyName);
              return convertModernColorToRGB(val);
            };
          }
          
          const val = (target as any)[prop];
          if (typeof val === 'string') {
            return convertModernColorToRGB(val);
          }
        }
        
        const val = Reflect.get(target, prop);
        if (typeof val === 'function') {
          return val.bind(target);
        }
        return val;
      }
    });
  };
  
  return () => {
    window.getComputedStyle = originalGetComputedStyle;
  };
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

          // Temporarily wrap the snapshot capture function to polyfill getComputedStyle
          const renderer = lens.renderer;
          if (renderer && !(renderer as any)._captureSnapshotWrapped) {
            (renderer as any)._captureSnapshotWrapped = true;
            const originalCapture = renderer.captureSnapshot;
            renderer.captureSnapshot = async function (this: any) {
              const restore = applyComputedStylePolyfill();
              try {
                return await originalCapture.call(this);
              } finally {
                restore();
              }
            };
          }
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
