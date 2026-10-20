# Cocktail Capture

A photobooth-style web app. Take a photo with your webcam or upload one, and it lands inside a bar-themed frame (shelf of bottles, neon sign, wooden counter).

## Features
- Live webcam preview inside the frame, with a 3-second countdown
- Upload an existing image instead of using the camera
- Retake, save to the gallery, delete, and download (PNG, 1080x1350)
- Gallery is kept in your browser (localStorage). Nothing is uploaded anywhere.

## Run it
Camera access needs `localhost` or `https`.

```bash
cd cocktail-capture
python3 -m http.server 8000
# open http://localhost:8000
```

To host it free, enable GitHub Pages on the repo (Settings > Pages).

## Change the frame
The frame is drawn in code: edit `buildBar()` in `app.js`. Photo window size and position are the constants at the top (`PX, PY, PW, PH`).
