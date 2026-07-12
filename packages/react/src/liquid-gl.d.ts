/**
 * Type declarations for the `liquid-gl` npm package.
 *
 * The core library is untyped vanilla JS, so we provide our own
 * declarations to enable type-safe usage within the React wrapper.
 */
declare module 'liquid-gl' {
  interface LiquidGLInitOptions {
    /** CSS selector for the element(s) to glassify. */
    target?: string;
    /** CSS selector for the element to snapshot. */
    snapshot?: string;
    /** Resolution of the background snapshot (0.1–3.0). */
    resolution?: number;
    /** Base refraction offset (0–1). */
    refraction?: number;
    /** Edge bevel depth (0–1). */
    bevelDepth?: number;
    /** Bevel zone width fraction (0–1). */
    bevelWidth?: number;
    /** Blur radius in px for frosted look. */
    frost?: number;
    /** Enable drop-shadow. */
    shadow?: boolean;
    /** Enable animated specular highlights. */
    specular?: boolean;
    /** Reveal animation: 'none' | 'fade'. */
    reveal?: string;
    /** Enable 3D tilt on hover. */
    tilt?: boolean;
    /** Tilt intensity in degrees. */
    tiltFactor?: number;
    /** Magnification factor (0.001–3.0). */
    magnify?: number;
    /** Lifecycle callbacks. */
    on?: {
      /** Fires once the first render completes. */
      init?: (instance: LiquidGLLensInstance) => void;
    };
  }

  interface LiquidGLLensInstance {
    /** The underlying DOM element. */
    el: HTMLElement;
    /** Mutable options object. */
    options: Record<string, unknown>;
    /** Current bounding rect. */
    rectPx: { left: number; top: number; width: number; height: number } | null;
    /** CSS border-radius in px. */
    radiusCss: number;
    /** WebGL-space border-radius. */
    radiusGl: number;
    /** Current tilt X rotation. */
    tiltX: number;
    /** Current tilt Y rotation. */
    tiltY: number;
    /** Toggle shadow at runtime. */
    setShadow(enabled: boolean): void;
    /** Toggle tilt at runtime. */
    setTilt(enabled: boolean): void;
    /** Re-read element dimensions. */
    updateMetrics(): void;
  }

  interface LiquidGLStatic {
    /**
     * Initialize liquidGL on target elements.
     * Returns a single lens instance, or an array if multiple targets match.
     */
    (options?: LiquidGLInitOptions): LiquidGLLensInstance | LiquidGLLensInstance[] | undefined;

    /** Register elements for live texture updates (non-video dynamic content). */
    registerDynamic(elements: string | Element[] | NodeList): void;

    /** Sync with smooth-scrolling / animation libraries (Lenis, GSAP, Locomotive). */
    syncWith(config?: Record<string, unknown>): {
      lenis: unknown;
      locomotiveScroll: unknown;
    };
  }

  const liquidGL: LiquidGLStatic;
  export default liquidGL;
}
