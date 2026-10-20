import type { IngredientId } from '../types/game';
import { createSvgElement } from './dom';

interface IShape {
  readonly tag: 'circle' | 'ellipse' | 'path';
  readonly attributes: Readonly<Record<string, string>>;
}

const INGREDIENT_ICON_SIZE: string = '0 0 48 48';

/**
 * Every ingredient is its own small drawing made of SVG shapes.
 */
const INGREDIENT_SHAPES: Readonly<Record<IngredientId, readonly IShape[]>> = {
  'dragon-tears': [
    {
      tag: 'path',
      attributes: {
        d: 'M24 5C24 5 11 21 11 30a13 13 0 0 0 26 0C37 21 24 5 24 5Z',
        fill: '#5f97a8',
      },
    },
    { tag: 'path', attributes: { d: 'M15 31a9 9 0 0 0 18 0Z', fill: '#3f6f80' } },
    { tag: 'ellipse', attributes: { cx: '19', cy: '27', rx: '2.5', ry: '5', fill: '#f3eee0' } },
    { tag: 'circle', attributes: { cx: '37', cy: '12', r: '2.5', fill: '#5f97a8' } },
  ],
  'fairy-dust': [
    {
      tag: 'path',
      attributes: {
        d: 'M22 6l3.5 12.5L38 22l-12.5 3.5L22 38l-3.5-12.5L6 22l12.5-3.5Z',
        fill: '#d9a3b8',
      },
    },
    {
      tag: 'path',
      attributes: {
        d: 'M36 28l1.6 4.4L42 34l-4.4 1.6L36 40l-1.6-4.4L30 34l4.4-1.6Z',
        fill: '#a879a8',
      },
    },
    { tag: 'circle', attributes: { cx: '38', cy: '10', r: '2', fill: '#d4a537' } },
    { tag: 'circle', attributes: { cx: '10', cy: '39', r: '1.6', fill: '#d4a537' } },
    { tag: 'circle', attributes: { cx: '27', cy: '43', r: '1.2', fill: '#d9a3b8' } },
  ],
  'frost-lotus': [
    { tag: 'ellipse', attributes: { cx: '24', cy: '37', rx: '14', ry: '3.5', fill: '#6b8f9c' } },
    { tag: 'path', attributes: { d: 'M7 20c9 0 15 7 17 14-9 0-16-6-17-14Z', fill: '#9cc3cf' } },
    { tag: 'path', attributes: { d: 'M41 20c-9 0-15 7-17 14 9 0 16-6 17-14Z', fill: '#9cc3cf' } },
    { tag: 'path', attributes: { d: 'M24 7c6 8 6 19 0 27-6-8-6-19 0-27Z', fill: '#e6eef0' } },
    { tag: 'circle', attributes: { cx: '36', cy: '9', r: '1.8', fill: '#f3eee0' } },
    { tag: 'circle', attributes: { cx: '11', cy: '12', r: '1.3', fill: '#f3eee0' } },
  ],
  'mandrake-root': [
    { tag: 'path', attributes: { d: 'M24 17C20 9 14 6 11 8c2 5 7 8 13 9Z', fill: '#7d8a3c' } },
    { tag: 'path', attributes: { d: 'M24 17c4-8 10-11 13-9-2 5-7 8-13 9Z', fill: '#5f6d2c' } },
    { tag: 'path', attributes: { d: 'M24 17c-2-6-1-11 0-13 1 2 2 7 0 13Z', fill: '#9aa755' } },
    {
      tag: 'path',
      attributes: {
        d: 'M18 26l-5 4m17-2l5 4',
        stroke: '#a0703f',
        'stroke-width': '2.5',
        'stroke-linecap': 'round',
      },
    },
    { tag: 'path', attributes: { d: 'M17 19c-1 9 2 16 7 25 5-9 8-16 7-25Z', fill: '#a0703f' } },
    {
      tag: 'path',
      attributes: {
        d: 'M21 25h5m-4 6h4',
        stroke: '#4a2f1c',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
      },
    },
  ],
  'caustic-acid': [
    {
      tag: 'path',
      attributes: {
        d: 'M19 6h10v4h-2v8l10.5 18.5A4 4 0 0 1 34 42H14a4 4 0 0 1-3.5-5.5L21 18v-8h-2Z',
        fill: '#dfe6d6',
        stroke: '#2a211b',
        'stroke-width': '1.5',
        'stroke-linejoin': 'round',
      },
    },
    {
      tag: 'path',
      attributes: {
        d: 'M15.3 28h17.4l4.8 8.5A4 4 0 0 1 34 42H14a4 4 0 0 1-3.5-5.5Z',
        fill: '#a3b245',
      },
    },
    { tag: 'circle', attributes: { cx: '20', cy: '35', r: '2', fill: '#eef0d8' } },
    { tag: 'circle', attributes: { cx: '28', cy: '32', r: '1.4', fill: '#eef0d8' } },
    { tag: 'circle', attributes: { cx: '24.5', cy: '23', r: '1.5', fill: '#a3b245' } },
  ],
  'essence-of-the-void': [
    { tag: 'circle', attributes: { cx: '24', cy: '24', r: '18', fill: '#4b3757' } },
    { tag: 'circle', attributes: { cx: '24', cy: '24', r: '12', fill: '#1f1622' } },
    {
      tag: 'ellipse',
      attributes: {
        cx: '24',
        cy: '24',
        rx: '21',
        ry: '6',
        fill: 'none',
        stroke: '#8e6fa3',
        'stroke-width': '2.5',
        transform: 'rotate(-25 24 24)',
      },
    },
    {
      tag: 'path',
      attributes: {
        d: 'M24 18a6 6 0 1 1-6 6',
        fill: 'none',
        stroke: '#6d5487',
        'stroke-width': '2',
        'stroke-linecap': 'round',
      },
    },
    { tag: 'circle', attributes: { cx: '32', cy: '14', r: '1.5', fill: '#efe3f0' } },
  ],
  'phoenix-feather': [
    {
      tag: 'path',
      attributes: { d: 'M37 6C24 8 12 20 12 34l4 4c14-2 24-16 21-32Z', fill: '#c9643a' },
    },
    {
      tag: 'path',
      attributes: { d: 'M33 11c-8 3-15 11-16 22 10-2 18-11 16-22Z', fill: '#e0a548' },
    },
    {
      tag: 'path',
      attributes: {
        d: 'M38 5L10 43',
        stroke: '#5a2a18',
        'stroke-width': '2',
        'stroke-linecap': 'round',
      },
    },
  ],
  'toad-slime': [
    {
      tag: 'path',
      attributes: {
        d: 'M8 30c0-10 8-16 16-16s16 6 16 16c0 4-3 6-6 5-1 5-5 6-6 1-2 2-6 2-7-1-2 5-7 5-7 0-4 1-6-1-6-5Z',
        fill: '#7d8a3c',
      },
    },
    { tag: 'circle', attributes: { cx: '18', cy: '20', r: '3.5', fill: '#f1ecc0' } },
    { tag: 'circle', attributes: { cx: '30', cy: '20', r: '3.5', fill: '#f1ecc0' } },
    { tag: 'circle', attributes: { cx: '18.5', cy: '20.5', r: '1.5', fill: '#2a211b' } },
    { tag: 'circle', attributes: { cx: '30.5', cy: '20.5', r: '1.5', fill: '#2a211b' } },
    { tag: 'ellipse', attributes: { cx: '24', cy: '28', rx: '4', ry: '1.5', fill: '#566126' } },
  ],
};

