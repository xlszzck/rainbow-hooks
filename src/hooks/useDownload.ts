import _ from 'lodash';

// 获取文件的文件名
export const getFileName = (url: string) => _.flow([_.partialRight(_.split, '/'), _.last])(url);

// 下载文件
const useDownload = (url: string, download = true) => {
  const filename = getFileName(url);

  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const blobUrl = window.URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.style.display = 'none';
      tempLink.href = blobUrl;

      if (download) {
        //下载
        tempLink.setAttribute('download', filename);
      } else {
        //预览
        tempLink.setAttribute('target', '_blank');
      }

      document.body.appendChild(tempLink);

      tempLink.click();

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
        document.body.removeChild(tempLink);
      });
    });
};

export default useDownload;
