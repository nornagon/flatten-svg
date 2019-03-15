# flatten-svg

`flatten-svg` normalizes SVG shape data into a simplified line segment form
suitable for, say, a [plotter](https://axidraw.com/). All shapes are reduced to
line segments, accurate to within a configurable error margin.

## Example

Input:

```svg
<svg>
  <g transform="translate(10 10)">
    <rect x="0" y="0" width="30" height="10" />
    <path d="M0 0 l10 0 l0 10 l-10 0 Z" />
  </g>
</svg>
```

Usage:

```js
import {flattenSVG} from 'flatten-svg';

const paths = flattenSVG(svgElement);
```

Output:

```js
[
  { points: [[10, 10], [40, 10], [40, 20], [10, 20], [10, 10]] },
  { points: [[10, 10], [20, 10], [20, 20], [10, 20], [10, 10]] }
]
```

### Non-browser environments

`flatten-svg` is compatible with [svgdom](https://github.com/svgjs/svgdom) for
use in non-browser environments such as node.js.

```js
import {flattenSVG} from 'flatten-svg';
import {Window} from 'svgdom';
import {readFileSync} from 'fs';

const window = new Window
window.document.documentElement.innerHTML = readFileSync('test.svg')
const paths = flattenSVG(window.document.documentElement)
```

## API

### flattenSVG(svgElement[, options])

* `svgElement` [SVGSVGElement](https://developer.mozilla.org/en-US/docs/Web/API/SVGSVGElement) - SVG to flatten.
* `options` Object _(optional)_
  * `maxError` number - maximum deviation from true shape. Defaults to 0.1.

Returns `Line[]`

### Line

Properties:
* `points` \[number, number][] - list of points on the line
* `stroke` ?string - if present, the `stroke` property of the line
