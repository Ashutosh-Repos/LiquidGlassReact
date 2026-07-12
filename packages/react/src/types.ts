/**
 * @module types
 *
 * Core TypeScript types and interfaces for liquidgl-react.
 * Provides full type safety for all component props, hook options,
 * provider configuration, and internal renderer/lens access.
 */

import type {
  ComponentPropsWithoutRef,
  ElementType,
  ReactNode,
} from 'react';

/* ==========================================================================
 *  Glass Effect Options
 * ========================================================================== */

/**
 * Reveal animation type for the glass pane.
 * - `'none'` — Renders immediately, no animation
 * - `'fade'` — Smoothly fades in over ~1 second
 */
export type RevealType = 'none' | 'fade';

/**
 * Named preset configurations, matching the liquidGL documentation.
 */
export type PresetName = 'default' | 'alien' | 'pulse' | 'frost' | 'edge';

/**
 * Visual / shader options that control the glass effect appearance.
 * Each property maps directly to a liquidGL rendering parameter.
 * All fields are optional — unset fields inherit from a preset or the defaults.
 */
export interface LiquidGlassOptions {
  /** Base refraction offset applied across the pane (0–1). @default 0.01 */
  refraction?: number;

  /** Additional refraction at the edge to simulate depth (0–1). @default 0.08 */
  bevelDepth?: number;

  /** Width of the bevel zone as a fraction of the shortest side (0–1). @default 0.15 */
  bevelWidth?: number;

  /** Blur radius in pixels for a frosted look. 0 = crystal clear. @default 0 */
  frost?: number;

  /** Toggles a subtle drop-shadow under the pane. @default true */
  shadow?: boolean;

  /** Enables animated specular highlights that move with time. @default true */
  specular?: boolean;

  /** Enables 3D tilt interaction on cursor / touch movement. @default false */
  tilt?: boolean;

  /** Depth of the tilt effect in degrees (0–25 recommended). @default 5 */
  tiltFactor?: number;

  /** Magnification factor of the lens (0.001–3.0). 1 = no magnification. @default 1 */
  magnify?: number;

  /** Reveal animation type. @default 'fade' */
  reveal?: RevealType;
}

/* ==========================================================================
 *  Renderer Configuration
 * ========================================================================== */

/**
 * Renderer-level configuration shared across all glass components on the page.
 * Typically provided via `<LiquidGlassProvider>`. These values are set once
 * when the singleton WebGL renderer is created and cannot be changed at runtime.
 */
export interface LiquidGlassConfig {
  /** CSS selector for the element to snapshot for refraction. @default 'body' */
  snapshot?: string;

  /** Resolution of the background snapshot (0.1–3.0). Higher = sharper but more memory. @default 2.0 */
  resolution?: number;
}

/* ==========================================================================
 *  Lens Instance (public surface)
 * ========================================================================== */

/**
 * A lens instance as returned by the `onReady` callback.
 * Provides imperative control over a single glass pane.
 */
export interface LiquidGlassLens {
  /** The underlying DOM element the glass effect is applied to. */
  el: HTMLElement;

  /** Current options (mutable at runtime for simple values). */
  options: Record<string, unknown>;

  /** Current bounding rectangle in CSS pixels. `null` before first render. */
  rectPx: { left: number; top: number; width: number; height: number } | null;

  /** Resolved CSS border-radius in pixels. */
  radiusCss: number;

  /** Current tilt X rotation in degrees (0 when tilt is off). */
  tiltX: number;

  /** Current tilt Y rotation in degrees (0 when tilt is off). */
  tiltY: number;

  /** Toggle the drop-shadow at runtime. Has DOM side effects. */
  setShadow(enabled: boolean): void;

  /** Toggle the tilt interaction at runtime. Has DOM side effects. */
  setTilt(enabled: boolean): void;

  /** Force a metric re-read (dimensions, border-radius). */
  updateMetrics(): void;
}

