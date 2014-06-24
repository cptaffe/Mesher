// Mesher v0.1
// Copyright 2014 Concept Forge
// Liscensed under MIT

// Check for Dependencies
if (typeof THREE === 'undefined') { throw new Error('Mesher\'s JavaScript requires THREE'); }
if (typeof jQuery === 'undefined') { throw new Error('Mesher\'s JavaScript requires jQuery'); }

var Mesher = { REVISION: '1' };

// Project object
(function (m$, THREE, $) {
	'use strict';

	m$.Project = function () {

		this.Index // how to get via top-down

		// set as _cModel's display
		this.Display;

		// reference to this.Three model stack
		// just shorter from top-down :)
		this.Models;
		// Transformations Array stack
		this.Trans = [
			[],
			[]
		];

		// Selected Models
		this.SelectedModels = [];

		// reference to transformations
		this.Hist = this.Trans[0];
		this.Fut = this.Trans[1];

		// One Three object per Project
		this.Three;
	};

	// init function
	m$.Project.prototype.init = function () {
		this.Three.init(this.Display);
	};

	m$.Project.prototype._addModel = function (file) {
		// Create Three with new Model
		if (typeof this.Three == 'undefined'){
			this.Three = new m$.Three();

			// Init Model
			this.init();

			// set Models to reference
			this.Models = this.Three.Models;
		}
		this.Three.newModel(file, m$.File.NextFile);
	};
	
	// Undo function
	// undo accepts an index to undo (optional)
	m$.Project.prototype.undo = function (index) {
		this._do(this.Hist, this.Fut, this._cModel, index);
	};

	// Redo function
	// redo accepts an index to redo (optional)
	m$.Project.prototype.redo = function (index) {
		this._do(this.Fut, this.Hist, this._cModel, index);
	};

	// Preview function
	// preview accepts a transformation object to preview,
	// & the nth preview this is; this enables the treatment
	// of the indice like a preview array.
	// preview clones the current model to a new Model
	// indice, it also clones the history stack and provides
	// the transform object in a new stack
	m$.Project.prototype.preview = function (t, index) {
		// Sets indice to 0 on undefined
		// which will set the new Model on
		// the first 'unused' indice
		if (typeof index == 'undefined'){ index = 0; }

		// h is a clone of the Hist stack
		var h = this.Hist.clone();

		// _do is sent h (a clone of Hist),
		// a literal stack with one item, t,
		// a yet to be defined Models indice,
		// & the last operand is left off
		// which should defualt it to an undefined.
		this._do(h, [t], this.Models[0+index]);
	};

	// Internal Use: _do
	// accepts a stack to pop/splic from,
	// a stack to push to,
	// a model to apply the altered stack to,
	// & an index to splice from (optional)
	m$.Project.prototype._do = function (Hist, Fut, Model, index) {

		if (typeof index == 'undefined'){
			// pop from history and push to future
			Fut.push(Hist.pop());
		} else {
			// clip from history and push to future
			Fut.push(Hist.splice(index, 1));
		}

		// throw away current model,
		// get new copy of original model
		Model = THREE.GeometryUtils.clone(this._oModel);

		// Execute all transforms in history
		// with current model
		for (var i = 0; i < Hist.length; i++){
			Hist[i].call(Model);
		}
	};

})(Mesher, THREE, jQuery);


// File object
(function (m$) {

	m$.File = function (files) {
		this.Files = files;
		this.Index = 0;
		this.Project = m$._cProj; // saves current project
	};

	// Next File in array
	m$.File.prototype.Next = function () {
		if (this.Index < this.Files.length) {
			var f = this.Files[this.Index];
			this.Index++;
			return f;
		} else {
			return false;
		}
	}


	// Callback function that calls _addModel if the File
	// object contains any more files to add.
	// must reference everything from top-down.
	m$.File.NextFile = function () {
		self = m$.Files; // reference from top-down
		var f = self.Next();
		// check in case project was deleted
		if (f != false && typeof self.Project != 'undefined') {
			self.Project._addModel(f);
		} else {
			return;
		}
	};

})(Mesher);

