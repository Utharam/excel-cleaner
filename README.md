# SheetMonkey 🐒 — The Spreadsheet Cleaner & Forensic Ledger Sanitizer

A completely private, client-side browser application engineered for accountants and financial modelers to sanitize messy ERP exports, unformatted workbooks, and bank statements. Part of Utharam's spreadsheet zoo alongside [**LedgerDuck 🦆**](https://utharam.github.io/LedgerDuck/) and [**SheetHound 🐕**](https://sheethound.utharam.workers.dev/).

Built with a focus on data privacy, strict data typing, and forensic accounting hygiene, this tool processes everything directly in your browser. **Your financial data never leaves your machine.**

**[🔴 View Live Application](https://utharam.github.io/excel-cleaner/)**

---

## 🏛️ The 3-Pillar Accountant's Hygiene Matrix

1. **Text & Character Hygiene:**
   * **Purge ASCII 160 Web Spaces:** Strips non-breaking spaces (`&nbsp;` / `\u00A0`) injected by NetSuite, SAP, or QuickBooks table copy-pastes that break `=VLOOKUP()`.
   * **Trim Trailing & Excess Spaces:** Collapses multi-spaces and eliminates accidental whitespace.
   * **Normalize Line Breaks:** Flattens stray carriage returns and tabs that distort row formatting.
2. **Structural & Layout Hygiene:**
   * **Safe Nulls vs False Zeros:** Blank cells remain honest `null` rather than misleading `0.00` balances.
   * **Eliminate Ghost Blank Rows:** Removes phantom blank rows that break contiguous pivot ranges and Power Query ingestion.
   * **User-Guided Column Mapping:** Explicitly maps Date, Text, and Amount columns for zero-guessing precision.
3. **Numbers & Accounting Logic:**
   * **Coerce Text Numbers to Floats:** Strips currency prefixes (`$ / AED / €`) and commas from `'12,500.00`, outputting pure floats ready for `=SUM()`.
   * **Preserve GL Code Zeros:** Text account strings retain leading zeros (`004012`) without Excel truncating them to integers (`4012`).
   * **Standardize Dates:** Resolves mixed date formats into crisp `DD-MMM-YYYY` with US vs INTL precedence calibration.

---

## ⚡ Additional Superpowers

* **Dual Workflow Modes:**
  * **✨ Just Clean Up:** Instant standardization, zero extra columns, rapid sanitized export.
  * **⚡ Clean & Categorize (Rules):** Multi-condition rule evaluation with dynamic sideways remark columns.
* **Audit Reconciliation Ledger & CSV Log:**
  * Telemetry bar tracking cells sanitized, spaces purged, numbers coerced, and safe nulls preserved.
  * 1-click **Download Audit Log (.csv)** documenting every modified cell address, raw input, sanitized value, and forensic transformation applied.
* **Compound Multi-Condition Rules:**
  * **AND / OR Condition Gates:** Match multiple conditions across single or separate columns (e.g. `Particulars contains 'Etihad'` AND `Particulars contains 'Alex'`).
  * **Cross-Column Numeric Comparisons:** Filter by transaction amounts (e.g. `Particulars contains 'UBER TRIP'` AND `Debit > 100`).
  * **Negative Matching:** Supports "Does not contain" (e.g. `Particulars contains 'UBER TRIP'` AND `Particulars does not contain 'AED'`).
  * **Dynamic Sideways Remarks:** Populate multiple remark columns simultaneously (`Remark 1`, `Remark 2`, `Remark 3`) with first-match-wins per output column.
* **Zero-Backend Privacy:** 100% in-browser memory execution (WASM/JS). No servers, no telemetry, and no data leaks.

---

## 🛠️ Tech Stack

* **Framework:** Vue 3 (Composition API)
* **Build Tool:** Vite
* **State Management:** Pinia
* **Styling:** Tailwind CSS
* **Icons:** Lucide Icons (`lucide-vue-next`)
* **Data Processing:** SheetJS (`xlsx` Excel/CSV import and export)
* **Hosting:** GitHub Pages (`gh-pages`)

---

## 🚀 Local Development Setup

If you want to clone this repository and run it locally, follow these steps:

1. **Clone the repository**
   ```bash
   git clone https://github.com/Utharam/excel-cleaner.git
   ```

2. **Navigate to the project directory**
   ```bash
   cd excel-cleaner
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Run the local development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

### Deployment

This project uses the `gh-pages` package for easy deployment. To push the latest built code to the live site:

```bash
npm run deploy
```
*(Note: Ensure your `vite.config.js` has the `base: '/excel-cleaner/'` property set before deploying).*

---
*Created with care by [Utharam](https://utharam.github.io/) — part of the spreadsheet zoo alongside [LedgerDuck 🦆](https://utharam.github.io/LedgerDuck/) and [SheetHound 🐕](https://sheethound.utharam.workers.dev/).*