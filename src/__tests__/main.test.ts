import {flattenSVG} from '../svg-to-paths';
import {Window} from 'svgdom';

function parseSvg(svg: string) {
  const window = new Window
  window.document.documentElement.innerHTML = svg
  return window.document.documentElement
}

test('empty svg', () => {
  const window = new Window
  const x = flattenSVG(window.document.documentElement)
  expect(x).toEqual([])
})

test('rect', () => {
  const x = flattenSVG(parseSvg(`
    <rect x="0" y="0" width="100" height="100" />
  `))
  expect(x).toEqual([
    {points: [[0,0], [100,0], [100,100], [0,100], [0,0]], stroke: null}
  ])
})

test('simple path', () => {
  const x = flattenSVG(parseSvg(`
    <path d="M0 0L10 10" />
  `))
  expect(x).toEqual([
    {points: [[0,0], [10,10]], stroke: null}
  ])
})

test('simple path with stroke', () => {
  const x = flattenSVG(parseSvg(`
    <path d="M0 0L10 10" stroke="red"/>
  `))
  expect(x).toEqual([
    {points: [[0,0], [10,10]], stroke: "red"}
  ])
})

test('multiple paths', () => {
  const x = flattenSVG(parseSvg(`
    <path d="M0 0L10 10" />
    <path d="M10 10L20 20" />
  `))
  expect(x).toEqual([
    {points: [[0,0], [10,10]], stroke: null},
    {points: [[10,10], [20,20]], stroke: null}
  ])
})

test('paths with multiple parts', () => {
  const x = flattenSVG(parseSvg(`
    <path d="M0 0L10 10M10 10L20 20" />
  `))
  expect(x).toEqual([
    {points: [[0,0], [10,10]], stroke: null},
    {points: [[10,10], [20,20]], stroke: null}
  ])
})

test('transformed simple path', () => {
  const x = flattenSVG(parseSvg(`
    <path d="M0 0L10 10" transform="translate(10 10)" />
  `))
  expect(x).toEqual([
    {points: [[10,10], [20,20]], stroke: null}
  ])
})

test('transformed group with simple path', () => {
  const x = flattenSVG(parseSvg(`
    <g transform="translate(10 10)">
      <path d="M0 0L10 10" />
    </g>
  `))
  expect(x).toEqual([
    {points: [[10,10], [20,20]], stroke: null}
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
  expect(x[0].points).toEqual([[0, 0], [10, 10]])
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
