// vite.config.js
export default {
    build: {
      lib: {
        entry: 'main.js',
        name: 'firebaseBundle',
        fileName: 'firebase-bundle',
        formats: ['iife'] // build a self-executing browser-ready bundle
      },
      rollupOptions: {
        output: {
          globals: {
            firebase: 'firebase'
          }
        }
      }
    }
  }
  