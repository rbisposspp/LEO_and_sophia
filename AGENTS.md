# Repository Guidelines

## Project Structure & Module Organization
This project is a static, multi-page ESL web app.

- `index.html`: vocabulary contrasts with clickable images.
- `story.html`: 10-scene story with line-by-line audio controls.
- `grammar.html`: unscramble and quiz interactions.
- `about.html`: usage notes and credits.
- `css/`: shared and page-specific styles (`main.css`, `story.css`, `grammar.css`, `high-contrast.css`).
- `js/`: shared helpers (`common.js`) plus page-specific scripts.
- `images/`, `audio/`: media assets used by pages.

Keep page-specific logic/styles in matching files; place reusable behavior in `js/common.js` and shared styles in `css/main.css`.

## Build, Test, and Development Commands
No build pipeline is required; serve files locally for testing.

- `python -m http.server 5500`: run a local static server from this folder.
- Open `http://localhost:5500`: load the app and navigate via the top menu.

## Coding Style & Naming Conventions
- Use 4-space indentation in HTML, CSS, and JavaScript.
- Prefer `camelCase` for JavaScript variables/functions.
- Prefer single quotes in JavaScript (for new/edited code).
- Use descriptive, kebab-case CSS class/id names (for example, `story-line`, `audio-btn`).

## Testing Guidelines
Automated tests are not configured. Use manual verification for every change:

- Start local server and test all pages: `index.html`, `story.html`, `grammar.html`, `about.html`.
- Confirm audio playback works and image paths resolve.
- Validate responsive behavior on narrow/mobile widths.
- Check browser console for errors before submitting.

## Accessibility Checklist
Run this quick check before opening a PR:

- Verify keyboard navigation: top menu, buttons, quiz inputs, and audio controls are reachable with `Tab` and usable with `Enter`/`Space`.
- Ensure all meaningful images have clear `alt` text; decorative images should use empty `alt=""`.
- Confirm color contrast is readable; test with `css/high-contrast.css` where applicable.
- Check focus visibility on interactive elements (no hidden focus outlines).
- Confirm audio controls have clear purpose and do not autoplay unexpectedly.
- Re-test on mobile widths to ensure text remains readable and controls are not clipped.

## Commit & Pull Request Guidelines
- Use commit format: `type(scope): short summary` (example: `fix(grammar): validate empty answers`).
- Keep commits focused and small; avoid mixing style-only and behavior changes.
- PRs should include:
  - clear summary of user-visible changes,
  - reproduction/verification steps,
  - screenshots or short clips for UI changes,
  - linked issue/task when available.

## Security & Configuration Tips
- Do not hardcode secrets or API keys in HTML/JS.
- Keep this project static-friendly; avoid introducing external scripts unless necessary and reviewed.
