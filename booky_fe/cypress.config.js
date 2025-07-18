import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    video: false, // Disables video recording for tests
  },
});
