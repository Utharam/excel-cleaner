import * as XLSX from 'xlsx'

/**
 * Generates an in-memory sample messy bank statement Excel workbook (.xlsx)
 * populated with real-world accounting scenarios:
 * - Mixed date formats (ISO YYYY-MM-DD, US MM/DD/YYYY, INTL DD/MM/YYYY, 'Jan 12, 2026')
 * - Text-formatted amounts with currency symbols and trailing/leading spaces (e.g., ' $18.25 ')
 * - Comma-separated strings (e.g., ' 1,240.00 ')
 * - Real merchant descriptions matching common categorization rules (Uber, Uber Eats, AWS, Stripe)
 * - True blanks for safe null handling
 */
export function generateDemoStatementFile() {
  const data = [
    ['Date', 'Particulars', 'Debit', 'Credit', 'Balance'],
    ['2026-01-05', 'UBER *TRIP 8492', '42.50', '', '15420.50'],
    ['08/01/2026', 'UBER EATS ORDER PENDING', ' $18.25 ', '', '15402.25'],
    ['Jan 12, 2026', 'AWS CLOUD SERVICES MONTHLY', ' 1,240.00 ', '', '14162.25'],
    ['2026/01/15', 'STRIPE PAYOUT REF 9941', '', ' $4,500.00 ', '18662.25'],
    ['18-01-2026', 'STARBUCKS STORE #104 CAFE', ' 6.75 ', '', '18655.50'],
    ['2026-01-20', 'CLIENT INVOICE #1048 PAYMENT', '', '3,800.00', '22455.50'],
    ['22/01/2026', 'OFFICE DEPOT SUPPLIES & PRINT', '89.40', '', '22366.10'],
    ['Jan 25, 2026', 'GOOGLE GSUITE WORKSPACE', ' 36.00 ', '', '22330.10'],
    ['2026-01-28', 'MONTHLY ACCOUNT MAINTENANCE FEE', '15.00', '', '22315.10'],
    ['30/01/2026', 'PAYROLL DIRECT DEPOSIT EXEC', '6,200.00', '', '16115.10']
  ]

  const worksheet = XLSX.utils.aoa_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bank_Statement_Jan')

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  return new File([blob], 'sample_messy_bank_statement.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
}
