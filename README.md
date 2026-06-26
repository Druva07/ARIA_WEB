# ARIA Web

A sleek, minimalistic, dark-themed web version of the ARIA personal assistant, built with **Next.js**, **React**, and **MongoDB**.

## Features

- **Modern UI**: Dark-themed, glassmorphism aesthetics.
- **Intelligent Assistant**: Chat with ARIA powered by the `gemini-2.5-flash` model.
- **Task Extraction**: ARIA automatically extracts intents (e.g., "remind me to...") and saves them to a cloud database.
- **Cloud Database (MongoDB)**: Tasks are synced to MongoDB, allowing cross-device persistence.

*(Note: Unlike the desktop CLI version, this web app does not track your local Windows active windows or Chrome history due to browser sandbox security).*

## Deployment on Vercel

This project is configured to be deployed on Vercel with zero configuration.

### Prerequisites
1. A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free tier is fine). Create a cluster, get your connection string, and replace `<password>` with your actual password.
2. A [Google AI Studio](https://aistudio.google.com/) account to get your Gemini API Key.

### Steps
1. Push this folder to a GitHub repository.
2. Go to [Vercel.com](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. Open the **Environment Variables** tab before deploying and add:
   - `GEMINI_API_KEY`: Your Gemini API Key.
   - `MONGODB_URI`: Your MongoDB connection string.
5. Click **Deploy**.

## Local Development (Requires Node.js)

1. Create an `.env.local` file and add your `GEMINI_API_KEY` and `MONGODB_URI`.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open `http://localhost:3000` in your browser.
