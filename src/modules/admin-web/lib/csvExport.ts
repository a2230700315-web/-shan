/** Escape a single CSV field per RFC 4180-style rules */
export function escapeCsvCell(cell: string): string {
  if (cell.includes('"') || cell.includes(',') || cell.includes('\n') || cell.includes('\r')) {
    return `"${cell.replace(/"/g, '""')}"`
  }
  return cell
}

/** Build CSV text with CRLF row endings */
export function rowsToCsv(rows: string[][]): string {
  return rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n')
}

/** Trigger a browser download of a UTF-8 CSV file (BOM for Excel) */
export function downloadCsvFile(filename: string, rows: string[][]): void {
  const body = rowsToCsv(rows)
  const bom = '\uFEFF'
  const blob = new Blob([bom + body], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
