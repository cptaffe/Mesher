//Default Transforms

function scale () {
	if (document.getElementById("scale").innerHTML.indexOf("<input id=\"factor\"") != -1) return;
	document.getElementById("scale").innerHTML += "<input id='factor' type='text' value='2' /> X: <input id='xfactor' type='checkbox' checked/>Y: <input id='yfactor' type='checkbox' checked/> Z: <input id='zfactor' type='checkbox' checked/><input type='button' value='Apply' onclick='apply()'/><input type='button' value='cancel' onclick='cancel()'/>";
	document.getElementById("factor").focus();
}

function apply () {
	var factor = document.getElementById('factor').value;
	var x = document.getElementById('xfactor').checked;
	var y = document.getElementById('yfactor').checked;
	var z = document.getElementById('zfactor').checked;
	editor.setValue("for (var i = 0; i < geometry.vertices.length;i++) {\n\t"
			+(x?"geometry.vertices[i].x *="+factor+";\n\t":"")
			+(y?"geometry.vertices[i].y *="+factor+";\n\t":"")
			+(z?"geometry.vertices[i].z *="+factor+";\n}":"}")
		);
}

function cancel() {
	var value = document.getElementById("scale").innerHTML;
	var num   = value.indexOf("<input id=\"factor\"");
	document.getElementById("scale").innerHTML = value.substring(0, num);
}