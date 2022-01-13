import { Upload } from 'antd';
import type { CSSProperties } from 'react';
import React from 'react';
import type { Descendant } from 'slate';
import { Transforms } from 'slate';
import { useSlate } from 'slate-react';

import IconFont from '../../components/IconFont';
import Toolbar from '../../components/Toolbar';

import Img from './Img';
import { file2base64, promiseUploadFunc } from './utils';
import { useConfig } from '../../contexts/ConfigContext';
import { usePluginHelper } from '../../contexts/PluginContext';

import type { UploadRequestOption } from 'rc-upload/lib/interface';
import type { DSlatePlugin, RenderElementPropsWithStyle } from '../../typing';

import './index.less';

const TYPE = 'img';

const renderElement = (props: RenderElementPropsWithStyle) => {
  return <Img {...props} />;
};

const renderStyle = (node: Descendant) => {
  if (node.type === TYPE) {
    const style: CSSProperties = {};
    if (node.imgWidth) style.width = node.imgWidth;
    if (node.imgHeight) style.height = node.imgHeight;
    return style;
  }
  return {};
};

const ToolbarButton = () => {
  const { setPercent } = usePluginHelper();
  const { customUploadRequest } = useConfig();
  const editor = useSlate();

  const insertImg = async (option: UploadRequestOption) => {
    const { url } = await promiseUploadFunc(customUploadRequest ?? file2base64, option, setPercent);
    Transforms.insertNodes(editor, { type: TYPE, url, children: [{ text: '' }] });
  };

  return (
    <Upload
      accept="image/*"
      maxCount={1}
      showUploadList={false}
      customRequest={(option) => insertImg(option)}
    >
      <Toolbar.Button tooltip="上传图片">
        <IconFont type="icon-image1" />
      </Toolbar.Button>
    </Upload>
  );
};

const ImgPlugin: DSlatePlugin = {
  type: TYPE,
  nodeType: 'element',
  toolbar: <ToolbarButton />,
  isVoid: true,
  isInline: true,
  renderElement,
  renderStyle,
};

export { ImgPlugin };
