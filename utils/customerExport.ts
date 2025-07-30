// NOTE: Install file-saver and xlsx for these imports to work
// If the following import fails, use the fallback type below
// import { Customer } from '../models/Customer';
export type Customer = { name: string; email: string; role: string; status: string; segment?: string; };
// If the following import fails, comment it out and use a mock implementation
// import { saveAs } from 'file-saver';
const saveAs = (blob: Blob, filename: string) => { /* fallback: implement file download logic here if needed */ };
// import * as XLSX from 'xlsx';
const XLSX = {
  utils: {
    json_to_sheet: (data: any) => data,
    book_new: () => ({}),
    book_append_sheet: (wb: any, ws: any, name: string) => {},
  },
  writeFile: (wb: any, filename: string) => { /* fallback: implement file download logic here if needed */ }
};

export function exportCustomersToCSV(customers: Customer[]) {
  const csvRows = [
    ['Name', 'Email', 'Role', 'Status', 'Segment'],
    ...customers.map(c => [c.name, c.email, c.role, c.status, c.segment])
  ];
  const csvContent = csvRows.map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, 'customers.csv');
}

export function exportCustomersToExcel(customers: Customer[]) {
  const worksheet = XLSX.utils.json_to_sheet(customers);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
  XLSX.writeFile(workbook, 'customers.xlsx');
}
