# MinELE 2026 — Mining & Environmental Laws and Ethics Reviewer — Final Offline Build

This build is designed to work as a static reviewer with no server or account required.

## Easiest way to use it
Use `MinELE_2026_Laws_Reviewer_FINAL.html`. It contains the CSS, legal data, questions, and JavaScript in a single file.

## Included modules
- Dashboard and progress
- Law Map
- Law/DAO Review
- Timeline
- Compare mode
- Standards & Parameters
- Numbers You Must Memorize
- Flashcards
- Quiz modes: Quick 10, 20, 50, Mining Laws, Environmental, Ethics, Hard, Mistakes
- Mock exams: 25, 50, 75, 100 (limited by verified question bank)
- Mistake Bank
- Bookmarks
- Global search
- Dark/light theme
- Local progress storage
- Export/import progress JSON

## Source-project files
`index.html`, `styles.css`, `data.js`, and `app.js` remain included for future editing.

## Updating questions
Add question objects to `DB.questions` in `data.js`, then rebuild the single-file version by inlining the updated files.

## Adding laws or DAOs
Add to `DB.laws` with the existing schema and cite the authoritative source URL.

## Accuracy rule
Do not add an exact numerical parameter, amendment status, or answer key without checking an authoritative source such as Lawphil, DENR/MGB/EMB, PRC, Official Gazette, or Supreme Court E-Library.
