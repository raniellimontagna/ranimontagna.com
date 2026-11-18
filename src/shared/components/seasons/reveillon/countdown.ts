/** Local midnight that opens the year after the edition: 1 January of `edition + 1`. */
export function midnightOf(edition: number): Date {
  return new Date(edition + 1, 0, 1)
}
