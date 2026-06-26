# PromptFlow Client

Frontend starter for the PromptFlow assignment.

## Tech Stack

- Next.js
- JavaScript
- Tailwind CSS

## Environment Variables

Create a local environment file from the example and use:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

For the live deployment, set:

```env
NEXT_PUBLIC_API_URL=https://programming-hero-assignment-10-serv-eta.vercel.app
```

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Project Structure

```text
src/
  app/
  assets/
  components/
    layout/
    shared/
    ui/
  data/
  hooks/
  lib/
  providers/
  styles/
```

## Notes

- Auth and protected API requests use `credentials: include`.
- Google OAuth depends on the backend cookie being set successfully before redirecting to Google.
- The frontend must use the production backend URL in `NEXT_PUBLIC_API_URL` when deployed.
