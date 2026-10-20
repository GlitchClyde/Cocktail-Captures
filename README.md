# Cocktail Capture

A photobooth-style web app. Take a photo with your webcam or upload one, and it lands inside a bar-themed frame.

## Features
- **Photo strip:** take 3 photos in a row (3-second countdown each) on a classic booth-style strip, or switch to Single photo
- Retake one photo or the whole strip, and upload 1-3 photos instead of using the camera
- **Edit each photo, Canva style:** zoom, move left/right and up/down (or just drag it), rotate, flip, and filters
- **Changeable bar background:** 5 bar themes, 6 animal prints (leopard, giraffe, panda, dalmatian, zebra, tiger), or your own background image
- Toggle the bar props (shelf, neon sign, counter) and edit the sign text
- Animated neon sign and drifting lights (respects reduced-motion settings)
- Retake, save to gallery, delete, download (PNG; strip is 720x1900, single is 1080x1350)
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
- Layouts (canvas size and photo windows): the `MODES` list at the top of `app.js`
