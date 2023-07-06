import '../../utils/lib/numjs/numjs.min.js'
const rows = 20,cols = 10
const shape = nj.zeros([rows,cols])
/**@type {HTMLElement[][]} */
const shapeList = shape.tolist()
const fragment = shapeList.reduce((fragment,row,i) => {
  const tr = document.createElement('tr')
  row = row.map(() => document.createElement('td'))
  shapeList[i] = row
  tr.append(...row)
  fragment.append(tr)
  return fragment
},document.createDocumentFragment())
document.querySelector('#box tbody').appendChild(fragment)


/**
 * 
 * @param {1[][]} shapeArr 
 */

class Cube {
  constructor() {
    this.template = shape.slice()
  }

  typeA(initRow = 0,initCol = 5,h = 4) {
    const _shape = this.template.slice()
    for (let i = initRow; i < initRow + h; i++) { _shape.set(i,initCol,1) }
    return _shape
  }
  typeB(initRow = 0,initCol = 5,h = 4) {
    const _shape = this.typeA(initRow,initCol,h)
    _shape.set(initRow + h - 1,initCol - 1,1)
    return _shape
  }
  typeC(initRow = 0,initCol = 5,h = 4) {
    const _shape = this.typeA(initRow,initCol,h)
    _shape.set(initRow + h - 1,initCol + 1,1)
    return _shape
  }
  typeD(initRow = 1,initCol = 4,h = 2) {
    const _shape1 = this.typeA(initRow,initCol,h)
    const _shape2 = this.typeA(initRow,initCol + 1,h)
    _shape1.add(_shape2)
    return _shape2
  }
  typeE(initRow = 0,initCol = 5,h = 3) {
    const _shape1 = this.typeA(initRow,initCol,h)
    const _shape2 = this.typeA(initRow + 1,initCol - 1,1)
    _shape1.add(_shape2)
    return _shape2
  }
  typeF(initRow = 1,initCol = 4,h = 2) {
    const _shape1 = this.typeA(initRow,initCol,h)
    const _shape2 = this.typeA(initRow + 1,initCol + 4,h)
    _shape1.add(_shape2)
    return _shape2
  }
}

class Renderer {
  currentShapeArr = null
  boundary = Array(cols).fill(0)


  /**
   * @param {nj.NdArray} shapeArr 
   */
  render(shapeArr) {

    if (!Array.isArray(shapeArr)) shapeArr = shapeArr.tolist()
    this.currentShapeArr = shapeArr
    shapeArr.forEach((row,i) => {
      row.forEach((col,j) => {
        const item = shapeList[i][j]
        if (col === 1) {
          item.classList.add('item')
        } else {
          item.classList.remove('item')
        }
      })
    })
  }
  /**
     * 
     * @param {nj.NdArray} shapeArr 
     */
  rotate(shapeArr) {
    const arr = shapeArr.tolist()
    // console.log('arr',arr)
    const len = arr.length
    arr.forEach((row,i) => {
      row.forEach((col,j) => {
        if (col === 1) {
          console.log(i,j)
        }
      })
    })
    return arr
  }

  down(shapeArr) {
    if (shapeArr[shapeArr.length - 1].includes(1)) return shapeArr
    shapeArr.unshift(Array(cols).fill(0))
    return shapeArr.slice(0,-1)
    // return [Array(cols).fill(0)].concat(shapeArr.slice(0,-1))
  }
  parseIntFromArr(arr) {
    return parseInt(arr.join(''),2)
  }
  /**
   * @param {number[][]} shapeArr 
   */
  left(shapeArr) {
    const l_boundary_arr = this.boundary.map((v,i) => !i ? 1 : v)

    for (let i = 0; i < shapeArr.length; i++) {
      const row = shapeArr[i]
      if (row.includes(1)) {
        const l_boundary_val = this.parseIntFromArr(l_boundary_arr)
        const rowVal = this.parseIntFromArr(row)
        // 判断左边界
        if (l_boundary_val & rowVal) {
          return shapeArr
        } else {
          shapeArr[i] = (rowVal << 1).toString(2).padStart(cols,0).split('').map(Number)
        }
      }
    }
    return shapeArr
  }
  right(shapeArr) {
    return shapeArr.map(row => {
      if (row.includes(1)) {
        return (this.parseIntFromArr(row) >> 1).toString(2).padStart(cols,0).split('').map(Number)
      } else {
        return row
      }

    })
  }
}

const a = new Cube().typeE()
const r = new Renderer()
r.render(a)
setInterval(() => {
  // b.render(b.rotate(a))
  // console.log('b.rotate(a)',b.rotate(a))
  // r.render(r.down(r.currentShapeArr))
  r.currentShapeArr = r.down(r.currentShapeArr)
  r.render(r.currentShapeArr)

},1000);

document.onkeydown = e => {
  switch (e.key) {
    case 'a':
      r.currentShapeArr = r.left(r.currentShapeArr)
      break;
    case 'd':
      r.currentShapeArr = r.right(r.currentShapeArr)
      break;
    case 's':
      r.currentShapeArr = r.down(r.currentShapeArr)
      break;
  }
  r.render(r.currentShapeArr)


}

