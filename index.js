const fs = require('fs')
const { Helper } = require('dxf')
const { Group, Polygon, Geom, Pt } = require('pts')
const helper = new Helper(fs.readFileSync('./1001.dxf', 'utf-8'))

const dist = ({x1, y1, x2, y2}) => Math.sqrt((Math.pow(x1-x2,2))+(Math.pow(y1-y2,2)))
const SCALE = 3.7795
const OFFSET = 5

const getSize = (shape) => shape.boundingBox().moveTo(0, 0).q1
const packInto = (shapes = [], sheet = [400, 400]) => {
  const lastPos = { x: 0, y: 0 }
  let maxHeight = 0
  shapes.forEach(({vertices}, index) => {
    const shape = Group.fromArray(vertices.map(({x, y}) => [x,y]))
    const [fx, fy] = shape.$zip().map( p => Math.abs(Math.min(...p)))
    const [width, height] = getSize(shape)
    if(
      (lastPos.x + width + OFFSET < sheet[0])
    ){
      shape.moveBy(fx + lastPos.x, fy + lastPos.y)
      lastPos.x += width + OFFSET
      maxHeight = Math.max(maxHeight, height)
    } else {
      lastPos.x = width + OFFSET
      lastPos.y += maxHeight + OFFSET
      maxHeight = 0
      // if(!(lastPos.y + height + OFFSET < sheet[1])) {
      //   lastPos.y += 20
      //   lastPos.x = 0
      // }
      shape.moveBy(fx, fy + lastPos.y)
    }



    shapes[index].vertices.forEach( (vertex, index) => {
      vertex.x = shape[index].x * SCALE
      vertex.y = shape[index].y * SCALE
    })
  })

  shapes.push({
    type: 'POLYLINE',
    layer: '0',
    colorNumber: 1,
    closed: true,
    polygonMesh: false,
    polyfaceMesh: false,
    vertices: [
      {x: 0, y: 0},
      {x: 0, y: sheet[1] * SCALE},
      {x: sheet[0] * SCALE, y: sheet[1] * SCALE},
      {x: sheet[0] * SCALE, y: 0},
    ]
  })

  return shapes
}

helper.parsed.entities = packInto(helper.parsed.entities.slice(0, 6))
fs.writeFileSync('./test.svg', helper.toSVG(), 'utf-8')
