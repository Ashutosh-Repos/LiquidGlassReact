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

import type { LiquidGlassOptions, PresetName } from './types';

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
export const PRESETS: Readonly<Record<PresetName, LiquidGlassOptions>> = {
  default: {
    refraction: 0,
    bevelDepth: 0.052,
    bevelWidth: 0.211,
    frost: 2,
    shadow: true,
    specular: true,
  },

  alien: {
    refraction: 0.073,
    bevelDepth: 0.2,
    bevelWidth: 0.156,
    frost: 2,
    shadow: true,
    specular: false,
  },

  pulse: {
    refraction: 0.03,
    bevelDepth: 0,
    bevelWidth: 0.273,
    frost: 0,
    shadow: false,
    specular: false,
  },

  frost: {
    refraction: 0,
    bevelDepth: 0.035,
    bevelWidth: 0.119,
    frost: 0.9,
    shadow: true,
    specular: true,
  },

  edge: {
    refraction: 0.047,
    bevelDepth: 0.136,
    bevelWidth: 0.076,
    frost: 2,
    shadow: true,
    specular: false,
  },
} as const;
