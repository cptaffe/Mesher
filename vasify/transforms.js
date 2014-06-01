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
	trans(px, py, pz);
	geometry.verticesNeedUpdate = true;
}

function Scale(x, y, z){
	for (var i = 0; i < geometry.vertices.length; i++) {
		geometry.vertices[i].x *= (x/lastScale[0]);
		geometry.vertices[i].y *= (y/lastScale[1]);
		geometry.vertices[i].z *= (z/lastScale[2]);
	}
	// set lastScale
	lastScale[0] = x;
	lastScale[1] = y;
	lastScale[2] = z;
}

function Shift(x, y, z){
	for (var i = 0; i < geometry.vertices.length; i++) {
		geometry.vertices[i].x += (x - lastRotate[0]);
		geometry.vertices[i].y += (y - lastRotate[1]);
		geometry.vertices[i].z += (z - lastRotate[2]);
	}
	// set lastRotate
	lastRotate[0] = x;
	lastRotate[1] = y;
	lastRotate[2] = z;
}

function Rotate(x, y, z){
	for (var i = 0; i < geometry.vertices.length; i++) {
		geometry.vertices[i].x += (x - lastRotate[0]);
		geometry.vertices[i].y += (y - lastRotate[1]);
		geometry.vertices[i].z += (z - lastRotate[2]);
	}
	// set lastRotate
	lastRotate[0] = x;
	lastRotate[1] = y;
	lastRotate[2] = z;
}

function Stats(){
	var b = cube.geometry.boundingBox.clone();
	var s = ['Min x:', b.min.x, 'Min lastScale[0]y:', b.min.y, 'Min z:', b.min.z];
	document.getElementById('stats').value = s.join(' ');
}