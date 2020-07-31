var cols = 20;
var rows = 20;
var tileSize = ~~(Math.min(window.innerWidth, window.innerHeight) / Math.max(cols, rows));
var numOfBombs = Math.round((cols * rows) * 0.2);

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.width = cols * tileSize;
canvas.height = rows * tileSize;
var tiles = [];
var firstClickFuntion;
var flagsLeft = numOfBombs;
var hasWon = false;
var hasLost = false;
var flagIcon = icons.flag;
var bombIcon = icons.bomb;

ctx.strokeStyle = "black";
ctx.font = (tileSize * 7 / 8) + "px Arial";
ctx.lineWidth = 1;

window.addEventListener("resize", function() {
	tileSize = ~~(Math.min(window.innerWidth, window.innerHeight) / Math.max(cols, rows));
	canvas.width = cols * tileSize;
	canvas.height = rows * tileSize;
	ctx.strokeStyle = "black";
	ctx.font = (tileSize * 7 / 8) + "px Arial";
	ctx.lineWidth = 1;
	draw();
});
canvas.addEventListener("click", firstClickFunction = function(event) { // Capture first click and makes sure first click and it's neighbors aren't bombs.
	canvas.removeEventListener("click", firstClickFunction); // Remove itself.
	firstClickFunction = null;
	var x = ~~(event.clientX / tileSize); // ~~ is a double bitwise NOT operator, it removes any decimal value.
	var y = ~~(event.clientY / tileSize);
	checkNeighbors(function(i, j) {
		tiles[x + i][y + j].isBomb = true;
	}, x, y);
	initBombs();
	checkNeighbors(function(i, j) {
		tiles[x + i][y + j].isBomb = false;
	}, x, y);
	initValues();
	discover(x, y);
	draw();
});
canvas.addEventListener("mouseup", function(event) { // Manages user interation.
	if (!hasLost && !hasWon && !firstClickFunction) {
		var x = ~~(event.clientX / tileSize);
		var y = ~~(event.clientY / tileSize);
		if (event.which != 3) { // If it's not a right click.
			if (!tiles[x][y].hasFlag) {
				if (tiles[x][y].isBomb) {
					hasLost = true;
					tiles[x][y].isDiscovered = true;
				} else if (!tiles[x][y].isDiscovered) {
					discover(x, y);
				}
			}
		} else { // If it's a right click.
			if (!tiles[x][y].isDiscovered && !(flagsLeft == 0 && !tiles[x][y].hasFlag)) {
				tiles[x][y].hasFlag = !tiles[x][y].hasFlag;
				flagsLeft = (tiles[x][y].hasFlag ? flagsLeft - 1 : flagsLeft + 1);
			}
		}
		hasWon = true; // Check win.
		forAll(function(x, y) {
			if (tiles[x][y].isBomb && !tiles[x][y].hasFlag) {
				hasWon = false;
			}
		});
		draw();
	}
});
function initTiles() { // Fills the two dimensional array with empty objects.
	for (var x = 0; x < cols; x++) {
		tiles[x] = [];
		for (var y = 0; y < rows; y++) {
			tiles[x][y] = {};
		}
	}
}
function initBombs() { // Randomly picks bomb placement.
	if (numOfBombs + 9 > cols * rows) {
		alert("Too many bombs to place.");
		return;
	}
	var randX, randY;
	for (var n = 0; n < numOfBombs; n++) {
		randX = ~~(Math.random() * cols);
		randY = ~~(Math.random() * rows);
		if (tiles[randX][randY].isBomb) { // If tile is already a bomb.
			n--;
			continue;
		}
		tiles[randX][randY].isBomb = true;
	}
}
function initValues() { // Sets the number of neighboring bombs for each tile.
	for (var y = 0; y < rows; y++) {
		for (var x = 0; x < cols; x++) {
			if (!tiles[x][y].isBomb) {
				tiles[x][y].closeBombs = 0;
				checkNeighbors(function(i, j) {
					if (tiles[x + i][y + j].isBomb) {
						tiles[x][y].closeBombs++;
					}
				}, x, y);
			}
		}
	}
}
function discover(x, y) { // Marks tiles as discovered recursively.
	tiles[x][y].isDiscovered = true;
	if (tiles[x][y].closeBombs == 0) {
		checkNeighbors(function(i, j) {
			if (!tiles[x + i][y + j].isDiscovered) {
				discover(x + i, y + j);
			}
		}, x, y);
	}
}
function checkNeighbors(forEach, x, y) { // Loops through the laplacian neighbors.
	for (var j = -1; j < 2; j++) {
		for (var i = -1; i < 2; i++) {
			if (x + i != -1 && x + i != cols && y + j != -1 && y + j != rows) {
				forEach(i, j);
			}
		}
	}
}
function forAll(forEach) { // Loops through all the 'tile' objects.
	for (var y = 0; y < rows; y++) {
		for (var x = 0; x < cols; x++) {
			forEach(x, y);
		}
	}
}
function drawImgAtTile(img, x, y) {
	ctx.imageSmoothingEnabled = false;
	var dh = tileSize * (img.height / 16);
	var dw = img.width * (dh / img.height);
	var dx = (x + 0.5) * tileSize - dw / 2;
	var dy = (y + 0.5) * tileSize - dh / 2;
	ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, dw, dh);
}
function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas.

	ctx.beginPath(); // Draw discovered.
	ctx.fillStyle = "#777777";
	forAll(function(x, y) {
		if (tiles[x][y].isDiscovered) {
			ctx.moveTo(x * tileSize, y * tileSize);
			ctx.rect(x * tileSize, y * tileSize, tileSize, tileSize);
		}
	});
	ctx.fill();
	forAll(function(x, y) { // Draw numbers and flags and sometimes bombs.
		var tile = tiles[x][y];
		if (tile.isDiscovered) {
			drawImgAtTile(icons.tile, x, y);
			if (tile.closeBombs) {
				var icon = icons[tile.closeBombs];
				drawImgAtTile(icon, x, y);
			}
			if (tile.isBomb) {
				ctx.fillStyle = "#ff0000";
				var dx = (x + 1/16) * tileSize;
				var dy = (y + 1/16) * tileSize;
				ctx.fillRect(dx, dy, tileSize - 1/16, tileSize - 1/16);
				drawImgAtTile(icons.bomb, x, y);
			}
		} else {
			drawImgAtTile(icons.tileCovered, x, y);
			if (hasLost) {
				if (tile.hasFlag) {
					if (tile.isBomb) {
						drawImgAtTile(icons.flag, x, y);
					} else {
						drawImgAtTile(icons.tile, x, y);
						drawImgAtTile(icons.bomb, x, y);
						drawImgAtTile(icons.x, x, y);
					}
				} else if (tile.isBomb) {
					drawImgAtTile(icons.tile, x, y);
					drawImgAtTile(tile.hasFlag ? icons.flag : icons.bomb, x, y);
				}
			} else if (tile.hasFlag) {
				drawImgAtTile(icons.flag, x, y);
			}
		}
	});
	if (hasLost || hasWon) { // Extras.
		ctx.font = canvas.width / 7 + "px Arial";
		ctx.fillStyle = (hasLost ? "red" : "green");
		ctx.strokeStyle = "black";
		ctx.lineWidth = 3;
		ctx.globalAlpha = 0.5;
		var text = hasLost ? "You Lost! :(" : "You Won! :)";
		var x = canvas.width / 8;
		var y = canvas.height / 2 + (canvas.width / 30);
		var maxWidth = canvas.width * 3 / 4;
		ctx.fillText(text, x, y, maxWidth);
		ctx.strokeText(text, x, y, maxWidth);
		ctx.globalAlpha = 1;
	}
}

initTiles();
draw();
