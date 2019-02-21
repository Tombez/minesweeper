"use strict";

/* User Variables */
var gridHeight = Math.min(window.innerWidth, window.innerHeight);
var r = 10; // Number of spaces from center and corner (excluding the center).

var canvas;
var ctx;
var spaces;
Math.ROOT_THREE = Math.sqrt(3);
var cols = r * 2 + 1;
var hexagonSideLength = gridHeight / (cols * Math.ROOT_THREE);
var gridWidth = hexagonSideLength * (3/2 * cols + 1/2);
var nodes = ((r + 1) * r / 2 * 6 + 1);
var amountOfDanger = ~~(nodes * 0.25);

var directions = [{x: 1, y: -1}, {x: 0, y: -1}, {x: -1, y: 0}, {x: -1, y: 1}, {x: 0, y: 1}, {x: 1, y: 0}];
var corners = [{x: 2, y: Math.ROOT_THREE/2}, {x: 3/2, y: 0}, {x: 1/2, y: 0},
	{x: 0, y: Math.ROOT_THREE/2}, {x: 1/2, y: Math.ROOT_THREE}, {x: 3/2, y: Math.ROOT_THREE}];

function initCanvas() {
	canvas = document.getElementById("canvas");
	canvas.width = gridWidth;
	canvas.height = gridHeight;

	ctx = canvas.getContext("2d");
	ctx.strokeStyle = "black";
	ctx.scale(hexagonSideLength, hexagonSideLength);
	ctx.lineWidth = 2 / hexagonSideLength;
}
function initListeners() {
	canvas.addEventListener("mousedown", function(event) {
		ctx.beginPath();
		ctx.strokeStyle = "red";
		ctx.arc(event.offsetX/hexagonSideLength, event.offsetY/hexagonSideLength, 5/hexagonSideLength, 0, 2*Math.PI);
		ctx.stroke();
		var spaceXY = mouseToSpace(event.offsetX, event.offsetY);
		console.log(spaceXY);
		//if (spaceXY) {
			var x = spaceXY.x;
			var y = spaceXY.y;
			spaces[x][y].discovered = true;
			//draw();
		//}
		//console.log("best: ", x, y);
		var drawX = getDrawX(x);
		var drawY = getDrawY(y, x);
		ctx.beginPath();
		ctx.strokeStyle = "blue";
		ctx.translate(drawX, drawY);
			strokeSpace(x, y);
		ctx.translate(-drawX, -drawY);
		ctx.stroke();
	});
}
function initSpaces() {
	spaces = {};
	for (let x = -r; x <= r; x++) {
		spaces[x] = {};
		let start = Math.max(-(r + x), -r);
		let end = Math.min(r - x, r);
		for (let y = start; y <= end; y++) {
			spaces[x][y] = {};
		}	
	}
}
function getDrawX(spaceX) {
	return (spaceX + r) * 3/2; // * hexagonSideLength
}
function getDrawY(spaceY, spaceX) {
	var colTopOffset = (spaceX + 2*r) / 2; // * Math.ROOT_THREE;
	return (spaceY + colTopOffset) * Math.ROOT_THREE; // * hexagonSideLength;
}
// canvasY / (Math.ROOT_THREE * hexagonSideLength) - ((hypX + 2*r) / 2) = hypY
function mouseToSpace(canvasX, canvasY) {
	var hypX = ~~(canvasX / (3/2 * hexagonSideLength)) - r;
	var hypY = Math.round(canvasY / (Math.ROOT_THREE * hexagonSideLength) - ((hypX + 2*r) / 2));
	console.log("hyp: ", hypX, hypY);

		var drawX = getDrawX(hypX);
		var drawY = getDrawY(hypY, hypX);
		ctx.beginPath();
		ctx.strokeStyle = "green";
		ctx.translate(drawX, drawY);
			strokeSpace(hypX, hypY);
		ctx.translate(-drawX, -drawY);
		ctx.stroke();

	var least = Number.POSITIVE_INFINITY;
	var bestX = null;
	var bestY = null;
	ctx.beginPath(); ctx.strokeStyle = "purple";
	directions.push({x: 0, y: 0});
	for (let direction of directions) {
		let neighborX = hypX + direction.x;
		let neighborY = hypY + direction.y;
		if (spaces[neighborX]) {
			if (spaces[neighborX][neighborY]) {
				var drawNeiX = (getDrawX(neighborX) * hexagonSideLength + hexagonSideLength);
				var drawNeiY = (getDrawY(neighborY, neighborX) * hexagonSideLength + Math.ROOT_THREE / 2 * hexagonSideLength);
				ctx.moveTo(drawNeiX/hexagonSideLength, drawNeiY/hexagonSideLength);ctx.lineTo(canvasX/hexagonSideLength, canvasY/hexagonSideLength);
				var difX = canvasX - drawNeiX;
				var difY = canvasY - drawNeiY;
				var distSqrd = difX * difX + difY * difY;
				if (distSqrd < least) {
					least = distSqrd;
					bestX = neighborX;
					bestY = neighborY;
				}
			}
		}
	}
	directions.pop();
	ctx.stroke();
	if (bestX !== null) {
		return {x: bestX, y: bestY};
	}
}

function fillSpace(x, y, space) {
	ctx.beginPath();
	ctx.fillStyle = space.discovered ? "#888" : "#CCC";
	ctx.moveTo(corners[0].x, corners[0].y);
	for (let n = 1; n < corners.length; n++) {
		ctx.lineTo(corners[n].x, corners[n].y);
	}
	ctx.closePath();
	ctx.fill();
}
function strokeSpace(x, y) {
	var corner = corners[corners.length - 1];
	ctx.moveTo(corner.x, corner.y);
	for (corner of corners) {
		ctx.lineTo(corner.x, corner.y);
	}
}
function drawAll(exec) {
	for (let x = -r; x <= r; x++) {
		var drawX = getDrawX(x);
		var yStart = Math.max(-(r + x), -r);
		var yEnd = Math.min(r - x, r);
		for (let y = yStart; y <= yEnd; y++) {
			var drawY = getDrawY(y, x);
			ctx.translate(drawX, drawY);
				exec(x, y, spaces[x][y]);
			ctx.translate(-drawX, -drawY);
		}
	}
}
function draw() {
	drawAll(fillSpace);
	ctx.beginPath();
	drawAll(strokeSpace);
	ctx.stroke();
}

// Main:
initCanvas();
initListeners();
initSpaces();
draw();