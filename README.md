# OpenDevUtils

Essential developer utilities built with React + TypeScript. Available as a web app, a desktop app, and a Chrome extension.

**Quick start**

```sh
npm run dev           # Web dev server (port 8080)
npm run build         # Production web build
npm run test          # Playwright tests
npm run lint          # ESLint
npm run check         # Type check + build
```

## Web app

```sh
npm run dev
```

Web app: `http://localhost:8080`

## Desktop app (using Tauri)

Prereqs: Rust + platform toolchain.

```sh
npm run tauri:dev
npm run tauri:build
```

Build outputs: `src-tauri/target/release/bundle/`

## Chrome extension

```sh
npm run extension:prepare
```

Load:
1. Chrome → `chrome://extensions/`
2. Enable Developer Mode
3. Load unpacked → `dist-extension/`

Publish:
1. Zip `dist-extension/`
2. Upload to Chrome Web Store Developer Console

**Project layout**

```
src/        # Web + shared UI
src-tauri/  # Desktop app
extension/  # Extension manifest + icons
```

**CI / deploy**

- GitHub Actions runs build + tests on push/PR.
- Vercel deploys preview and production from `main`.

**Acknowledgments**

- Inspired by various developer utils collections
- Thanks to the open source community

**License**

[MIT License](LICENSE).
