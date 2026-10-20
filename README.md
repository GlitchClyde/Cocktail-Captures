# Cocktail Capture

A photobooth-style web app. Take a photo with your webcam or upload one, and it lands inside a bar-themed frame.

## Features
- Live webcam preview with a 3-second countdown, or upload a photo
- **Edit each photo, Canva style:** zoom, move left/right and up/down (or just drag it), rotate, flip, and filters
- **Changeable bar background:** 5 bar themes, 6 animal prints (leopard, giraffe, panda, dalmatian, zebra, tiger), or your own background image
- Toggle the bar props (shelf, neon sign, counter) and edit the sign text
- Animated neon sign and drifting lights (respects reduced-motion settings)
- Retake, save to gallery, delete, download (PNG, 1080x1350)
- Font: Inter (loaded from Google Fonts; falls back to the system font offline)

Everything stays in your browser. Nothing is uploaded.

## Run it
Camera access needs `localhost` or `https`.

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

To host it free, enable GitHub Pages on the repo (Settings > Pages).

## Customize
- Bar themes: the `SCENES` list in `app.js`
- Animal prints: `patterns.js`
- Photo window size and position: `PX, PY, PW, PH` at the top of `app.js`
