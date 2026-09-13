# Production Deployment Guide

## 1. Render
- Create Web Service.
- Build Command: `npm run build`
- Start Command: `npm start`
- Use Dockerfile.

## 2. Vercel
- Import repo.
- Build Command: `npm run build`
- Output Directory: `dist`
- Add environment variables.

## 3. AWS (Elastic Beanstalk / ECS)
- Containerize with Docker.
- Set health check path `/health`.
- Add environment variables.

## 4. Common Steps
- Create `.env.example`.
- Run `npm install` in frontend and backend.
- Run `npm run build`.
- Verify 247 labs and learning features.