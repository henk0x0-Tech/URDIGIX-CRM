import { Prisma } from '@prisma/client';

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function parsePagination(query: Record<string, unknown>): PaginationOptions {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  const sortBy = (query.sortBy as string) || 'createdAt';
  const sortOrder = (query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

  return { page, limit, sortBy, sortOrder };
}

export function buildPaginationResult(total: number, options: PaginationOptions): PaginationResult {
  return {
    page: options.page,
    limit: options.limit,
    total,
    totalPages: Math.ceil(total / options.limit),
  };
}

export function buildSkipTake(options: PaginationOptions): { skip: number; take: number } {
  return {
    skip: (options.page - 1) * options.limit,
    take: options.limit,
  };
}

export function buildOrderBy(sortBy: string, sortOrder: 'asc' | 'desc'): Record<string, string> {
  return { [sortBy]: sortOrder };
}

export function buildSearchFilter(
  search: string | undefined,
  fields: string[]
): Prisma.JsonObject | undefined {
  if (!search || search.trim() === '') return undefined;

  const searchTerm = search.trim();
  return {
    OR: fields.map((field) => ({
      [field]: { contains: searchTerm, mode: 'insensitive' },
    })),
  } as unknown as Prisma.JsonObject;
}

export function buildDateRangeFilter(
  dateFrom?: string,
  dateTo?: string,
  field: string = 'createdAt'
): Record<string, unknown> | undefined {
  if (!dateFrom && !dateTo) return undefined;

  const filter: Record<string, unknown> = {};
  if (dateFrom) filter.gte = new Date(dateFrom);
  if (dateTo) filter.lte = new Date(dateTo);

  return { [field]: filter };
}

export function excludeFields<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}
