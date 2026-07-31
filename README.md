# Animated book-check loading screen (Expo)

## Install dependencies

```bash
npx expo install react-native-svg react-native-reanimated expo-splash-screen expo-font
```

If `react-native-reanimated` isn't already set up, add the babel plugin as the
**last** plugin in `babel.config.js`:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

Then restart Metro with cache clear:

```bash
npx expo start -c
```

## Files

- `AnimatedBookIcon.tsx` — the actual animated SVG icon (outline draws in →
  lines draw in staggered → checkmark draws in with a bounce → breathing
  pulse loop while data loads).
- `LoadingScreen.tsx` — wraps the icon on a full-screen dark background with
  the app name fading in underneath once the draw-in finishes.
- `App.example.tsx` — shows how to keep the **native** Expo splash screen
  (the plain logo one) up while fonts/data load, then swap to this animated
  screen, matching the flow from the earlier bug fix conversation.

## Customizing

- Colors: edit the `COLORS` object at the top of `AnimatedBookIcon.tsx`.
- Timing: all the `withDelay(ms, ...)` values in the `useEffect` control the
  sequencing — outline → spine → 3 lines → checkmark → breathing loop.
- Size: pass `size={...}` to `<AnimatedBookIcon />` (default 160).
- To stop the breathing loop (e.g. one-shot animation instead of a loading
  loop), pass `loop={false}`.

## Notes

- The SVG path data is a close hand-drawn approximation of your icon, not a
  pixel-exported trace. If you want an exact match, export the icon as SVG
  from your design tool and swap the `d="..."` values in
  `AnimatedBookIcon.tsx` — the animation logic works the same regardless of
  the exact path shapes, as long as `strokeDasharray`/`strokeDashoffset` stay
  driven by the shared values already wired up.
- `DASH_LENGTH` (1200) is set comfortably higher than any path's actual
  length — react-native-svg doesn't reliably expose `getTotalLength()` on
  native, so an oversized fixed value is the standard workaround.
