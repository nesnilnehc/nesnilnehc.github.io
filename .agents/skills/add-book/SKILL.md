---
name: add-book
description: Add books to the nesnilnehc.github.io Jekyll books page. Use when the user asks to add books, authors, editions, ISBNs, or book metadata to `_data/books.yml` for the personal site.
---

# Add Book

## Overview

Add one or more books to the personal site's `_data/books.yml` using verified bibliographic metadata and the existing schema. Keep changes focused on book data and necessary name dictionary entries unless the user requests layout or styling changes.

## Workflow

1. Confirm the repository and branch with `git status --short --branch`; preserve unrelated edits.
2. Read `_data/books.yml`, `_pages/books.md`, the book validation rules in `script/validate_content.rb`, and `_data/person_names.yml` before editing. Read `_data/group_names.yml` if a credit belongs to an organization. Treat these current files as authoritative for schema and name rendering.
3. Identify the requested work and edition. Use the user's ISBN, publisher, translator, language, or edition details when provided. Verify missing metadata through current publisher catalogs, library records, or reliable bookseller listings. Distinguish the work's original publication from the selected Chinese edition.
4. Check for an existing entry using title variants, authors, and ISBN. For the same work and edition, increment `count` instead of adding a duplicate. Do not merge distinct works just because their titles match. When a different edition is explicitly requested, preserve its distinct bibliographic details; if a consequential edition choice remains ambiguous, ask a focused question.
5. Add a YAML list item with the current fields:
   - `chinese_title`
   - `original_title`
   - `count: 1`
   - `authors` (array)
   - `translators` (array, when applicable)
   - `category`
   - `tags` (array)
   - `original_publish_date`
   - `chinese_publish_date` (when verified and applicable)
   - `publisher`
   - `isbn`
   - `source_url`
   - `note`
6. Reuse stable name dictionary keys for authors and translators. Add verified missing people to `_data/person_names.yml` following its current conventions; all book credits must resolve to the person or group dictionary. Keep alternate names and display forms in the dictionary, not in composite keys such as `English Name（中文名）`.
7. Run `make validate build` from the repository root using the Ruby setup in `README.md`. Report any check blocked by a missing prerequisite.
8. Report changed files, validation results, metadata sources, and any unresolved assumptions. Do not commit or push unless authorized.

## Metadata Choices

- Keep `chinese_title` as the published Chinese title and `original_title` as the original-language title, including a subtitle when supported by the source. For a Chinese original, both may be identical. Do not invent a Chinese translation to satisfy a required field.
- Keep publisher, ISBN, translators, and Chinese publication date tied to the same edition. Do not combine metadata from different translations, revised editions, bindings, or electronic editions.
- Use the work's first original publication date for `original_publish_date`, not the selected translation's date or a later reprint. Revised works may need a version distinction; verify rather than silently substituting dates.
- Quote ISBNs as strings to preserve leading zeros. Quote publication dates and preserve the precision supported by the source and current renderer. Do not invent January 1 or the first day of a month when only a year or month is known.
- Use `source_url` for a stable bibliographic page supporting the selected edition, preferably a publisher or library record. Cross-check original publication separately when needed and include that source in the response.
- Prefer existing categories and compact topic tags that improve filtering. Avoid tags that merely repeat a title or person's name; follow the site's existing category/tag overlap conventions.
- The current validator requires Chinese and original titles, count, authors, category, tags, original publication date, publisher, ISBN, source URL, and note; `note` may be empty. If required metadata cannot be verified, explain the gap and request the missing edition detail rather than inventing data or changing the validator.

## Note Policy

`note` is an objective fact supplement, not a review or recommendation.

- Add only verified, non-redundant facts, such as a central model, adaptation source, or edition distinction not already captured elsewhere.
- Do not repeat titles, names, dates, publisher, ISBN, category, tags, or the source link.
- Avoid subjective claims about quality, impact, emotional effect, suitability, or why the book is worth reading. Do not copy publisher marketing text or long book excerpts.
- If no additional reliable fact is needed, use `note: ""`.

## Avoid Repeating These Mistakes

- Do not use the Chinese edition's publication date as the original publication date.
- Do not attach one edition's ISBN to another edition's publisher or translators.
- Do not create duplicate entries when the request repeats an existing book.
- Do not write display strings directly into author or translator keys or omit the required dictionary mapping.
- Do not invent dates, translated titles, ISBNs, or bibliographic URLs to make validation pass.
