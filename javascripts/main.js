/*
	multistr: true,
	debug:true,
	forin:true,
	noarg:true,
	noempty:true,
	eqeqeq:true,
	bitwise:true,
	strict:true,
	undef:true,
	unused:true,
	curly:true,
	browser:true,
	jquery:true,
	node:true,
	indent:4,
	devel:true
*/
function Linker(){
	this.spaceX = 5;
	this.spaceY = 6;
	this.typeNum = 5;
	this.board = [];
}
Linker.prototype._random = function(biggestNum) {
	return Math.round(Math.random()*(biggestNum-1)) + 1;
}
Linker.prototype.GenerateBoard = function(){
	for(var i=0; i<this.spaceY+2; ++i) {
		this.board[i] = [];
		for(var j=0; j<this.spaceX + 2; ++j) {
			if (i===0 || i=== this.spaceY+1) {
				this.board[i][j] = 0;
			} else if (j===0 || j===this.spaceX+1) {
				this.board[i][j] = 0;
			} else {
				this.board[i][j] = this._random(this.typeNum);
			}
		}
	}
}

Linker.prototype.getLocateValue = function(locate) {
	if (locate.y >= 0 && locate.y < this.spaceY+2 && locate.x >=0 && locate.x < this.spaceX+2) {
		return this.board[locate.y][locate.x];
	}
};
Linker.prototype._rotate = function(locate, rotateIndex) {
	var curlocates = [
		{"y": locate.y-1, "x": locate.x}, 
		{"y": locate.y, "x": locate.x+1},
		{"y": locate.y+1, "x": locate.x},
		{"y": locate.y, "x": locate.x-1}
	];
	return 	curlocates[rotateIndex];
};
/*
Linker.prototype._judgeValue = function(locate, value, rotateIndex) {
	if (rotateIndex == 4) {
		return {"value":-1, "index":rotateIndex};
	}
	var curLocate = this._rotate(locate, rotateIndex);

	if (curLocate.x < 0 || curLocate.x > this.spaceX+1) {
		return this._judgeValue(locate, value, ++rotateIndex);
	}
	if (curLocate.y < 0 || curLocate.y > this.spaceY+1) {
		return this._judgeValue(locate, value, ++rotateIndex);
	}
	var curValue = this.getLocateValue(curLocate);
	if (curValue === 0) {
		return {"value":1, "index":rotateIndex};
	} else if (curValue === value) {
		return {"value":0, "index":rotateIndex};
	} else {
		return this._judgeValue(locate, value, ++rotateIndex);
	}
};*/

Linker.prototype.getNdir = function(rotateIndex) {
	switch(rotateIndex) {
		case 0:
			return 2;
		case 1:
			return 3;
		case 2:
			return 0;
		case 3:
			return 1;
		default:
			break;
	}
};
Linker.prototype._judgeValue = function(locate, value, rotateIndex) {
	var curlocates = [
		{"y": locate.y-1, "x": locate.x}, 
		{"y": locate.y, "x": locate.x+1},
		{"y": locate.y+1, "x": locate.x},
		{"y": locate.y, "x": locate.x-1}
	];
	var curStack = [];
	for(var i=3; i>=0; --i) {
		if (typeof rotateIndex != "undefined" && i == this.getNdir(rotateIndex) ) {
			continue;
		}
		var curValue = this.getLocateValue(curlocates[i]);
		if (typeof curValue != "undefined") {
			if (curValue === 0) {
				curStack.push({"locate": curlocates[i], "index": i});
			} else if (curValue === value){
				// done;
				return {"result":true, "locate": curlocates[i]};
			}
		}
	}
	return {"result": false, "pathPoint": curStack}
};

Linker.prototype.findPair = function(locate, value, path, totalStack, index) {
	if (typeof value === "undefined") {
		value = this.getLocateValue(locate);
	}
	if (typeof path === "undefined") {
		path = [];
	};
	path.push(locate);
	var curResult = this._judgeValue(locate, value, index);
	if (typeof totalStack === "undefined") {
		totalStack = [];
	}
	if (!curResult.result) {
		totalStack = totalStack.concat(curResult.pathPoint);
		if (totalStack.length != 0) {
			var curCell = totalStack.pop();

			return this.findPair(curCell.locate, value, path, totalStack, curCell.index);
		} else{
			return {"result":false, "detail":path};
			// none;
		}
	} else{
		path.push(curResult.locate);
		return {"result":true, "detail": path};
		// done;
	}



/*
	if (typeof rotateIndex == "undefined") {
		rotateIndex = 0;
	};
	if (typeof value == "undefined") {
		value = this.getLocateValue(locate);
	}
	var judged = this._judgeValue(locate, value, rotateIndex);
	if (judged.value === 1) {
		// go ahead;
		if (typeof stack === "undefined") {
			stack = [];
		}
		stack.push({"locate":locate, index:judged.index});
		this.findPair(this._rotate(locate, judged.index), value, stack);
	} else if (judged === 0) {
		// done;
		return true;
	} else {
		if (stack.length == 0) {
			return false;
		} else{
			var curValue = stack.pop();
			this.findPair(curValue.locate, value, stack, index);			
		}
	}
	*/
};

Linker.prototype.testBoard = function() {
	var strAry = [];
	for (var i = 0; i < this.board.length; i++) {
		strAry[i] = this.board[i].join(" ");
	};
	console.log(strAry.join("\n"));
	return strAry.join("\n");
};

$(function(){
	var testLinker = new Linker();
	testLinker.GenerateBoard();
	testLinker.testBoard();
	var maxX = testLinker.spaceX;
	var maxY = testLinker.spaceY;
	var me = testLinker;
	setInterval(function() {
		for(var i=1; i<maxX; ++i) {
			for(var j=1; j<maxY; ++j) {
				if (me.getLocateValue({"x":i, "y":j}) != 0) {
					var a = testLinker.findPair({"x":i, "y":j});
					if (a.result) {
						me.board[a.detail[0].x][a.detail[0].y] = 0;
						var lastCell = a.detail[a.detail.length-1];
						me.board[lastCell.x][lastCell.y] = 0;
					}
					testLinker.testBoard();
					break;
				}
			}
		}
		
	}, 1000);
})