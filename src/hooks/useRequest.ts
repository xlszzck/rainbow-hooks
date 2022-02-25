// import hash from 'hash.js';
import { stringify } from 'qs';
import { getCookie } from '../utils';
import { InterceptorsOptions, otherOptions } from '../../typings';

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};


// const cachedSave = (response, hashcode) => {
//   /**
//    * Clone a response data and store it in sessionStorage
//    * Does not support data other than json, Cache only json
//    */
//   const contentType = response.headers.get('Content-Type');
//   if (contentType && contentType.match(/application\/json/i)) {
//     // All data is saved as text
//     response
//       .clone()
//       .text()
//       // @ts-ignore
//       .then((content) => {
//         sessionStorage.setItem(hashcode, content);
//         // @ts-ignore
//         sessionStorage.setItem(`${hashcode}:timestamp`, Date.now());
//       });
//   }
//   return response;
// };

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [option] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url: string, option: InterceptorsOptions, { requestInterceptors, responseInterceptors }: otherOptions) {
  const _requestInterceptors = requestInterceptors(url, option);

  url = _requestInterceptors?.url || url;

  const options = {
    // expirys: true,
    ...(_requestInterceptors?.options || {}),
    ...option,
  };

  /**
   * Produce fingerprints based on url and parameters
   * Maybe url has the same parameters
   */
  const fingerprint = url + (options.body ? JSON.stringify(options.body) : '');

  // const hashcode = hash.sha256().update(fingerprint).digest('hex');

  // const defaultOptions = {
  //   // credentials: 'include',
  // };

  // const token = getCookie('token');

  const newOptions: InterceptorsOptions = {
    // ...defaultOptions,
    ...options,
    headers: { Authorization: getCookie('token') },
  };

  if (['POST', 'PUT', 'DELETE'].includes(newOptions.method)) {
    const { body } = newOptions;

    // newOptions.body is JSON
    if (!(body instanceof FormData)) {
      newOptions.headers = {
        // Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        ...newOptions.headers,
      };
      newOptions.body = JSON.stringify(newOptions.body);
    }
    // newOptions.body is FormData
    else {
      newOptions.headers = {
        Accept: 'application/json',
        // 'Content-Type': 'application/x-www-form-urlencoded',
        ...newOptions.headers,
      };
      // const formData = new FormData();
      // for (const key in body) {
      //   formData.append(key, body[key]);
      // }

      // newOptions.body = formData;
      // newOptions.contentType = false;
      // newOptions.processData = false;
      // newOptions.dataType = 'text';
    }
  }

  // 拼接GET请求参数
  if (newOptions.method === 'GET' && Object.keys(newOptions?.params || {}).length > 0) {
    url = `${url}?${stringify(newOptions.params)}`;
  }

  // const expirys = options.expirys && 60;
  // options.expirys !== false, return the cache,
  // if (options.expirys !== false) {
  //   const cached = sessionStorage.getItem(hashcode);
  //   const whenCached = sessionStorage.getItem(`${hashcode}:timestamp`);
  //   if (cached !== null && whenCached !== null) {
  //     // @ts-ignore
  //     const age = (Date.now() - whenCached) / 1000;
  //     if (age < expirys) {
  //       const response = new Response(new Blob([cached]));
  //       return response.json();
  //     }
  //     sessionStorage.removeItem(hashcode);
  //     sessionStorage.removeItem(`${hashcode}:timestamp`);
  //   }
  // }

  return fetch(url, newOptions)
    .then((response: Response) => responseInterceptors(response, newOptions) || response)
    .then((response: Response) => response.json())
    .catch((response: Response) => response.json());
}
