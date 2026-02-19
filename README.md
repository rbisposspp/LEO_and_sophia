# LOOK LIKE: Leo & Sofia (Multi-Page ESL App)

Static ESL learning app with multiple pages, shared navigation, images, audio, and grammar exercises.  
The project focuses on descriptive adjectives and basic `to be` question practice through a short story.

## Project Structure
- `index.html`: vocabulary contrasts with interactive image cards.
- `story.html`: 10-scene story with per-line audio playback controls.
- `grammar.html`: unscramble + quiz activities with instant feedback.
- `about.html`: app description and learning context.
- `css/`: shared and page-specific styles (`main.css`, `story.css`, `grammar.css`, `high-contrast.css`).
- `js/`: shared logic (`common.js`) and page scripts (`index.js`, `story.js`, `grammar.js`).
- `images/`, `audio/`: media assets used by pages.

## Run Locally
Serve this folder with a local static server (recommended because pages use CSP).

```powershell
python -m http.server 5500
```

Open: `http://localhost:5500`

## Features
- Responsive navigation menu for desktop/mobile.
- High-contrast accessibility mode (footer button).
- Keyboard support for interactive vocabulary cards (`Enter` and `Space`).
- Story audio playback with stable button state during rapid interactions.
- Grammar validation tuned for both simple and multi-keyword answers.

## Manual Test Checklist
1. Open all pages (`index`, `story`, `grammar`, `about`) and verify top navigation links.
2. Toggle **Accessibility** mode and confirm visual changes across pages.
3. On `story.html`, test play/pause, fast repeated clicks, and scene navigation.
4. On `grammar.html`, verify that partial answers are rejected when questions require multiple keywords.
5. Check browser console for runtime errors.

## Notes
- No build step or framework is required.
- No automated test suite is configured yet.
- Keep assets local (`images/`, `audio/`) and avoid external dependencies unless necessary.
