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
		this.OriginalModels = [];
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

	m$.Project.prototype._addModel = function (file, callback) {
		// Create Three with new Model
		if (typeof this.Three == 'undefined'){
			this.Three = new m$.Three();

			// Init Model
			this.init();

			// set Models to reference
			this.Models = this.Three.Models;
		}
		this.Three.newModel(file, m$.File.NextFile, callback);
	};

	m$.Project.prototype.Originalize = function () {
		for (var i = 0; i < this.Models.length; i++){
			this.Three.Scene.remove(this.Models[i]);
			this.Models[i] = this.OriginalModels[i].clone();
			this.Three.Scene.add(this.Models[i]);
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
					s.appendChild(document.createTextNode(m$._cProj.Hist[i].getString()));
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

(function (m$, $, THREE) {
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

	// adds a Model object to the scene, file, callbacks
	m$.Three.prototype.newModel = function (file) {
		this.readFile.call(this, arguments);
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

	// Reads file into THREE map, file, callbacks
	m$.Three.prototype.readFile = function (args) {
		this.Reader.parent = this;
		this.Reader.onload = function (e) {
			this.parent.addModel(e.target.result, args[0].name);
			if (args.length > 1) {
				for (var i = 1; i < args.length; i++) {
					args[i]();
				}
			}
		};
		this.Reader.readAsBinaryString(args[0]);
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
		// Backup original copy of model :)
		// TODO: Make this better
		m$._cProj.OriginalModels.push(this.Models[l-1].clone());
		m$.registerChange(); // register change

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
})(Mesher, jQuery, THREE);

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
		m$.registerChange(); // register change
	};

	// deselect model
	m$.Select.prototype.Deselect = function () {
			this.Project.SelectedModels.splice(this.Index, 1);
			this.model.material.color.setHex(m$.MESHCOLOR);
			m$.registerChange(); // register change
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
		selected.setAttribute('onclick', 'Mesher.ModelTag.SelectModelByUUID.call(this,event)')
		$(m$.Settings.Selected).append(selected);
	};

	m$.ModelTag.SelectModelByUUID = function (event) {
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

	m$.ModelTag.SelectTagByUUID = function (uuid) {
		return $(m$.Settings.Selected).children('#'+uuid);
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

(function (m$, $) {

	// Array of Tool types (tools)
	m$.Tool = function () {
		this.Tools = [];
	};

	m$.Tool.prototype.New = function (map) {

		var tool = function (project, map) {
			this.Params = map;
			this.Project = project;
		}

		// sets name
		tool.Name = map['name'];
		tool.Icon = map['icon'];

		// set undo function, should return true on success
		if (typeof map['undo'] == 'undefined'){
			tool.prototype.undo = function () { return false; };
		} else {
			tool.prototype.undo = map['undo'];
		}

		// set redo function, should return true on success
		if (typeof map['redo'] == 'undefined'){
			tool.prototype.redo = function () { return false; };
		} else {
			tool.prototype.redo = map['redo'];
		}

		// Does the transformation, should return true on success
		tool.prototype.do = map['do'];

		// accessible globally
		// takes project pointer, returns bool
		tool.check = map['check'];
		tool._Prep = new m$.Tool._Prep(map['prep']);
		tool.Prep = function (map) {
			return this._Prep.Do(map);
		};
		this.Tools.push(tool);
	};

	m$.Tool._Prep = function (prep) {
		this.UIstack = []; // UI stack for use.
		this.Prep = prep;
	};

	m$.Tool._Prep.prototype.Do = function (map) {
		this.Prep.call(this, map);
		var con = document.createElement('div');
		var l = this.UIstack.length;
		for (var i = 0; i < this.UIstack.length; i++) {
			var html = this.UIstack[i];
			html = html.html();
			// makes all inputs part of class 'form-control',
			// bootstrap styling.
			if ($(html).prop("tagName") == 'INPUT' || $(html).prop("tagName") == 'BUTTON'){
				$(html).addClass('form-control');
			}
			con.appendChild(html);
		}
		while (this.UIstack.length > 0) {
			this.UIstack.pop();
		}
		return con;
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
	m$.Tool.prototype.Do = function (index, map) {
		var proj = m$._cProj; // record current project
		if (index >= 0 && index < this.Tools.length) {
			var toolType = this.Tools[index];
			// check if can be done
			if (toolType.check({
				project: proj,
				index: index
			})){
				// create new tool of type in index
				var tool = new toolType(proj, map);
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
			console.log("Index out ("+index+") of bounds.");
			return false; // fail
		}
	}

	// pop from Hist to Fut,
	// execute its undo function
	m$.Tool.prototype.Undo = function () {
		var proj = m$._cProj; // record current project
		if (proj.Hist.length > 0){
			var tool = proj.Hist.pop();
			// try undo, it fail
			if (!tool.undo()) {
				// reload original models
				proj.Originalize();
				// do all operations from the ground up
				for (var i = 0; i < proj.Hist.length; i++){
					if (!proj.Hist[i].do()) { // if no work
						// basically ignore it and move on.
						// this should not ever happen
						console.log(proj.Hist[i].getString() + ", it no work.");
					}
				}
			}
			// at this point, undo has 'worked' somehow.
			proj.Fut.push(tool);
			return true;
		} else {
			console.log('Nothing to undo.');
		}
	}

	// pop from Fut to Hist
	// execute do.
	m$.Tool.prototype.Redo = function () {
		var proj = m$._cProj; // record current project
		if (proj.Fut.length > 0) {
			var tool = proj.Fut.pop();
			// try do, it fail
			if (!tool.redo()) {
				console.log(tool.getString + ", it no work.");
				// essentially throws away
				return false; // fail
			}
			proj.Hist.push(tool);
			return true;
		} else {
			console.log('Nothing to redo.');
		}
	}

})(Mesher, jQuery);

(function (m$, $) {
	m$.Controls = function () {
		this.Index = 0;
		this.SetSize = 8;
		this.Proj = m$._cProj;
		this.Panes = [];
		this.Tools; // ref to Pane
	};

	m$.Controls.prototype.CreatePanes = function () {
		var Index = 0;
		for (var i = 0; Index != m$.tool.Tools.length; i++) {
			var inIndex = Index;
			this.Panes.push([])
			for (; Index < m$.tool.Tools.length && (Index-inIndex) < this.SetSize; Index++) {
				this.Panes[i].push(m$.tool.Tools[Index]);
			}
		}
	};

	// Get 8 tools from the set of all tools (per call)
	m$.Controls.prototype.GetTools = function () {
		this.Tools = this.Panes[this.Index];
	};

	// Get 8 tools from the set of all tools (per call)
	m$.Controls.prototype.GetPrevTools = function () {
		if (this.Index > 0) {
			this.Index--;
		} else {
			this.Index = this.Panes.length-1;
		}
	};

	m$.Controls.prototype.GetNextTools = function () {
		if (this.Index < this.Panes.length-1) {
			this.Index++;
		} else {
			this.Index = 0;
		}
	};

	// write control elements to page
	m$.Controls.prototype.WriteTools = function () {
		$(m$.Settings.Controls).empty();
		for (var i = 0; i < this.Tools.length; i++){
			var control = document.createElement('div');
			control.setAttribute('color', 'green');
			control.setAttribute('data-toggle', 'tooltip');
			control.setAttribute('data-placement', 'top');
			control.setAttribute('title', this.Tools[i].Name);
			control.setAttribute('id', i);
			var icon = document.createElement('i');
			icon.setAttribute('class', 'fa fa-fw ' + this.Tools[i].Icon);
			control.appendChild(icon);
			$(control).tooltip(); // tooltip implemented
	        $(control).popover({
		        placement: 'left',
		        title: this.Tools[i].Name,
		        html: true,
		        content: function () {
		        	// close all popovers
		        	var _ = function () {
		        		$(this).siblings().popover('hide');
		        	}.call(this);
		        	var f = function (s) {
			        	return this.Tools[s.id].Prep({
							project: m$._cProj,
							index: s.id
						});
		        	}.call(m$.controls, this);
		        	return f;
		        }
		    });
			$(m$.Settings.Controls).append(control);
		}
	};

	m$.Controls.prototype.CheckTools = function () {
		for (var i = 0; i < this.Tools.length; i++){
			if (!this.Tools[i].check({
				project: m$._cProj,
				index: i
			})){
				$(m$.Settings.Controls).children('#'+i).attr('color', 'gray').popover('disable');
			} else {
				$(m$.Settings.Controls).children('#'+i).attr('color', 'green').popover('enable');
			}
		}
	};

})(Mesher, jQuery);

(function (m$) {
	m$.FileIO = function () {};

	m$.FileIO.Drag = function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }

    m$.FileIO.Drop = function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        Mesher.addModel(evt.dataTransfer.files, m$.RemoveIntroPanel);
    }
    m$.FileIO.Select = function (evt) {
    	console.log("was here.");
    	evt.stopPropagation();
        evt.preventDefault();
        Mesher.addModel(evt.target.files, m$.RemoveIntroPanel);
    }
})(Mesher);

// HTML library for popovers and stuffs
(function (m$, $) {

	m$.HTML = function (map) {
		this.Name = map['Name'];
		this.New = map['New'];
		this.Val = map['Val'];
		this.Is = map['Is'];
	};

	// html functions map
	m$.HTML.List = {};

	m$.HTML.New = function (map) {
		m$.HTML.List[map['Name']] = new m$.HTML(map);
	};

	m$.HTML.Is = function (elem) {
		for (key in this.List) {
			if (this.List.hasOwnProperty(key)) {
				if (this.List[key].Is.call(elem)) {
					return this.List[key];
				}
			}
		}
	};

	m$.HTML.Val = function (elem) {
		return (this.Is(elem)).Val.call(elem);
	}

})(Mesher, jQuery);


(function (m$, $) {
	m$.IntroPanel = function () {

		// page cover
		var div = document.createElement('div');
		$(div).attr('id', 'IntroPanel');
		$(div).css('background-color', 'white');
		$(div).css('position', 'absolute');
		$(div).css('top', '0');
		$(div).css('bottom', '0');
		$(div).css('right', '0');
		$(div).css('left', '0');

		// img
		var img = document.createElement('img');
		$(img).attr('src', 'Mesher.svg');
		var HEIGHT = 212.8;
		var WIDTH = 184.85;
		$(img).attr('height', HEIGHT + 'px');
		$(img).attr('width', WIDTH + 'px');
		$(img).css('position', 'absolute');
		$(img).css('top', (window.innerHeight/2)-(HEIGHT/2)+'px');
		$(img).css('bottom', (window.innerHeight/2)-(HEIGHT/2)+'px');
		$(img).css('right', (window.innerWidth/2)-(WIDTH/2)+'px');
		$(img).css('left', (window.innerWidth/2)-(WIDTH/2)+'px');
		div.appendChild(img);

		var file_select = document.createElement('input');
		$(file_select).attr('id', 'file-select');
		$(file_select).attr('name', 'file[]');
		$(file_select).attr('multiple');
		$(file_select).attr('type', 'file');
		$(file_select).css('display', 'none');

		div.addEventListener('dragover', m$.FileIO.Drag, false);
        div.addEventListener('drop', m$.FileIO.Drop, false);
       	file_select.addEventListener('change', m$.FileIO.Select, false);
        div.appendChild(file_select);

        // text
		var text = document.createElement('p');
		text.appendChild(document.createTextNode("Drag in an STL, "));
		var browse = document.createElement('a');
		browse.appendChild(document.createTextNode("browse"));
		$(browse).click(function(event){
			$(file_select).trigger('click');
		});
		$(browse).css('cursor', 'pointer');
		text.appendChild(browse);
		$(text).css('font-family', 'Ubuntu');
		$(text).css('font-size', '16px');
		$(text).css('color', 'rgb(200,200,200)');
		$(text).css('position', 'absolute');
		$(text).css('top', (window.innerHeight/2)+(HEIGHT/2)+20+'px');
		$(text).css('right', (window.innerWidth/2)-82+'px');
		div.appendChild(text);

		document.body.appendChild(div);
	}

	m$.RemoveIntroPanel = function () {
		$('#IntroPanel').fadeOut(1000);
		$('#IntroPanel').remove();
		m$.AfterIntroInit();
	};
})(Mesher, jQuery);

// Mesher v0.1
// Utilitarian functions

(function (m$, $) {
	// addModel adds the a Model
	// to the current Project
	m$.addModel = function (files, callback) {
		var l  = this.Projects.length;
		if (l < 1){
			l = this.Projects.push(new this.Project());
		}
		this._cProj = m$.Projects[l-1];
		this.Files = new m$.File(files);
		this.Files.Project.Display = this.Settings.Display || document.body;
		this.Files.Project._addModel(m$.Files.Next(), callback);
	};

	// Sets up m$ with appropriate settings
	// takes settings, a map of jQuery selectors
	m$.init = function (settings) {
		this.Settings.Display = settings.Display;
		this.Settings.Selected = settings.Selected;
		this.output.Elements.history = settings.History;
		this.Settings.Controls = settings.Controls;
		this.Settings.Drop = settings.Drop;
		this.Settings.Undo_Redo = settings.Undo_Redo;
		this.Settings.Tool_Nav = settings.Tool_Nav;
		this.controls.SetSize = settings.ToolNum;
		// model is added, get stuff working
		$(this.Settings.Display).click(this.click);
		$(window).resize(this.resize);

		// Undo/Redo setup
		this.UndoRedoInit();
		// Nav setup
		this.ToolNavInit();

		// Controls Setup
		this.controls.CreatePanes();
		this.controls.GetTools();
		this.controls.WriteTools();

		// Set height of div as height when filled first
		$(Mesher.Settings.Controls).height($(Mesher.Settings.Controls).height());

        m$.IntroPanel();
	};

	m$.UndoRedoInit = function () {
		// Container
		var undo_redo = document.createElement('div');
		$(undo_redo).attr('id', 'undo_redo');

		// Undo stuff
		var undo_i = document.createElement('i');
		$(undo_i).addClass('fa');
		$(undo_i).addClass('fa-fw');
		$(undo_i).addClass('fa-undo');
		$(undo_i).css('cursor', 'pointer');
		$(undo_i).on('click', function () {
			Mesher.tool.Undo();
		})
		undo_redo.appendChild(undo_i);

		// Redo stuff
		var redo_i = document.createElement('i');
		$(redo_i).addClass('fa');
		$(redo_i).addClass('fa-fw');
		$(redo_i).addClass('fa-undo');
		$(redo_i).addClass('fa-flip-horizontal');
		$(redo_i).css('cursor', 'pointer');
		$(redo_i).on('click', function () {
			Mesher.tool.Redo();
		})
		undo_redo.appendChild(redo_i);

		$(this.Settings.Undo_Redo).append(undo_redo);
	}

	m$.ToolNavInit = function () {
		var DELAY = 300;
		
		// Container
		var undo_redo = document.createElement('div');
		$(undo_redo).attr('id', 'undo_redo');

		// Undo stuff
		var undo_i = document.createElement('i');
		$(undo_i).addClass('fa');
		$(undo_i).addClass('fa-fw');
		$(undo_i).addClass('fa-chevron-left');
		$(undo_i).css('cursor', 'pointer');
		$(undo_i).on('click', function () {
			Mesher.controls.GetPrevTools();
			Mesher.controls.GetTools();
			Mesher.Settings.Controls.fadeOut(DELAY, function () {
				Mesher.controls.WriteTools();
				Mesher.controls.CheckTools();
			});
			Mesher.controls.CheckTools();
			Mesher.Settings.Controls.fadeIn(DELAY);
		})
		undo_redo.appendChild(undo_i);

		// Redo stuff
		var redo_i = document.createElement('i');
		$(redo_i).addClass('fa');
		$(redo_i).addClass('fa-fw');
		$(redo_i).addClass('fa-chevron-right');
		$(redo_i).css('cursor', 'pointer');
		$(redo_i).on('click', function () {
			Mesher.controls.GetNextTools();
			Mesher.controls.GetTools();
			Mesher.Settings.Controls.fadeOut(DELAY, function () {
				Mesher.controls.WriteTools();
				Mesher.controls.CheckTools();
			});
			Mesher.Settings.Controls.fadeIn(DELAY);
		})
		undo_redo.appendChild(redo_i);

		$(this.Settings.Tool_Nav).append(undo_redo);
	}

	m$.AfterIntroInit = function () {
		// File interface setup
        this.Settings.Drop.addEventListener('dragover', m$.FileIO.Drag, false);
        this.Settings.Drop.addEventListener('drop', m$.FileIO.Drop, false);
	}

	// things that run on environmental changes
	m$.registerChange = function () {
		this.controls.CheckTools();
	}

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

	// UUID Generation
	m$.UUIDGen = function (){
	    var d = new Date().getTime();
	    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	        var r = (d + Math.random()*16)%16 | 0;
	        d = Math.floor(d/16);
	        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
	    });
	    return uuid;
	};

})(Mesher, jQuery);

// Mesher Library
var Mesher = function (m$) {
	'use strict';

	m$.MESHCOLOR = 0xAAAAAA; // Defualt mesh color

	m$.Projects = []; // Projects stack
	m$._cProj; // reference to project

	m$.Clicks = []; // click stack...

	m$.controls = new m$.Controls();

	// Settings, map of jQuery selectors for things
	m$.Settings = {};

	// Tools
	m$.tool = new m$.Tool();

	// Output object for handling printing
	// & such
	m$.output = new m$.Output();

	return m$;
}(Mesher);