# Recallify

Recallify turns pasted multiple-choice questions into timed study decks. It works in guest mode with browser storage, or with a free account for cross-device sync and deck sharing.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Enable accounts, sync, and sharing

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in its SQL Editor.
3. Copy the project URL and publishable key into `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

4. In Supabase Authentication URL Configuration, set the Site URL to the deployed Recallify URL and add the local development URL as an allowed redirect URL.
5. Restart the Vite development server.

Never put a Supabase secret or `service_role` key in a `VITE_` environment variable.

## Checks

```bash
npm test
npm run lint
npm run build
```

## Data behavior

- Guests keep decks in local browser storage.
- Signed-in users store decks in Supabase and can use them on other devices.
- Existing guest decks can be moved into an account from the Account dialog.
- Decks are private until their owner enables sharing.
- Shared links are read-only; signed-in recipients can save an independent copy.
