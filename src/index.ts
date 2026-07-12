/**
 * liquidgl-react — React components for liquidGL glassmorphism effects.
 *
 * @packageDocumentation
 *
 * ## Exports
 *
 * | Export                  | Kind      | Description                                    |
 * | ----------------------- | --------- | ---------------------------------------------- |
 * | `LiquidGlass`           | Component | Polymorphic glass pane component               |
 * | `LiquidGlassProvider`   | Component | Provider for shared renderer config            |
 * | `useLiquidGlass`        | Hook      | Low-level hook for imperative usage            |
 * | `PRESETS`               | Constant  | Named preset configurations                    |
 * | `LiquidGlassProps`      | Type      | Props for the `LiquidGlass` component          |
 * | `LiquidGlassOptions`    | Type      | Visual / shader option interface               |
 * | `LiquidGlassConfig`     | Type      | Renderer-level config interface                |
 * | `LiquidGlassLens`       | Type      | Lens instance (returned by `onReady`)          |
 * | `PresetName`            | Type      | Union of available preset names                |
 * | `UseLiquidGlassOptions` | Type      | Options for the `useLiquidGlass` hook          |
 */

/* --- Components --- */
export { LiquidGlass } from './LiquidGlass';
export { LiquidGlassProvider } from './context';

/* --- Hooks --- */
export { useLiquidGlass } from './useLiquidGlass';

/* --- Constants --- */
export { PRESETS } from './presets';

/* --- Types --- */
export type {
  LiquidGlassProps,
  LiquidGlassOptions,
  LiquidGlassConfig,
  LiquidGlassLens,
  LiquidGlassProviderProps,
  PresetName,
  RevealType,
  UseLiquidGlassOptions,
} from './types';
