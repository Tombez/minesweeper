var height = 10;
var width = 20;
var tileSize = 50;
var canvas = 0;
var ctx = 0;
var boxes = [];
var lose = false;
var win = false;
console.log("running");
function start() {
	canvas = document.getElementById("canvas");
	canvas.width = tileSize*width;
	canvas.height = tileSize*height;
	ctx = canvas.getContext("2d");
	for (n=0;n<width*height;n++) {
		boxes.push({x:n % width,y:Math.floor(n / width), b:false, d:false, v:0, f:false});
	}
	var temp = 0;
	while (temp<width*height/5) {
		var rand = Math.floor(Math.random() * 199);
		if (boxes[rand].b==false) {
			boxes[rand].b = true;
			delete boxes[rand].v;
			temp++;
		}
	}
	for (n=0;n<width*height;n++) {
		if (boxes[n].b==false) {
			function bfinder(value) {
				if (boxes[value].b==true) {
					boxes[n].v+=1;
				}
			}
			var tmpx = boxes[n].x;
			var tmpy = boxes[n].y;
			if (tmpx != 0) {
				bfinder(n-1);
			}
			if (tmpx != width-1) {
				bfinder(n+1);
			}
			if (tmpy != 0) {
				bfinder(n-20);
			}
			if ((tmpy != 0) && (tmpx != 0)) {
				bfinder(n-21);
			}
			if ((tmpy != 0) && (tmpx != width-1)) {
				bfinder(n-19);
			}
			if (tmpy != height-1) {
				bfinder(n+20);
			}
			if ((tmpy != height-1) && (tmpx != width-1)) {
				bfinder(n+21);
			}
			if ((tmpx != 0) && (tmpy != height-1)) {
				bfinder(n+19);
			}
		}
	}
	draw();
}

document.getElementById("canvas").onmousedown = function(event) {
	 event.preventDefault();
	if (event.which == 3 && !lose && !win) {
		x = Math.floor(event.clientX / 50);
		y = Math.floor(event.clientY / 50);
		var index = y * width + x;
		if (boxes[index].f) {
			boxes[index].f = false;
		} else if (boxes[index].d==false) { 
			boxes[index].f = true;
		}
		draw();
		win = true;
		for (n=0;n<boxes.length;n++) {
			if (boxes[n].b && boxes[n].f==false) {
				win = false;
			}
			if (boxes[n].v==0 && boxes[n].d==false) {
				win = false;
			}
		}
		if (win) {
			ctx.beginPath();
			//ctx.clearRect(0,0,1000,500);
			ctx.fillStyle = "green";
			ctx.font = "100px Arial";
			ctx.fillText("You Win!", 330, 260);
			ctx.stroke();
			ctx.fill();
			ctx.closePath();
			return
		}
		win = false;
	}
	if (lose || win) {
		window.location.reload();
		return;
	}
	if (lose==false && event.which!=3) {
		click(event.clientX, event.clientY);
	}
}

function click(x, y) {
	x = Math.floor(x / 50);
	y = Math.floor(y / 50);
	var index = y * width + x;
	if (boxes[index].f==false) {
		boxes[index].d = true;
	}
	if (boxes[index].b && boxes[index].f==false) {
		
		lose = true;
		draw();
		ctx.beginPath();
		//ctx.clearRect(0,0,1000,500);
		ctx.fillStyle = "red";
		ctx.font = "100px Arial";
		ctx.fillText("You Lose!", 300, 260);
		ctx.stroke();
		ctx.fill();
		ctx.closePath();
		return
	}
	
	if (win == false) {
		var empty = [];
		empty.push(boxes[index]);
		var w = 0;
		while (empty[0].v==0) {
			if (w==empty.length) {
				break
			}
			var n = empty[w].x + empty[w].y * width;
			w += 1;
			var value = 0;
			function discover(value) {
				boxes[value].d = true;
				if (boxes[value].v==0 && containsObject(boxes[value], empty)==false) {
					empty.push(boxes[value]);
				}
			}
			var tmpx = boxes[n].x;
			var tmpy = boxes[n].y;
			if (tmpx != 0) {
				discover(n-1);
			}
			if (tmpx != width-1) {
				discover(n+1);
			}
			if (tmpy != 0) {
				discover(n-20);
			}
			if ((tmpy != 0) && (tmpx != 0)) {
				discover(n-21);
			}
			if ((tmpy != 0) && (tmpx != width-1)) {
				discover(n-19);
			}
			if (tmpy != height-1) {
				discover(n+20);
			}
			if ((tmpy != height-1) && (tmpx != width-1)) {
				discover(n+21);
			}
			if ((tmpx != 0) && (tmpy != height-1)) {
				discover(n+19);
			}
		}
		draw();
	}
}

function draw() {
	ctx.clearRect(0,0,1000,500);
	ctx.font = "30px Arial";
	ctx.fillStyle = "grey";
	
	for (n=0; n<boxes.length; n++) {
		if (boxes[n].d==true) {
			ctx.beginPath();
			ctx.fillStyle = "grey";
			ctx.rect(n % width * 50, Math.floor(n / width) * 50,50,50);
			ctx.fill();
			ctx.closePath();
			if (boxes[n].hasOwnProperty("v") && boxes[n].v != 0) {
				ctx.beginPath();
				ctx.fillStyle = "white";
				ctx.fillText(boxes[n].v, n % width * 50 + 18, Math.floor(n / width) * 50 + 35);
				ctx.fill();
			} else if (boxes[n].b==true) {
				ctx.beginPath();
				//ctx.moveTo(n % width + 25, n / width + 25);
				ctx.fillStyle = "red";
				ctx.arc(boxes[n].x * 50 + 25, boxes[n].y * 50 + 25, 12.5, 0, 2*Math.PI);
				ctx.fill();
			}
		}
		if (boxes[n].f==true) {
			ctx.beginPath();
			ctx.fillStyle = "black";
			ctx.arc(boxes[n].x * 50 + 25, boxes[n].y * 50 + 25, 12.5, 0, 2*Math.PI);
			ctx.fill();
		}
	}
	
	ctx.strokeStyle = "black";
	ctx.beginPath();
	for (n=0; n<=height; n++) {
		ctx.moveTo(0,n*50);
		ctx.lineTo(width*50,n*50);
	}
	for (n=0;n<=width;n++) {
		ctx.moveTo(n*50,0);
		ctx.lineTo(n*50,height*50);
	}
	ctx.stroke();
	ctx.closePath();
}

function containsObject(obj, list) {
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }
    return false;
}

start();