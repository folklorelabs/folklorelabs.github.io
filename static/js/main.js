var MAX_NODES = 500;

function random(minVal, maxVal) {
    return Math.random() * (maxVal - minVal) + minVal;
}

function randomThemedColor(hue, saturation, lightness) {
    return {
        hue: hue || random(0, 360),
        // saturation: saturation || random(25, 95),
        saturation: 0,
        lightness: lightness || random(85, 95),
    };
}

var FloatingNode = function( options ) {
    this.x = this.ox = options.x || 0.0;
    this.y = this.oy = options.y || 0.0;
    const color = randomThemedColor();
    this.hue = typeof options.hue === 'number' ? options.hue : color.hue;
    this.saturation = typeof options.saturation === 'number' ? options.saturation : color.saturation;
    this.lightness = typeof options.lightness === 'number' ? options.lightness : color.lightness;
    this.radius = options.radius || 10;
    this.parent = options.parent;
    this.moving = false;
    this.colorChanging = false;
};
FloatingNode.prototype = {
    move: function(x, y) {
        var floatingNode = this;
        var speed = random(1000, 4000);
        var tween = new window.TWEEN.Tween(floatingNode)
            .to({ x: x, y: y }, speed)
            .easing(window.TWEEN.Easing.Quadratic.InOut)
            .onComplete(function(){
                floatingNode.moving = false;
            })
            .start();

        floatingNode.moving = true;
        return tween;
    },
    changeColor: function(hue, saturation, lightness) {
        var floatingNode = this;
        var tween = new window.TWEEN.Tween(floatingNode)
            .to({ hue: hue, saturation: saturation, lightness: lightness }, 5000)
            .easing(window.TWEEN.Easing.Quadratic.InOut)
            .onComplete(function(){
                floatingNode.colorChanging = false;
            })
            .start();

        floatingNode.colorChanging = true;
        return tween;
    },
    update: function() {
        window.TWEEN.update();
    },
    draw: function( ctx ) {
        ctx.beginPath();
        ctx.globalAlpha = 0.8;
        ctx.strokeStyle = `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
        ctx.lineWidth = this.radius * 0.1;

        // draw line to parent floatingNode
        if (this.parent) {
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.parent.x, this.parent.y);
            ctx.stroke();
        }
    }
};

function AnimationCanvas(canvas, numFloatingNodesVisible) {
    this.visibleFloatingNodes = numFloatingNodesVisible || 20;
    this.floatingNodes = [];
    this.canvas = canvas;
    this.isPaused = false;
    this.stepTimestamp = null;
    this.stepPreviousTimeStamp = null;
    
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = this.canvas.parentElement.clientHeight;

    // init floatingNodes
    var floatingNode;
    const hue = random(0, 360);
    for (i = 0; i < MAX_NODES; i++) {
        floatingNode = new FloatingNode(this.getRandomCanvasPoint(), { hue });
        this.floatingNodes.push(floatingNode);
    }

    // start the loop
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

AnimationCanvas.prototype.getRandomCanvasPoint = function getRandomCanvasPoint(originX, originY) {
    originX = originX || random(0, this.canvas.width);
    originY = originY || random(0, this.canvas.height);
    const maxDistanceX = this.canvas.width * 0.3;
    const maxDistanceY = this.canvas.height * 0.3;
    let startX = originX - (maxDistanceX * 0.5);
    let endX = originX + (maxDistanceX * 0.5);
    if (startX < 0) {
        const offset = 0 - startX;
        startX = startX + offset;
        endX = endX + offset;
    } else if (startX > this.canvas.width) {
        const offset = startX - this.canvas.width;
        startX = startX + offset;
        endX = endX + offset;
    }
    let startY = originY - (maxDistanceY * 0.5);
    let endY = originY + (maxDistanceY * 0.5);
    if (startY < 0) {
        const offset = 0 - startY;
        startY = startY + offset;
        endY = endY + offset;
    } else if (startY > this.canvas.height) {
        const offset = startY - this.canvas.height;
        startY = startY + offset;
        endY = endY + offset;
    }
    return {
        x: random(startX, endX),
        y: random(startY, endY),
    }
}

AnimationCanvas.prototype.pause = function pause() {
    this.isPaused = true;
}

AnimationCanvas.prototype.unpause = function unpause() {
    this.isPaused = false;
}

AnimationCanvas.prototype.step = function step(timestamp) {
    if (this.stepTimestamp === undefined) {
        this.stepTimestamp = timestamp;
    }

    if (this.stepPreviousTimeStamp !== timestamp) {
        this.updateFrame();
        this.drawFrame();
    }

    this.stepPreviousTimeStamp = timestamp
    window.requestAnimationFrame(step.bind(this));
}

AnimationCanvas.prototype.drawFrame = function drawFrame() {   
    if (!this.canvas.getContext) return;
    var canvas = this.canvas;
    // var cw = this.canvas.width;
    // var ch = this.canvas.height;
    var ctx = canvas.getContext('2d');

    // Clear
    // ctx.clearRect(0, 0, cw, ch);

    for ( var i = 0, n = this.visibleFloatingNodes; i < n; i++ ) {
        this.floatingNodes[i].draw(ctx);
    }
}

AnimationCanvas.prototype.updateFrame = function updateFrame() {
    var floatingNode;
    for ( var i = 0, n = this.visibleFloatingNodes; i < n; i++ ) {

        floatingNode = this.floatingNodes[i];

        floatingNode.parent = (i + 1 < this.visibleFloatingNodes) ? this.floatingNodes[i + 1] : this.floatingNodes[0];

        if (!floatingNode.moving){
            const randomPoint = this.getRandomCanvasPoint(floatingNode.x, floatingNode.y);
            floatingNode.move(randomPoint.x, randomPoint.y);
        }

        if (!floatingNode.colorChanging){
            const color = randomThemedColor(floatingNode.hue);
            floatingNode.changeColor(
                color.hue,
                color.saturation,
                color.lightness,
            );
        }

        floatingNode.update();
    }
}

AnimationCanvas.prototype.save = function save() {
    window.open( this.canvas.toDataURL(), 'floatingNodes', "top=0,left=0,width=" + this.canvas.width + ",height=" + this.canvas.height );
}


new AnimationCanvas(document.querySelector('.PastelArtBG'));
