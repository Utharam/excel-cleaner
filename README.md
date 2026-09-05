# SheetMonkey 🐒 — The Spreadsheet Grunt Work Engine

A completely private, client-side browser application designed to automate accounting reconciliation and clean messy bank statements. Part of Utharam's spreadsheet zoo alongside [**LedgerDuck 🦆**](https://utharam.github.io/LedgerDuck/) and [**SheetHound 🐕**](https://sheethound.utharam.workers.dev/).

Built with a focus on data privacy, strict data typing, and ease of use, this tool processes everything directly in your browser. **Your financial data never leaves your machine.**

**[🔴 View Live Application](https://utharam.github.io/excel-cleaner/)**

---

* **Dual Workflow Modes:**
  * **✨ Just Clean Up:** Quickly standardizes dates (DD-MMM-YYYY), converts text-as-number to true floats, trims whitespace, and preserves blanks as nulls — zero rules evaluated, no extra remark columns, instant clean export.
  * **⚡ Clean & Categorize (Rules):** Full multi-condition rule evaluation, categorization rate tracking, dynamic sideways remark columns, and sample categorization preview.
* **Compound Multi-Condition Rule Engine:**
  * **AND / OR Condition Gates:** Match multiple conditions across single or separate columns (e.g. `Particulars contains 'Etihad'` AND `Particulars contains 'Alex'`).
  * **Cross-Column Numeric Comparisons:** Filter by transaction amounts (e.g. `Particulars contains 'UBER TRIP'` AND `Debit > 100`).
  * **Negative Matching:** Supports "Does not contain" (e.g. `Particulars contains 'UBER TRIP'` AND `Particulars does not contain 'AED'`).
  * **Dynamic Sideways Remarks:** Populate multiple remark columns simultaneously (e.g., `Remark 1`, `Remark 2`, `Remark 3`) with first-match-wins per output column.
* **Zero-Backend Privacy:** 100% client-side processing. No servers, no databases, and no tracking. Your sensitive financial data remains completely offline.
* **Strict Data Handling:** Uses explicit user-mapped column types (Date, Text, Amount) instead of automated guessing to guarantee accounting accuracy.
* **"True Number" Formatting:** Automatically resolves the notorious Excel "Text-as-Number" bug, ensuring exported amounts are mathematically actionable.
* **Robust Date Parsing:** Standardizes varied and messy date formats into crisp `DD-MMM-YYYY` outputs.
* **Safe Null Handling:** Missing data is strictly treated as `null` rather than zero, preventing false accounting balances.

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