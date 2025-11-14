import type { ElementType, ReactNode } from "react";
import { createElement } from "react";

type LocaleTextProps<T extends ElementType> = {
  as?: T;
  en: ReactNode;
  ar: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function LocaleText<T extends ElementType = "span">({
  as,
  en,
  ar,
  className,
  style,
}: LocaleTextProps<T>) {
  const Component = (as || "span") as ElementType;

  return createElement(
    Component,
    { className, style },
    createElement("span", { "data-locale-text": "en" }, en),
    createElement("span", { "data-locale-text": "ar" }, ar)
  );
}