// Output function
// DEPRECIATED.
// TODO: Move this functionality to something else. 
(function (m$) {
  'use strict';
  
	m$.Output = function () {
		this.Elements = {};

		// Function to print history,
		// this is the defualt
	    this.histPrinter = function (e) {
				for (var i = 0; i < m$._cProj.Hist.length; i++) {
					var s = document.createElement('div');
					s.appendChild(document.createTextNode(m$._cProj.Hist[i].toString()));
					s.setAttribute('onclick', 'Hist['+i+'].call()');
					e.history.insertBefore(s, e.history.firstChild);
				}
			};

		m$.Output.prototype.PrintHistory = function () {
			this.histPrinter(this.Elements);
		};
	};
})(Mesher);

/*!
 * Mesher v0.1
 * THREE bindings
 */

(function (m$, THREE) {
	// Three Object
	// Used to store all the information about
	// the THREE stuff
	m$.Three = function () {
		this.Models = [];
		// stuff
	};
	
	// TODO: Adjust on Window resize.
	// init function
	// init creates a basic scene and supporting objects
	m$.Three.prototype.init = function (local) {
		
		// Create Scene, Camera, Renderer
		this.Scene = new THREE.Scene();
		this.Camera = new THREE.PerspectiveCamera(75, $(local).innerWidth()/$(local).innerHeight(), 0.1, 1000);
		
		// Create & Add Renderer as child of Parent
		this.Renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true
		});
		this.Renderer.setSize($(local).innerWidth(), $(local).innerHeight());
		this.Renderer.setClearColor( 0x000000, 0);
		//this.model.Parent
		$(local).append(this.Renderer.domElement);

		// Create & Add DirectionalLight to Scene 
		this.DirectionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
		this.DirectionalLight.position.set( 0, 0, 1 );
		this.Scene.add( this.DirectionalLight );

		// set controls to container
		this.Controls = new THREE.TrackballControls(this.Camera, $(local).children()[0]);

		this.Reader = new FileReader();
	};

	// adds a Model object to the scene
	m$.Three.prototype.newModel = function (file, callback) {
		this.readFile(file, callback);
	};

	// Globalize allows requestAnimationFrame() to reference
	// global variables by storing object value references in
	// the Globals object of the Mesher global object.
	m$.Three.prototype.Globalize = function () {
		m$.Globals = this;
	};

	// set render function
	m$.Three.prototype.Render = function() {
		// Animates
		window.requestAnimationFrame(m$.Globals.Render);
		// Shift DirectionalLight, Render Scene with Camera,
		// & Update Controls
		m$.Globals.DirectionalLight.position.set( 
			m$.Globals.Camera.position.x,
			m$.Globals.Camera.position.y,
			m$.Globals.Camera.position.z 
		);
		m$.Globals.Renderer.render(m$.Globals.Scene, m$.Globals.Camera);
		m$.Globals.Controls.update();
	};

	// Reads file into THREE map
	m$.Three.prototype.readFile = function (file, callback) {
		this.Reader.parent = this;
		this.Reader.onload = function (e) {
			this.parent.addModel(e.target.result, file.name);
			if (typeof callback != 'undefined') {
				callback();
			}
		};
		this.Reader.readAsBinaryString(file);
	};

	// Adds Model 
	m$.Three.prototype.addModel = function (data, name) {
		// Create Mesh
		var material = new THREE.MeshLambertMaterial({
			color: m$.MESHCOLOR,
			opacity : 1,
			transparent: true,
			side: THREE.DoubleSide
		});

		// Create Geometry from Loaded Data
		var geometry = (new THREE.STLLoader()).parse(data);
		geometry.dynamic = true;
    
    	// Create Model
		var l = this.Models.push(new THREE.Mesh(geometry, material))

		// name modification to remove extension
		// this is where we lose the extension (!)
		name = name.substring(0, name.lastIndexOf('.'));
		this.Models[l-1].name = name;

		// Modify Scene
		if (l < 2){
			this.zoomFit();
			this.addGrid();
		}

		// Add Model to Scene
		if (l < 2){
			this.Scene.add(this.Models[l-1]);
			this.Globalize();
		} else {
			m$.Globals.Scene.add(this.Models[l-1]);
		}

		(new m$.ModelTag(this.Models[l-1])).Display();

		this.Render();
	};

	m$.Three.prototype.zoomFit = function () {

		// Alias Model geometry
		var l = this.Models.length;
		var geometry = this.Models[l-1].geometry;

		// Calculate Bounding Box
		// & alias to b
		geometry.computeBoundingBox();
		var b = geometry.boundingBox;

		// Calculate Camera Position
		var l = (b.max.x - b.min.x) * (b.max.x - b.min.x) + (b.max.y - b.min.y) * (b.max.y - b.min.y) + (b.max.z - b.min.z) * (b.max.z - b.min.z);
		l = Math.sqrt(l) * 0.5;

		// Set Camera Position
		this.Camera.position.set(
			(b.max.x + b.min.x) / 2 + l,
			(b.max.y + b.min.y) / 2 - l,
			(b.max.z + b.min.z) / 2 + l
		);
		this.Camera.up.set( 0, 0, 1 );

		// Set Controls Target
		this.Controls.target = new THREE.Vector3(
			(b.max.x + b.min.x) / 2,
			(b.max.y + b.min.y) / 2,
			(b.max.z + b.min.z) / 2
		);
	};

	m$.Three.prototype.addGrid = function (){

		// Create Line Geometry
		var geometry = new THREE.Geometry();
	    geometry.vertices.push(new THREE.Vector3(0,0,0));
	    geometry.vertices.push(new THREE.Vector3(200,0,0));
	    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
	    geometry.vertices.push(new THREE.Vector3(0, 200, 0));
	    geometry.vertices.push(new THREE.Vector3(0,0,0));
	    geometry.vertices.push(new THREE.Vector3(0, 0, 200));

	    // Create Line Material
	    var material = new THREE.LineBasicMaterial({
	    	color: 0x000000,
	    	opacity: 0.8
	    });

	    // Create Line (not referenced to Model)
	    // & Add to Scene
	    var line = new THREE.Line(geometry, material);
	    this.Scene.add(line);

	    // Create Line Material
	    material = new THREE.LineBasicMaterial({
	    	color: 0x000000,
	    	opacity: 0.25
	    });

	    // Loop to Create Grid Lines
	    for (var i = -200; i <= 200; i+=25) {

	    	// Create X Line Geometry & Material
	    	// Add to Scene
			var geoX = new THREE.Geometry();
			geoX.vertices.push(new THREE.Vector3(i,-200,0));
			if (i === 0) {
				geoX.vertices.push(new THREE.Vector3(i,0,0));
			} else {
				geoX.vertices.push(new THREE.Vector3(i,200,0));
			}
			var lineX = new THREE.Line(geoX, material);
			this.Scene.add(lineX);

			// Create Y Line Geometry & Material
	    	// Add to Scene
			var geoY=new THREE.Geometry();
			geoY.vertices.push(new THREE.Vector3(-200,i,0));
			if (i === 0) {
				geoY.vertices.push(new THREE.Vector3(0,i,0));
			} else {
				geoY.vertices.push(new THREE.Vector3(200,i,0));
			}
			var lineY = new THREE.Line(geoY, material);
			this.Scene.add(lineY);
		}  
	};
})(Mesher, THREE);

