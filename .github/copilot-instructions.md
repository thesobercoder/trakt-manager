# AI Coding Agent Instructions

Concise, codebase-specific guidance to be immediately productive. Focus on THESE patterns; don't add generic advice.

## Project Overview

Raycast extension: control a user's Trakt account (search, watchlist, history, up next, recommendations, episodes). All user-facing functionality is implemented as Raycast "commands" (one per top-level `.tsx` in `src/`). No tests. Strong runtime + compile-time typing via `zod` + `@ts-rest/core`.

## Key Files & Directories

- `package.json`: Raycast command registry + npm scripts (`dev`, `build`, `lint`, `check`, `publish`).
- `src/movies.tsx`, `src/shows.tsx`, `src/episodes.tsx`, `src/watchlist.tsx`, `src/up-next.tsx`, `src/history.tsx`, `src/recommendations.tsx`: Entry points (each default export = Raycast command component).
- `src/components/`: Reusable typed UI building blocks (`GenericGrid`, `GenericDetail`, specialized grids for episodes/seasons).
- `src/lib/`: Core platform + API layer:
  - `client.ts` (init authenticated Trakt client)
  - `contract.ts` (ts-rest contract definitions)
  - `schema.ts` (zod schemas + `withPagination` helper)
  - `oauth.ts` (PKCE OAuth setup)
  - `helper.ts` (file cache + URL & image helpers)
  - `detail-helpers.tsx` (markdown + metadata composition for detail views)
  - `constants.ts` (keys, base URLs, config like `APP_MAX_LISTENERS`).
- `src/tools/`: Non-UI tooling style commands (parallel pattern references) – mirror fetch/abort conventions.
- `assets/`: Fallback images (`poster.png`, `episode.png`).

## Core Architectural Patterns

1. Single source API client per render: `const traktClient = initTraktClient();` used directly—no global state container.
2. Data fetching via `useCachedPromise` with a higher-order function signature: `(searchText) => async (paginationOptions) => { ... }` returning `{ data, hasMore }`.
3. Pagination: Always increment `options.page + 1` (Raycast pages are 0-based; Trakt 1-based). Use `withPagination(response)` to read pagination headers and compute `hasMore`.
4. Request throttling & cancellation: `await setTimeout(100);` (or 100–200 ms) before network call, store an `AbortController` in `abortable.current`, call `abortable.current?.abort()` on new search text, pass `fetchOptions.signal`.
5. Listener cap: `setMaxListeners(APP_MAX_LISTENERS, abortable.current?.signal);` immediately after creating controller to avoid Node EventEmitter warnings.
6. Action side-effects (mutations) isolate the network call + toast in a reusable wrapper pattern: local `actionLoading` state gates spinner combined with primary loading.
7. Image selection: use helpers (`getPosterUrl`, `getScreenshotUrl`, `getBannerUrl`) that gracefully fall back to local asset filename.
8. URL construction centralized (`getTraktUrl`, `getIMDbUrl`)— ALWAYs pass slug defensively (slug may be undefined; helper guards and falls back to base URL).
9. Zod schemas define both structure and transformations (e.g., `z.coerce.number()` for header numbers); infer exported TypeScript types directly from them.
10. Responses validated at edges only (construction of `withPagination` + contract layer) — internal components trust typed data.

## Conventions & Gotchas

- Guards: Early return `{ data: [], hasMore: false }` when search text empty to suppress unnecessary API calls.
- `extended: "full,cloud9"` used for richer image data—maintain for new endpoints needing artwork.
- Always check `response.status === 200` before processing; otherwise return empty data shape.
- Keys in grids: `keyFn={(item, index) => \
`${item.movie.ids.trakt}-${index}`}` pattern; keep stable unique prefix from trakt ID.
- Do not introduce global state libraries; local React state + hook revalidation is intentional.
- Keep `keepPreviousData: true` to allow seamless pagination loading UX.
- Use toast styles: `Toast.Style.Success`/`Failure`; show user-friendly messages (existing strings form a pattern: "Movie added to watchlist").
- Timeout / cancellation: mutation actions reuse existing `abortable.current?.signal` but generally do not create a new controller.

## When Adding a New Command

1. Create `src/<name>.tsx` default export component.
2. Add matching entry in `package.json.commands` (name must match filename). Title/description follow imperative present tense ("Search X", "List Y").
3. Implement `useCachedPromise` fetcher with: empty input guard, throttle, abort logic, status check, `withPagination` usage.
4. Provide grid or list UI via `GenericGrid` (or specialized grid if episodes/seasons style needed). Supply `title`, `poster`, `keyFn`, `actions` callbacks.
5. For detail view: push `GenericDetail` passing `markdown` + `metadata` composer functions from `detail-helpers.tsx` or new ones consistent with existing naming (`create<Movie|Show|Episode>Markdown`).
6. Use existing image helpers and fallback asset filenames.

## Mutations (Watchlist / History etc.)

- Wrap low-level calls (e.g., `traktClient.movies.addMovieToWatchlist`) in `useCallback` returning a Promise; pass to a generic `handleAction` that sets `actionLoading` and shows toasts.
- For history additions include `watched_at: new Date().toISOString()` as shown in `addMovieToHistory`.

## Pagination Logic Example

```
const paginated = withPagination(response);
const hasMore = paginated.pagination["x-pagination-page"] < paginated.pagination["x-pagination-page-count"];
```

Preserve this comparison for consistency; headers already coerced to numbers by zod.

## OAuth & Auth Headers

- Auth handled implicitly by `initTraktClient()` + Raycast OAuth provider. Do NOT manually store tokens.
- New endpoints must be added to `contract.ts`; regenerate client usage accordingly.

## File Cache Usage

- Only simple line-based storage with `setFileCache(key, content)`; ensures final newline and replaces existing file. Do not append implicitly; explicit design is replace semantics.

## Tooling / Scripts

- Development: `npm run dev` launches Raycast develop mode (hot reload). Build with `npm run build`. Publish via `npm run publish`.
- Quality gates: `npm run lint`, `npm run fix-lint`, `npm run fmt`, `npm run check`. Run `check` before committing contract/schema changes.

## Adding API Data Shapes

- Extend or compose existing zod schemas (prefer `merge` / `.extend()` chaining). Use `z.coerce.number()` for numeric headers or query params.
- Export inferred types right after schema definition to keep colocated.

## Performance Notes

- Keep throttle delay small (100–200ms); larger values degrade search UX.
- Maintain `keepPreviousData: true` for smoother infinite scroll.
- Abort previous search before setting new `searchText`.

## PR Review Checklist (Implicit)

- Command file name matches `package.json` entry.
- Uses abort/throttle/pagination template.
- No new global state or unused dependencies.
- User feedback via toasts on all mutations and errors.
- Fallback images and defensive slug handling in URL helpers.

If any of these patterns are unclear or you need deeper examples (e.g., contract.ts structure), ask for clarification before diverging.
