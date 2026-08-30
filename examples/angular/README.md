# Ayle Angular example

This is the canonical Angular example page for Ayle.

It contains four live variants on one page:

- minimal-video
- minimal-audio
- full-video
- full-audio

Each card shows its Angular template directly below the live player. The complete Player configuration objects are in `src/app/app.component.ts`.

Copy `proxy.conf.example.json` to `proxy.conf.json` and point it at the backend that serves the example metadata/track endpoints, then run `npm start`.