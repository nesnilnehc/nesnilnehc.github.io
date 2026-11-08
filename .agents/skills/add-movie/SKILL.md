---
name: add-movie
description: Add films, TV series, documentaries, animation series, and variety shows to the nesnilnehc.github.io personal site's `_data/movies.yml`. Use when the user asks to add movies, shows, viewing links, posters, or screen-work metadata to that collection.
---

# Add Movie

Add requested screen works using verified metadata and the site's current schema. Keep changes focused on collection data, necessary name mappings, and posters unless broader changes are requested.

## Workflow

1. Locate the personal-site repository; do not assume the current directory is it. Read its `AGENTS.md`, `docs/CONTENT_RULES.md`, and poster rules in `CLAUDE.md`. Check `git status --short --branch` and preserve unrelated edits. If a repository-local `add-movie` skill exists, use it as authoritative.
2. Read `_data/movies.yml`, `_data/movie_types.yml`, `_pages/movies.md`, `_includes/movie-premiere.html`, movie validation in `script/validate_content.rb`, and `_data/person_names.yml`. Read `_data/group_names.yml` for organizational credits. These current files govern fields, date rendering, types, and name mapping.
3. Identify the exact work using title variants, year, creators, and IMDb ID. Distinguish remakes, sequels, films versus series, and explicitly requested seasons. Search existing entries before adding one. Increment `count` for the same work instead of duplicating it; do not collapse distinct works sharing a title. Ask only when an unresolved identity or season distinction materially affects the entry.
4. Verify missing metadata with current web sources. Prefer official production/distribution/broadcaster pages, festival programs, and award organizers; use IMDb and reliable film catalogs for identity and cross-checks. Record sources in the response rather than inventing unsupported YAML fields.
5. Add the entry using the fields below and the existing YAML style. Reuse stable person/group dictionary keys for all creators and cast, adding verified missing mappings according to dictionary conventions. Keep alternate names in dictionaries rather than composite display keys. Actively verify established Chinese names for non-Chinese credits and store reliable forms in `chinese_name`. Set `display_name` to the distinct romanized, original-script, and Chinese forms joined by ` · `, following existing dictionary entries; do not let a romanized-only display hide verified original or Chinese names. If a Chinese name is uncertain, retain verified forms and report the gap instead of inventing one.
6. Obtain a matching official poster according to `CLAUDE.md`: prefer the original release region/language, then Wikipedia infobox, TMDb, or Douban sources in that order. Save under `assets/images/movies/<kebab-case-slug>.<original-format>`. Actually view the downloaded image before referencing it; verify work, version, and image content rather than trusting its filename. Do not generate a replacement official poster or use a still as one.
7. From the site root run:
   - `ruby script/validate_content.rb`
   - `RBENV_ROOT="$HOME/.rbenv" PATH="$HOME/.rbenv/shims:/opt/homebrew/bin:$PATH" bundle exec jekyll build`
   Check the affected rendered entry and poster, following the repository's UI verification requirements. Report any checks the environment prevents.
8. Report changed files, verification results, metadata sources, and unresolved gaps. Commit, push, or deploy only within the user's authorization.

## Fields and Metadata

- `original_title`: verified original-language title, not a platform-localized translation.
- `chinese_title`: established Chinese title when reliably available; do not invent translations.
- `count`: start at `1` for a new work. It represents cumulative likes, not an inferred viewing history.
- `type`: reuse `_data/movie_types.yml` keys. Current keys are `film`, `documentary`, `animation-series`, `tv-series`, and `variety`; confirm the current mapping before use.
- `director` for one creator, or `directors` as an array for multiple creators. The renderer prefers `directors`; do not leave conflicting values. Verify the actual credited role for non-film works rather than substituting a presenter or lead actor.
- `cast`: array of verified principal cast or appropriate credited participants, following comparable entries. Do not invent performers for a documentary without cast.
- `premiere_date` and `premiere_note`: distinguish festival premiere, theatrical release, broadcast premiere, and streaming release. Prefer the earliest verified public premiere for the selected work and identify its context. Preserve supported date precision; do not invent a month or day. Do not use a later regional release as the original premiere without explaining the scope.
- `imdb_url`: verified work-specific IMDb URL, not a search page or another adaptation's record.
- `poster`: root-relative path to the actual local poster. The current validator requires this existing file even when `poster_url` is used by the renderer; a remote URL alone does not satisfy it.
- `awards`: concise verified awards and nominations for this work, with event/edition and category. Keep wins distinct from nominations; do not borrow honors from source material, another season, or another work. Do not claim that no awards exist from a limited search; explain uncertain coverage and follow the site's convention for unverified awards.
- `tags`: compact filtering topics using existing vocabulary where useful. Do not repeat the type's Chinese label, title, or names.
- `note`: verified objective facts not already represented, such as adaptation source or version distinction. Use `note: ""` when none is needed. Avoid reviews, recommendations, plot summaries, and unsupported allegations.
- Optional `interview_url`: a verified relevant creator interview. Optional `watch_links`: array of `{label, url}` objects pointing to the requested work on legitimate viewing platforms. Use absolute HTTP/HTTPS URLs and do not imply verified regional availability from a catalog link alone.

The current required fields are `original_title`, `count`, `type`, `premiere_date`, `imdb_url`, `poster`, `awards`, `tags`, and `note`, plus a nonempty creator credit resolving to the person/group dictionary. Recheck the validator as the schema evolves. If required metadata or a poster cannot be verified, report the specific blocker and request necessary information; do not fabricate values or weaken validation.
