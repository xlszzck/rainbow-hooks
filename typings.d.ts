declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';

declare module 'rainbow-hooks' {
  export function useRequest(url: string, options: HeadersInit, other: any): Response;

  export interface InterceptorsOptions {
    headers?: IHeaders;
    method: 'GET' | 'POST' | 'DELETE' | 'PUT';
    params?: BodyInit | null | undefined;
    body?: BodyInit | null | undefined;
  }
}

type IHeaders = Headers | { Authorization: string } | { 'Content-Type': 'application/json; charset=utf-8' } | { Accept: 'application/json' };

// type IHeaders = {
//   Headers;
//   Authorization: string;
// };

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
