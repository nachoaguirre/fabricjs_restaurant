let canvas
const grid = 40
const backgroundColor = '#f8f8f8'
const lineStroke = '#ebebeb'

const tableSize = 80
const tableFill = 'rgba(150, 111, 51, 0.7)'
const tableStroke = '#694d23'
const tableStrokeWidth = 1
const tableShadow = 'rgba(0, 0, 0, 0.4) 3px 3px 7px'

const chairSize = 20
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

let sendLinesToBack = () => { canvas.getObjects().map(o => { if (o.type === 'line') { canvas.sendToBack(o) } }) }

let initCanvas = () => {
  if (canvas) { canvas.clear(); canvas.dispose(); }

  canvas = new fabric.Canvas('canvas')
  canvas.backgroundColor = backgroundColor;

  let canWidth = canvas.width;
  let options = {stroke: lineStroke, selectable: false, type: 'line', excludeFromExport: true};
  for (let i=0; i<(canWidth/grid); i++) {
    const lineX = new fabric.Line([0, i*grid, canWidth, i*grid], options);
    const lineY = new fabric.Line([i*grid, 0, i*grid, canWidth], options);
    sendLinesToBack(); canvas.add(lineX); canvas.add(lineY);
  }

  canvas.on('object:moving', function(e) {
    snapToGrid(e.target);
    checkBoudningBox(e);
  })
}
initCanvas();



let drawGrid = () => {
  let canWidth = canvas.width;
  let options = {stroke: lineStroke, selectable: false, type: 'line', excludeFromExport: true};
  for (let i=0; i<(canWidth/grid); i++) {
    const lineX = new fabric.Line([0, i*grid, canWidth, i*grid], options);
    const lineY = new fabric.Line([i*grid, 0, i*grid, canWidth], options);
    sendLinesToBack(); canvas.add(lineX); canvas.add(lineY);
  }
}
//drawGrid();

let snapToGrid = (t) => { t.set({left: Math.round(t.left / (grid / 2)) * grid / 2, top: Math.round(t.top / (grid / 2)) * grid / 2}) }

let checkBoudningBox = (e) => {
  const o = e.target; let cW = canvas.width; let cH = canvas.height;
  if (!o) { return }
  o.setCoords();

  const oB = o.getBoundingRect();
  if (oB.top < 0) { o.set('top', 0); o.setCoords() }
  if (oB.left > cW - oB.width) { o.set('left', cW - oB.width); o.setCoords() }
  if (oB.top > cH - oB.height) { o.set('top', cH - oB.height); o.setCoords() }
  if (oB.left < 0) { o.set('left', 0); o.setCoords() }
}

let addTable = (id, left, top, chairs={}, width=0, height=0) => {
  if (width === 0) { width = tableSize } if (height === 0) { height = tableSize }
  if (Object.keys(chairs).length === 0) { chairs = { top: false, right: true, bottom: false, left: true } }

  const table = new fabric.Rect({
    width: width-tableStrokeWidth, height: height-tableStrokeWidth, fill: tableFill, stroke: tableStroke, strokeWidth: tableStrokeWidth, shadow: tableShadow,
    originX: 'center', originY: 'center', centeredRotation: true, snapAngle: 45, selectable: true
  });

  const text = new fabric.IText(id.toString(), {fontFamily:'Calibri', fontSize:14, fill:'#fff', textAlign:'center', originX:'center', originY:'center'});

  let groupItems = [table, text];

  Object.keys(chairs).forEach(pos => {
    if(pos !== 'top' && pos !== 'right' && pos !== 'bottom' && pos !== 'left') return;

    let value = chairs[pos];
    if(value) {
      if(Array.isArray(value)) {
        value.forEach((v, i) => {
          console.log("chairs: "+pos+"// foreach: ", v, i);
          let top = v.top || 0;
          let left = v.left || 0;
          groupItems.unshift(addChair(pos, width, top, left))
        })
      } else {
        console.log("chairs: "+pos, value);
        let top = value.top || 0;
        let left = value.left || 0;
        groupItems.unshift(addChair(pos, width, top, left))
      }
    }
  });

  const group = new fabric.Group(groupItems, {
    left:left, top:top, centeredRotation:true, snapAngle:45, selectable:true, type:'table', id:id,
    transparentCorners: false, cornerStyle: 'circle',
    cornerColor: 'rgba(0, 0, 0, 0.5)',
    //setControlVisible: 'mtr', hasRotatingPoint: false,
    hasRotatingPoint: false,
    //cornerSize: 10,
    //padding: 5
  })
  //group.setControlVisible('mtr', false);
  group.setControlsVisibility({
    mtr: false,
    tl: false,
    tr: false,
    br: false,
    bl: false,

    // mb: false,
    // ml: false,
    // mr: false,
    // mt: false,
  });
  canvas.add(group);

  group.on('moving', (e) => { printCoords(text) })
  group.on('mouseover', (e) => { printCoords(text); canvas.renderAll(); })
  group.on('mouseout', (e) => { printName(text, id.toString()); })

  return group
}

function addChair(pos=null, tableWidth=0, top=0, left=0) {
  if (tableWidth === 0) { tableWidth = tableSize }
  if(pos == 'top') { top = tableWidth * -1 / 2; }
  if(pos == 'right') { left = tableWidth / 2; }
  if(pos == 'bottom') { top = tableWidth / 2; }
  if(pos == 'left') { left = tableWidth * -1 / 2; }

  const o = new fabric.Rect({
    left: left, top: top,
    width: chairSize, height: chairSize,
    fill: chairFill, stroke: chairStroke, shadow: chairShadow,
    originX: 'center', originY: 'center',
    type: 'chair', id: generateId(),
    lockScalingX: true, lockScalingY: true, lockRotation: true,
  })
  return o
}


// let chairs102 = {
//   right: [{ top: -20, left: 0 }, { top: 20, left: 0 }],
//   left: true,
//   top: false,
//   bottom: { left: 10 },
//   test: true
// }

// addTable(102, 150, 0, chairs102, 80, 80);

let chairsAll = {top: true, right: true, bottom: true, left: true}
let chairsTRL = {top: true, right: true, left: true}
let chairsRL = {right: true, left: true}
let chairsTL_T_TR_R_RB_LB_L = {
  top: true,
  right: [
    { top: -40, left: 0 },
    { top: 0, left: 0 },
    { top: 40, left: 0 },
  ],
  left: [
    { top: -40, left: 0 },
    { top: 0, left: 0 },
    { top: 40, left: 0 },
  ]
}

let printCoords = (target) => { target.set('text', target.group.left + ', ' + target.group.top) }
let printName = (target, name) => { target.set('text', name); canvas.renderAll(); }
function generateId() { return Math.random().toString(36).substr(2, 8) }

addTable(100, 0, 0, chairsAll);
addTable(101, 120, 0, chairsAll);
addTable(102, 240, 0, chairsAll);
addTable(103, 360, 0, chairsAll);
addTable(104, 480, 0, chairsTL_T_TR_R_RB_LB_L);

addTable(109, 0, 140, chairsAll);
addTable(108, 120, 140, chairsAll);
addTable(107, 240, 140, chairsAll);
addTable(106, 360, 140, chairsAll);
addTable(105, 480, 140, chairsTRL);

addTable(110, 0, 280, chairsRL);
addTable(111, 120, 280, chairsRL);
addTable(112, 240, 280, chairsRL);
addTable(113, 360, 280, chairsRL);
addTable(114, 480, 280, chairsRL);

let json = canvas.toJSON();
console.log("json2", json.objects);
