const fs = require('fs')
const { Helper } = require('dxf')
const { Group, Polygon, Geom, Pt } = require('pts')
const helper = new Helper(fs.readFileSync('./1001.dxf', 'utf-8'))

const dist = ({x1, y1, x2, y2}) => Math.sqrt((Math.pow(x1-x2,2))+(Math.pow(y1-y2,2)))
const SCALE = 3.7795
const OFFSET = 0

const getSize = (shape) => shape.boundingBox().moveTo(0, 0).q1
const packInto = (shapes = [], sheet = [400, 400]) => {
  const lastPos = { x: 0, y: 0 }
  const rects = []
  shapes
    .map(({vertices}) => Group.fromArray(vertices.map(({x, y}) => [x,y])))
    .forEach((shape, index) => {
      const [fx, fy] = shape.$zip().map( p => Math.abs(Math.min(...p)))
      shape.moveBy(lastPos.x + fx, lastPos.y + fy)
      const [width, height] = getSize(shape)
      lastPos.x += width + OFFSET
      lastPos.y += height + OFFSET
      shapes[index].vertices.forEach( (vertex, index) => {
        vertex.x = shape[index].x * SCALE
        vertex.y = shape[index].y * SCALE
      })
    })

  return shapes
}

helper.parsed.entities = packInto(helper.parsed.entities.slice(0, 6))
fs.writeFileSync('./test.svg', helper.toSVG(), 'utf-8')
