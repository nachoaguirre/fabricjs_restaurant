let canvas
const grid = 40
const backgroundColor = '#f8f8f8'
const lineStroke = '#ebebeb'

const tableSize = 80
const tableFill = 'rgba(150, 111, 51, 0.7)'
const tableStroke = '#694d23'
const tableStrokeWidth = 1
const tableShadow = 'rgba(0, 0, 0, 0.4) 3px 3px 7px'

const chairSize = 30
const chairFill = 'rgba(67, 42, 4, 0.7)'
const chairStroke = '#32230b'
const chairShadow = 'rgba(0, 0, 0, 0.4) 3px 3px 7px'

const barFill = 'rgba(0, 93, 127, 0.7)'
const barStroke = '#003e54'
const barShadow = 'rgba(0, 0, 0, 0.4) 3px 3px 7px'
const barText = 'Bar'

const wallFill = 'rgba(136, 136, 136, 0.7)'
const wallStroke = '#686868'
const wallShadow = 'rgba(0, 0, 0, 0.4) 5px 5px 20px'

let canvasEl = document.getElementById('canvas');

let initCanvas = () => {
  if (canvas) { canvas.clear(); canvas.dispose(); }

  canvas = new fabric.Canvas('canvas')
  canvas.backgroundColor = backgroundColor

  canvas.on('object:moving', function(e) {
    snapToGrid(e.target);
    checkBoudningBox(e);
  })
}
initCanvas()

let drawGrid = () => {
  let canHeight = canvas.height;
  for (let i=0; i<(canHeight/grid); i++) {
    const lineX = new fabric.Line([0, i * grid, canHeight, i * grid], {stroke: lineStroke, selectable: false, type: 'line'});
    const lineY = new fabric.Line([i * grid, 0, i * grid, canHeight], {stroke: lineStroke, selectable: false, type: 'line'});
    sendLinesToBack(); canvas.add(lineX); canvas.add(lineY);
  }
}
drawGrid();

function sendLinesToBack() {
  canvas.getObjects().map(o => { if (o.type === 'line') { canvas.sendToBack(o) } })
}

function snapToGrid(target) {
  target.set({left: Math.round(target.left / (grid / 2)) * grid / 2, top: Math.round(target.top / (grid / 2)) * grid / 2})
}

function checkBoudningBox(e) {
  const obj = e.target; let canWidth = canvas.width; let canHeight = canvas.height;

  if (!obj) { return }
  obj.setCoords();

  const objBoundingBox = obj.getBoundingRect();
  if (objBoundingBox.top < 0) { obj.set('top', 0); obj.setCoords() }
  if (objBoundingBox.left > canWidth - objBoundingBox.width) { obj.set('left', canWidth - objBoundingBox.width); obj.setCoords() }
  if (objBoundingBox.top > canHeight - objBoundingBox.height) { obj.set('top', canHeight - objBoundingBox.height); obj.setCoords() }
  if (objBoundingBox.left < 0) { obj.set('left', 0); obj.setCoords() }
}



/**
 *
 * @param {int} id - id of the table
 * @param {int} left - left position
 * @param {int} top - top position
 * @param {int} width - width of the table
 * @param {int} height - height of the table
 * @returns fabric.Group
 */
function addTable0(id, name, left, top, width, height) {
  const table = new fabric.Rect({
    width: width, height: height, fill: tableFill, stroke: tableStroke, strokeWidth: 1, shadow: tableShadow, originX: 'center', originY: 'center',
    centeredRotation: true, snapAngle: 45, selectable: true
  })
  const text = new fabric.IText(name, {
    fontFamily: 'Calibri', fontSize: 14, fill: '#fff', textAlign: 'center', originX: 'center', originY: 'center'
  })
  const group = new fabric.Group([table, text], {
    left: left, top: top, centeredRotation: true, snapAngle: 45, selectable: true, type: 'table', id: id, number: 1
  })
  canvas.add(group)

  group.on('moving', (e) => { printCoords(text) })
  group.on('mouseover', (e) => { printCoords(text); canvas.renderAll(); })
  group.on('mouseout', (e) => { printName(text, name); })

  return group
}




function addTable(id, left, top, chairs={}, width=0, height=0) {
  if (width === 0) { width = tableSize }
  if (height === 0) { height = tableSize }
  if (Object.keys(chairs).length === 0) {
    chairs = {
      top: false,
      right: true,
      bottom: false,
      left: true
    }
  }

  const table = new fabric.Rect({
    width: width-tableStrokeWidth, height: height-tableStrokeWidth, fill: tableFill, stroke: tableStroke, strokeWidth: tableStrokeWidth, shadow: tableShadow,
    originX: 'center', originY: 'center', centeredRotation: true, snapAngle: 45, selectable: true
  });

  const text = new fabric.IText(id.toString(), {fontFamily:'Calibri', fontSize:14, fill:'#fff', textAlign:'center', originX:'center', originY:'center'});

  let groupItems = [];
  if (chairs.top) { groupItems.push(addChair('top', width)) }
  if (chairs.right) { groupItems.push(addChair('right', width)) }
  if (chairs.bottom) { groupItems.push(addChair('bottom', width)) }
  if (chairs.left) { groupItems.push(addChair('left', width)) }

  groupItems.push(table); groupItems.push(text);

  const group = new fabric.Group(groupItems, {left:left, top:top, centeredRotation:true, snapAngle:45, selectable:true, type:'table', id:id})
  canvas.add(group);

  group.on('moving', (e) => { printCoords(text) })
  group.on('mouseover', (e) => { printCoords(text); canvas.renderAll(); })
  group.on('mouseout', (e) => { printName(text, id.toString()); })

  return group
}

function addChair(pos=null, tableWidth=0, top=0, left=0) {
  if (tableWidth === 0) { tableWidth = tableSize }
  //if (pos !== null) { top = pos.top; right = pos.right; bottom = pos.bottom; left = pos.left; }

  if(pos == 'top') { top = tableWidth * -1 / 2; }
  if(pos == 'right') { left = tableWidth / 2; }
  if(pos == 'bottom') { top = tableWidth / 2; }
  if(pos == 'left') { left = tableWidth * -1 / 2; }

  const o = new fabric.Rect({
    left: left, top: top,
    width: chairSize, height: chairSize,
    fill: chairFill, stroke: chairStroke, shadow: chairShadow,
    originX: 'center', originY: 'center',
    type: 'chair', id: generateId()
    //strokeWidth: 2, centeredRotation: true, snapAngle: 45, selectable: true,
  })
  return o
}


//addTable0(101, "101", 0, 0, 79, 79)
addTable(101, 0, 0, {}, 80, 80)
//addTable(102, 120, 0, 80, 80)


let printCoords = (target) => { target.set('text', target.group.left + ', ' + target.group.top) }
let printName = (target, name) => { target.set('text', name); canvas.renderAll(); }
function generateId() { return Math.random().toString(36).substr(2, 8) }
