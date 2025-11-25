export function logEvent(evt: string, data?: any) {
  if (import.meta.env.DEV) {
    console.info('[evt]', evt, data);
  }
  // In production, could send to analytics service
}

export function logError(err: any, ctx?: string) {
  if (import.meta.env.DEV) {
    console.error('[err]', ctx ?? '', err);
  }
  // In production, could send to error tracking service (e.g., Sentry)
}

export function logApiError(error: any, endpoint: string) {
  logError(error, `api_error: ${endpoint}`);
}