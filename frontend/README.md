# DSA Practice Tracker - Frontend

React frontend for the DSA Practice Tracker that syncs with GitHub repository.

## Features

- 📊 View all questions organized by topic
- ➕ Add new questions directly from the UI
- 📝 Add notes to questions
- 🔄 Real-time sync with GitHub README
- 🎨 Beautiful, modern UI

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## GitHub Integration

To use this app, you'll need:
- A GitHub Personal Access Token with `repo` scope
- Your GitHub username/organization name
- Repository name

The app will read and write to your repository's README.md file.

## Deployment

This app is configured for GitHub Pages deployment. The workflow will automatically deploy when you push to the `main` branch.

Make sure to:
1. Enable GitHub Pages in your repository settings
2. Set the source to "GitHub Actions"
3. The app will be available at: `https://<username>.github.io/dsa-practice-tracker/`

