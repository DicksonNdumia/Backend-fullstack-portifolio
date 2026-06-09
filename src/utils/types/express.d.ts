declare namespace Express {
  export interface Response {
    respond: (data: any, statusCode?: number) => void
  }
}
