declare module 'cors' {
  import type { RequestHandler } from 'express';

  export interface CorsOptions {
    origin?:
      | boolean
      | string
      | RegExp
      | Array<boolean | string | RegExp>
      | ((
          origin: string | undefined,
          callback: (err: Error | null, allow?: boolean) => void,
        ) => void);
    credentials?: boolean;
    methods?: string | string[];
    allowedHeaders?: string | string[];
    optionsSuccessStatus?: number;
  }

  function cors(options?: CorsOptions): RequestHandler;

  export default cors;
}
