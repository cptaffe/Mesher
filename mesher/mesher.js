// Mesher v0.1
// Copyright 2014 Concept Forge
// Liscensed under MIT

// Check for Dependencies
if (typeof THREE === 'undefined') { throw new Error('Mesher\'s JavaScript requires THREE'); }
if (typeof jQuery === 'undefined') { throw new Error('Mesher\'s JavaScript requires jQuery'); }

var Mesher = { REVISION: '1' };

// easy colloquial usage
var m$ = Mesher;

// Project object
(function (m$, THREE, $) {
	'use strict';

	m$.Project = function () {
		// Models stack
		this.Models = [];

		// references to models
		this._oModel;
		this._cModel;

		// set as _cModel's display
		this.Display;

		// Transformations Array stack
		this.Trans = [
			[],
			[]
		];

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

	// addModel creates a model and sets it to
	// _oModel, and then clones that model to _cModel
	m$.Project.prototype.addModel = function (files) {
		this._addModel(files[0]); // add each file in array
	};

	m$.Project.prototype._addModel = function (file) {

		// Create _oModel
		// & push to stack
		var i = this.Models.push(new m$.Model(file));

		// Create Three with new Model
		if (typeof this.Three == 'undefined'){
			this.Three = new m$.Three(this.Models[i-1]);

			// Init Model
			this.init();

			// Read File to _oModel
			this.Three.readFile(file);
		} else {
			this.Three.newModel(this.Models[i-1]);
		}

		// Clone _oModel to _cModel
		// using jQuery Deep Clone
		// TODO: More efficient clone, less cloning...
		this.Models[i] = $.extend(true, {}, this._oModel);

		// Set _oModel and _cModel accordingly
		this._oModel = this.Models[i-1];
		this._cModel = this.Models[i];
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

// Trans object
(function (m$) {
	'use strict';

	m$.Trans = function (proj, func) {
		// transformation function
		this.func = func;

		// function parameters
    if (typeof arguments !== 'undefined'){
			this.params = arguments.splice(2);
		}

		// reference to project object
		this.project = proj;
	};

	// calls func(params, g)
	// g specifies the geometry to change
	m$.Trans.prototype.call = function (g) {
		// .apply() sends the scope
		// & sends parameters as an array
		// since concat returns the merged array
		// params is merged with g, the goemetry,
		// resulting in (g, params...) in the called
		// function.
		this.func.apply(this, [g].concat(this.params));
	};

	// create takes a transformation function
	// and an arguments as parameters, any arguments
	// following the function are treated as params (optional)
	m$.Trans.prototype.create = function (func) {
		this.func = func;
		// optional params
		if (typeof arguments !== 'undefined'){
			this.params = arguments.splice(1);
		}
	};

	// record takes no parameters and pushes
	// the current transform object onto the
	// project's history stack.
	m$.Trans.prototype.record = function () {
		var i = this.project.Hist.push(this);
		return i - 1; // returns index
	};

	// toString takes no parameters and pushes
	m$.Trans.prototype.toString = function(){

		// creates stack
		// & pushes the func name and '(' stack
		var s = [];
		s.push(this.func.name, '(');

		// stack declared and params looped over
		// & pushed, then pushed to the main
		// stack when conjoined with ', ' and 
		// the stack is topped with ')'
		var p = [];
		for (var i = 0; i < this.params.length; i++){
			p.push(this.params[i]);
		}
		s.push(p.join(', '));
		s.push(')');

		// return joined stack.
		return s.join('');
	};
})(Mesher);

// Output function
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
	m$.Three.prototype.newModel = function (model) {
		this.readFile(model.File)
	};

	// Globalize allows requestAnimationFrame() to reference
	// global variables by storing object value references in
	// the Globals object of the Mesher global object.
	m$.Three.prototype.Globalize = function () {
		m$.Globals = {};
		m$.Globals.Render = this.Render;
		m$.Globals.DirectionalLight = this.DirectionalLight;
		m$.Globals.Camera = this.Camera;
		m$.Globals.Renderer = this.Renderer;
		m$.Globals.Scene = this.Scene;
		m$.Globals.Controls = this.Controls;
		m$.Globals.Models = this.Models;
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
	m$.Three.prototype.readFile = function (file) {
		m$.ReadyToRead = false;
		this.Reader.parent = this;
		this.Reader.onload = function (e) {
			this.parent.addModel(e.target.result);
			m$.ReadyToRead = true;
		};
		this.Reader.readAsBinaryString(file);
	};

	// Adds Model 
	m$.Three.prototype.addModel = function (data) {
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

(function (m$) {
	'use strict';
	
	// Model object
	// Model is used interface the THREE.js package
	// & 'globals' are stored in the main object
	m$.Model = function (file) {
		this.File = file;
	};
})(Mesher);

// Mesher v0.1
// Utilitarian functions

(function (m$) {
	// addModel adds the a Model
	// to the current Project
	m$.addModel = function (file) {
		var l  = this.Projects.length;
		if (l < 1){
			l = this.Projects.push(new this.Project());
		}
		this._cProj = m$.Projects[l-1];
		this._cProj.Display = this.Settings.Display || document.body;
		this._cProj.addModel(file);

		// model is added, get stuff working
		$(this.Settings.Display).click(this.click);
		// Too resource intensive
		//$(this.Settings.Display).mousemove(this.hover);
		$(window).resize(this.resize);
	};

	// Sets up m$ with appropriate settings
	// takes settings, a map of jQuery selectors
	m$.init = function (settings) {
		this.Settings.Display = settings.Display;
		this.output.Elements.history = settings.History;
	};

	// NOT WORKING
	m$.resize = function () {
		this.Globals.Camera.aspect = this.Settings.Display.innerWidth / this.Settings.Display.innerHeight;
		this.Globals.Camera.updateProjectionMatrix();

		this.Globals.Renderer.setSize( this.Settings.Display.innerWidth, this.Settings.Display.innerHeight );
	}

	m$.hover = function () {

		event.preventDefault();

		var projector = new THREE.Projector();

		var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
		projector.unprojectVector( vector, m$.Globals.Camera );

		var raycaster = new THREE.Raycaster( m$.Globals.Camera.position, vector.sub( m$.Globals.Camera.position ).normalize() );

		var intersects = raycaster.intersectObjects( m$.Globals.Models );
		
		// select or unselect
		if ( intersects.length > 0 ) {
			//
			if (m$.RolledModel == intersects[0].object){
				// still selected
			} else {
				// is now selected
				m$.RolledModel = intersects[0].object;
				m$.OldColor = intersects[0].object.material.color.getHex();
				intersects[0].object.material.color.setHex(m$.shade(m$.OldColor, 15));
			}
		} else {
			// is not selected anymore
			if (typeof m$.RolledModel != 'undefined'){
				m$.RolledModel.material.color.setHex(m$.OldColor);
				m$.RolledModel = undefined;
			}
		}
	};

	m$.click = function () {

		event.preventDefault();

		var projector = new THREE.Projector();

		var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
		projector.unprojectVector( vector, m$.Globals.Camera );

		var raycaster = new THREE.Raycaster( m$.Globals.Camera.position, vector.sub( m$.Globals.Camera.position ).normalize() );

		var intersects = raycaster.intersectObjects( m$.Globals.Models );
		
		// select or unselect
		if ( intersects.length > 0 ) {
			var i = m$.SelectedModels.indexOf(intersects[0].object);
			if (i == -1){
				m$.SelectedModels.push(intersects[0].object);
				intersects[0].object.material.color.setHex(m$.shade(m$.MESHCOLOR, 20));
				//m$.OldColor = 0xAAAA00; // for hover
			} else {
				m$.SelectedModels.splice(i, 1);
				intersects[0].object.material.color.setHex(m$.MESHCOLOR);
				//m$.OldColor = m$.MESHCOLOR; // for hover
			}
		}
	};

	// Freaking boss shading
	// & blending
	// http://stackoverflow.com/a/13542669
	m$.shade = function (num, percent) {  
	    amt = Math.round(2.55 * percent),
	    R = (num >> 16) + amt,
	    G = (num >> 8 & 0x00FF) + amt,
	    B = (num & 0x0000FF) + amt;
	    return (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)-0x1000000);
	}

})(Mesher);

// Mesher Library
var Mesher = function (m$) {
	'use strict';

	// Defualt mesh color
	m$.MESHCOLOR = 0xAAAAB9;

	// Projects stack
	m$.Projects = [];

	// reference to project
	m$._cProj;

	// Selected Models
	m$.SelectedModels = [];
	m$.RolledModel;
	m$.OldColor;

	// Settings, map of jQuery selectors for things
	m$.Settings = {};

	// Output object for handling printing
	// & such
	m$.output = new m$.Output();

	return m$;
}(Mesher);