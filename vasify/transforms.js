/*
This is the defualt transformations library.
It works with the Tools API, which specifies
 */

var Hist = new Array();

// History framework
//{func: function, params: [x, y, z]}

function Trans(map){
	this.func = map['func'];
	this.params = map['params'];
	// automatically record
	this.index = this.record();
}

// calls a function
Trans.prototype.call = function(){
	this.func(this.params);
}

Trans.prototype.record = function(){
	Hist.push(this);
	return Hist.length - 1
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

// Default Transformations
var lastScale = [1.0,1.0,1.0]; // for reverting after scale
var lastRotate = [0.0,0.0,0.0];
var lastShift = [0.0, 0.0, 0.0];

// Set functions parse the 
function setTrans(x, y, z, trans){
	if (isNaN(px = parseFloat(x))) {
		px = 1.0;
	}
	if (isNaN(py = parseFloat(y))) {
		py = 1.0;
	}
	if (isNaN(pz = parseFloat(z))) {
		pz = 1.0
	}
	var t = new Trans({
		func: trans,
		params: [px, py, pz]
	})
	t.call();
	t.Set(); // shows on page
}

function Scale(par){
	for (var i = 0; i < geometry.vertices.length; i++) {
		geometry.vertices[i].x *= (par[0]/lastScale[0]);
		geometry.vertices[i].y *= (par[1]/lastScale[1]);
		geometry.vertices[i].z *= (par[2]/lastScale[2]);
	}
	// save state
	lastScale[0] = par[0];
	lastScale[1] = par[1];
	lastScale[2] = par[2];

	geometry.verticesNeedUpdate = true;
}

function Shift(par){
	for (var i = 0; i < geometry.vertices.length; i++) {
		geometry.vertices[i].x += (par[0] - lastRotate[0]);
		geometry.vertices[i].y += (par[1] - lastRotate[1]);
		geometry.vertices[i].z += (par[2] - lastRotate[2]);
	}
	// save state
	lastRotate[0] = par[0];
	lastRotate[1] = par[1];
	lastRotate[2] = par[2];
	geometry.verticesNeedUpdate = true;
}

function Rotate(par){
	for (var i = 0; i < geometry.vertices.length; i++) {
		// junk
	}
	// save state
	lastRotate[0] = par[0];
	lastRotate[1] = par[1];
	lastRotate[2] = par[2];
	geometry.verticesNeedUpdate = true;
}

/*function Stats(){
	var b = cube.geometry.boundingBox.clone();
	var s = ['Min x:', b.min.x, 'Min lastScale[0]y:', b.min.y, 'Min z:', b.min.z];
	document.getElementById('stats').value = s.join(' ');
}*/