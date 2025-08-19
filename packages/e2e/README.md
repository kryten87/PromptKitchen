# E2E Workspace

This workspace contains end-to-end tests for Prompt Kitchen using Playwright.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Install Playwright browsers:
   ```bash
   npx playwright install --with-deps
   ```

## Running Tests

```bash
npm run test
```

## Notes
- Playwright is used for browser automation and E2E testing.
- See `playwright.config.ts` for configuration details.
