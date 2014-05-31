//Default Transforms

function scale(x, y, z){
	for (var i = 0; i < geometry.vertices.length;i++) {
		geometry.vertices[i].x *= x;
		geometry.vertices[i].y *= y;
		geometry.vertices[i].z *= z;
	}
}