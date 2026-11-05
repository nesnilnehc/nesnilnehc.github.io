---
name: add-music
description: Add songs to the nesnilnehc.github.io Jekyll music page. Use when the user asks to add music, songs, tracks, artists, albums, listening links, or music metadata to `_data/music.yml` for the personal site.
---

# Add Music

## Overview

Add one or more tracks to the personal site's `_data/music.yml` file using verified metadata and the existing schema. Keep the change focused on music data and necessary credit dictionary entries unless the user explicitly asks for layout or styling changes.

## Workflow

1. Confirm the repository and branch with `git status --short --branch`. Preserve unrelated edits.
2. Read the music rules in `docs/CONTENT_RULES.md` and `script/validate_content.rb`, then check `_data/music.yml`, `_data/music_taxonomy.yml`, `_data/person_names.yml`, `_data/group_names.yml`, and `_pages/music.md` for the current schema and rendering behavior.
3. Verify song metadata with current web sources when the user gives only title/artist, especially for release dates, original titles, album names, and streaming links.
4. Match existing tracks by title, performer, and recording before adding a new item. For a new track, follow the current schema:
   - `id` (a stable page anchor)
   - `title`
   - `count: 1`
   - `original_title`
   - `artist`
   - `artists`
   - `lyricists` and `composers` (when verified)
   - `release_title`
   - `date`
   - `date_label`
   - `languages` (a non-empty array), `primary_genre`, `genres`, and `tags` (arrays for the latter two)
   - `note`
   - `listen_links`
5. Preserve the existing style:
   - Store individual credit keys in `artists` and set `artist` to those same keys joined with `; `.
   - For an existing track request, increment `count` instead of adding a duplicate entry.
   - Keep `title` and `original_title` aligned with the actual song title used for the requested version. Do not put a platform-localized title such as an Apple Music English display into `original_title` when the song is known and requested by its Chinese title.
   - Use stable person or group dictionary keys for all credits. For non-Chinese artists, check whether a Chinese name is established in reliable sources. Record verified alternate names in the appropriate dictionary and keep the same stable keys in the track data.
   - Prefer platform links to the original recording, not karaoke, cover, or live versions unless requested.
   - Do not add lyrics.
   - Use `note` only for objective facts that are not already expressed by other fields; otherwise set `note: ""`.
6. Run `make validate build` from the repository root using the Ruby setup in `README.md`. Report any check blocked by a missing prerequisite.
7. Report changed files, validation results, metadata sources, and any unresolved assumptions. Commit or push only when authorized.

## Metadata Choices

Use `date_label: "数字发行"` for digital song or album release dates. Use `date_label: "专辑发行"` when the source clearly refers to a full album release and the entry is album-oriented.

Use the keys in the taxonomy for languages, the primary genre, optional styles, and tags. Use empty arrays for `genres` and `tags` when none apply. Keep the primary genre out of `genres`. Add a taxonomy key only when it improves filtering and fits the project conventions. Avoid tags that repeat the title, artist, release title, or other fields.

For Korean songs, set `original_title` to the Korean title and use the Chinese or English title in `title` when helpful. If the commonly used title is English, keep `title` English and include the Korean form in `original_title`.

## Avoid Repeating These Mistakes

- Do not add a title-derived tag such as `time` for a song named `还给时间`.
- Do not use parenthesized composite artist keys such as `小霞（黄绮珊）`; use `小霞` in music data and put 黄绮珊 in `person_names.yml`.
- Do not treat platform localization as the canonical title. If the requested song is 《我的美丽》 and Apple Music shows `My Beauty`, keep `title` and `original_title` as `我的美丽` unless there is reliable evidence the work's canonical title is English.
- Do not write uncertain infringement claims such as plagiarism into `note`; only record externally verified, objective facts.

## Note Policy

`note` is an objective fact supplement, not a review, recommendation, or personal impression.

- Do not repeat fields already present in the entry: `title`, `original_title`, `artist`, `artists`, `release_title`, `release_context`, `date`, `date_label`, `tags`, or `listen_links`.
- Write a note only when it adds a reliable non-redundant fact, such as a member identity, source folk song, adaptation source, version distinction, soundtrack context not already in `release_title`, or other release background not captured elsewhere.
- If the only available fact is already represented by another field, use `note: ""`.
- Avoid subjective or evaluative wording, including claims about mood, quality, impact, suitability, emotional effect, or why the song is worth keeping.
