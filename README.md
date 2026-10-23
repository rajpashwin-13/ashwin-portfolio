# Ashwin Raj P — Portfolio

A responsive, accessible single-page portfolio built with plain HTML, CSS, and JavaScript. No dependency installation is required.

## Run locally

From this folder, run:

```powershell
npm start
```

Then open <http://localhost:4173>.

## Build for deployment

```powershell
npm run build
```

The deployable static site is written to `dist/`.

## Portfolio chatbot

The chat widget calls the Vercel Function at `/api/chat` and uses the Groq Chat Completions API with the OpenAI-compatible endpoint. To enable it after importing the repository into Vercel:

1. Create an API key in your GroqCloud account.
2. In the Vercel project, open **Settings → Environment Variables** and add `GROQ_API_KEY` with that key for Production (and Preview if you want it enabled in previews).
3. Redeploy the project so the function can read the variable.

Keep the key only in Vercel environment variables. Never place it in `script.js`, `index.html`, or a committed file. Groq API rate limits and any applicable pricing depend on your Groq plan. The chat can be previewed visually with `npm.cmd start`, but the AI reply requires the deployed Vercel Function and environment variable.