// Select Object
(function (m$, $) {
	m$.Select = function (event) {
		if (typeof event != 'undefined'){
			this.click = event;
			this.model = this.GetModel();
			this.Init(); // init rest of stuff
		}
	};

	m$.Select.prototype.Init = function () {
		this.Project = m$._cProj; // saves current project
		if (this.model != false){
			this.Tag = new m$.ModelTag(this.model);
			this.Index = this.Selected();
			if (this.Index === false){ // not selected, select
				this.Select();
				this.Tag.Highlight();
			} else { // is selected, deselect
				this.Deselect();
				this.Tag.UnHighlight();
			}
		}
	};

	// selects clicked model
	m$.Select.prototype.GetModel = function () {
		var vector = new THREE.Vector3( 
			( this.click.clientX / window.innerWidth ) * 2 - 1,
			- ( this.click.clientY / window.innerHeight ) * 2 + 1,
			0.5
		);

		var projector = new THREE.Projector()
		projector.unprojectVector(
			vector,
			m$.Globals.Camera
		);

		var raycaster = new THREE.Raycaster(
			m$.Globals.Camera.position,
			vector.sub( m$.Globals.Camera.position ).normalize()
		);

		var intersects = raycaster.intersectObjects( m$.Globals.Models );
		
		// select models if there are intersects
		if ( intersects.length > 0 ) {
			return intersects[0].object
		} else {
			return false;
		}
	};

	m$.Select.prototype.Selected = function () {
		var i = this.Project.SelectedModels.indexOf(this.model);
		if (i == -1){
			return false;
		} else {
			return i;
		}
	};

	// select model
	m$.Select.prototype.Select = function () {
		// select
		this.Project.SelectedModels.push(this.model);
		this.model.material.color.setHex(m$.shade(m$.MESHCOLOR, 20));
	};

	// deselect model
	m$.Select.prototype.Deselect = function () {
			this.Project.SelectedModels.splice(this.Index, 1);
			this.model.material.color.setHex(m$.MESHCOLOR);
	};
})(Mesher, jQuery);

