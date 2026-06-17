# PR Media Resizer

Resize screenshots and screen recordings for GitHub PRs. Default **800px max edge** matches iOS CI (`sips -Z 800` in `ui-test-report.sh`).

**Live app:** https://shanenoormohamed.github.io/screenshot-resize/

## For the team

### Supported files

- PNG, JPG — resized still images
- GIF — animated resize (keeps animation)
- MOV, MP4 — resize to MP4 **or** extract PNG frames

### How to use

1. Open the app URL above.
2. Drop one or more files.
3. Leave **GitHub PR (800px)** selected, or set a custom max edge.
4. For videos: choose **Resize video** or **Extract frames**.
5. Click **Process all**.
6. Download individual files or **Download all (.zip)**.

All processing runs in your browser — files are never uploaded.

## For developers

```bash
npm install
npm run dev
```

Open http://localhost:5173/

### Deploy

Pushes to `main` deploy via GitHub Actions. Enable Pages under **Settings → Pages → Source: GitHub Actions**.

If you rename the repo, update `base` in `vite.config.ts` to `/your-repo-name/`.
