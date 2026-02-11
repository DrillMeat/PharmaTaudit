# PharmaT Audit

## Architecture rationale
This project uses a static HTML/JS frontend with Vercel serverless functions to keep deployment simple and reliable while still enabling secure backend logic. Serverless endpoints scale on demand, reduce maintenance overhead, and allow each feature (auth, profiles, submissions, tasks) to be isolated into small, testable modules without a long‑running server.

Supabase is used via its REST API because it provides persistent, structured storage with a clear JSON interface and server‑side secrets, fitting the project’s need for users, profiles, task definitions, and submissions without adding a custom database layer. The REST approach aligns with the existing fetch‑based frontend and keeps network I/O consistent.

We avoid a monolithic hosted backend here because a single server would add operational complexity and cost for a small team, while serverless functions already cover the required functionality with less overhead.

