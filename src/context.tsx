/**
 * @module context
 *
 * React Context and Provider for sharing renderer-level configuration
 * across all `<LiquidGlass>` components in a subtree.
 *
 * The Provider is optional — components without a Provider ancestor
 * use sensible defaults (`snapshot: 'body'`, `resolution: 2.0`).
 *
 * @example
 * ```tsx
 * // Override snapshot and resolution for all glass components
 * <LiquidGlassProvider snapshot=".main-content" resolution={1.5}>
 *   <LiquidGlass>Card 1</LiquidGlass>
 *   <LiquidGlass>Card 2</LiquidGlass>
 * </LiquidGlassProvider>
 * ```
 */

import { createContext, useMemo } from 'react';
import type { LiquidGlassConfig, LiquidGlassProviderProps } from './types';

/**
 * Context that carries renderer configuration to descendant glass components.
 * `null` when no Provider is present (components fall back to defaults).
 */
export const LiquidGlassContext = createContext<LiquidGlassConfig | null>(null);

LiquidGlassContext.displayName = 'LiquidGlassContext';

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
export function LiquidGlassProvider({
  snapshot,
  resolution,
  children,
}: LiquidGlassProviderProps) {
  const config = useMemo<LiquidGlassConfig>(
    () => ({ snapshot, resolution }),
    [snapshot, resolution],
  );

  return (
    <LiquidGlassContext.Provider value={config}>
      {children}
    </LiquidGlassContext.Provider>
  );
}
