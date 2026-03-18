import { defineConfig } from 'vite';

export default defineConfig({
  // Set base to './' for relative asset paths in GitHub Pages
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure the build handles the assets folder correctly
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
});
