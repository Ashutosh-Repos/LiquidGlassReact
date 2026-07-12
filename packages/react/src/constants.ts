/**
 * @module constants
 *
 * Default values for all glass options and renderer configuration.
 * These mirror the defaults in the core liquidGL library.
 */

import type { LiquidGlassConfig, ResolvedGlassOptions } from './types';

/**
 * Default visual options matching liquidGL's built-in defaults.
 * Used when no preset is selected and no explicit value is provided.
 */
export const DEFAULT_OPTIONS: ResolvedGlassOptions = {
  refraction: 0.01,
  bevelDepth: 0.08,
  bevelWidth: 0.15,
  frost: 0,
  shadow: true,
  specular: true,
  tilt: false,
  tiltFactor: 5,
  magnify: 1,
  reveal: 'fade',
} as const;

/**
 * Default renderer-level configuration.
 * Applied when no `<LiquidGlassProvider>` is present.
 */
export const DEFAULT_CONFIG: Required<LiquidGlassConfig> = {
  snapshot: 'body',
  resolution: 2.0,
} as const;

/**
 * All glass-option keys, used to separate glass props from HTML element props
 * when destructuring component props.
 */
export const GLASS_OPTION_KEYS = [
  'refraction',
  'bevelDepth',
  'bevelWidth',
  'frost',
  'shadow',
  'specular',
  'tilt',
  'tiltFactor',
  'magnify',
  'reveal',
] as const;
