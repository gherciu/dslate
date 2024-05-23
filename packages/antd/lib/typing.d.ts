import type { DSlateProps, ProgressProps, ShowCountProps } from '@dslate/core';

export interface AntdStyleDSlateProps extends DSlateProps {
  toolbar?: string[];
  bordered?: boolean;
  showCounter?: boolean | ShowCountProps;
  disabled?: boolean;
  placeholder?: string;
  progress?: ProgressProps;
  className?: string;
  pluginProps?: Record<string, any>;
}
