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
var lastAutoCenter = [0.0,0.0,0.0];

// Set functions parse the 
function setTrans(x, y, z, def, trans){
	if (isNaN(px = parseFloat(x))) {
		px = def;
	}
	if (isNaN(py = parseFloat(y))) {
		py = def;
	}
	if (isNaN(pz = parseFloat(z))) {
		pz = def;
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
		geometry.vertices[i].x *= par[0];
		geometry.vertices[i].y *= par[1];
		geometry.vertices[i].z *= par[2];
	}
	// save state
	lastScale[0] = par[0];
	lastScale[1] = par[1];
	lastScale[2] = par[2];
	zoomFit();

	geometry.verticesNeedUpdate = true;
}

function Shift(par){
	for (var i = 0; i < geometry.vertices.length; i++) {
		geometry.vertices[i].x += par[0];
		geometry.vertices[i].y += par[1];
		geometry.vertices[i].z += par[2];
	}
	// save state
	lastShift[0] = par[0];
	lastShift[1] = par[1];
	lastShift[2] = par[2];
	geometry.verticesNeedUpdate = true;
}

function Rotate(par){
	var rotx = new THREE.Matrix4().makeRotationX(Math.PI*par[0]/180);
	var roty = new THREE.Matrix4().makeRotationY(Math.PI*par[1]/180);
	var rotz = new THREE.Matrix4().makeRotationZ(Math.PI*par[2]/180);
		
	geometry.applyMatrix(rotx.multiply(roty).multiply(rotz));
	geometry.computeFaceNormals();
	lastRotate[0] = par[0];
	lastRotate[1] = par[1];
	lastRotate[2] = par[2];
	geometry.verticesNeedUpdate = true;
	geometry.normalsNeedUpdate=true;
	//geometry=cube.geometry;
}

function Slice(){
	//experiments in slicing
	var plane_geometry = new THREE.CubeGeometry( 1000, 1000, 1000 );
	var plane_mesh = new THREE.Mesh( plane_geometry );
	plane_mesh.position.x = 500;
	//plane_mesh.rotation.x=-Math.PI/2;
	var plane_bsp = new ThreeBSP( plane_mesh );
	//var cube_geometry = new THREE.CubeGeometry( 3, 3, 3 );
	var cube_mesh = new THREE.Mesh( geometry );
	var cube_bsp = new ThreeBSP( cube_mesh );
	//var cube_bsp = new ThreeBSP( cube );
	var result=cube_bsp.subtract(plane_bsp);
	scene.remove(cube);
	var material = new THREE.MeshLambertMaterial({color: 0xAAAAB9, opacity : 1, transparent: true, side: THREE.DoubleSide});
	cube=result.toMesh(material);
	geometry=cube.geometry;
	//cube.rotation.x=-Math.PI/2;
	scene.add(cube);
	
	geometry.verticesNeedUpdate = true;
	geometry.normalsNeedUpdate=true;
}

// TODO: Get this to show up on stack.
function AutoCenter(){

	
	
	
	geometry.computeBoundingBox ();
	var b =geometry.boundingBox;
	var lenX = (b.max.x - b.min.x)/2;
	//alert(b.max.x+","+b.min.x);
	var x = lenX - b.max.x;
	var lenY = (b.max.y - b.min.y)/2;
	var y = lenY - b.max.y;
	// do not center z, min should be 0
	var lenZ = (b.max.z - b.min.z);
	var z = (lenZ - b.max.z);
	//alert([x,y,z]);
	Shift([x,y,z]);
	
		
	//zoomFit();
	//camera.lookAt(new THREE.Vector3( 0,0,lenZ/2));
	
	// use Shift invisibly
	//var last = lastShift.slice(0);
	//setTrans(x-lastAutoCenter[0], y-lastAutoCenter[1], z-lastAutoCenter[2], 0.0, Shift);
	//lastShift = last.slice(0);
	// save
	lastAutoCenter[0] = x;
	lastAutoCenter[1] = y;
	lastAutoCenter[2] = z;
}

/*function Stats(){
	var b = cube.geometry.boundingBox;
	var s = ['Min x:', b.min.x, 'Min y:', b.min.y, 'Min z:', b.min.z];
	s.push('Max x:', b.max.x, 'Max y:', b.max.y, 'Min z:', b.max.z);
	var d = document.createElement('div');
	d.appendChild(document.createTextNode(s.join(' ')));
	var l = document.getElementById('hist');
	l.innerHTML = '';
	l.appendChild(d);
}*/
