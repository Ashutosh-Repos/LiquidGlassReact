"use client";
'use strict';

var react = require('react');
var jsxRuntime = require('react/jsx-runtime');

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
var LiquidGlassContext = react.createContext(null);
LiquidGlassContext.displayName = "LiquidGlassContext";
function LiquidGlassProvider({
  snapshot,
  resolution,
  children
}) {
  const config = react.useMemo(
    () => ({ snapshot, resolution }),
    [snapshot, resolution]
  );
  return /* @__PURE__ */ jsxRuntime.jsx(LiquidGlassContext.Provider, { value: config, children });
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
  const elementRef = react.useRef(null);
  const lensRef = react.useRef(null);
  const instanceIdRef = react.useRef("");
  if (instanceIdRef.current === "") {
    instanceIdRef.current = generateId();
  }
  const instanceId = instanceIdRef.current;
  const optionsRef = react.useRef(options);
  optionsRef.current = options;
  const config = react.useContext(LiquidGlassContext);
  react.useEffect(() => {
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
  react.useEffect(() => {
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
  return react.useCallback(
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
  return /* @__PURE__ */ jsxRuntime.jsx(Component, { ref: mergedRef, ...htmlProps, children });
}
var LiquidGlass = react.forwardRef(LiquidGlassRender);

exports.LiquidGlass = LiquidGlass;
exports.LiquidGlassProvider = LiquidGlassProvider;
exports.PRESETS = PRESETS;
exports.useLiquidGlass = useLiquidGlass;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map