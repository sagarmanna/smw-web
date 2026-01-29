# Prompt: Generate QA Checklist for a Page

Use the prompt below when you want an AI (or a QA engineer) to create a QA checklist for a specific page. Replace the placeholders with your page details.

---

## Instructions for you (the requester)

1. **Copy the prompt block below** (from "You are..." to the end of the example table).
2. **Replace placeholders:**
   - `[PAGE_NAME]` → e.g. "Administrators Listing", "Items", "Students"
   - `[PAGE_URL]` → e.g. `https://dev2.studiomanagerweb.com/admin/v2/training-location/administrators`
   - `[APP_PATH]` → e.g. `src/app/[location]/administrators` (so the AI can inspect components)
3. **Paste** into your AI chat and run. Request output as a **.tsv file** for Google Sheets.
4. **Save** the generated content as `docs/qa/QA_CHECKLIST_[PAGE_NAME].tsv` (use a short slug for the page).

---

## The prompt (copy from here)

```
You are a Senior QA engineer.

Prepare a QA checklist for this page by inspecting the page and its components in the codebase.

**Page:** [PAGE_NAME]
**URL:** [PAGE_URL]
**Codebase path to inspect:** [APP_PATH] (listing client, table config, modals, hooks, and related components)

**Deliverable:** A single .tsv file (tab-separated values) suitable for Google Sheets. Use tabs between columns only; no pipe characters. Save as QA_CHECKLIST_[PAGE_SLUG].tsv.

**Required columns (exact headers):**
- ID (numeric: 1, 2, 3, …)
- Category (e.g. UI, Func, Error, Access)
- Test Case Description (short, action/observation)
- Expected Result (what should happen)
- Status (default: "Not Started")
- Notes/Bugs (empty by default)

**Format rules:**
- One row per test case; header row first.
- Do not use commas or tabs inside a cell (rephrase if needed).
- Status column must be "Not Started" for all new rows.
- Categories: use UI for layout/visibility, Func for actions/flows, Error for error handling, Access for permissions/navigation.

**Example (match this style):**

ID	Category	Test Case Description	Expected Result	Status	Notes/Bugs
1	UI	Table loads correctly	Data is aligned; no overlapping text.	Not Started	
2	UI	Page title and subtitle	Administrators and Manage system administrators are visible.	Not Started	
3	UI	Table columns visible	First Name, Last Name, Email columns are present.	Not Started	
4	Func	Add button opens modal	Clicking Add opens the form modal.	Not Started	

**What to do:**
1. List the route and main client component for the page.
2. From the code, identify: table/grid columns, buttons, filters, modals, forms, validation, pagination, sorting, export/print, row actions, error states, empty states.
3. Write test cases covering: page load, UI elements, each main action (add, edit, filter, sort, etc.), validation, errors, and edge cases.
4. Output the full checklist as TSV only (no markdown table, no code fence). First line = header; then one line per test case with tab separators.
```

---

## Comment summary (for your reference)

| Part | Purpose |
|------|--------|
| **Role** | "Senior QA engineer" sets context so the AI thinks in test cases and coverage. |
| **Inspect page + components** | Ensures the checklist is based on real UI (table, modals, buttons) not guesswork. |
| **TSV + Google Sheets** | Tab-separated = paste/import into Sheets without splitting columns wrong. |
| **Exact column names** | ID, Category, Test Case Description, Expected Result, Status, Notes/Bugs — so every checklist matches your template. |
| **Status = "Not Started"** | Same default for all rows; you change to Pass/Fail when running tests. |
| **No commas/tabs in cells** | Keeps one cell per column when pasted into Sheets. |
| **Example rows** | Show the exact format (tabs, no pipes); the AI will mirror it. |
| **Categories (UI, Func, Error, Access)** | Keeps checklists consistent and easy to filter in Sheets. |
| **Output TSV only** | Ask for raw TSV so you can copy-paste or save as .tsv and import. |

After you get the TSV, create or overwrite `docs/qa/QA_CHECKLIST_[page_slug].tsv` and optionally add a short note in the same folder linking to it (e.g. in a README or in the main QA doc).
