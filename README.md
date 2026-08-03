# Excel Cleaner & Reconciliation Engine

A completely private, client-side browser application designed to automate accounting reconciliation and clean messy bank statements. 

Built with a focus on data privacy, strict data typing, and ease of use, this tool processes everything directly in your browser. **Your financial data never leaves your machine.**

**[🔴 View Live Application](https://utharam.github.io/excel-cleaner/)**

---

## ✨ Key Features

* **Zero-Backend Privacy:** 100% client-side processing. No servers, no databases, and no tracking. Your sensitive financial data remains completely offline.
* **Smart Rule Engine:** Features a customizable "first-match-wins" profile-based rule engine to automatically categorize and reconcile transactions.
* **Strict Data Handling:** Uses explicit user-mapped column types (Date, Text, Amount) instead of automated guessing to guarantee accounting accuracy.
* **"True Number" Formatting:** Automatically resolves the notorious Excel "Text-as-Number" bug, ensuring exported amounts are mathematically actionable.
* **Robust Date Parsing:** Built-in fallbacks capable of parsing diverse and messy date formats (e.g., "Jan 22, 2026") into standardized outputs.
* **Safe Null Handling:** Missing data is strictly treated as "Null" rather than zero, preventing false accounting balances.
* **In-App Onboarding:** Includes a "Quick Start" help modal for immediate user onboarding with zero learning curve.

---

## 🛠️ Tech Stack

* **Framework:** Vue 3
* **Build Tool:** Vite
* **State Management:** Pinia
* **Styling:** Tailwind CSS
* **Data Processing:** SheetJS (Excel/CSV import and export)
* **Hosting:** GitHub Pages (`gh-pages`)

---

## 🚀 Local Development Setup

If you want to clone this repository and run it locally, follow these steps:

1. **Clone the repository**
   ```bash
   git clone [https://github.com/Utharam/excel-cleaner.git](https://github.com/Utharam/excel-cleaner.git)
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

## 🗺️ Roadmap (Version 2.0)

While the core reconciliation engine is fully functional, future updates will focus on advanced filtering capabilities:
* **Multi-Condition Rule Logic:** Implementation of AND/OR gates within the rule engine to allow for highly complex transaction categorization.

---
*Architected and developed as a custom solution for streamlined, secure accounting workflows.*