// Select Object
(function (m$, $) {
	m$.ModelTag = function (model) {
		this.model = model;
	};

	m$.ModelTag.prototype.Display = function () {
		// add to Selected DOM object
		var selected = document.createElement('div');
		selected.appendChild(document.createTextNode(this.model.name));
		selected.setAttribute('id', this.model.uuid);
		selected.setAttribute('onclick', 'Mesher.ModelTag.SelectModelUUID.call(this,event)')
		$(m$.Settings.Selected).append(selected);
	};

	m$.ModelTag.SelectModelUUID = function (event) {
		event.preventDefault();
		var uuid = this.id;
		for (var i = 0; i < m$._cProj.Models.length; i++){
			if (m$._cProj.Models[i].uuid == uuid){
				var s = new m$.Select();
				s.model = m$._cProj.Models[i];
				s.Init();
			}
		}
	};

	m$.ModelTag.prototype.UnDisplay = function () {
		var c = $(m$.Settings.Selected).children("#"+this.model.uuid).remove();
	};

	m$.ModelTag.prototype.Highlight = function () {
		var c = $(m$.Settings.Selected).children("#"+this.model.uuid)
		.css('color', 'rgba(0,0,0,1)');
	};

	m$.ModelTag.prototype.UnHighlight = function () {
		var c = $(m$.Settings.Selected).children("#"+this.model.uuid)
		.css('color', '');
	};

})(Mesher, jQuery);

// Mesher Tool API

// TODO: move management of Hist/Fut stack to Tool API.

// Used for declaring tools,
// Interfacing with tools,
// & parsing tool declarations.

