export function isGowtherDemoRoute(path?: string): boolean {
  return /^\/v1\/demos\/questionnaires\/(?!0{24}(?:$|\/))[a-f0-9]{24}(?:\/(?:jobs|cancel|report))?$/.test(
    path || '',
  )
}

// Exact relative paths only: never attach the session to arbitrary URLs.
export function isGowtherRoute(path?: string): boolean {
  return (
    isGowtherDemoRoute(path) ||
    path === '/v1/session' ||
    path === '/v1/statistics/periods' ||
    /^\/v1\/statistics\/questionnaires\/[a-f0-9]{24}$/.test(path || '')
  )
}
