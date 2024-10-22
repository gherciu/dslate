/* eslint-disable react-hooks/exhaustive-deps */
import { Icon, Input, InputNumber, Popover, Toolbar } from '@dslate/component';
import type { RenderElementPropsWithStyle } from '@dslate/core';
import {
  promiseUploadFunc,
  useConfig,
  useMessage,
  usePlugin,
  usePluginHelper,
} from '@dslate/core';
import Upload from 'rc-upload';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import { useEffect, useRef, useState } from 'react';
import { Transforms } from 'slate';
import { ReactEditor, useSelected, useSlate } from 'slate-react';

const prefixCls = 'dslate-img-element';

type Size = { width: string; height: string };

const resize = (
  origin: Size,
  fixBy: 'width' | 'height',
  value: string,
): Size => {
  if (String(value).endsWith('%')) {
    return {
      width: fixBy === 'width' ? value : 'auto',
      height: fixBy === 'height' ? value : 'auto',
    };
  }

  const p = Number(origin.width) / Number(origin.height);

  if (isNaN(Number(value)) && Number(value) <= 0) return origin;

  const valueNumber = Number(value);

  return {
    width: String(
      fixBy === 'height' ? Math.floor(valueNumber * p) : valueNumber,
    ),
    height: String(
      fixBy === 'width' ? Math.floor(valueNumber / p) : valueNumber,
    ),
  };
};

