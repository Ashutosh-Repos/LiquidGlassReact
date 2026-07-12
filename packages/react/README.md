# liquidgl-react

React components for [liquidGL](https://liquidgl.naughtyduk.com) — ultra-light glassmorphism for the web.

Turn any React component into a beautiful, refracted glass pane with a single import.

## Installation

```bash
npm install liquidgl-react
```

> **Peer dependencies:** `react >= 18.0.0` and `react-dom >= 18.0.0`

## Quick Start

```tsx
import { LiquidGlass } from 'liquidgl-react';

function App() {
  return (
    <LiquidGlass className="card" style={{ width: 400, height: 300 }}>
      <h2>Glass Card</h2>
      <p>This content sits on top of a refracted glass pane.</p>
    </LiquidGlass>
  );
}
```

## Features

- 🧩 **Polymorphic** — render as `<div>`, `<button>`, `<nav>`, or any HTML element
- 🎛️ **Fully customizable** — control refraction, bevel, frost, specular, tilt, and more
- 🎨 **Presets** — five built-in styles: `default`, `alien`, `pulse`, `frost`, `edge`
- 🪝 **Hook API** — `useLiquidGlass()` for advanced imperative usage
- 📦 **SSR safe** — works with Next.js App Router and other SSR frameworks
- 🔧 **TypeScript first** — full type inference, including polymorphic `as` prop
- ♻️ **Proper cleanup** — lenses and WebGL resources are freed on unmount

---

## API Reference

### `<LiquidGlass>`

The main component. Renders a glass-effect pane with any children inside.

```tsx
<LiquidGlass
  // Polymorphic — render as any element
  as="section"
  
  // Glass effect options
  refraction={0.05}
  bevelDepth={0.1}
  bevelWidth={0.15}
  frost={2}
  shadow
  specular
  tilt
  tiltFactor={10}
  magnify={1.2}
  reveal="fade"
  
  // Or use a preset (explicit options override preset values)
  preset="frost"
  
  // Lifecycle callback
  onReady={(lens) => console.log('Glass initialized!', lens)}
  
  // All native HTML props are supported and type-checked
  className="my-card"
  style={{ width: 400, height: 300 }}
  onClick={() => console.log('clicked')}
>
  <p>Content</p>
</LiquidGlass>
```

#### Props

| Prop          | Type                          | Default   | Description                                          |
| ------------- | ----------------------------- | --------- | ---------------------------------------------------- |
| `as`          | `React.ElementType`           | `'div'`   | HTML element or component to render                  |
| `preset`      | `PresetName`                  | —         | Named preset (`default`, `alien`, `pulse`, `frost`, `edge`) |
| `refraction`  | `number`                      | `0.01`    | Base refraction offset (0–1)                         |
| `bevelDepth`  | `number`                      | `0.08`    | Edge bevel depth (0–1)                               |
| `bevelWidth`  | `number`                      | `0.15`    | Bevel zone width fraction (0–1)                      |
| `frost`       | `number`                      | `0`       | Blur radius in px. 0 = crystal clear                 |
| `shadow`      | `boolean`                     | `true`    | Enable drop-shadow under the pane                    |
| `specular`    | `boolean`                     | `true`    | Enable animated specular highlights                  |
| `tilt`        | `boolean`                     | `false`   | Enable 3D tilt on hover                              |
| `tiltFactor`  | `number`                      | `5`       | Tilt intensity in degrees (0–25)                     |
| `magnify`     | `number`                      | `1`       | Magnification (0.001–3.0)                            |
| `reveal`      | `'none' \| 'fade'`            | `'fade'`  | Reveal animation type                                |
| `onReady`     | `(lens: LiquidGlassLens) => void` | —     | Callback when the glass effect is ready              |
| `children`    | `ReactNode`                   | —         | Content inside the glass pane                        |
| `ref`         | `React.Ref`                   | —         | Forwarded ref to the underlying element              |
| `...htmlProps`| —                             | —         | All native props for the rendered element            |

---

### `useLiquidGlass(options?)`

Low-level hook for applying the glass effect to any element via a ref.

```tsx
import { useLiquidGlass } from 'liquidgl-react';

function CustomPanel() {
  const ref = useLiquidGlass<HTMLDivElement>({
    refraction: 0.05,
    frost: 2,
    preset: 'frost',
    onReady: (lens) => {
      // Access the lens instance for imperative control
      console.log('Lens ready:', lens);
    },
  });

  return (
    <div ref={ref} className="panel">
      Custom glass panel
    </div>
  );
}
```

#### Parameters

| Param     | Type                   | Description                              |
| --------- | ---------------------- | ---------------------------------------- |
| `options` | `UseLiquidGlassOptions` | Glass options + `preset` + `onReady`     |

#### Returns

`React.RefObject<T | null>` — attach this to the target element.

---

### `<LiquidGlassProvider>`

Context provider for shared renderer configuration.

```tsx
import { LiquidGlassProvider, LiquidGlass } from 'liquidgl-react';

function App() {
  return (
    <LiquidGlassProvider snapshot=".main-content" resolution={1.5}>
      <LiquidGlass>Card 1</LiquidGlass>
      <LiquidGlass>Card 2</LiquidGlass>
    </LiquidGlassProvider>
  );
}
```

| Prop         | Type     | Default   | Description                                  |
| ------------ | -------- | --------- | -------------------------------------------- |
| `snapshot`   | `string` | `'body'`  | CSS selector for the element to snapshot      |
| `resolution` | `number` | `2.0`     | Snapshot resolution (0.1–3.0)                |
| `children`   | `ReactNode` | —      | Child components                              |

---

### `PRESETS`

Object of built-in preset configurations you can reference or extend.

```tsx
import { PRESETS } from 'liquidgl-react';

console.log(PRESETS.frost);
// { refraction: 0, bevelDepth: 0.035, bevelWidth: 0.119, frost: 0.9, shadow: true, specular: true }
```

| Preset    | Description                                       |
| --------- | ------------------------------------------------- |
| `default` | Balanced glass with subtle frost and specular      |
| `alien`   | Strong refraction + deep bevel — sci-fi aesthetic  |
| `pulse`   | Flat pane with wide bevel — ideal for UI pulses    |
| `frost`   | Soft diffused privacy-glass effect                 |
| `edge`    | Thin bevel with bright rim highlights              |

---

## Examples

### Glass Card

```tsx
<LiquidGlass
  preset="default"
  className="card"
  style={{
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    height: 300,
    borderRadius: 24,
    zIndex: 100,
  }}
>
  <div style={{ position: 'relative', zIndex: 3, padding: 24 }}>
    <h2>Glass Card</h2>
    <p>Beautiful refracted content</p>
  </div>
</LiquidGlass>
```

### Glass Button

```tsx
<LiquidGlass
  as="button"
  preset="edge"
  tilt
  tiltFactor={8}
  onClick={() => alert('Clicked!')}
  style={{
    position: 'fixed',
    bottom: 40,
    right: 40,
    padding: '16px 32px',
    borderRadius: 16,
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    zIndex: 100,
  }}
>
  <span style={{ position: 'relative', zIndex: 3 }}>Click Me</span>
</LiquidGlass>
```

### Glass Navigation Bar

```tsx
<LiquidGlass
  as="nav"
  frost={1}
  shadow
  style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    padding: '0 24px',
  }}
>
  <div style={{ position: 'relative', zIndex: 3, display: 'flex', gap: 24 }}>
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href="/contact">Contact</a>
  </div>
</LiquidGlass>
```

---

## Important Notes

- The glass effect element should have a **`position: fixed`** (or high z-index) to sit above the page content it refracts.
- Content inside the glass pane should have **`position: relative; z-index: 3`** to appear on top of the lens.
- **Border-radius** is automatically inherited — the refraction respects rounded corners.
- The **`snapshot`** defaults to `<body>`. For better performance on complex pages, snapshot a smaller container.
- The initial capture is **asynchronous**. The `onReady` callback fires when the glass is actually visible.
- The library uses a **shared WebGL canvas** — multiple `<LiquidGlass>` instances are efficient.

## SSR / Next.js

The package is fully SSR-safe:
- The `'use client'` directive is included in the built output
- The WebGL library is dynamically imported (never evaluated on the server)
- Components render their children normally during SSR — the glass effect activates on hydration

```tsx
// Works in Next.js App Router
import { LiquidGlass } from 'liquidgl-react';

export default function Page() {
  return (
    <LiquidGlass preset="frost">
      <p>Server-rendered content with client-side glass effect</p>
    </LiquidGlass>
  );
}
```

## TypeScript

All exports are fully typed. The polymorphic `as` prop provides complete type inference:

```tsx
// TypeScript knows this is a <button> — onClick, disabled, type etc. are available
<LiquidGlass as="button" onClick={(e) => {
  e.currentTarget; // HTMLButtonElement ✅
}} disabled>
  Submit
</LiquidGlass>
```

Import types directly:

```tsx
import type { LiquidGlassOptions, PresetName, LiquidGlassLens } from 'liquidgl-react';
```

## License

MIT © NaughtyDuk
