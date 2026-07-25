import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } from '../../config/constants';

export interface PaginationParams {
  cursor?: string;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    pagination: {
      has_more: boolean;
      next_cursor: string | null;
    };
  };
}

export function parsePagination(query: any): PaginationParams {
  const limit = Math.min(
    parseInt(query.limit) || PAGINATION_DEFAULT_LIMIT,
    PAGINATION_MAX_LIMIT
  );
  return { cursor: query.cursor, limit };
}

export function encodeCursor(data: object): string {
  return Buffer.from(JSON.stringify(data)).toString('base64');
}

export function decodeCursor(cursor: string): any {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}
