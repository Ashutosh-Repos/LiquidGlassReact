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

import React, { forwardRef, useCallback } from 'react';

import { useLiquidGlass } from './useLiquidGlass';
import type { LiquidGlassProps, UseLiquidGlassOptions } from './types';

/* ==========================================================================
 *  Ref merging utility
 * ========================================================================== */

/**
 * Merge an internal `RefObject` with a user-provided forwarded ref.
 *
 * Returns a stable callback ref that sets both refs whenever React
 * attaches/detaches the DOM node. This is the standard pattern for
 * libraries that need their own ref while still supporting `forwardRef`.
 */
function useMergedRef<T>(
  internalRef: React.RefObject<T | null>,
  forwardedRef: React.ForwardedRef<T>,
): React.RefCallback<T> {
  return useCallback(
    (node: T | null) => {
      // Set the internal ref (from useLiquidGlass)
      (internalRef as React.MutableRefObject<T | null>).current = node;

      // Set the forwarded ref (from the consumer)
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<T | null>).current = node;
      }
    },
    // internalRef is stable (from useRef), forwardedRef may change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [forwardedRef],
  );
}

/* ==========================================================================
 *  Component
 * ========================================================================== */

/**
 * Type for the polymorphic `LiquidGlass` component.
 *
 * The generic `C` flows from the `as` prop and determines which native
 * HTML props are accepted. For example, `as="button"` enables `onClick`,
 * `disabled`, `type`, etc.
 */
type LiquidGlassComponent = <C extends React.ElementType = 'div'>(
  props: LiquidGlassProps<C> & { ref?: React.Ref<React.ComponentRef<C>> },
) => React.ReactElement | null;

/**
 * Inner render function (receives forwarded ref as second argument).
 * Uses explicit destructuring to cleanly separate:
 *   - Glass options → passed to `useLiquidGlass`
 *   - Internal props (`as`, `preset`, `onReady`) → consumed by the component
 *   - Everything else → spread onto the rendered HTML element
 */
function LiquidGlassRender<C extends React.ElementType = 'div'>(
  props: LiquidGlassProps<C>,
  forwardedRef: React.ForwardedRef<HTMLElement>,
): React.ReactElement {
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

  // Determine which element to render
  const Component = (as || 'div') as React.ElementType;

  // Build the hook options object
  const glassOptions: UseLiquidGlassOptions = {
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
    reveal,
  };

  // Initialize the glass effect and get the internal ref
  const glassRef = useLiquidGlass<HTMLElement>(glassOptions);

  // Merge our internal ref with the consumer's forwarded ref
  const mergedRef = useMergedRef(glassRef, forwardedRef);

  return (
    <Component ref={mergedRef} {...htmlProps}>
      {children}
    </Component>
  );
}

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
export const LiquidGlass: LiquidGlassComponent =
  forwardRef(LiquidGlassRender) as LiquidGlassComponent;
