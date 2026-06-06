import { createObjectCsvStringifier } from 'csv-writer';

export interface CsvColumn {
  id: string;
  title: string;
}

export function generateCsv(columns: CsvColumn[], data: Record<string, unknown>[]): string {
  const csvStringifier = createObjectCsvStringifier({
    header: columns,
  });

  const header = csvStringifier.getHeaderString();
  const body = csvStringifier.stringifyRecords(data);

  return (header ?? '') + body;
}
