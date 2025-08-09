# Experiments Gallery

A modern web gallery for interactive experiments and mini-games, built with Next.js, TypeScript, and styled-components. Features include voting (Supabase), filtering, search, and dynamic experiment loading.

[![Vercel](https://vercelbadge.vercel.app/api/steven-d-pennington/experiments)](https://vercel.com/import/project?template=https://github.com/steven-d-pennington/experiments)

## Features

- Responsive gallery of creative coding experiments
- Voting system (Supabase backend)
- Tag filtering and search
- Dynamic experiment loading
- Modern theming (light/dark)
- Easy to add new experiments

## Getting Started

1. **Clone the repo:**
   ```sh
   git clone https://github.com/steven-d-pennington/experiments.git
   cd experiments
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env.local` and fill in your Supabase credentials.
4. **Run the dev server:**
   ```sh
   npm run dev
   ```
5. **Run tests:**
   ```sh
   npm test
   ```

## Deployment

This project is ready for [Vercel](https://vercel.com/) deployment. Just connect your GitHub repo and set the required environment variables in the Vercel dashboard.

## Adding Experiments

- Add a new experiment component in `src/experiments/`
- Register it in `src/experiments/registry.ts`
- Add a thumbnail to `public/thumbnails/`

## License

See [LICENSE](./LICENSE).
