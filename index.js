const fs = require('fs')
const { Helper } = require('dxf')
const { Group, Polygon } = require('pts')
const helper = new Helper(fs.readFileSync('./1001.dxf', 'utf-8'))
const boxes = helper.parsed.entities.map(({vertices}) =>
	Polygon.toRects([
		Group.fromArray(
			vertices.map(({x, y}) => [x,y])
		)
	])
	.pop()
	.reduce((a, b) => [Math.abs(a[0]-b[0]), Math.abs(a[1]-b[1])])
)

helper.parsed.entities = helper.parsed.entities.map(({vertices, ...shape}, index) => {
	const [w, h] = boxes
		.slice(1, index)
		.reduce(([w, h], [nw, nh]) => [w+nw+10, h+nh+10], boxes[0])

	return {
		...shape,
		vertices: vertices.map(({x, y, ...r}) => ({x: x+w, y: y+h, ...r}))
	}
})
helper.parsed.entities.push({
  type: 'POLYLINE',
  layer: '0',
  colorNumber: 1,
  closed: true,
  polygonMesh: false,
  polyfaceMesh: false,
  vertices: [
  	{x: 0, y: 0},
  	{x: 0, y: -400},
  	{x: -400, y: -400},
  	{x: -400, y: 0},
  ]
})

fs.writeFileSync('./test.svg', helper.toSVG(), 'utf-8')
