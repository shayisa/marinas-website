# Suara Sayang - Digital Archive

This project is a high-fidelity digital archive of Malaysian musical history, based on the research of Marina Tan.

## 🚀 Deployment Standards

To ensure the website remains functional and visually intact across all future updates, follow these guidelines:

### 1. The "Public Folder" Rule (Crucial)
**Any asset (image, PDF, etc.) that is referenced as a string in JavaScript (e.g., in `src/data/songs.js`) MUST be placed in the `/public` directory.**

*   **Correct**: `image: "images/song1.png"` (File is in `/public/images/song1.png`)
*   **Incorrect**: `image: "assets/images/song1.png"`

**Why?** Vite (the build tool) hashes and moves files in the `src/assets` folder during production. This breaks string references. Files in the `/public` folder are copied to the root of the website exactly as-is, preserving their paths.

### 2. Local Verification Workflow
Before pushing any changes to GitHub, always run these commands to verify the production environment:
```bash
npm run build    # Generates the 'dist' folder
npm run preview  # Starts a local server using the production files
```
If the images work in `preview`, they will work on GitHub.

### 3. Automated CI/CD
The project uses GitHub Actions (`.github/workflows/deploy.yml`). 
*   **Trigger**: Any push to the `main` branch.
*   **Action**: Automatically builds the project and deploys it to the `gh-pages` branch.

## 📂 Project Structure
*   `index.html`: Main entry point and landing page structure.
*   `style.css`: All styling, following the "Editorial Noir" design language.
*   `src/data/songs.js`: The authoritative database of 32 songs and their metadata.
*   `src/js/main.js`: Interactive logic for the carousel, chronicle, and modal.
*   `public/images`: All archival images and thumbnails.
