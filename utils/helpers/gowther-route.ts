// Exact relative paths only: never attach the session to arbitrary URLs.
export function isGowtherRoute(path?: string): boolean {
  return (
    path === '/v1/session' ||
    path === '/v1/statistics/periods' ||
    /^\/v1\/statistics\/questionnaires\/[a-f0-9]{24}$/.test(path || '')
  )
}
