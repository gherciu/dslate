import type { UploadFunc, UploadRequestOption } from '../typing';

export const base64file: UploadFunc = (option: UploadRequestOption) => {
  const reader: FileReader = new FileReader();
  reader.addEventListener(
    'load',
    () => {
      option.onSuccess?.({ url: reader.result as string });
    },
    false,
  );
  reader.readAsDataURL(option.file);
};

export const blobfile: UploadFunc = (option: UploadRequestOption) => {
  const reader: FileReader = new FileReader();
  reader.addEventListener(
    'load',
    (event) => {
      let blob = new Blob([event?.target?.result as any], {
        type: option.file.type,
      });
      window.URL = window.URL || window.webkitURL;
      option.onSuccess?.({ url: window.URL.createObjectURL(blob) });
    },
    false,
  );
  reader.readAsDataURL(option.file);
};
