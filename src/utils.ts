import dayjs from 'dayjs';

// 当前浏览器域名截取
export const getDomain = () => {
  const DomainRegular = [/(.+\.)?(([^.]+)\.(com.cn|net.cn|org.cn|gov.cn))/, /(.+\.)?(([^.]+)\.([^.]+))/];
  const domain = location.host;
  // const domain = 'www.zhetuitui.com';
  if (domain.indexOf('localhost') >= 0) {
    return 'localhost';
  }
  if (domain.indexOf('127.0.0.1') >= 0) {
    return '127.0.0.1';
  }
  const ret = DomainRegular.map((r) => domain.match(r)).filter((r) => r !== null)[0];

  return ret?.[2] || '';
};

//设置cookie
export const setCookie = (c_name: string, value: string, addTime?: any) => {
  const domain = getDomain();

  // document.cookie =
  //   c_name +
  //   '=' +
  //   escape(value) +
  //   (';expires=' + d.toGMTString()) +
  //   `;domain=${domain};path=/`;
  document.cookie = `${c_name}=${escape(value)};expires=${dayjs().add(addTime, 'days').toString()};domain=${domain};SameSite=Lax;path=/`;
};

// 获取cookie
export const getCookie = (c_name: string): string => {
  let c_start, c_end;
  if (document.cookie.length > 0) {
    c_start = document.cookie.indexOf(c_name + '=');
    if (c_start !== -1) {
      c_start = c_start + c_name.length + 1;
      c_end = document.cookie.indexOf(';', c_start);
      if (c_end === -1) c_end = document.cookie.length;
      return unescape(document.cookie.substring(c_start, c_end));
    }
  }
  return '';
};

// 删除cookie
export const deleteCookie = (name: string) => {
  const domain = getDomain();

  const cval = getCookie(name);
  if (cval != null) {
    document.cookie = `${name}=${''};expires=${dayjs().toString()};domain=${domain};SameSite=Lax;path=/`;
  }
};

/**
 * @description 判断data的值是否为''、undefined、长度为0
 * @param {Object,Number,String} data
 */
export const isEmpty = (data: any) => {
  if (data === '' || data === undefined || data === null || data.length === 0) {
    return true;
  }
  return false;
};

/**
 * @description 判断json的值是否为''、undefined、null，并筛选数据
 * @param {Object} json json对象
 */
export const filterKeys = (json: any | Array<any>) => {
  let result: any = false;
  if (Array.isArray(json)) {
    result = json.filter((item) => item !== '' && item !== null && item !== undefined);
  } else if (json instanceof Object) {
    result = {};

    for (const key in json) {
      if (json[key] !== '' && json[key] !== null && json[key] !== undefined) {
        // if (Array.isArray(json[key]) && json[key].length > 0) {
        result[key] = json[key];
        // }
      }
    }
  }
  return result;
};
// 转驼峰命名
export const toCamelCase = (text: string): string => {
  const pattern = /-([a-z])/g;
  return text.replace(pattern, function (all, letter) {
    return letter.toUpperCase();
  });
};
