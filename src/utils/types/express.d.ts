declare namespace Express {
  export interface Response {
    respond: (data: unknown, statusCode?: number) => void
  }
}
