declare module 'rainbow-hooks' {
  export function useRequest(url: string, options: HeadersInit, other: any): Body.json | Body.text;

  export interface InterceptorsOptions {
    headers?: IHeaders;
    method: 'GET' | 'POST' | 'DELETE' | 'PUT';
    params?: BodyInit | null | undefined;
    body?: BodyInit | null | undefined;
  }
}

type IHeaders = Headers | { Authorization: string } | { 'Content-Type': 'application/json; charset=utf-8' } | { Accept: 'application/json' };

export interface InterceptorsOptions {
  headers?: IHeaders;
  method: 'GET' | 'POST' | 'DELETE' | 'PUT';
  params?: BodyInit | null | undefined;
  body?: BodyInit | null | undefined;
  showMessage?: boolean;
}

interface otherOptions {
  requestInterceptors: (url: string, options: InterceptorsOptions) => { url: string; options: InterceptorsOptions };
  responseInterceptors: (response: Response, options: InterceptorsOptions) => Response;
}
