import * as React$1 from 'react';
import React__default, { ElementType, ReactNode, ComponentPropsWithoutRef } from 'react';

/**
 * @module types
 *
 * Core TypeScript types and interfaces for liquidgl-react.
 * Provides full type safety for all component props, hook options,
 * provider configuration, and internal renderer/lens access.
 */

/**
 * Reveal animation type for the glass pane.
 * - `'none'` — Renders immediately, no animation
 * - `'fade'` — Smoothly fades in over ~1 second
 */
type RevealType = 'none' | 'fade';
/**
 * Named preset configurations, matching the liquidGL documentation.
 */
type PresetName = 'default' | 'alien' | 'pulse' | 'frost' | 'edge';
/**
 * Visual / shader options that control the glass effect appearance.
 * Each property maps directly to a liquidGL rendering parameter.
 * All fields are optional — unset fields inherit from a preset or the defaults.
 */
interface LiquidGlassOptions {
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
/**
 * Renderer-level configuration shared across all glass components on the page.
 * Typically provided via `<LiquidGlassProvider>`. These values are set once
 * when the singleton WebGL renderer is created and cannot be changed at runtime.
 */
interface LiquidGlassConfig {
    /** CSS selector for the element to snapshot for refraction. @default 'body' */
    snapshot?: string;
    /** Resolution of the background snapshot (0.1–3.0). Higher = sharper but more memory. @default 2.0 */
    resolution?: number;
}
/**
 * A lens instance as returned by the `onReady` callback.
 * Provides imperative control over a single glass pane.
 */
interface LiquidGlassLens {
    /** The underlying DOM element the glass effect is applied to. */
    el: HTMLElement;
    /** Current options (mutable at runtime for simple values). */
    options: Record<string, unknown>;
    /** Current bounding rectangle in CSS pixels. `null` before first render. */
    rectPx: {
        left: number;
        top: number;
        width: number;
        height: number;
    } | null;
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
/**
 * Extended lens type that includes private properties needed for cleanup.
 * These mirror the internal structure of `liquidGLLens` in the core library.
 *
 * @internal — Not part of the public API.
 */
interface LiquidGlassLensInternal extends LiquidGlassLens {
    renderer: LiquidGlassRendererInternal;
    originalShadow?: string;
    originalOpacity?: string;
    originalTransition?: string;
    _bgColorComponents?: {
        r: number;
        g: number;
        b: number;
        a: number;
    } | null;
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
interface LiquidGlassRendererInternal {
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
declare global {
    interface Window {
        /** Singleton WebGL renderer created by liquidGL. */
        __liquidGLRenderer__?: LiquidGlassRendererInternal;
        /** WebGL availability flag (set once, reused). */
        __liquidGLNoWebGL__?: boolean;
    }
}
/**
 * Options accepted by the `useLiquidGlass` hook.
 */
interface UseLiquidGlassOptions extends LiquidGlassOptions {
    /** Named preset to apply. Explicit option values override preset values. */
    preset?: PresetName;
    /**
     * Callback fired once the glass effect is fully initialized and the first
     * frame has been rendered. Receives the lens instance for imperative control.
     */
    onReady?: (lens: LiquidGlassLens) => void;
}
/**
 * Props for the `<LiquidGlassProvider>` component.
 */
interface LiquidGlassProviderProps extends LiquidGlassConfig {
    children: ReactNode;
}
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
type LiquidGlassProps<C extends ElementType = 'div'> = UseLiquidGlassOptions & {
    /** The HTML element or React component to render as. @default 'div' */
    as?: C;
    /** React children rendered inside the glass pane. */
    children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<C>, keyof UseLiquidGlassOptions | 'as' | 'children'>;

/**
 * @module LiquidGlass
 *
 * The main React component for the liquidGL glass effect.
 *
 * This is a polymorphic component: the `as` prop determines the rendered
 * HTML element (default: `<div>`), and all native props for that element
 * are fully type-checked. Glass options can be passed as individual props
 * or selected via a named `preset`.
 *
 * @example
 * ```tsx
 * // Glass card (renders a <div>)
 * <LiquidGlass refraction={0.05} frost={2} className="card">
 *   <h2>Title</h2>
 *   <p>Content</p>
 * </LiquidGlass>
 *
 * // Glass button (renders a <button> with full type safety)
 * <LiquidGlass as="button" preset="edge" onClick={handleClick}>
 *   Click me
 * </LiquidGlass>
 *
 * // Glass nav (renders a <nav>)
 * <LiquidGlass as="nav" preset="frost" tilt>
 *   <a href="/">Home</a>
 * </LiquidGlass>
 * ```
 */

/**
 * Type for the polymorphic `LiquidGlass` component.
 *
 * The generic `C` flows from the `as` prop and determines which native
 * HTML props are accepted. For example, `as="button"` enables `onClick`,
 * `disabled`, `type`, etc.
 */
type LiquidGlassComponent = <C extends React__default.ElementType = 'div'>(props: LiquidGlassProps<C> & {
    ref?: React__default.Ref<React__default.ComponentRef<C>>;
}) => React__default.ReactElement | null;
/**
 * A polymorphic React component that applies the liquidGL glass effect.
 *
 * Renders any HTML element (controlled by the `as` prop) with a WebGL-powered
 * refracted glass appearance. All native element props are type-safe and
 * forwarded to the rendered element.
 *
 * ## Quick Start
 * ```tsx
 * <LiquidGlass>
 *   <p>This content sits on top of a glass pane.</p>
 * </LiquidGlass>
 * ```
 *
 * ## Polymorphic
 * ```tsx
 * <LiquidGlass as="button" onClick={() => alert('hi')}>
 *   Glass button
 * </LiquidGlass>
 * ```
 *
 * ## With Preset
 * ```tsx
 * <LiquidGlass preset="frost" className="card">
 *   Frosted glass card
 * </LiquidGlass>
 * ```
 *
 * ## With Ref
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * <LiquidGlass ref={ref} refraction={0.05}>Content</LiquidGlass>
 * ```
 */
declare const LiquidGlass: LiquidGlassComponent;

/**
 * Provider component for shared renderer configuration.
 *
 * Use this to control the `snapshot` element and `resolution` for all
 * descendant `<LiquidGlass>` components. The renderer is a singleton —
 * these values are set once when the first glass component mounts and
 * cannot be changed afterward.
 *
 * @param props.snapshot  CSS selector for the element to snapshot. Defaults to `'body'`.
 * @param props.resolution  Snapshot resolution (0.1–3.0). Defaults to `2.0`.
 * @param props.children  React children.
 */
declare function LiquidGlassProvider({ snapshot, resolution, children, }: LiquidGlassProviderProps): React$1.JSX.Element;

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
declare function useLiquidGlass<T extends HTMLElement = HTMLDivElement>(options?: UseLiquidGlassOptions): React.RefObject<T | null>;

/**
 * @module presets
 *
 * Named preset configurations for quick setup.
 * Each preset is a curated combination of glass options
 * taken directly from the liquidGL documentation.
 *
 * @example
 * ```tsx
 * <LiquidGlass preset="frost" />
 * ```
 */

/**
 * Built-in preset configurations.
 *
 * | Preset      | Look & Feel                                  |
 * | ----------- | -------------------------------------------- |
 * | `default`   | Balanced glass with subtle frost and specular |
 * | `alien`     | Strong refraction + deep bevel, sci-fi vibe   |
 * | `pulse`     | Flat pane with wide bevel, great for UI pulses |
 * | `frost`     | Soft diffused privacy-glass effect            |
 * | `edge`      | Thin bevel with bright rim highlights         |
 */
declare const PRESETS: Readonly<Record<PresetName, LiquidGlassOptions>>;

export { LiquidGlass, type LiquidGlassConfig, type LiquidGlassLens, type LiquidGlassOptions, type LiquidGlassProps, LiquidGlassProvider, type LiquidGlassProviderProps, PRESETS, type PresetName, type RevealType, type UseLiquidGlassOptions, useLiquidGlass };
