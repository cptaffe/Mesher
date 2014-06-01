//Default Transforms

// global states
var scalar= [1.0, 1.0, 1.0];
var scaleSet = false;

function setScale(x, y, z){
	if (!isNaN(px = parseFloat(x))) {
		scalar[0] = px;
	} else { scalar[0] = 1; }
	if (!isNaN(py = parseFloat(y))) {
		scalar[1] = py;
	} else { scalar[1] = 1; }
	if (!isNaN(pz = parseFloat(z))) {
		scalar[2] = pz;
	} else { scalar[2] = 1; }
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