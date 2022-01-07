import type { Descendant, Editor } from 'slate';
import type { DSlatePlugin } from '../typing';

export default function mergeStyle(
  node: Descendant,
  plugins: DSlatePlugin[],
  nodeType: string,
  editor: Editor,
) {
  const textPlugins = plugins.filter((i) => i.nodeType === nodeType) as DSlatePlugin[];
  return textPlugins.reduce((preStyle, plugin) => {
    const style: any = { ...preStyle };
    if (!plugin.renderStyle) return { ...style };
    let gstyle = {};
    if (typeof plugin.renderStyle === 'function') {
      gstyle = plugin.renderStyle(node, editor);
    } else if (!!node[plugin.type]) {
      gstyle = plugin.renderStyle;
    }
    return { ...style, ...gstyle };
  }, {});
}
