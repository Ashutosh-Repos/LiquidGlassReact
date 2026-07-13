"use client";
import { createContext, forwardRef, useRef, useContext, useEffect, useCallback, useMemo } from 'react';
import { jsx } from 'react/jsx-runtime';

// src/LiquidGlass.tsx

// src/constants.ts
var DEFAULT_OPTIONS = {
  refraction: 0.01,
  bevelDepth: 0.08,
  bevelWidth: 0.15,
  frost: 0,
  shadow: true,
  specular: true,
  tilt: false,
  tiltFactor: 5,
  magnify: 1,
  reveal: "fade"
};
var DEFAULT_CONFIG = {
  snapshot: "body",
  resolution: 2
};
var LiquidGlassContext = createContext(null);
LiquidGlassContext.displayName = "LiquidGlassContext";
function LiquidGlassProvider({
  snapshot,
  resolution,
  children
}) {
  const config = useMemo(
    () => ({ snapshot, resolution }),
    [snapshot, resolution]
  );
  return /* @__PURE__ */ jsx(LiquidGlassContext.Provider, { value: config, children });
}

// src/lens-cleanup.ts
function destroyLens(lens) {
  if (!lens || !lens.el) return;
  const { el, renderer } = lens;
  if (lens._sizeObs) {
    lens._sizeObs.disconnect();
    lens._sizeObs = null;
  }
  if (lens._shadowEl) {
    if (lens._shadowSyncFn) {
      window.removeEventListener("resize", lens._shadowSyncFn);
      lens._shadowSyncFn = null;
    }
    lens._shadowEl.remove();
    lens._shadowEl = null;
  }
  if (lens._resetCleanupTimer) {
    clearTimeout(lens._resetCleanupTimer);
    lens._resetCleanupTimer = null;
  }
  if (typeof lens._destroyMirrorCanvas === "function") {
    lens._destroyMirrorCanvas();
  }
  if (lens._tiltHandlersBound && typeof lens._unbindTiltHandlers === "function") {
    lens._unbindTiltHandlers();
  }
  el.style.opacity = lens.originalOpacity ?? "";
  el.style.transition = lens.originalTransition ?? "";
  el.style.boxShadow = lens.originalShadow ?? "";
  el.style.backdropFilter = "";
  el.style.webkitBackdropFilter = "";
  el.style.backgroundImage = "";
  el.style.background = "";
  el.style.pointerEvents = "";
  if (lens._bgColorComponents) {
    const { r, g, b, a } = lens._bgColorComponents;
    el.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  if (renderer && Array.isArray(renderer.lenses)) {
    renderer.lenses = renderer.lenses.filter((l) => l !== lens);
  }
}
function destroyRendererIfEmpty() {
  const renderer = window.__liquidGLRenderer__;
  if (!renderer) return;
  if (renderer.lenses && renderer.lenses.length > 0) return;
  if (renderer._rafId) {
    cancelAnimationFrame(renderer._rafId);
    renderer._rafId = null;
  }
  if (renderer._dynWorker) {
    renderer._dynWorker.terminate();
    renderer._dynWorker = null;
  }
  const styleEl = document.getElementById("liquid-gl-dynamic-styles");
  if (styleEl) {
    styleEl.remove();
  }
  if (renderer.canvas && renderer.canvas.parentNode) {
    renderer.canvas.remove();
  }
  if (renderer.gl) {
    if (renderer.texture) {
      renderer.gl.deleteTexture(renderer.texture);
      renderer.texture = null;
    }
    if (renderer.program) {
      renderer.gl.deleteProgram(renderer.program);
      renderer.program = null;
    }
    const loseCtx = renderer.gl.getExtension("WEBGL_lose_context");
    if (loseCtx) {
      loseCtx.loseContext();
    }
  }
  delete window.__liquidGLRenderer__;
  delete window.__liquidGLNoWebGL__;
}

// src/presets.ts
var PRESETS = {
  default: {
    refraction: 0,
    bevelDepth: 0.052,
    bevelWidth: 0.211,
    frost: 2,
    shadow: true,
    specular: true
  },
  alien: {
    refraction: 0.073,
    bevelDepth: 0.2,
    bevelWidth: 0.156,
    frost: 2,
    shadow: true,
    specular: false
  },
  pulse: {
    refraction: 0.03,
    bevelDepth: 0,
    bevelWidth: 0.273,
    frost: 0,
    shadow: false,
    specular: false
  },
  frost: {
    refraction: 0,
    bevelDepth: 0.035,
    bevelWidth: 0.119,
    frost: 0.9,
    shadow: true,
    specular: true
  },
  edge: {
    refraction: 0.047,
    bevelDepth: 0.136,
    bevelWidth: 0.076,
    frost: 2,
    shadow: true,
    specular: false
  }
};

// src/useLiquidGlass.ts
var _nextId = 0;
function generateId() {
  return `lgl-${++_nextId}`;
}
var convertOklabToRGB = (L, a, b, alpha) => {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  let r_val = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let g_val = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let b_val = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  const gammaEncode = (c) => {
    return c >= 31308e-7 ? 1.055 * Math.pow(c, 1 / 2.4) - 0.055 : 12.92 * c;
  };
  r_val = Math.round(Math.max(0, Math.min(1, gammaEncode(r_val))) * 255);
  g_val = Math.round(Math.max(0, Math.min(1, gammaEncode(g_val))) * 255);
  b_val = Math.round(Math.max(0, Math.min(1, gammaEncode(b_val))) * 255);
  return alpha !== void 0 ? `rgba(${r_val}, ${g_val}, ${b_val}, ${alpha})` : `rgb(${r_val}, ${g_val}, ${b_val})`;
};
var convertModernColorToRGB = (colorStr) => {
  if (!colorStr || typeof colorStr !== "string") return colorStr;
  if (colorStr.includes("oklab")) {
    const match = colorStr.match(/(?:oklab|color\(oklab)\s+([0-9.-]+)%?\s+([0-9.-]+)%?\s+([0-9.-]+)%?(?:\s*\/\s*([0-9.-]+)%?)?/i) || colorStr.match(/oklab\(\s*([0-9.-]+)%?\s+([0-9.-]+)%?\s+([0-9.-]+)%?(?:\s*\/\s*([0-9.-]+)%?)?\s*\)/i);
    if (match) {
      let L = parseFloat(match[1]);
      if (match[1].includes("%")) L /= 100;
      const a = parseFloat(match[2]);
      const b = parseFloat(match[3]);
      let alpha = void 0;
      if (match[4]) {
        alpha = parseFloat(match[4]);
        if (match[4].includes("%")) alpha /= 100;
      }
      return convertOklabToRGB(L, a, b, alpha);
    }
  }
  if (colorStr.includes("oklch")) {
    const match = colorStr.match(/(?:oklch|color\(oklch)\s+([0-9.-]+)%?\s+([0-9.-]+)%?\s+([0-9.-]+)(?:\s*\/\s*([0-9.-]+)%?)?/i) || colorStr.match(/oklch\(\s*([0-9.-]+)%?\s+([0-9.-]+)%?\s+([0-9.-]+)(?:\s*\/\s*([0-9.-]+)%?)?\s*\)/i);
    if (match) {
      let L = parseFloat(match[1]);
      if (match[1].includes("%")) L /= 100;
      const C = parseFloat(match[2]);
      const H = parseFloat(match[3]);
      let alpha = void 0;
      if (match[4]) {
        alpha = parseFloat(match[4]);
        if (match[4].includes("%")) alpha /= 100;
      }
      const hRad = H * Math.PI / 180;
      const a = C * Math.cos(hRad);
      const b = C * Math.sin(hRad);
      return convertOklabToRGB(L, a, b, alpha);
    }
  }
  if (colorStr.includes("oklab") || colorStr.includes("oklch") || colorStr.includes("lab(")) {
    return "rgba(0, 0, 0, 0)";
  }
  return colorStr;
};
function applyComputedStylePolyfill() {
  if (typeof window === "undefined") return () => {
  };
  const originalGetComputedStyle = window.getComputedStyle;
  window.getComputedStyle = function(el, pseudo) {
    const style = originalGetComputedStyle.call(this, el, pseudo);
    return new Proxy(style, {
      get(target, prop) {
        if (typeof prop === "string") {
          if (prop === "getPropertyValue") {
            return function(propertyName) {
              const val3 = target.getPropertyValue(propertyName);
              return convertModernColorToRGB(val3);
            };
          }
          const val2 = target[prop];
          if (typeof val2 === "string") {
            return convertModernColorToRGB(val2);
          }
        }
        const val = Reflect.get(target, prop);
        if (typeof val === "function") {
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
function resolveOptions(options) {
  const preset = options.preset ? PRESETS[options.preset] : void 0;
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
    reveal: options.reveal ?? preset?.reveal ?? DEFAULT_OPTIONS.reveal
  };
}
function syncLensOptions(lens, resolved) {
  const opts = lens.options;
  const simpleKeys = [
    "refraction",
    "bevelDepth",
    "bevelWidth",
    "frost",
    "specular",
    "tiltFactor",
    "magnify",
    "reveal"
  ];
  for (const key of simpleKeys) {
    if (opts[key] !== resolved[key]) {
      opts[key] = resolved[key];
    }
  }
  if (opts.shadow !== resolved.shadow) {
    lens.setShadow(resolved.shadow);
  }
  if (opts.tilt !== resolved.tilt) {
    lens.setTilt(resolved.tilt);
  }
}
function useLiquidGlass(options = {}) {
  const elementRef = useRef(null);
  const lensRef = useRef(null);
  const instanceIdRef = useRef("");
  if (instanceIdRef.current === "") {
    instanceIdRef.current = generateId();
  }
  const instanceId = instanceIdRef.current;
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const config = useContext(LiquidGlassContext);
  useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof window === "undefined") return;
    element.setAttribute("data-liquidgl-id", instanceId);
    const computedStyle = window.getComputedStyle(element);
    const originalZIndex = element.style.zIndex;
    if (computedStyle.zIndex === "auto" || computedStyle.zIndex === "") {
      element.style.zIndex = "1";
    }
    let lens = null;
    let cancelled = false;
    import('liquid-gl').then((module) => {
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
            init(instance) {
              optionsRef.current.onReady?.(instance);
            }
          }
        });
        if (cancelled) {
          if (result) {
            const lensToClean = Array.isArray(result) ? result[0] : result;
            destroyLens(lensToClean);
            destroyRendererIfEmpty();
          }
          return;
        }
        lens = Array.isArray(result) ? result[0] : result;
        lensRef.current = lens;
        const renderer = lens.renderer;
        if (renderer && !renderer._captureSnapshotWrapped) {
          renderer._captureSnapshotWrapped = true;
          const originalCapture = renderer.captureSnapshot;
          renderer.captureSnapshot = async function() {
            const restore = applyComputedStylePolyfill();
            try {
              return await originalCapture.call(this);
            } finally {
              restore();
            }
          };
        }
      } catch (err) {
        console.error("liquidgl-react: Failed to initialize glass effect.", err);
      }
    }).catch((err) => {
      console.error("liquidgl-react: Failed to load liquid-gl module.", err);
    });
    return () => {
      cancelled = true;
      if (lensRef.current) {
        destroyLens(lensRef.current);
        destroyRendererIfEmpty();
        lensRef.current = null;
      }
      element.removeAttribute("data-liquidgl-id");
      element.style.zIndex = originalZIndex;
    };
  }, []);
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
    options.reveal
  ]);
  return elementRef;
}
function useMergedRef(internalRef, forwardedRef) {
  return useCallback(
    (node) => {
      internalRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    // internalRef is stable (from useRef), forwardedRef may change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [forwardedRef]
  );
}
function LiquidGlassRender(props, forwardedRef) {
  const {
    // ---- Internal component props ----
    as,
    preset,
    onReady,
    // ---- Glass effect options ----
    refraction,
    bevelDepth,
    bevelWidth,
    frost,
    shadow,
    specular,
    tilt,
    tiltFactor,
    magnify,
    reveal,
    // ---- React children ----
    children,
    // ---- Everything else → native HTML props ----
    ...htmlProps
  } = props;
  const Component = as || "div";
  const glassOptions = {
    preset,
    onReady,
    refraction,
    bevelDepth,
    bevelWidth,
    frost,
    shadow,
    specular,
    tilt,
    tiltFactor,
    magnify,
    reveal
  };
  const glassRef = useLiquidGlass(glassOptions);
  const mergedRef = useMergedRef(glassRef, forwardedRef);
  return /* @__PURE__ */ jsx(Component, { ref: mergedRef, ...htmlProps, children });
}
var LiquidGlass = forwardRef(LiquidGlassRender);

export { LiquidGlass, LiquidGlassProvider, PRESETS, useLiquidGlass };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map