import { Icon, Toolbar } from '@dslate/component';
import {
  DSlatePlugin,
  isBlockActive,
  Locales,
  RenderElementPropsWithStyle,
  useMessage,
} from '@dslate/core';
import { Descendant, Editor, Element, Point, Range, Transforms } from 'slate';
import { useSlate } from 'slate-react';

const TYPE = 'table';

const DEFAULT_CELL: (defaultType: string) => Descendant = (defaultType) => ({
  type: TYPE,
  tableType: 'table-cell',
  children: [{ type: defaultType, children: [{ text: '' }] }],
});

const ToolbarButton = () => {
  const editor = useSlate();
  const getMessage = useMessage();

  const insertTable = () => {
    Editor.withoutNormalizing(editor, () => {
      if (!editor.selection) return;
      if (Range.isExpanded(editor.selection)) {
        Transforms.delete(editor);
      }
      Transforms.insertNodes(editor, [
        {
          type: TYPE,
          tableType: 'table',
          children: [
            {
              type: TYPE,
              tableType: 'table-row',
              children: [
                DEFAULT_CELL(editor.defaultElement as string),
                DEFAULT_CELL(editor.defaultElement as string),
                DEFAULT_CELL(editor.defaultElement as string),
              ],
            },
          ],
        },
      ]);
    });
  };

  return (
    <Toolbar.Button
      active={isBlockActive(editor, TYPE)}
      onClick={insertTable}
      tooltip={getMessage('toolbar', '表格')}
      icon={<Icon type="icon-table1" />}
    />
  );
};

const Table = ({ children, attributes }: RenderElementPropsWithStyle) => {
  return (
    <table
      style={{
        borderCollapse: 'collapse',
        padding: 10,
      }}
      {...attributes}
    >
      <tbody>{children}</tbody>
    </table>
  );
};

const TableRow = ({ children, attributes }: RenderElementPropsWithStyle) => {
  return <tr {...attributes}>{children}</tr>;
};

const TableCell = (props: RenderElementPropsWithStyle) => {
  return (
    <td
      {...props?.attributes}
      style={{
        ...(props.style || {}),
        border: '1px solid gray',
        minWidth: '1em',
      }}
    >
      {props?.children}
    </td>
  );
};

const renderElement = ({ children, ...props }: RenderElementPropsWithStyle) => {
  switch (props.element.tableType) {
    case 'table':
      return <Table {...props}>{children}</Table>;

    case 'table-row':
      return <TableRow {...props}>{children}</TableRow>;

    case 'table-cell':
      return <TableCell {...props}>{children}</TableCell>;

    default:
      return <></>;
  }
};

const withPlugin = (editor: Editor) => {
  const { insertBreak, deleteBackward } = editor;

  editor.deleteBackward = (unit) => {
    const selection = editor.selection;
    /**
     * 不可删除表单单元
     */
    if (selection && Range.isCollapsed(selection)) {
      const [match] = Editor.nodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) && Element.isElement(n) && n.type === TYPE,
        mode: 'lowest',
      });

      if (match) {
        const [, path] = match;
        const start = Editor.start(editor, path);
        if (Point.equals(selection.anchor, start)) {
          return;
        }
      }
    }

    deleteBackward(unit);
  };

  //   editor.insertBreak = () => {
  //     const selection = editor.selection;

  //     if (selection && Range.isCollapsed(selection)) {
  //       const [match] = Editor.nodes(editor, {
  //         match: (n) =>
  //           !Editor.isEditor(n) &&
  //           Element.isElement(n) &&
  //           n.type === TYPE &&
  //           n.tableType === 'table-cell',
  //         at: selection.anchor,
  //       });

  //       console.log('match', match);

  //       if (match) {
  //         const [, path] = match;
  //         const end = Editor.end(editor, path);
  //         console.log('end', end);

  //         if (Point.equals(selection.anchor, end)) {
  //           console.log('is end!!');

  //           return;
  //         }
  //       }
  //     }

  //     insertBreak();
  //   };

  return editor;
};

const TablePlugin: DSlatePlugin = {
  type: TYPE,
  nodeType: 'element',
  toolbar: ToolbarButton,
  renderElement,
  withPlugin,
  locale: [
    {
      locale: Locales.zhCN,
      toolbar: '表格',
    },
    {
      locale: Locales.enUS,
      toolbar: 'Table',
    },
  ],
  serialize: () => {
    return '';
  },
  serializeWeapp: () => {
    return {};
  },
};

export { TablePlugin };
