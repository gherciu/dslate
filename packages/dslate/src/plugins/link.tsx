import React from 'react';
import { Editor, Node, Path, Point, Range, Text, Transforms } from 'slate';
import zhCN from 'antd/lib/locale/zh_CN';
import enUS from 'antd/lib/locale/en_US';
import { Input, Space } from 'antd';
import { ReactEditor, useSelected, useSlate } from 'slate-react';
import IconFont from '../components/IconFont';
import Toolbar from '../components/Toolbar';
import Popover from '../components/Popover';

import { isBlockActive } from '../utils';

import type { NodeEntry } from 'slate';
import type { DSlatePlugin, NormalizeNode, RenderElementPropsWithStyle } from '../typing';
import { useMessage } from '../contexts/ConfigContext';

const TYPE = 'a';

const ToolbarButton = () => {
  const editor = useSlate();
  const getMessage = useMessage();

  const toggle = () => {
    if (!editor.selection) return;
    const active = isBlockActive(editor, TYPE);

    if (active) {
      Transforms.unwrapNodes(editor, {
        match: (n) => n.type === TYPE,
        split: true,
      });
    } else {
      if (Range.isCollapsed(editor.selection)) {
        Transforms.insertNodes(editor, {
          type: TYPE,
          children: [{ text: getMessage('link', '链接') }],
        });
      } else {
        Transforms.wrapNodes(
          editor,
          {
            type: TYPE,
            children: [],
          },
          {
            at: editor.selection,
            match: (n) => Text.isText(n),
            split: true,
          },
        );
      }
    }
  };
  return (
    <Toolbar.Button
      tooltip={getMessage('link', '链接')}
      active={isBlockActive(editor, TYPE)}
      onClick={toggle}
    >
      <IconFont type="icon-link1" />
    </Toolbar.Button>
  );
};

const Link = ({ attributes, element, children }: RenderElementPropsWithStyle) => {
  const selected = useSelected();
  const editor = useSlate();
  const path = ReactEditor.findPath(editor, element);
  const getMessage = useMessage();

  return (
    <a {...attributes} href={element.href}>
      <Popover
        overlayClassName=""
        visible={selected}
        content={
          <Space>
            <span>{getMessage('link', '链接')}：</span>
            <Input
              value={element.href}
              onChange={(e) => {
                Transforms.setNodes(
                  editor,
                  {
                    href: e.target.value,
                  },
                  {
                    at: path,
                  },
                );
              }}
            />
            <Toolbar.Button
              tooltip={getMessage('clear', '清除链接')}
              onClick={() => {
                Transforms.unwrapNodes(editor, {
                  at: path,
                  split: true,
                });
              }}
            >
              <IconFont type="icon-empty" />
            </Toolbar.Button>
          </Space>
        }
      >
        {children}
      </Popover>
    </a>
  );
};

const renderElement = (props: RenderElementPropsWithStyle) => {
  return <Link {...props} />;
};

const normalizeNode = (entry: NodeEntry, editor: Editor, next: NormalizeNode) => {
  const [node, path] = entry;
  if (node.type === TYPE) {
    const isEmpty = Node.string(node).length === 0;
    if (isEmpty) {
      Transforms.unwrapNodes(editor, {
        at: path,
        match: (n) => !Editor.isEditor(n) && n.type === TYPE,
        split: true,
      });
      return;
    }
  }

  next(entry);
};

const withPlugin = (editor: Editor) => {
  const { insertText, insertBreak } = editor;

  editor.insertBreak = () => {
    const { selection } = editor;
    if (selection) {
      const [link] = Editor.nodes(editor, {
        match: (n) => !Editor.isEditor(n) && n.type === TYPE,
      });

      if (link) {
        return;
      }
    }

    insertBreak();
  };
  editor.insertText = (text) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const [link] = Editor.nodes(editor, {
        match: (n) => !Editor.isEditor(n) && n.type === TYPE,
      });

      if (link) {
        const [, linkPath] = link;
        const end = Editor.end(editor, linkPath);
        if (Point.equals(selection.anchor, end)) {
          Transforms.select(editor, Path.next(linkPath));
        }
      }
    }

    insertText(text);
  };

  return editor;
};
const LinkPlugin: DSlatePlugin = {
  type: TYPE,
  nodeType: 'element',
  isInline: true,
  renderElement,
  toolbar: <ToolbarButton />,
  withPlugin,
  normalizeNode,
  locale: {
    [zhCN.locale]: {
      link: '链接',
      clear: '清除链接',
    },
    [enUS.locale]: {
      link: 'link',
      clear: 'clear link',
    },
  },
};

export { LinkPlugin };
