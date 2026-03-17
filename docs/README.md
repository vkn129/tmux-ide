# Docs

This is the documentation app for `tmux-ide`. It is a Next.js site built with Fumadocs and published as the project docs surface.

## Commands

```bash
pnpm install --frozen-lockfile
pnpm docs
pnpm docs:build
```

Open the local site at `http://localhost:3000` after starting `pnpm docs`.

## Maintenance Notes

- Content pages live under `content/docs/`.
- The docs navigation is defined in `content/docs/meta.json`.
- Root-level `pnpm docs:build` delegates to this app's production build and is part of the release check path.
- Keep docs changes aligned with CLI behavior changes in the main package.

## Explore

In the project, you can see:

- `lib/source.ts`: Code for content source adapter, [`loader()`](https://fumadocs.dev/docs/headless/source-api) provides the interface to access your content.
- `lib/layout.shared.tsx`: Shared options for layouts, optional but preferred to keep.

| Route                     | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `app/(home)`              | The route group for your landing page and other pages. |
| `app/docs`                | The documentation layout and pages.                    |
| `app/api/search/route.ts` | The Route Handler for search.                          |

### Fumadocs MDX

A `source.config.ts` config file is included for frontmatter and content-source behavior.

Read the [Introduction](https://fumadocs.dev/docs/mdx) for further details.