const Video = ({
  attributes,
  children,
  element,
  style,
}: RenderElementPropsWithStyle) => {
  const { setPercent } = usePluginHelper();
  const { customUploadRequest } = useConfig();
  const { props } = usePlugin();

  const getMessage = useMessage();

  const video = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(false);

  const [editable, setEditable] = useState<{
    width: string;
    height: string;
    maxWidth: string;
    url: string;
  }>({
    width: '',
    height: '',
    maxWidth: '',
    url: '',
  });

  useEffect(() => {
    if (element.url.indexOf(';base64,') === -1) {
      setLoading(true);
    }
  }, [element.url]);

  const selected = useSelected();
  const editor = useSlate();
  const path = ReactEditor.findPath(editor, element);

  const updateSize = (target: any) => {
    const width = isNaN(Number(target.width))
      ? target.width
      : Number(target.width);
    const height = isNaN(Number(target.height))
      ? target.height
      : Number(target.height);
    Transforms.setNodes(
      editor,
      {
        videoHeight: height,
        videoWidth: width,
      },
      {
        at: path,
      },
    );
  };

  const updateMargin = (position: string, margin: number) => {
    Transforms.setNodes(
      editor,
      {
        margin: {
          ...(element.margin || {}),
          [position]: margin,
        },
      },
      {
        at: path,
      },
    );
  };

  const updateAlign = (align: string) => {
    Transforms.setNodes(
      editor,
      {
        align,
      },
      {
        at: path,
      },
    );
  };

  const updateEditableSizeEnd = () => {
    updateSize(editable);
  };

  const updateEditableSize = (key: 'width' | 'height', value: string) => {
    // 等比缩放
    const width = String(video.current?.videoWidth ?? 1);
    const height = String(video.current?.videoHeight ?? 1);
    const nSize = resize({ width, height }, key, value);
    setEditable((pre) => ({
      ...pre,
      ...nSize,
    }));
  };

  useEffect(() => {
    if (selected) {
      /**
       * 选中状态下，优先同步参数宽度，其次同步实际宽高到编辑框
       */
      const width = element.videoWidth ?? video.current?.offsetWidth ?? '';
      const height = element.videoHeight ?? video.current?.offsetHeight ?? '';
      setEditable((pre) => {
        return {
          ...pre,
          width: width,
          height: height,
          url: element.url,
          maxWidth: element.maxWidth,
        };
      });
    }
  }, [selected, element.videoWidth, element.videoHeight]);

  /**
   * 加载完毕后初始化参数
   */
  const onVideoLoad = () => {
    if (element.videoWidth && element.videoHeight) {
      setEditable((pre) => {
        return {
          ...pre,
          width: element.videoWidth,
          height: element.videoHeight,
        };
      });

      updateSize({
        width: element.videoWidth,
        height: element.videoHeight,
      });

      setLoading(false);
    } else {
      const defaultWidth = props?.defaultWidth;
      let offsetWidth = String(video.current?.offsetWidth ?? '');
      let offsetHeight = String(video.current?.offsetHeight ?? '');

      if (!offsetWidth || !offsetHeight) return;

      let width = offsetWidth;
      let height = offsetHeight;

      if (defaultWidth) {
        ({ width, height } = resize({ width, height }, 'width', defaultWidth));
      }

      setEditable((pre) => {
        return {
          ...pre,
          width,
          height,
        };
      });

      updateSize({
        width,
        height,
      });

      setLoading(false);
    }
  };

  const updateUrl = async (option: UploadRequestOption) => {
    const { url } = await promiseUploadFunc(
      {
        onProgress: option.onProgress,
        onError: option.onError,
        onSuccess: option.onSuccess,
        file: option.file as File,
      },
      customUploadRequest,
      setPercent,
      false,
    );

    if (!url) return;
    Transforms.setNodes(
      editor,
      {
        url,
        videoWidth: '100%',
        videoHeight: 'auto',
      },
      {
        at: path,
      },
    );

    setEditable({
      width: '100%',
      height: 'auto',
      url: url,
      maxWidth: '',
    });

    updateSize({
      width: '100%',
      height: 'auto',
    });
  };

  return (
    <div {...attributes}>
      {children}
      <div
        contentEditable={false}
        style={{
          textAlign: element?.align || 'left',
        }}
      >
        <Popover
          trigger="click"
          position="top"
          content={
            <div
              style={{
                padding: 12,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span>{getMessage('URL', 'URL')}</span>
                <Input
                  value={editable.url}
                  style={{ width: 300 }}
                  onChange={(url) => {
                    setEditable((pre) => ({
                      ...pre,
                      url,
                    }));
                    Transforms.setNodes(
                      editor,
                      {
                        url,
                      },
                      {
                        at: path,
                      },
                    );
                  }}
                />
                <Upload
                  accept="video/*"
                  customRequest={(option) => {
                    updateUrl(option);
                  }}
                >
                  <Toolbar.Button
                    tooltip={getMessage('tooltip', '上传视频')}
                    icon={<Icon type="icon-shipin" />}
                  />
                </Upload>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span>{getMessage('width', '宽')}</span>
                <Input
                  value={editable.width}
                  style={{ width: 70 }}
                  onChange={(number) => {
                    updateEditableSize('width', number);
                  }}
                  onKeyPress={(e: any) => {
                    if (e.key === 'Enter') {
                      updateEditableSizeEnd();
                    }
                  }}
                />
                <span>{getMessage('height', '高')}</span>
                <Input
                  value={editable.height}
                  style={{ width: 70 }}
                  onChange={(number) => {
                    updateEditableSize('height', String(number));
                  }}
                />

                <span>{getMessage('max-width', '宽上限')}</span>
                <Input
                  value={editable.maxWidth}
                  style={{ width: 70 }}
                  onChange={(maxWidth) => {
                    setEditable((pre) => ({
                      ...pre,
                      maxWidth,
                    }));

                    Transforms.setNodes(
                      editor,
                      {
                        maxWidth,
                      },
                      {
                        at: path,
                      },
                    );
                  }}
                />

                <Toolbar.Button
                  tooltip={getMessage('remove', '删除')}
                  onClick={() => {
                    Transforms.removeNodes(editor, {
                      at: path,
                    });
                  }}
                  icon={
                    <Icon
                      type="icon-empty"
                      style={{
                        color: 'red',
                      }}
                    />
                  }
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: 8,
                }}
              >
                {['20%', '40%', '60%', '80%', '100%'].map((p) => (
                  <Toolbar.Button
                    onClick={() => {
                      updateEditableSize('width', p);
                      updateSize({
                        width: p,
                        height: 'auto',
                      });
                    }}
                    style={{
                      backgroundColor: '#eee',
                      borderRadius: '8px',
                      fontSize: '12px',
                      height: '22px',
                    }}
                    key={p}
                  >
                    {p}
                  </Toolbar.Button>
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: 8,
                }}
              >
                <span>{getMessage('float', '对齐方式')}</span>

                <Toolbar.Button
                  tooltip={getMessage('float-left', '左对齐')}
                  onClick={() => {
                    updateAlign('left');
                  }}
                  icon={<Icon type="icon-alignleft" />}
                />

                <Toolbar.Button
                  tooltip={getMessage('float-center', '居中对齐')}
                  onClick={() => {
                    updateAlign('center');
                  }}
                  icon={<Icon type="icon-alignjustify" />}
                />

                <Toolbar.Button
                  tooltip={getMessage('float-right', '右对齐')}
                  onClick={() => {
                    updateAlign('right');
                  }}
                  icon={<Icon type="icon-alignright" />}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>{getMessage('margin', '外边距')}</span>
                <InputNumber
                  value={element?.margin?.top}
                  style={{ width: 70 }}
                  onChange={(number) => {
                    updateMargin('top', number as number);
                  }}
                  placeholder={getMessage('top', '上')}
                />
                <InputNumber
                  value={element?.margin?.right}
                  style={{ width: 70 }}
                  onChange={(number) => {
                    updateMargin('right', number as number);
                  }}
                  placeholder={getMessage('right', '右')}
                />
                <InputNumber
                  value={element?.margin?.bottom}
                  style={{ width: 70 }}
                  onChange={(number) => {
                    updateMargin('bottom', number as number);
                  }}
                  placeholder={getMessage('bottom', '下')}
                />
                <InputNumber
                  value={element?.margin?.left}
                  style={{ width: 70 }}
                  onChange={(number) => {
                    updateMargin('left', number as number);
                  }}
                  placeholder={getMessage('left', '左')}
                />
              </div>
            </div>
          }
        >
          <div
            className={`${prefixCls} ${selected ? 'selected' : ''}`}
            style={style}
          >
            <video
              ref={video}
              src={element.url}
              style={{
                backgroundColor: loading ? 'rgba(0,0,0,0.1)' : 'transparent',
                width: '100%',
              }}
              onLoadedMetadata={onVideoLoad}
              autoPlay={false}
              controls={false}
            />
          </div>
        </Popover>
      </div>
    </div>
  );
};

export default Video;
