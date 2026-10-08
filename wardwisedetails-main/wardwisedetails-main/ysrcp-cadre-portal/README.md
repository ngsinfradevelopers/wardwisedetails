# YSRCP Cadre Portal

## Supabase setup

Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and
`VITE_SUPABASE_PUBLISHABLE_KEY` to the values from the Supabase project. The
project URL must be used as provided; do not replace a custom project URL with a
derived `*.supabase.co` URL.

Apply the SQL files in `supabase/migrations` to the project in filename order.
The portal requires the `cadre`, `wards`, `castes`, and `sub_castes` tables.
The migrations enable row-level security and permit authenticated portal users
to read and manage these records.

Create admin users in Supabase Authentication, then sign in to the portal.
Registration submissions and edits are saved to the `cadre` table.
