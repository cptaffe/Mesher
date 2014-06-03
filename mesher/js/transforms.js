// Transform Library v0.2

function makeTrans(x, y, z, trans){
	var 
	// parse inputs
	if (isNaN(x = parseFloat(x))) {x = t.def;}
	if (isNaN(y = parseFloat(y))) {y = t.def;}
	if (isNaN(z = parseFloat(z))) {z = t.def;}
	// create object
	var h = new Trans(new trans([x, y, z]));
	h.go(); // calls function
	h.Set(); // sets function
}


// Scale
function Scale(){
	this.def = 1.0;
}

Scale.prototype.init = function(par){
	this.par = par;
}

Scale.prototype.go = function(){
	for (var i = 0; i < geometry.vertices.length; i++) {
		geometry.vertices[i].x *= this.par[0];
		geometry.vertices[i].y *= this.par[1];
		geometry.vertices[i].z *= this.par[2];
	}
	geometry.verticesNeedUpdate = true;
}

Scale.prototype.undo = function(){
	for (var i = 0; i < geometry.vertices.length; i++) {
		geometry.vertices[i].x /= this.last[0];
		geometry.vertices[i].y /= this.last[1];
		geometry.vertices[i].z /= this.last[2];
	}
	geometry.verticesNeedUpdate = true;
}

// Shift
function Shift(par){
	this.par = par
	this.def = 1.0;
}

Shift.prototype.call = function(){
	for (var i = 0; i < geometry.vertices.length; i++) {
		geometry.vertices[i].x += this.par[0];
		geometry.vertices[i].y += this.par[1];
		geometry.vertices[i].z += this.par[2];
	}
	geometry.verticesNeedUpdate = true;
}

Shift.prototype.undo = function(){
	for (var i = 0; i < geometry.vertices.length; i++) {
		geometry.vertices[i].x -= this.last[0];
		geometry.vertices[i].y -= this.last[1];
		geometry.vertices[i].z -= this.last[2];
	}
	geometry.verticesNeedUpdate = true;
}