function createShape(shape: IShape): SVGElement {
  return createSvgElement(shape.tag, shape.attributes);
}

/**
 * A decorative ingredient icon; the ingredient name next to it carries the meaning.
 * The `ingredient-icon` class gives every shape its ink outline.
 */
export function createIngredientIcon(id: IngredientId, className: string): SVGSVGElement {
  return createSvgElement(
    'svg',
    {
      class: `ingredient-icon ${className}`,
      viewBox: INGREDIENT_ICON_SIZE,
      'aria-hidden': 'true',
      focusable: 'false',
    },
    INGREDIENT_SHAPES[id].map((shape: IShape): SVGElement => createShape(shape)),
  );
}

const CAULDRON_SHAPES: readonly IShape[] = [
  {
    tag: 'path',
    attributes: { d: 'M58 150l-12 24m136-24l12 24', stroke: '#2b2733', 'stroke-width': '10' },
  },
  {
    tag: 'path',
    attributes: { d: 'M28 62c0 64 40 100 92 100s92-36 92-100Z', fill: '#2b2733' },
  },
  {
    tag: 'path',
    attributes: {
      d: 'M48 78c4 34 22 56 46 64',
      fill: 'none',
      stroke: '#4a4357',
      'stroke-width': '6',
      'stroke-linecap': 'round',
    },
  },
  {
    tag: 'ellipse',
    attributes: { class: 'cauldron-art__liquid', cx: '120', cy: '58', rx: '90', ry: '15' },
  },
  {
    tag: 'ellipse',
    attributes: {
      cx: '120',
      cy: '58',
      rx: '98',
      ry: '20',
      fill: 'none',
      stroke: '#3b3446',
      'stroke-width': '9',
    },
  },
  { tag: 'circle', attributes: { class: 'cauldron-art__bubble', cx: '92', cy: '52', r: '6' } },
  { tag: 'circle', attributes: { class: 'cauldron-art__bubble', cx: '140', cy: '56', r: '4' } },
  { tag: 'circle', attributes: { class: 'cauldron-art__bubble', cx: '118', cy: '46', r: '3' } },
];

/**
 * The cauldron drawing; the liquid and bubble colors come from CSS.
 */
export function createCauldronArt(): SVGSVGElement {
  return createSvgElement(
    'svg',
    { class: 'cauldron-art', viewBox: '0 0 240 180', 'aria-hidden': 'true', focusable: 'false' },
    CAULDRON_SHAPES.map((shape: IShape): SVGElement => createShape(shape)),
  );
}

const HEART_PATH: string =
  'M12 21s-7.5-4.6-9.6-9.3C.9 8.3 2.8 4.5 6.4 4.1c2.2-.2 4 .9 5.6 2.9 1.6-2 3.4-3.1 5.6-2.9 3.6.4 5.5 4.2 4 7.6C19.5 16.4 12 21 12 21Z';

/**
 * One life in the HUD.
 */
export function createHeartIcon(className: string): SVGSVGElement {
  return createSvgElement(
    'svg',
    { class: className, viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' },
    [createSvgElement('path', { d: HEART_PATH })],
  );
}
