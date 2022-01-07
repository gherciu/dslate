import type { CSSProperties } from 'react';
import type { BaseEditor, Descendant, Editor, NodeEntry } from 'slate';
import type { ReactEditor, RenderElementProps, RenderLeafProps } from 'slate-react';
import type { HistoryEditor } from 'slate-history';
import type React from 'react';

export type DSlateCustomElement = {
  type: string;
  children: (DSlateCustomText | DSlateCustomElement)[];
  [index: string]: any;
};

export type DSlateCustomText = {
  text: string;
  [index: string]: any;
};

export type NormalizeNode = (entry: NodeEntry) => void;

export type DSlatePlugin = {
  uuid?: React.Key;
  type: string;
  nodeType: 'element' | 'text' | 'tool';
  isVoid?: ((element: DSlateCustomElement) => boolean) | boolean;
  isInline?: ((element: DSlateCustomElement) => boolean) | boolean;
  toolbar?: React.ReactNode;
  renderElement?: (props: RenderElementPropsWithStyle, editor: Editor) => JSX.Element;
  renderLeaf?: (props: RenderLeafPropsWithStyle, editor: Editor) => JSX.Element;
  renderStyle?: ((node: Descendant, editor: Editor) => CSSProperties) | CSSProperties;
  normalizeNode?: (entry: NodeEntry, editor: Editor, next: NormalizeNode) => void;
  withPlugin?: (editor: Editor) => Editor;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>, editor: Editor) => void;
  isDefaultElement?: boolean;
  locale?: Record<string, any>;
  props?: Record<string, any>;
};

export interface DSlateEditor {
  [index: string]: any;
  defaultElement?: string;
}

export type Locale = {
  locale: string;
  [index: string]: any;
};

export interface RenderElementPropsWithStyle extends RenderElementProps {
  style?: CSSProperties;
}

export interface RenderLeafPropsWithStyle extends RenderLeafProps {
  style?: CSSProperties;
}

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor & DSlateEditor;
    Element: DSlateCustomElement;
    Text: DSlateCustomText;
  }
}