(function (m$) {

	// Array of Tool types (tools)
	m$.Tool = function () {
		this.Tools = [];
	};

	m$.Tool.prototype.New = function (name, does, undo, toString, check, prepare) {

		var tool = function (project, args) {
			this.Params = args;
			this.Project = project;
		}

		// sets name
		tool.Name = name;

		// set undo function, should return true on success
		if (undo === false){
			tool.prototype.undo = function () { return false; };
		} else {
			tool.prototype.undo = undo;
		}

		// Does the transformation, should return true on success
		tool.prototype.do = does;

		// Returns a string like "Transform(12, 2)"
		if (tool.prototype.toString == false) {
			tool.prototype.toString = function () {
				return (this.Name + "(" + this.Params + ")");
			};
		} else {
			tool.prototype.toString = toString;
		}

		// accessible globally
		// takes project pointer, returns bool
		tool.check = check;
		tool.prototype.prepare = prepare;

		this.Tools.push(tool);
	};

	// Get a tool by its name,
	// return reference
	m$.Tool.prototype.Get = function (string) {
		for (var i = 0; i < this.Tools.length; i++) {
			if (this.Tools[i].Name == string) {
				return this.Tools[i];
			}
		}
	};

	// Get a tool by its name,
	// return index
	m$.Tool.prototype.GetIndex = function (string) {
		for (var i = 0; i < this.Tools.length; i++) {
			if (this.Tools[i].Name == string) {
				return i;
			}
		}
	}

	// Create a new tool instance,
	// push it to the hist stack,
	// and execute its do function
	m$.Tool.prototype.Do = function (index, args) {
		var proj = m$._cProj; // record current project
		if (index >= 0 && index < this.Tools.length) {
			var toolType = this.Tools[index];
			// check if can be done
			if (toolType.check(proj)){
				// create new tool of type in index
				var tool = new toolType(proj, args);
				// if successful push to Hist
				if (tool.do()){
					return proj.Hist.push(tool); // success
				} else {
					console.log("Tool do failed.");
					return false; // fail
				}
			} else {
				console.log("Tool check returned false.");
				return false; // fail
			}
		} else {
			console.log("Index out of bounds.");
			return false; // fail
		}
	}

	// pop from Hist to Fut,
	// execute its undo function
	m$.Tool.prototype.Undo = function () {
		var proj = m$._cProj; // record current project
		var tool = proj.Hist.pop();
		// try undo, it fail
		if (!tool.undo()) {
			// reload original models
			// TODO: reload original models
			// do all operations from the ground up
			for (var i = 0; i < proj.Hist.length; i++){
				if (!proj.Hist[i].do()) { // if no work
					// basically ignore it and move on.
					// this should not ever happen
					console.log(proj.Hist[i].toString() + ", it no work.");
				}
			}
		}
		// at this point, undo has 'worked' somehow.
		proj.Fut.push(tool);
	}

	// pop from Fut to Hist
	// execute do.
	m$.Tool.prototype.Redo = function () {
		var proj = m$._cProj; // record current project
		var tool = proj.Fut.pop();
		// try do, it fail
		if (!tool.do()) {
			console.log(tool.toString + ", it no work.");
			// essentially throws away
			return false; // fail
		}
		proj.Hist.push(tool);
	}

})(Mesher);

(function (m$) {

	// button for a tool
	// accepts name, fa-icon, and popover
	m$.Button = function (name, icon, popover) {
		this.Name = name;
		this.Icon = icon;
		this.Popover = popover;
	}

	// returns html for a button
	m$.Button.prototype.Html = function () {

	}
})(Mesher);

(function (m$) {

	// Popover for a tool
	m$.Popover = function () {
		this.UI = [];
		this.Apply = [];
	}

	// returns html for a popover
	// by calling Html() on all objects in the UI stack.
	m$.Popover.prototype.Html = function () {
		var html = "";
		for (x in this.UI) {
			html += x;
		}
		return html;
	}

	// adds a slider {val: , step: , min: , max: , axis: , units: }
	m$.Popover.prototype.addSlider = function (name, range) {
		// range config
	    var rMax = (parseInt(range['max']) + parseInt(Math.abs(range['min']))) / parseFloat(range['step']);
	    var rStep = 1/parseFloat(range['step']);
	    var rMin = 0;
	    var rOffset = parseInt(range['min']);
	    var rVal = (parseInt(range['val']) - rOffset) * rStep;
	    var rPrec = (String(range['step']).split('.')[1] || []).length;
	    var axis = range['axis'];
	    var units = range['units'];

		this.UI.push([
			'<!-- ', axis, ' ', name, ' -->',
			'<div class="input-group">',
			'<span class="input-group-addon">',axis.toUpperCase(), '</span>',
			// input bit
			'<input',
				' id="', axis, '-', name, '"',
				' type="text"',
				' class="form-control"',
				' placeholder="', name, '"',
				' oninput="document.getElementById(\'', axis, '-', name, '-r\').value = (parseFloat(this.value).toFixed(', rPrec, ') - ', rOffset, ') * ', rStep, '"',
				'onchange="document.getElementById(\'', axis, '-', name, '-r\').value = (parseFloat(this.value).toFixed(', rPrec, ') - ', rOffset, ' ) * ', rStep, '"',
			' />',
			'<span class="input-group-addon">', units, '</span>',
			'</div>',
			'<input',
				' id="', axis, '-', name, '-r"',
				' type="range"',
				' value="', rVal, '"',
				' min="', rMin, '"',
				' max="', rMax, '"',
				' oninput="document.getElementById(\'', axis, '-', name, '\').value = ((this.value / ', rStep, ') + ', rOffset, ').toFixed(', rPrec, ');"',
				' onchange="document.getElementById(\'', axis, '-', name, '\').value = ((this.value / ', rStep, ') + ', rOffset, ').toFixed(', rPrec, ');"',
			' />'].join(''));
	};
})(Mesher);

