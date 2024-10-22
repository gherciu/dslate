import { Editor, Path, Transforms } from 'slate';
import { useSlate } from 'slate-react';

import { Icon, Toolbar } from '@dslate/component';

import { Locales, useMessage, usePlugin } from '@dslate/core';
import Video from './video';

import type { CSSProperties } from 'react';
import type { Descendant } from 'slate';

import type { DSlatePlugin, RenderElementPropsWithStyle } from '@dslate/core';

const TYPE = 'video';

const renderElement = (props: RenderElementPropsWithStyle) => {
  return <Video {...props} />;
};

const withPlugin = (editor: Editor) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    // console.log("editor.selection", editor.selection);

    if (editor.selection) {
      const [ele] = Editor.nodes(editor, {
        match: (n) => n.type === TYPE,
      });

      // console.log(ele);

      if (!!ele) {
        const [, elepath] = ele;
        Editor.withoutNormalizing(editor, () => {
          Transforms.insertNodes(
            editor,
            {
              type: editor.defaultElement,
              children: [{ text: '' }],
            } as Descendant,
            {
              at: Path.next(elepath),
            },
          );

          Transforms.select(editor, Path.next(elepath));
        });
        return;
      }
    }
    insertBreak();
  };

  return editor;
};

const renderStyle = (node: Descendant) => {
  if (node.type === TYPE) {
    const style: CSSProperties = {};
    if (node.videoWidth) style.width = node.videoWidth;
    if (node.videoHeight) style.height = node.videoHeight;
    for (const position of ['Left', 'Top', 'Bottom', 'Right']) {
      const cssKey = `margin${position}` as
        | 'marginLeft'
        | 'marginTop'
        | 'marginBottom'
        | 'marginRight';
      if (node.margin?.[position.toLowerCase()]) {
        style[cssKey] = `${node.margin[position.toLowerCase()]}px`;
      } else {
        style[cssKey] = undefined;
      }
    }

    if (node.maxWidth) {
      if (String(node.maxWidth).endsWith('%')) {
        style.maxWidth = node.maxWidth;
      } else {
        style.maxWidth = `${node.maxWidth}px`;
      }
    }

    return style;
  }
  return {};
};

const ToolbarButton = () => {
  const editor = useSlate();
  const getMessage = useMessage();
  const { disabled } = usePlugin();

  const insertVideo = async () => {
    if (disabled) return;
    // const { url } = await promiseUploadFunc(
    //   {
    //     onProgress: option.onProgress,
    //     onError: option.onError,
    //     onSuccess: option.onSuccess,
    //     file: option.file as File,
    //   },
    //   customUploadRequest,
    //   setPercent
    // );
    Transforms.insertNodes(editor, {
      type: TYPE,
      url: '',
      children: [{ text: '' }],
      videoWidth: '100%',
      videoHeight: 'auto',
    });
  };

  return (
    <Toolbar.Button
      tooltip={getMessage('tooltip', '插入视频')}
      icon={<Icon type="icon-shipin" />}
      onClick={() => {
        insertVideo();
      }}
    />
  );
};

const VideoPlugin: DSlatePlugin = {
  type: TYPE,
  nodeType: 'element',
  toolbar: ToolbarButton,
  isVoid: true,
  renderElement,
  renderStyle,
  props: {
    loadingStyle: {
      minHeight: 150,
      minWidth: 300,
    } as CSSProperties,
    maxWidth: false,
    defaultWidth: undefined,
    loadingText: '视频加载中...',
  },
  locale: [
    {
      locale: Locales.zhCN,
      tooltip: '插入视频',
      upload: '上传视频',
      confirm: '确认',
      height: '高',
      width: '宽',
      loading: '视频加载中',
      remove: '删除',
      float: '对齐方式',
      ['float-left']: '左对齐',
      ['float-right']: '右对齐',
      ['float-center']: '居中',
      margin: '外边距',
      top: '上',
      left: '左',
      right: '右',
      bottom: '下',
      ['empty-url']: '未设置视频',
    },
    {
      locale: Locales.enUS,
      tooltip: 'insert video',
      upload: 'upload video',
      confirm: 'confirm',
      height: 'height',
      width: 'width',
      loading: 'loading',
      remove: 'remove',
      float: 'align',
      ['float-left']: 'left',
      ['float-right']: 'right',
      ['float-center']: 'center',
      margin: 'margin',
      top: 'top',
      left: 'left',
      right: 'right',
      bottom: 'bottom',
      ['empty-url']: 'empty url',
    },
  ],
  withPlugin,
  serialize: (element, props) => {
    const style = [];
    if (props?.style) style.push(props.style);
    return `<div style="text-align: ${
      element?.align || 'left'
    }"><video controls="controls" style="${style.join('')}" src="${
      element.url
    }" /></div>`;
  },
  serializeWeapp: () => {
    return {
      type: 'node',
      name: 'div',
      attrs: {
        style: `text-align: center; color: red;`,
      },
      children: [
        {
          type: 'text',
          text: 'weapp not support video',
        },
      ],
    };
  },
};

export { VideoPlugin };
