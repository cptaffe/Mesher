/*!
 * Mesher v0.1
 * Copyright 2014 Concept Forge
 * Liscensed under MIT
 */

// Check for Dependencies
if (typeof THREE === 'undefined') { throw new Error('Mesher\'s JavaScript requires THREE'); }
if (typeof jQuery === 'undefined') { throw new Error('Mesher\'s JavaScript requires jQuery'); }


// Mesher Library
var Mesher = function () {
	'use strict';
	// Projects stack
	this.Projects = [];

	// reference to project
	this._cProj = this.Porjects[0];

	// Output object for handling printing
	// & such
	this.Output = new this.Output();
};

// Mesher Prototypes
(function (m, $) {
	'use strict';

m.prototype.import = function () {
		$.getScript("js/transform.js").fail(
			function(){
				console.log("js/transform.js failed");
			}); // transform functions
		$.getScript("js/tools.js").fail(
			function(){
				console.log("js/tools.js failed");
			}); // tools api
		$.getScript("init/tools.js").fail(
			function(){
				console.log("init/tools.js failed");
			}); // defualt tools
}(); // Import Scripts
  
})(Mesher, jQuery);

// Project object
(function (m) {
	'use strict';

	m.Project = function () {
		// Models stack
		this.Models = [];

		// references to models
		this._oModel = this.Models[0];
		this._cModel = this.Models[1];

		// Transformations Array stack
		this.Trans = [];

		// reference to transformations
		this.Hist = this.Trans[0];
		this.Fut = this.Trans[1];

		// original File info
		this.File = new m.File();
	};
	
	// Undo function
	// undo accepts an index to undo (optional)
	m.Project.undo = function (index) {
		this._do(this.Hist, this.Fut, this._cModel, index);
	};

	// Redo function
	// redo accepts an index to redo (optional)
	m.Project.undo = function (index) {
		this._do(this.Fut, this.Hist, this._cModel, index);
	};

	// Preview function
	// preview accepts a transformation object to preview,
	// & the nth preview this is; this enables the treatment
	// of the indice like a preview array.
	// preview clones the current model to a new Model
	// indice, it also clones the history stack and provides
	// the transform object in a new stack
	m.Project.preview = function (t, index) {
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

	// Internal Use _do
	// accepts a stack to pop/splic from,
	// a stack to push to,
	// a model to apply the altered stack to,
	// & an index to splice from (optional)
	m.Project._do = function (Hist, Fut, Model, index) {

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

})(Mesher);

// File object
(function (m) {
	'use strict';

	m.File = function(){
		// file name
		this.Name;
	};
})(Mesher)

// Trans object
(function (m) {
	'use strict';

	m.Trans = function () {
		// transformation function
		this.func;

		// function parameters
		this.params = [];

		// reference to project object
		this.project;
	};

	// calls func(params, g)
	// g specifies the geometry to change
	m.Trans.prototype.call = function (g) {
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
	m.Trans.prototype.create = function (func) {
		this.func = func;
		// optional params
		if (typeof arguments !== 'undefined'){
			this.params = arguments.splice(1);
		}
	};

	// record takes no parameters and pushes
	// the current transform object onto the
	// project's history stack.
	m.Trans.prototype.record = function () {
		var i = this.project.Hist.push(this);
		return i - 1; // returns index
	};

	// toString takes no parameters and pushes
	m.Trans.prototype.toString = function(){

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
(function (m) {
  'use strict';
  
	m.Output = function () {
		this.Elements;
		this.histPrinter;
	};

	m.Output.prototype.PrintHistory = function () {
		this.histPrinter(this.Elements);
	};
})(Mesher)

// JQuery Plugins.
(function ($, m){
  'use strict';
	// Set takes a trans object and prints a history
	// within a DOM element.
	$.fn.meshHistory = function(){
		m.Output.Elements.history = this;
		m.Output.histPrinter = function (e) {
			for (var i = 0; i < m._cProj.Hist.length; i++) {
        var s = document.createElement('div');
        s.appendChild(document.createTextNode(m._cProj.Hist[i].toString()));
        s.setAttribute('onclick', 'Hist['+i+'].call()');
        e.history.insertBefore(s, e.history.firstChild);
      }
    };
	};
})(jQuery, Mesher);