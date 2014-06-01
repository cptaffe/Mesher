// Default Transformations

function setScale(x, y, z){
	if (isNaN(px = parseFloat(x))) {
		px = 1.0;
	}
	if (isNaN(py = parseFloat(y))) {
		py = 1.0;
	}
	if (isNaN(pz = parseFloat(z))) {
		pz = 1.0
	}
	if (!(px == 1.0 && py == 1.0 && pz == 1.0)) {
		Scale(px, py, pz);
		geometry.verticesNeedUpdate = true;
	}
}

function Scale(x, y, z){
	for (var i = 0; i < geometry.vertices.length; i++) {
		geometry.vertices[i].x *= x;
		geometry.vertices[i].y *= y;
		geometry.vertices[i].z *= z;
	}
}