import {flattenSVG} from '../svg-to-paths';
import {createSVGWindow} from 'svgdom';

function parseSvg(svg: string) {
  const window = createSVGWindow()
  window.document.documentElement.innerHTML = svg
  return window.document.documentElement
}

type Point = [number, number] & {x: number, y: number}
function pt(x: number, y: number): Point {
  const pt = [x, y];
  (pt as any).x = x;
  (pt as any).y = y;
  return pt as any
}

function pts(arr: [number, number][]): Point[] {
  return arr.map(([x, y]) => pt(x, y))
}

test('empty svg', () => {
  const window = createSVGWindow()
  const x = flattenSVG(window.document.documentElement)
  expect(x).toEqual([])
})

test('rect', () => {
  const x = flattenSVG(parseSvg(`
    <rect x="0" y="0" width="100" height="100" />
  `))
  expect(x).toHaveLength(1)
  expect(x[0].points).toEqual(pts([[0,0], [100,0], [100,100], [0,100], [0,0]]))
})

test('simple path', () => {
  const x = flattenSVG(parseSvg(`
    <path d="M0 0L10 10" />
  `))
  expect(x).toHaveLength(1)
  expect(x[0].points).toEqual(pts([[0,0], [10,10]]))
})

test('simple path with stroke', () => {
  const x = flattenSVG(parseSvg(`
    <path d="M0 0L10 10" stroke="red"/>
  `))
  expect(x).toEqual([
    {points: pts([[0,0], [10,10]]), stroke: "red", groupId: null}
  ])
})

test('multiple paths', () => {
  const x = flattenSVG(parseSvg(`
    <path d="M0 0L10 10" />
    <path d="M10 10L20 20" />
  `))
  expect(x).toEqual([
    {points: pts([[0,0], [10,10]]), stroke: null, groupId: null},
    {points: pts([[10,10], [20,20]]), stroke: null, groupId: null}
  ])
})

test('paths with multiple parts', () => {
  const x = flattenSVG(parseSvg(`
    <path d="M0 0L10 10M10 10L20 20" />
  `))
  expect(x).toEqual([
    {points: pts([[0,0], [10,10]]), stroke: null, groupId: null},
    {points: pts([[10,10], [20,20]]), stroke: null, groupId: null}
  ])
})

test('transformed simple path', () => {
  const x = flattenSVG(parseSvg(`
    <path d="M0 0L10 10" transform="translate(10 10)" />
  `))
  expect(x).toEqual([
    {points: pts([[10,10], [20,20]]), stroke: null, groupId: null}
  ])
})

test('transformed group with simple path', () => {
  const x = flattenSVG(parseSvg(`
    <g transform="translate(10 10)">
      <path d="M0 0L10 10" />
    </g>
  `))
  expect(x).toEqual([
    {points: pts([[10,10], [20,20]]), stroke: null, groupId: null}
  ])
})

test('circle', () => {
  const x = flattenSVG(parseSvg(`
    <circle cx="0" cy="0" r="10" />
  `))
  expect(x).toHaveLength(1)
  expect(x[0].points).toHaveLength(33)
  for (const p of x[0].points) {
    expect(Math.sqrt(p[0]*p[0]+p[1]*p[1])).toBeCloseTo(10, 2)
  }
})

test('ignores clipPaths', () => {
  const x = flattenSVG(parseSvg(`
    <g clip-path="url(#clip0)">
      <path d="M0 0L10 10" />
    </g>
    <defs>
      <clipPath id="clip0">
        <rect width="600" height="400" />
      </clipPath>
    </defs>
  `))
  expect(x).toHaveLength(1)
  expect(x[0].points).toEqual(pts([[0, 0], [10, 10]]))
})

test('gets stroke from style', () => {
  const x = flattenSVG(parseSvg(`
    <path d="M0 0L10 10" style="stroke: green" />
  `))
  expect(x[0].stroke).toEqual('green')
})

test('gets stroke from parent style', () => {
  const x = flattenSVG(parseSvg(`
    <g style="stroke: green">
      <path d="M0 0L10 10" />
    </g>
  `))
  expect(x[0].stroke).toEqual('green')
})

test('gets stroke from parent attr', () => {
  const x = flattenSVG(parseSvg(`
    <g stroke="green">
      <path d="M0 0L10 10" />
    </g>
  `))
  expect(x[0].stroke).toEqual('green')
})

test('gets group id', () => {
  const x = flattenSVG(parseSvg(`
    <g id="abc">
      <path d="M0 0L10 10" />
    </g>
  `))
  expect(x[0].groupId).toEqual('abc')
})

test('gets group id when nested', () => {
  const x = flattenSVG(parseSvg(`
    <g id="abc">
      <g>
        <path d="M0 0L10 10" />
      </g>
    </g>
  `))
  expect(x[0].groupId).toEqual('abc')
})

test('gets innermost group id', () => {
  const x = flattenSVG(parseSvg(`
    <g id="abc">
      <g id="def">
        <path d="M0 0L10 10" />
      </g>
    </g>
  `))
  expect(x[0].groupId).toEqual('def')
})

test('ignores ids on non-<g> elements', () => {
  const x = flattenSVG(parseSvg(`
    <g id="abc">
      <a id="def">
        <path d="M0 0L10 10" />
      </a>
    </g>
  `))
  expect(x[0].groupId).toEqual('abc')
})
