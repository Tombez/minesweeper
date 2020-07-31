var icons = {
	1: "aSAAAAAAAA//8CEQAhICESABMAISACEgAhIAISABE0A=",
	2: "mSAAAAAAB7AP8BEjATQAISAjEgMRIAITAhMAIRIAMRJQ",
	3: "mSAAAAAP8AAP8UARQCMSAjEgIRMAIRMAIxICMRNQ",
	4: "mSAAAAAAAAe/8AEgEgISASABIAEgASABIBElADEgIxICMSAjEgA=",
	5: "mSAAAAAHsAAP8SNQIxICMUARQCMSAjETUA==",
	6: "mSAAAAAAB7e/8BEjAUASAjEgIxQBNAAhEwAhNAESMA==",
	7: "mSAAAAAAAAAP8RJQIxICMSADEgIxIAMSAjEgAxICMSAg",
	8: "mSAAAAAHt7e/8BEjATQAIRMAISARIwARIwEgAhEwAhNAESMA",
	bomb: "zDAAAAAAAAAP//////AEEANRADQQFAEEE0BBEiFAAxEiFAAUUAFQAxUEE0BBAUAQA0EANRAE",
	flag: "eTAAAAAP8AAP8AAAD/AxEAMRMDFAAxEwBBEDQgNCBCIwAiNF",
	tile: "/ye3t7/729vf8FEjQBI0ASNAEjQBI0ASNAEjQBI0ASNAEjQBI0ASNAEjQBI0ASNA",
	tileCovered: "/z/////729vf97e3v/A0UQBFEgARNSIAETUiABE1IgARNSIAETUiABE1IgARNSIAETUiABE1IgARNSIAETUiABE1IgEiRRI0UA==",
	x: "yyAAAAAP8AAP8RBBEBECMRAhEDEQMRAhECMRARBBIAQSBBEBECMRAhEDEQMRAhECMRARBBE="
};

for (var prop in icons) {
	var data = atob(icons[prop]).split("").map(c => c.charCodeAt(0));
	var i = 0;
	var getNibble = () => (data[i >> 1] >> ((i++) & 1 ? 0 : 4)) & 0x0f;
	var getByte = () => getNibble() << 4 | getNibble();
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");
	canvas.width = getNibble() + 1;
	canvas.height = getNibble() + 1;
	var numColors = getNibble();
	var colors = [];
	for (let n = 0; n < numColors; ++n) {
		colors.push({
			rgb: "#" + (1 << 24 | getByte() << 16 |
				getByte() << 8 | getByte()).toString(16).slice(1),
			alpha: getByte() / 255.0
		});
	}
	var prevColor = null;
	var repeat = 0;
	var rect = (x, y, color) => {
		ctx.fillStyle = color.rgb;
		ctx.globalAlpha = color.alpha;
		ctx.fillRect(x, y, 1, 1);
	};
	for (var y = 0; y < canvas.height; ++y) {
		for (var x = 0; x < canvas.width; ++x) {
			if (repeat) {
				rect(x, y, prevColor);
				--repeat;
				continue;
			}
			if (i >= data.length * 2) {
				console.log(prop + "is bad");
			}
			var colorIndex = getNibble();
			if (colorIndex >= colors.length) {
				repeat = Math.pow(2, colorIndex - colors.length + 1);
				--x;
				continue;
			}
			rect(x, y, prevColor = colors[colorIndex]);
		}
	}
	icons[prop] = canvas;
}

function decode(str) {
	var hex = atob(str).split("").map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join("");
	var width = parseInt(hex.charAt(0), 16) + 1;
	var height = parseInt(hex.charAt(1), 16) + 1;
	var numColors = parseInt(hex.charAt(2), 16);
	var indices = hex.slice(numColors * 8 + 3);
	var reg = new RegExp(`[${numColors}-9a-f]`, "g");
	var reg2 = new RegExp(`([0-${numColors - 1}])([${numColors}-9a-f])`, "g");
	while (reg.test(indices)) {
		indices = indices.replace(reg2, (match, p1, p2) => {
			return p1 + p1.repeat(Math.pow(2, parseInt(p2, 16) - numColors + 1));
		});
	}
	indices = indices.slice(0, width * height);
	var reg3 = new RegExp(`((?:. ){${width - 1}}.) `, "g");
	indices = indices.split("").join(" ").replace(reg3, "$1\n");
	return hex.slice(0, numColors * 8 + 3) + "\n" + indices;
}

function encode(str) {
	str = str.replace(/\W/g, "");
	var width = parseInt(str.charAt(0), 16);
	var height = parseInt(str.charAt(1), 16);
	var numColors = parseInt(str.charAt(2), 16);
	var indices = str.slice(numColors * 8 + 3);
	var reg = new RegExp(`([0-${numColors - 1}])\\1*`, "g");
	indices = indices.replace(reg, (match, p1) => {
		var len = match.length - 1;
		var result = p1;
		if (len & 1) {
			result += p1;
		}
		len >>= 1;
		for (var a = numColors; len > 0; len >>= 1, ++a) {
			if (len & 1) {
				var repeat = a.toString(16);
				if (repeat.length > 1) {
					throw new Error("needed to repeat too many times");
				}
				result += repeat;
			}
		}
		return result;
	});
	var hex = str.slice(0, numColors * 8 + 3) + indices;
	if (hex.length & 1) {
		hex += "0";
	}
	return btoa(hex.match(/../g).map(c => String.fromCharCode(parseInt(c, 16))).join(""));
}