// Mesher v0.1
// Utilitarian functions

(function (m$) {
	// addModel adds the a Model
	// to the current Project
	m$.addModel = function (files) {
		var l  = this.Projects.length;
		if (l < 1){
			l = this.Projects.push(new this.Project());
		}
		this._cProj = m$.Projects[l-1];
		this.Files = new m$.File(files);
		this.Files.Project.Display = this.Settings.Display || document.body;
		this.Files.Project._addModel(m$.Files.Next());
	};

	// Sets up m$ with appropriate settings
	// takes settings, a map of jQuery selectors
	m$.init = function (settings) {
		this.Settings.Display = settings.Display;
		this.Settings.Selected = settings.Selected;
		this.output.Elements.history = settings.History;

		// model is added, get stuff working
		$(this.Settings.Display).click(this.click);
		$(window).resize(this.resize);
	};

	// NOT WORKING
	m$.resize = function () {
		m$.Globals.Camera.aspect = m$.Settings.Display.innerWidth / m$.Settings.Display.innerHeight;
		m$.Globals.Camera.updateProjectionMatrix();

		m$.Globals.Renderer.setSize( m$.Settings.Display.innerWidth, m$.Settings.Display.innerHeight );
	};

	m$.click = function (event) {
		event.preventDefault();
		m$.Clicks.push(new m$.Select(event));
	};

	// Freaking boss shading
	// http://stackoverflow.com/a/13542669
	m$.shade = function (num, percent) {
		// inverts percent depending on number (so always changes)
		if (num > (255/2)) {
			percent = -percent;
		}
	    amt = Math.round(2.55 * percent),
	    R = (num >> 16) + amt,
	    G = (num >> 8 & 0x00FF) + amt,
	    B = (num & 0x0000FF) + amt;
	    return (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)-0x1000000);
	};

})(Mesher);

// Mesher Library
var Mesher = function (m$) {
	'use strict';

	m$.MESHCOLOR = 0xAAAAAA; // Defualt mesh color

	m$.Projects = []; // Projects stack
	m$._cProj; // reference to project

	m$.Clicks = []; // click stack...

	// Settings, map of jQuery selectors for things
	m$.Settings = {};

	// Tools
	m$.tool = new m$.Tool();

	// Output object for handling printing
	// & such
	m$.output = new m$.Output();

	return m$;
}(Mesher);

(function (m$) {
// Rename Tool Definition
	// TODO: Relocate
	//(name, does, undo, toString, check, prepare)
	m$.tool.New(
		// name
		"Rename",
		// do function: does rename
		function () {
			var name = this.Params.name;
			// stores model by ref.
			this.model = this.Project.SelectedModels[0];
			this.OldName = this.Project.SelectedModels[0].name;
			this.model.name = name;
			return true;
		},
		// undo function: undoes rename
		function () {
			this.model.name = this.OldName;
			return true;
		},
		// toString function (idk what this does...)
		false,
		// check function: checks if can be performed
		function (proj) {
			return (proj.SelectedModels.length == 1);
		},
		// prepare function
		function () {
			// prepares and shit...
		}
	);
})(Mesher);