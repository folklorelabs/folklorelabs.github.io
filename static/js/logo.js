// (function main() {
//     const layerClass = 'Logo-fun';
//     const logoEl = document.querySelector('.Logo');
//     const style = document.createElement('style');
//     logoEl.appendChild(style);
//     Array.from(Array(100)).forEach(function (item, index) {
//         const layerEl = document.createElement('div');
//         const uniqueClassName = `${layerClass}--${index}`;
//         layerEl.classList.add(layerClass);
//         layerEl.classList.add(uniqueClassName);
//         const layerStyles = `
//             .${uniqueClassName} {
//                 top: ${-20 * index}px;
//                 right: ${-20 * index}px;
//                 bottom: ${-20 * index}px;
//                 left: ${-20 * index}px;
//             }
//         `;
//         style.appendChild(document.createTextNode(layerStyles));
//         logoEl.appendChild(layerEl);
//     });
// })();

function getTextBoundBox(ctx, text) {
    const metrics = ctx.measureText(text);
    const left = metrics.actualBoundingBoxLeft * -1;
    const top = metrics.actualBoundingBoxAscent * -1;
    const right = metrics.actualBoundingBoxRight;
    const bottom = metrics.actualBoundingBoxDescent;
    // actualBoundinBox... excludes white spaces
    const width = text.trim() === text ? right - left : metrics.width;
    const height = bottom - top;
    return { left, top, right, bottom, width, height };
}

function FolkloreLabsHeader(canvas, bgColor, color) {
    this.bgColor = bgColor || '#000000';
    this.color = color || '#ffffff';
    this.isPaused = false;
    this.canvas = canvas;
    this.stepTimestamp = null;
    this.stepPreviousTimeStamp = null
    this.step();

    // responsive canvas sizing
    (new ResizeObserver((entries) => {
        if (!Array.isArray(entries) || !entries.length) return;
        var cw = entries[0].contentRect.width;
        var ch = entries[0].contentRect.height;
        console.log(`update canvas size ${cw}x${ch}`);
        this.canvas.width = cw;
        this.canvas.height = ch;
    })).observe(canvas.parentElement);
}

FolkloreLabsHeader.prototype.pause = function pause() {
    this.isPaused = true;
}

FolkloreLabsHeader.prototype.unpause = function unpause() {
    this.isPaused = false;
}

FolkloreLabsHeader.prototype.step = function step(timestamp) {
    if (this.stepTimestamp === undefined) {
        this.stepTimestamp = timestamp;
    }

    if (this.stepPreviousTimeStamp !== timestamp) {
        this.drawFrame();
    }

    this.stepPreviousTimeStamp = timestamp
    window.requestAnimationFrame(step.bind(this));
}

FolkloreLabsHeader.prototype.drawFrame = function drawFrame() {   
    if (!this.canvas.getContext) return;
    var canvas = this.canvas;
    var cw = this.canvas.width;
    var ch = this.canvas.height;
    var ctx = canvas.getContext('2d');

    // Clear
    ctx.clearRect(0, 0, cw, ch);

    // BG
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(cw, 0);
    ctx.lineTo(cw, ch);
    ctx.lineTo(0, ch);
    ctx.fillStyle = this.bgColor;
    ctx.fill();

    // // Filled text bg
    // ctx.beginPath();
    // ctx.moveTo(cw * 0.25, ch * 0.25);
    // ctx.lineTo(cw * 0.75, ch * 0.25);
    // ctx.lineTo(cw * 0.75, ch * 0.75);
    // ctx.lineTo(cw * 0.25, ch * 0.75);
    // ctx.fillStyle = this.color;
    // ctx.fill();

    // // Stroked triangle
    // ctx.beginPath();
    // ctx.moveTo(0.75 * cw, 0.75 * ch);
    // ctx.lineTo(0.25 * cw, 0.75 * ch);
    // ctx.lineTo(0.75 * cw, 0.25 * ch);
    // ctx.closePath();
    // ctx.strokeStyle = this.color;
    // ctx.stroke();

    const fontSize = cw * 0.1;
    const logoName = 'Folklore Labs';
    ctx.font = `${fontSize}px East Sea Dokdo`;

    // Calc text location
    const textBoundBox = getTextBoundBox(ctx, logoName);
    const logoTextLeftOffset = textBoundBox.width * -0.5;
    const logoTextTopOffset = textBoundBox.height * -0.5;
    const logoTextLeft = (cw / 2) + logoTextLeftOffset;
    const logoTextTop = (ch / 2) + logoTextTopOffset;
    
    // Calc logo bg location
    const logoBgPaddingX = fontSize * 0.25;
    const logoBgPaddingTop = fontSize * 0.25;
    const logoBgPaddingBottom = fontSize * 0.15;
    const logoBgLeft = logoTextLeft + textBoundBox.left - logoBgPaddingX;
    const logoBgTop = logoTextTop + textBoundBox.top - logoBgPaddingTop;
    const logoBgBottom = logoTextTop + textBoundBox.bottom + logoBgPaddingBottom;
    const logoBgRight = logoTextLeft + textBoundBox.right + logoBgPaddingX;
    const logoBgWidth = logoBgRight - logoBgLeft;
    const logoBgHeight = logoBgBottom - logoBgTop;

    // Position logo
    const logoContainer = new Path2D();
    logoContainer.rect(logoTextLeft, logoTextTop, textBoundBox.width, textBoundBox.height);

    const logoBg = new Path2D();
    rectangle.rect(0, 0, logoBgWidth, logoBgHeight);
    logoContainer.addPath(logoBg);

    // Filled text bgctx.save();
    ctx.save();
    // ctx.setTransform(1, -7 * Math.PI / 180, -5.25  * Math.PI / textBoundBox.width, 1, 0, 0);
    // ctx.rotate(6 * Math.PI / 180);
    // ctx.setTransform(1, 0.2, 0.8, 1, 0, 0);
    var rectangle = new Path2D();
    // rectangle.transform(1, 0.2, 0.8, 1, 0, 0);
    rectangle.rect(logoBgLeft, logoBgTop, logoBgWidth, logoBgHeight);

    ctx.fillStyle = this.color;
    ctx.fill(rectangle);

    // Draw text
    ctx.font = `normal normal bold ${fontSize * 1.25}px ${fontSize}px East Sea Dokdo`;
    ctx.fillStyle = this.bgColor;
    ctx.fillText(logoName, logoTextLeft, logoTextTop );
    // logoContainer.addText(logoName, { font: `normal normal bold ${fontSize * 1.25}px ${fontSize}px East Sea Dokdo`});
    ctx.fill(logoBg);
}


// new FolkloreLabsHeader(document.getElementById('LogoCanvas'));
