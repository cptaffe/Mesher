// Transform Library v0.2

// The All Powerfuller Meser Object!
function Mesher(){
	// Mesher library
}

// The All Powerful project Object!
function Project(){
	this.Hist = new Array(); // stack of Trans objects
}

// History framework
//{func: function, params: [x, y, z]}

function Trans(trans){
	this.trans = trans
	// automatically record
	this.index = this.record();
}

// calls a function
Trans.prototype.go = function(){
	this.tran.go();
}

// undoes a function
Trans.prototype.undo = function(){
	this.tran.undo();
}

Trans.prototype.record = function(){
	return Hist.push(this) -1; // returns index
}

Trans.prototype.toString = function(){
	var s = new Array();
	s.push(this.func.name, '(');
	var p = new Array();
	for (var i = 0; i < this.params.length; i++){
		p.push(this.params[i])
	}
	s.push(p.join(', '));
	s.push(')');
	return s.join('');
}

Trans.prototype.Set = function(){
	var s = document.createElement('p');
	s.appendChild(document.createTextNode(this.toString()));
	s.setAttribute('onclick', 'Hist['+this.index+'].call()')
	var h = document.getElementById('hist');
	h.insertBefore(s, h.firstChild);
}

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


