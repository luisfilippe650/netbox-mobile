# Portuguese and English implementation plan

Goal: Add Linguagens to the home menu and switch all application UI between Portuguese and English without reloading.

Architecture: English is the default when no preference is saved. A central translation catalog and a small React language store using localStorage. Translate at rendering boundaries; keep API payloads, identifiers, status values, user-entered content, and CSS class names unchanged. React subscriptions update the existing screen and document language.

- [x] Test translation, language persistence, interpolation and switching.
- [x] Add the language store, complete Portuguese/English catalog, and accessible language dialog.
- [x] Migrate visible text, labels, placeholders, accessibility text, and errors across every screen; preserve NetBox data.
- [x] Verify switching, existing functionality, lint and development build.

Validation: 87 tests across 24 files passed, lint passed, TypeScript and development build passed.
