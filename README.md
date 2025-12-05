<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1moLFr1cwG3FVjsf0PGWmNTIf9b8vx_-M

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Run with Docker

**Prerequisites:** Docker and Docker Compose

### Development Mode

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Set your `GEMINI_API_KEY` in `.env.local`

3. Run the development container:
   ```bash
   docker compose up app-dev
   ```

4. Access the app at http://localhost:3000

### Production Mode

1. Build and run the production container:
   ```bash
   docker compose up app-prod
   ```

2. Access the app at http://localhost:3000

### Docker Commands

- Build the Docker image:
  ```bash
  docker build -t project-planner .
  ```

- Run development container:
  ```bash
  docker compose up app-dev
  ```

- Run production container:
  ```bash
  docker compose up app-prod
  ```

- Stop containers:
  ```bash
  docker compose down
  ```

- Rebuild containers:
  ```bash
  docker compose up --build
  ```
