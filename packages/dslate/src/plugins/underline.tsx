import React from 'react';
import { useSlate } from 'slate-react';
import { IconFont } from '../components/Icon';
import { ToolbarButton } from '../components/Toolbar';
import type { DSlatePlugin } from '../typing';

import { getTextProps, toggleTextProps } from '../utils';

const Toolbar = () => {
  const editor = useSlate();
  return (
    <ToolbarButton
      active={getTextProps(editor, 'underline')}
      onClick={() => {
        toggleTextProps(editor, 'underline');
      }}
      tooltip="下划线"
    >
      <IconFont style={{ fontSize: '90%' }} type="icon-xiahuaxian" />
    </ToolbarButton>
  );
};

const UnderlinePlugin: DSlatePlugin = {
  type: 'underline',
  nodeType: 'text',
  toolbar: <Toolbar />,
  renderStyle: { textDecoration: 'underline' },
};

export { UnderlinePlugin };
