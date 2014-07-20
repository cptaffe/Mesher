// Tools defined here.

(function (m$) {
	// Rename Tool Definition
	m$.tool.New({
		name: "Rename",
		icon: "fa-quote-right", // Font-Awesome Icon
		do: function () {
			var name = this.Params['name'];
			// stores model by ref.
			this.model = this.Project.SelectedModels[0];
			this.OldName = this.Project.SelectedModels[0].name;
			this.model.name = name;
			m$.ModelTag.SelectTagByUUID(this.model.uuid).html(document.createTextNode(name));
			return true;
		},
		undo: function () {
			if (typeof this.model == 'undefined'){return false;}
			this.model.name = this.OldName;
			m$.ModelTag.SelectTagByUUID(this.model.uuid).html(document.createTextNode(this.OldName));
			return true;
		},
		redo: function () {
			if (typeof this.model == 'undefined'){return false;}
			var name = this.Params.name;
			this.model.name = name;
			m$.ModelTag.SelectTagByUUID(this.model.uuid).html(document.createTextNode(name));
			return true;
		},
		check: function (map) {
			return (map['project'].SelectedModels.length == 1);
		},
		prep: function (map) {
			this.UIstack.push(new m$.HTML.List['TextInput'].New({
				name: "name", // what this param is called
				def: "name"
			}));
			this.UIstack.push(new m$.HTML.List['ApplyInput'].New({
				text: "Apply",
				index: map['index']
			}));
		}
	});
	
	// Scale tool
	m$.tool.New({
		name: "Scale",
		icon: "fa-expand",
		do: function () {
			var scalar = this.Params['scalar'];
			this.models = [];
			for (var i = 0; i < this.Project.SelectedModels.length; i++) {
				this.models.push(this.Project.SelectedModels[i]);
			}
			for (var i = 0; i < this.models.length; i++) {
				model = this.models[i];
				for (var j = 0; j < model.geometry.vertices.length; j++) {
					if (this.Params['x']){model.geometry.vertices[j].x *= scalar;}
					if (this.Params['y']){model.geometry.vertices[j].y *= scalar;}
					if (this.Params['z']){model.geometry.vertices[j].z *= scalar;}
				}
				model.geometry.verticesNeedUpdate = true;
			}
			return true;
		},
		undo: function () {
			if (typeof this.models == 'undefined'){return false;}
			var scalar = this.Params['scalar'];
			for (var i = 0; i < this.models.length; i++) {
				model = this.models[i];
				for (var j = 0; j < model.geometry.vertices.length; j++) {
					if (this.Params['x']){model.geometry.vertices[j].x /= scalar;}
					if (this.Params['y']){model.geometry.vertices[j].y /= scalar;}
					if (this.Params['z']){model.geometry.vertices[j].z /= scalar;}
				}
				model.geometry.verticesNeedUpdate = true;
			}
			return true;
		},
		redo: function () {
			if (typeof this.models == 'undefined'){return false;}
			var scalar = this.Params['scalar'];
			for (var i = 0; i < this.models.length; i++) {
				model = this.models[i];
				for (var j = 0; j < model.geometry.vertices.length; j++) {
					if (this.Params['x']){model.geometry.vertices[j].x *= scalar;}
					if (this.Params['y']){model.geometry.vertices[j].y *= scalar;}
					if (this.Params['z']){model.geometry.vertices[j].z *= scalar;}
				}
				model.geometry.verticesNeedUpdate = true;
			}
			return true;
		},
		check: function (map) {
			return (map['project'].SelectedModels.length > 0);
		},
		prep: function (map) {
			// Radio axes
			this.UIstack.push(new m$.HTML.List['InlineCheckboxInput'].New({
				name: "x", // what this param is called
				def: "x"
			}));
			this.UIstack.push(new m$.HTML.List['InlineCheckboxInput'].New({
				name: "y", // what this param is called
				def: "y"
			}));
			this.UIstack.push(new m$.HTML.List['InlineCheckboxInput'].New({
				name: "z", // what this param is called
				def: "z"
			}));

			// scalar text box
			this.UIstack.push(new m$.HTML.List['TextInput'].New({
				name: "scalar", // what this param is called
				def: "scalar"
			}));
			this.UIstack.push(new m$.HTML.List['ApplyInput'].New({
				text: "Apply",
				index: map['index']
			}));
		}
	});

	// Shift tool
	m$.tool.New({
		name: "Shift",
		icon: "fa-arrows",
		do: function () {
			this.models = [];
			this.Shift= function () {
				var scalar = this.Params['scalar'];
				for (var i = 0; i < this.models.length; i++) {
					model = this.models[i];
					if (this.Params['x']){model.translateX(scalar);}
					if (this.Params['y']){model.translateY(scalar);}
					if (this.Params['z']){model.translateZ(scalar);}
				}
				return true;
			}
			for (var i = 0; i < this.Project.SelectedModels.length; i++) {
				this.models.push(this.Project.SelectedModels[i]);
			}
			return this.Shift();
		},
		undo: function () {
			if (typeof this.models == 'undefined'){return false;}
			var scalar = this.Params['scalar'];
			for (var i = 0; i < this.models.length; i++) {
				model = this.models[i];
				if (this.Params['x']){model.translateX(-scalar);}
				if (this.Params['y']){model.translateY(-scalar);}
				if (this.Params['z']){model.translateZ(-scalar);}
			}
			return true;
		},
		redo: function () {
			if (typeof this.models == 'undefined'){return false;}
			return this.Shift();
		},
		check: function (map) {
			return (map['project'].SelectedModels.length > 0);
		},
		prep: function (map) {
			// Radio axes
			this.UIstack.push(new m$.HTML.List['InlineCheckboxInput'].New({
				name: "x", // what this param is called
				def: "x"
			}));
			this.UIstack.push(new m$.HTML.List['InlineCheckboxInput'].New({
				name: "y", // what this param is called
				def: "y"
			}));
			this.UIstack.push(new m$.HTML.List['InlineCheckboxInput'].New({
				name: "z", // what this param is called
				def: "z"
			}));

			// scalar text box
			this.UIstack.push(new m$.HTML.List['TextInput'].New({
				name: "scalar", // what this param is called
				def: "units"
			}));
			this.UIstack.push(new m$.HTML.List['ApplyInput'].New({
				text: "Apply",
				index: map['index']
			}));
		}
	});

	// Rotate tool
	m$.tool.New({
		name: "Rotate",
		icon: "fa-undo",
		do: function () {
			this.models = [];
			this.Rotate = function () {
				var scalar = this.Params['scalar'];
				var rotx, roty, rotz = {};
				if (this.Params['x']){
					rotx = new THREE.Matrix4().makeRotationX(Math.PI*scalar/180);
				} else {
					rotx = new THREE.Matrix4().makeRotationX(0);
				}
				if (this.Params['y']){
					roty = new THREE.Matrix4().makeRotationY(Math.PI*scalar/180);
				} else {
					roty = new THREE.Matrix4().makeRotationY(0);
				}
				if (this.Params['z']){
					rotz = new THREE.Matrix4().makeRotationZ(Math.PI*scalar/180);
				} else {
					rotz = new THREE.Matrix4().makeRotationZ(0);
				}

				for (var i = 0; i < this.models.length; i++) {
					model = this.models[i];
					model.geometry.applyMatrix(rotx.multiply(roty).multiply(rotz));
					model.geometry.computeFaceNormals();
					model.geometry.verticesNeedUpdate = true;
					model.geometry.normalsNeedUpdate = true;
				}
				return true;
			}
			for (var i = 0; i < this.Project.SelectedModels.length; i++) {
				this.models.push(this.Project.SelectedModels[i]);
			}
			return this.Rotate();
		},
		undo: function () {
			var scalar = this.Params['scalar'];

			// Rotate matrixes
			var rotx, roty, rotz = {};
			if (this.Params['x']){
				rotx = new THREE.Matrix4().makeRotationX(Math.PI*(-scalar)/180);
			} else {
				rotx = new THREE.Matrix4().makeRotationX(0);
			}
			if (this.Params['y']){
				roty = new THREE.Matrix4().makeRotationY(Math.PI*(-scalar)/180);
			} else {
				roty = new THREE.Matrix4().makeRotationY(0);
			}
			if (this.Params['z']){
				rotz = new THREE.Matrix4().makeRotationZ(Math.PI*(-scalar)/180);
			} else {
				rotz = new THREE.Matrix4().makeRotationZ(0);
			}

			for (var i = 0; i < this.models.length; i++) {
				model = this.models[i];
				model.geometry.applyMatrix(rotx.multiply(roty).multiply(rotz));
				model.geometry.computeFaceNormals();
				model.geometry.verticesNeedUpdate = true;
				model.geometry.normalsNeedUpdate = true;
			}

			return true;
		},
		redo: function () {
			if (typeof this.models == 'undefined'){return false;}
			return this.Rotate();
		},
		check: function (map) {
			return (map['project'].SelectedModels.length > 0);
		},
		prep: function (map) {
			// Radio axes
			this.UIstack.push(new m$.HTML.List['InlineCheckboxInput'].New({
				name: "x", // what this param is called
				def: "x"
			}));
			this.UIstack.push(new m$.HTML.List['InlineCheckboxInput'].New({
				name: "y", // what this param is called
				def: "y"
			}));
			this.UIstack.push(new m$.HTML.List['InlineCheckboxInput'].New({
				name: "z", // what this param is called
				def: "z"
			}));

			// scalar text box
			this.UIstack.push(new m$.HTML.List['TextInput'].New({
				name: "scalar", // what this param is called
				def: "degrees"
			}));
			this.UIstack.push(new m$.HTML.List['ApplyInput'].New({
				text: "Apply",
				index: map['index']
			}));
		}
	});

	// Slice tool
	m$.tool.New({
		name: "Slice",
		icon: "fa-cube",
		do: function () {
			this.models = [];
			this.Slice = function () {
				var scalar = this.Params['scalar'];
				for (var i = 0; i < this.models.length; i++) {
					model = this.models[i];
					model.geometry.computeBoundingBox();
					var b = model.geometry.boundingBox;
					//experiments in slicing
					var plane_geometry = new THREE.CubeGeometry( 1000, 1000, 1000 );
					var plane_mesh = new THREE.Mesh( plane_geometry );
					if (this.Params['x']){plane_mesh.position.x = 500+b.min.x+scalar*(b.max.x - b.min.x)/100;}
					if (this.Params['y']){plane_mesh.position.y = 500+b.min.y+scalar*(b.max.y - b.min.y)/100;}
					if (this.Params['z']){plane_mesh.position.z = 500+b.min.z+scalar*(b.max.z - b.min.z)/100;}

					var plane_bsp = new ThreeBSP( plane_mesh );
					var cube_mesh = new THREE.Mesh( model.geometry );
					var cube_bsp = new ThreeBSP( cube_mesh );
					var result = cube_bsp.subtract(plane_bsp);
					this.Project.Three.Scene.remove(model);
					var material = model.material;
					cube = result.toMesh(material);
					model.geometry = cube.geometry;
					this.Project.Three.Scene.add(cube);

					model.geometry.verticesNeedUpdate = true;
					model.geometry.normalsNeedUpdate=true;
				}
				return true;
			}
			for (var i = 0; i < this.Project.SelectedModels.length; i++) {
				this.models.push(this.Project.SelectedModels[i]);
			}
			return this.Slice();
		},
		undo: function () {
			return false;
		},
		redo: function () {
			if (typeof this.models == 'undefined'){return false;}
			return this.Slice();
		},
		check: function (map) {
			return (map['project'].SelectedModels.length > 0);
		},
		prep: function (map) {
			// Radio axes
			this.UIstack.push(new m$.HTML.List['InlineCheckboxInput'].New({
				name: "x", // what this param is called
				def: "x"
			}));
			this.UIstack.push(new m$.HTML.List['InlineCheckboxInput'].New({
				name: "y", // what this param is called
				def: "y"
			}));
			this.UIstack.push(new m$.HTML.List['InlineCheckboxInput'].New({
				name: "z", // what this param is called
				def: "z"
			}));

			// scalar text box
			this.UIstack.push(new m$.HTML.List['TextInput'].New({
				name: "scalar", // what this param is called
				def: "scalar"
			}));
			this.UIstack.push(new m$.HTML.List['ApplyInput'].New({
				text: "Apply",
				index: map['index']
			}));
		}
	});

	// Save tool
	m$.tool.New({
		name: "Save",
		icon: "fa-download",
		do: function () {
			if (this.Project.SelectedModels.length == 1) {
				var model = this.Project.SelectedModels[0];
				var stlString = m$.STL.Generate(model);
				var blob = new Blob([stlString], {type: 'text/plain'});
				saveAs(blob, model.name + '.stl');
				return true;
			} else {
				// defualts to zipping
				if (!this.Params['zip'] && !this.Params['merge'] && !this.Params['multiple']) {
					this.Params['zip'] = true;
				}
				if (this.Params['zip']) {
					var zip = new JSZip();
					stlStringArray = [];
					for (var i = 0; i < this.Project.SelectedModels.length; i++) {
						var model = this.Project.SelectedModels[i];
						var stlString = m$.STL.Generate(model);
						if (!this.Params['merge']) {
							zip.file(model.name+".stl", stlString);
						} else {
							stlStringArray.push(stlString);
						}
					}
					if (this.Params['merge']) {
						zip.file(this.Params['Name']+".stl", stlStringArray.join(''));
					}
					var content = zip.generate({type:"blob"});
					saveAs(content, this.Params['Name']+".zip");
					return true;
				} else if (this.Params['merge']) {
					stlStringArray = [];
					for (var i = 0; i < this.Project.SelectedModels.length; i++) {
						var model = this.Project.SelectedModels[i];
						stlStringArray.push(m$.STL.Generate(model));
					}
					var blob = new Blob([stlStringArray.join('')], {type: 'text/plain'});
					saveAs(blob, this.Params['Name']+".stl");
					return true;
				} else if (this.Params['multiple']) {
					for (var i = 0; i < this.Project.SelectedModels.length; i++) {
						var model = this.Project.SelectedModels[i];
						stlString = m$.STL.Generate(model);
						var blob = new Blob([stlString], {type: 'text/plain'});
						saveAs(blob, model.name+".stl");
					}
					return true;
				} else {
					return false;
				}
			}
		},
		save: false, // not to be used often.
		check: function (map) {
			return (map['project'].SelectedModels.length > 0);
		},
		prep: function (map) {
			if (map['project'].SelectedModels.length == 1){
				this.UIstack.push(new m$.HTML.List['ApplyInput'].New({
					text: "Save",
					index: map['index']
				}));
			} else {
				this.UIstack.push(new m$.HTML.List['InlineCheckboxInput'].New({
					name: "zip", // what this param is called
					def: "zip"
				}));
				this.UIstack.push(new m$.HTML.List['InlineCheckboxInput'].New({
					name: "merge", // what this param is called
					def: "merge"
				}));
				this.UIstack.push(new m$.HTML.List['InlineCheckboxInput'].New({
					name: "multiple", // what this param is called
					def: "multiple"
				}));
				this.UIstack.push(new m$.HTML.List['TextInput'].New({
					name: "Name", // what this param is called
					def: "Name"
				}));
				this.UIstack.push(new m$.HTML.List['ApplyInput'].New({
					text: "Save",
					index: map['index']
				}));
			}
		}
	});

	// AutoCenter tool
	m$.tool.New({
		name: "Auto Center",
		icon: "fa-arrows-alt",
		do: function () {
			this.models = [];
			this.shift = [];
			this.AutoCenter = function () {
				for (var i = 0; i < this.models.length; i++) {
					model = this.models[i];
					var box = new THREE.Box3().setFromObject( model );
					shiftX = -box.min.x;
					shiftY = -box.min.y;
					shiftZ = -box.min.z;
					this.shift.push(shiftX);
					this.shift.push(shiftY);
					this.shift.push(shiftZ);
					model.translateX(shiftX);
					model.translateY(shiftY);
					model.translateZ(shiftZ);
				}
				return true;
			}

			for (var i = 0; i < this.Project.SelectedModels.length; i++) {
				this.models.push(this.Project.SelectedModels[i]);
			}

			return this.AutoCenter();
		},
		undo: function () {
			if (typeof this.models == 'undefined'){return false;}
			for (var i = 0; i < this.models.length; i++) {
				model = this.models[i];
				shiftZ = this.shift.pop()
				shiftY = this.shift.pop()
				shiftX = this.shift.pop()
				model.translateX(-shiftX);
				model.translateY(-shiftY);
				model.translateZ(-shiftZ);
			}
			return true;
		},
		redo: function () {
			if (typeof this.models == 'undefined'){return false;}
			return this.AutoCenter();
		},
		check: function (map) {
			return (map['project'].SelectedModels.length > 0);
		},
		prep: function (map) {
			this.UIstack.push(new m$.HTML.List['ApplyInput'].New({
				text: "Apply",
				index: map['index']
			}));
		}
	});

})(Mesher);