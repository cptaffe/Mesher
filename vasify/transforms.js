//Default Transforms

// global states
var scalar;
var scaleSet;

// set defaults on inclusion
clearTransforms();

// set defaults
function clearTransforms(){
	scalar= [1.0, 1.0, 1.0];
	scaleSet = false;
}

function setScale(x, y, z){
	if (!isNaN(px = parseFloat(x))) {
		scalar[0] = px;
	} else { scalar[0] = 1.0; }
	if (!isNaN(py = parseFloat(y))) {
		scalar[1] = py;
	} else { scalar[1] = 1.0; }
	if (!isNaN(pz = parseFloat(z))) {
		scalar[2] = pz;
	} else { scalar[2] = 1.0; }
	if (scalar[0] == 1.0 && scalar[1] == 1.0 && scalar[2] == 1.0) {
		scaleSet = false;
	} else{
		scaleSet = true;
		reloadFile();
	}
	//alert('('+px+', '+py+', '+pz+'): '+scaleSet);
}

function Scale(){
	for (var i = 0; i < geometry.vertices.length; i++) {
		geometry.vertices[i].x *= scalar[0];
		geometry.vertices[i].y *= scalar[1];
		geometry.vertices[i].z *= scalar[2];
	}
}