import React, { forwardRef } from "react";
import type { DSlateRef } from "@dslate/core";
import {
  ConfigProvider,
  ConfigConsumer,
  mergeLocalteFromPlugins,
  defaultConfig,
} from "@dslate/core";

import { registerElement } from "@dslate/component";

import DefaultPlugin from "@dslate/plugin";

import {
  Divider,
  Input,
  InputNumber,
  Popover,
  Progress,
  Select,
  Tooltip,
} from "@douyinfe/semi-ui";

import type { SemiStyleDSlateProps } from "./typing";

import ZH_CN from "./locale/zh_CN";
import EN_US from "./locale/en_US";
import { Button, SemiEditor } from "./components";

registerElement("tooltip", Tooltip);
registerElement("divider", Divider);
registerElement("progress", Progress);
registerElement("popover", Popover);
registerElement("input", Input);
registerElement("input-number", InputNumber);
registerElement("button", Button);
registerElement("select", Select);

export const DefaultLocales = [ZH_CN, EN_US];

export { DefaultPlugin };
export const DefaultToolbar = [
  "history",
  "clear",
  "divider",
  "paragraph",
  "font-size",
  "bold",
  "italic",
  "decoration",
  "color",
  "background-color",
  "divider",
  "text-align",
  "list",
  "todo-list",
  "text-indent",
  "line-height",
  "divider",
  "img",
  "link",
  "blockquote",
  "hr",
];

export { ConfigProvider, defaultConfig };

export default forwardRef<DSlateRef, SemiStyleDSlateProps>(
  ({ toolbar = DefaultToolbar, ...props }, ref) => {
    return (
      <ConfigConsumer>
        {(value) => {
          const plugins =
            !value.plugins || value.plugins.length === 0
              ? Object.values(DefaultPlugin)
              : value.plugins;
          const locales = value.locales ? value.locales : DefaultLocales;
          return (
            <ConfigProvider
              value={{
                ...value,
                locales: mergeLocalteFromPlugins(locales, plugins),
                plugins,
                iconScriptUrl:
                  "//at.alicdn.com/t/c/font_3062978_atuqwazgoap.js",
              }}
            >
              <SemiEditor {...props} toolbar={toolbar} ref={ref} />
            </ConfigProvider>
          );
        }}
      </ConfigConsumer>
    );
  }
);
