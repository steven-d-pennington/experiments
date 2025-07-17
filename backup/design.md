
## Voting Feature Design

### Overview

- Users can upvote or downvote each experiment.
- Votes are stored in Supabase (Postgres) and fetched in real time.
- Each user can only vote once per experiment (tracked by device/session).
- Experiments are sorted by vote count in the gallery.

### Supabase Schema

**Table: experiment_votes**
- id: uuid (primary key)
- experiment_id: text (indexed)
- vote: integer (1 for upvote, -1 for downvote)
- user_id: text (nullable, for future auth)
- device_id: text (for anonymous voting, generated per device)
- created_at: timestamp

### API
- GET /votes?experiment_id=... → returns total votes and user vote
- POST /votes → upsert vote for experiment/device

### UI/UX
- Upvote/downvote buttons on each experiment card (with current count)
- Highlight user's vote
- Optimistic UI update on vote
- Error message if vote fails
- Sorting toggle: by votes or by newest 