# Songwriting Notebook — Deploy Ready

This repository is structured at the root and includes a GitHub Actions workflow to deploy to **GitHub Pages**.

## Quick start (GitHub Pages)
1. Commit & push to `main`.
2. Ensure repository name is the same as set in `vite.config.js` `base` option (default `/Song-Notebook-App/`).
3. In GitHub repo: Settings → Pages → Source = GitHub Actions.
4. Check the Actions tab; when green, your app will be live at:
   `https://<username>.github.io/Song-Notebook-App/`

> If your repository name differs, edit `vite.config.js` to match it exactly.
