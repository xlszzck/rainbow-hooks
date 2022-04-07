import { message } from 'antd';
import { HttpRequestHeader } from 'antd/lib/upload/interface';
// import hash from 'hash.js';
import router from 'next/router';
import { stringify } from 'qs';
import { commonLogin, getCookie } from './utils';

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

// 拷贝 response
const copyResponse = (response: Response) => {
  const newResponse = response.clone();
  return newResponse.status === 200 ? newResponse.json() : newResponse.text();
};

const checkStatus = (response: Response, newOptions: HttpRequestHeader) => {
  const { status } = response;
  const { showMessage = true } = newOptions;

  // 正确status，判断code!==0 报错提示
  if (status >= 200 && status < 300) {
    copyResponse(response).then(({ code, msg }) => {
      if (code !== 0 && showMessage) message.error(msg);
    });

    return response;
  }
  // 报错status，处理报错弹窗
  // else if (status < 500 && status != 401 && status != 404) {
  //   copyResponse(response).then((res) => {
  //     if (res.msg && showMessage) message.error(res.msg);
  //   });
  // }
  else {
    copyResponse(response).then((msg) => {
      if (msg && showMessage) message.error(msg);
    });
  }

  // 'POST', 'PUT', 'DELETE'方法，成功通用弹窗
  if (['POST', 'PUT', 'DELETE'].includes(newOptions.method) && status === 200) {
    copyResponse(response).then(({ code, msg }) => {
      if (code === 0 && msg && showMessage) message.success(msg);
    });
  }

  // const errortext = codeMessage[response.status] || response.statusText;
  // const error = new Error(errortext);
  // error.name = response.status;
  // error.response = response;
  throw response;
};

// @ts-ignore
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
export default function request(url: string, option: any) {
  url = process.env.NEXT_PUBLIC_URL_TEST + url;

  const options = {
    // expirys: true,
    ...option,
  };
  /**
   * Produce fingerprints based on url and parameters
   * Maybe url has the same parameters
   */
  const fingerprint = url + (options.body ? JSON.stringify(options.body) : '');

  // const hashcode = hash.sha256().update(fingerprint).digest('hex');

  const defaultOptions = {
    // credentials: 'include',
  };

  // const token = getCookie('token');

  const newOptions = {
    ...defaultOptions,
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
  if (newOptions.method === 'GET' && Object.keys(newOptions.params).length > 0) {
    url = `${url}?${stringify(newOptions.params)}`;
  }

  const expirys = options.expirys && 60;
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

  return (
    fetch(url, newOptions)
      .then((response) => checkStatus(response, newOptions))
      // .then(response => cachedSave(response, hashcode))
      .then((response) => {
        // DELETE and 204 do not return data by default
        // using .json will report an error.
        // if (newOptions.method === 'DELETE' || response.status === 204) {
        //   return response.text();
        // }

        return response.json();
      })
      .catch((response: any) => {
        const { status } = response;

        // 无权限访问 / 未登录
        if (status === 401 || status === 403) {
          // router.push('/user/wx-login');
          commonLogin();
        }
        // else if (status <= 504 && status >= 500) {
        //   message.error(codeMessage['500']);
        // } else if (status >= 404 && status < 422) {
        //   message.error(codeMessage['404']);
        // }

        return response.json();
      })
  );
}
