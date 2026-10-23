export interface IElementOptions {
  readonly className?: string;
  readonly text?: string;
  readonly attributes?: Readonly<Record<string, string>>;
}

/**
 * Creates an element with its class, text and attributes in one call.
 */
export function createElement<TagName extends keyof HTMLElementTagNameMap>(
  tagName: TagName,
  options: IElementOptions = {},
  children: readonly (Node | string)[] = [],
): HTMLElementTagNameMap[TagName] {
  const element: HTMLElementTagNameMap[TagName] = document.createElement(tagName);

  if (options.className) {
    element.className = options.className;
  }

  if (options.text !== undefined) {
    element.textContent = options.text;
  }

  const attributes: [string, string][] = Object.entries(options.attributes ?? {});

  for (const [name, value] of attributes) {
    element.setAttribute(name, value);
  }

  element.append(...children);

  return element;
}

const SVG_NAMESPACE: string = 'http://www.w3.org/2000/svg';

/**
 * Creates an SVG element with its attributes.
 */
export function createSvgElement<TagName extends keyof SVGElementTagNameMap>(
  tagName: TagName,
  attributes: Readonly<Record<string, string>> = {},
  children: readonly SVGElement[] = [],
): SVGElementTagNameMap[TagName] {
  const element: SVGElementTagNameMap[TagName] = document.createElementNS(
    SVG_NAMESPACE,
    tagName,
  ) as SVGElementTagNameMap[TagName];

  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }

  element.append(...children);

  return element;
}
