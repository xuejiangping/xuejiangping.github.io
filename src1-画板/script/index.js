import { setPos } from './aaa.js';
const cvs = document.getElementById('cvs1');
const clearBtn = document.getElementById('clearBtn');
const ctx = cvs.getContext('2d',{ willReadFrequently: true });
const penSize = document.getElementById('stroke');
const penColor = document.getElementById('color');
const redoBtn = document.getElementById('redo');
const undoBtn = document.getElementById('undo');
const CANVAS_WIDTH = cvs.width = 600;
const CANVAS_HEIGHT = cvs.height = 600;
const redoList = [],undoList = [];
//--------------------------------------------------------------------
const options = {
    lineWidth: 1,
    strokeStyle: '#000'
};
ctx.lineWidth = options.lineWidth;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
cvs.onmousedown = function ({ offsetX,offsetY }) {
    ctx.beginPath();
    ctx.moveTo(offsetX,offsetY);
    cvs.onmousemove = function ({ offsetX,offsetY }) {
        ctx.lineTo(offsetX,offsetY);
        ctx.stroke();
    };
    cvs.onmouseleave = end;
    cvs.onmouseup = end;
    function end() {
        cvs.onmousemove = null;
        cvs.onmouseup = null;
        cvs.onmouseleave = null;
        undoList.push(ctx.getImageData(0,0,CANVAS_WIDTH,CANVAS_HEIGHT));
    }
};
// 撤销
undoBtn.onclick = function () {
    let n = undoList.length;
    console.log(undoList,n);
    if (n > 0) {
        cl();
        const imgData = undoList.pop();
        redoList.push(imgData);
        ctx.putImageData(imgData,0,0);
    }
};
//恢复
redoBtn.onclick = function () {
    ctx.putImageData(redoList.pop(),0,0);
};
// 清除画布
clearBtn.onclick = cl;
// 画笔颜色
penColor.onchange = function () {
    ctx.strokeStyle = this.value;
};
//画笔尺寸
penSize.onchange = function () {
    ctx.lineWidth = this.value;
    this.title = this.value;
};
function cl() {
    ctx.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
}
function test(pos,count) {
    if (count === 0) return;
    // ctx.save()
    ctx.beginPath();
    const newPos = setPos(pos);
    newPos.forEach(([x,y],i) => {
        ctx.lineTo(x,y);
        // ctx.closePath()
    });
    // ctx.stroke()
    ctx.closePath();
    ctx.stroke();
    test(newPos,--count);
}
// test(pos,10)
function drawCircle(n = 5) {
    ctx.arc(CANVAS_WIDTH / 2,CANVAS_HEIGHT / 2,5,0,Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    for (let i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH / 2,CANVAS_HEIGHT / 2 - i * 15,200 - i * 15,0,Math.PI * 2);
        // ctx.stroke()
        i % 2 ? ctx.fillStyle = 'yellow' : ctx.fillStyle = 'pink';
        ctx.fill();
    }
    for (let i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH / 2,CANVAS_HEIGHT / 2 - 100 + i * 15,100 - i * 15,0,Math.PI * 2);
        i % 2 ? ctx.fillStyle = 'pink' : ctx.fillStyle = 'yellow';
        ctx.fill();
    }
}
drawCircle(6);
let img = (function (img) {
    img.src = cvs.toDataURL();
    document.body.appendChild(img);
    let animation = img.animate({
        transform: ['rotate(0deg)','rotate(360deg)']
    },{ duration: 2000,iterations: Infinity })
    // animation.cancel() 
    return img;
})(new Image);

// console.log(img)