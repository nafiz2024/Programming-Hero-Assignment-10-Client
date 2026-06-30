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

For the live deployment, do not point the browser at the backend domain. Leave `NEXT_PUBLIC_API_URL` unset so the frontend uses its same-origin `/api` proxy.

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
- Production API requests go through the frontend domain via the `/api/:path*` rewrite proxy.
