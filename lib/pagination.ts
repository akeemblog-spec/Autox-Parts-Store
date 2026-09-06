export function parsePagination(params: { page?: string; limit?: string }, defaultLimit = 25, maxLimit = 100) {
  const page = Math.max(1, Number.parseInt(params.page || "1", 10) || 1);
  const requested = Number.parseInt(params.limit || String(defaultLimit), 10) || defaultLimit;
  const limit = Math.min(maxLimit, Math.max(10, requested));
  return { page, limit, offset: (page - 1) * limit };
}
