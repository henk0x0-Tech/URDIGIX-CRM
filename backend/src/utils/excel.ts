import ExcelJS from 'exceljs';

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExcelExportOptions {
  sheetName: string;
  columns: ExcelColumn[];
  data: Record<string, unknown>[];
  title?: string;
}

export async function generateExcel(options: ExcelExportOptions): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'URDIGIX ERP';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(options.sheetName);

  // Add title row if provided
  if (options.title) {
    const titleRow = worksheet.addRow([options.title]);
    titleRow.font = { size: 16, bold: true };
    titleRow.height = 30;
    worksheet.mergeCells(1, 1, 1, options.columns.length);
    worksheet.addRow([]);
  }

  // Set columns
  worksheet.columns = options.columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width || 20,
  }));

  // Style header row
  const headerRowNum = options.title ? 3 : 1;
  const headerRow = worksheet.getRow(headerRowNum);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A1A2E' },
    };
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // Add data rows
  options.data.forEach((row, index) => {
    const dataRow = worksheet.addRow(row);
    dataRow.eachCell((cell) => {
      cell.alignment = { vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
      };
      if (index % 2 === 0) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF9F9F9' },
        };
      }
    });
  });

  // Auto-filter
  if (options.data.length > 0) {
    worksheet.autoFilter = {
      from: { row: headerRowNum, column: 1 },
      to: { row: headerRowNum + options.data.length, column: options.columns.length },
    };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
