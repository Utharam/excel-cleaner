import * as XLSX from 'xlsx'

/**
 * Generates an in-memory simulated dirty ERP export (.xlsx) representing
 * real-world failure modes from QuickBooks, NetSuite, and SAP exports:
 * - Hidden ASCII 160 (\u00A0) non-breaking spaces from web table copy-pastes
 * - Leading zeros on GL Account Codes ('004012', '001050') that Excel truncates to integers
 * - Text-formatted amounts with currency symbols and trailing spaces (e.g., " $1,240.50 ")
 * - Mixed date formats (YYYY-MM-DD, MM/DD/YYYY, DD-MMM-YYYY, 'Jan 12, 2026')
 * - Honest blanks that must be preserved as null rather than 0.00
 * - Multi-condition rule triggers (e.g. 'UBER TRIP AED 33.67', 'Etihad Airways, passenger Alex')
 */
export function generateDemoStatementFile() {
  // \u00A0 is ASCII 160 (Non-Breaking Space / &nbsp;)
  const nbs = '\u00A0'

  const data = [
    ['Date', 'Account Code', 'Particulars', 'Debit', 'Credit', 'Balance'],
    ['2026-01-05', '001050', `UBER${nbs}*TRIP${nbs}AED${nbs}33.67`, ' 33.67 ', '', '15,420.50'],
    ['08/01/2026', '006200', 'UBER EATS ORDER #8912', ' $18.25 ', '', '15,402.25'],
    ['Jan 12, 2026', '005100', `Etihad${nbs}Airways,${nbs}passenger${nbs}Alex`, ' 450.00 ', '', '14,952.25'],
    ['2026/01/15', '004012', 'AWS CLOUD HOSTING SERVICES', ' 1,240.50 ', '', '13,711.75'],
    ['18-01-2026', '001010', 'STRIPE PAYOUT SETTLEMENT REF 991', '', ' $4,500.00 ', '18,211.75'],
    ['2026-01-20', '006300', `STARBUCKS${nbs}STORE${nbs}#104${nbs}CAFE`, ' 6.75 ', '', '18,205.00'],
    ['22/01/2026', '001050', 'UBER TRIP GBP UK RIDE', ' 63.36 ', '', '18,141.64'],
    ['Jan 25, 2026', '002010', 'OFFICE DEPOT INVOICE SUPPLIES', ' 142.80 ', '', '17,998.84'],
    ['2026-01-28', '004012', 'GOOGLE WORKSPACE GSUITE', ' 36.00 ', '', '17,962.84'],
    ['30/01/2026', '007100', 'PAYROLL DIRECT DEPOSIT MONTHLY', ' 6,200.00 ', '', '11,762.84'],
    ['31-01-2026', '008050', 'BANK ACCOUNT MAINTENANCE FEE', ' 15.00 ', '', '11,747.84']
  ]

  const worksheet = XLSX.utils.aoa_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dirty_ERP_Export')

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  return new File([blob], 'dirty_erp_export_quickbooks.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
}