/* ==========================================================================
 *  Internal types (used by cleanup and renderer manager)
 * ========================================================================== */

/**
 * Extended lens type that includes private properties needed for cleanup.
 * These mirror the internal structure of `liquidGLLens` in the core library.
 *
 * @internal — Not part of the public API.
 */
export interface LiquidGlassLensInternal extends LiquidGlassLens {
  renderer: LiquidGlassRendererInternal;
  originalShadow?: string;
  originalOpacity?: string;
  originalTransition?: string;
  _bgColorComponents?: { r: number; g: number; b: number; a: number } | null;
  _shadowEl?: HTMLElement | null;
  _shadowSyncFn?: (() => void) | null;
  _sizeObs?: ResizeObserver | null;
  _mirror?: HTMLCanvasElement | null;
  _mirrorActive?: boolean;
  _tiltHandlersBound?: boolean;
  _resetCleanupTimer?: ReturnType<typeof setTimeout> | null;
  _destroyMirrorCanvas?(): void;
  _unbindTiltHandlers?(): void;
}

/**
 * Internal renderer type (the singleton stored on `window.__liquidGLRenderer__`).
 *
 * @internal — Not part of the public API.
 */
export interface LiquidGlassRendererInternal {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  lenses: LiquidGlassLensInternal[];
  texture: WebGLTexture | null;
  program: WebGLProgram | null;
  _rafId?: number | null;
  _dynWorker?: Worker | null;
  useExternalTicker: boolean;
  render(): void;
  captureSnapshot(): Promise<boolean>;
  addDynamicElement(el: unknown): void;
}

/* ==========================================================================
 *  Window augmentation
 * ========================================================================== */

declare global {
  interface Window {
    /** Singleton WebGL renderer created by liquidGL. */
    __liquidGLRenderer__?: LiquidGlassRendererInternal;
    /** WebGL availability flag (set once, reused). */
    __liquidGLNoWebGL__?: boolean;
  }
}

/* ==========================================================================
 *  Hook Options
 * ========================================================================== */

/**
 * Options accepted by the `useLiquidGlass` hook.
 */
export interface UseLiquidGlassOptions extends LiquidGlassOptions {
  /** Named preset to apply. Explicit option values override preset values. */
  preset?: PresetName;

  /**
   * Callback fired once the glass effect is fully initialized and the first
   * frame has been rendered. Receives the lens instance for imperative control.
   */
  onReady?: (lens: LiquidGlassLens) => void;
}

/* ==========================================================================
 *  Provider Props
 * ========================================================================== */

/**
 * Props for the `<LiquidGlassProvider>` component.
 */
export interface LiquidGlassProviderProps extends LiquidGlassConfig {
  children: ReactNode;
}

/* ==========================================================================
 *  Polymorphic Component Props
 * ========================================================================== */

/**
 * Props for the `<LiquidGlass>` component.
 *
 * This is a polymorphic type: the `as` prop determines which HTML element
 * is rendered, and the remaining props are type-checked against that element.
 *
 * @example
 * ```tsx
 * // Default <div>
 * <LiquidGlass refraction={0.05}>Card</LiquidGlass>
 *
 * // Renders a <button> with full button-prop autocomplete
 * <LiquidGlass as="button" onClick={fn} disabled>Click</LiquidGlass>
 * ```
 */
export type LiquidGlassProps<C extends ElementType = 'div'> =
  UseLiquidGlassOptions & {
    /** The HTML element or React component to render as. @default 'div' */
    as?: C;
    /** React children rendered inside the glass pane. */
    children?: ReactNode;
  } & Omit<
    ComponentPropsWithoutRef<C>,
    keyof UseLiquidGlassOptions | 'as' | 'children'
  >;

/**
 * A fully resolved set of glass options (no `undefined` values).
 * Used internally after merging defaults + preset + explicit props.
 *
 * @internal
 */
export type ResolvedGlassOptions = Required<LiquidGlassOptions>;
