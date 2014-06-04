/*!
 * Mesher v0.1
 * jQuery bindings
 */

// jQuery plugins
// All plugins are under the m$
(function ($, m$){
  'use strict';

	// Container object for jquery plugin
	var Mesher = function (elements) {
		this.elements = elements;
	};

	// $.m$.history plugin
	// history uses a jquery object to init the
	// m$.output Output object and set its histPrint
	// function.
	Mesher.prototype.history = function () {
		m$.output.Elements.history = this.elements;
		m$.output.histPrinter = function (e) {
			for (var i = 0; i < m$._cProj.Hist.length; i++) {
				var s = document.createElement('div');
				s.appendChild(document.createTextNode(m$._cProj.Hist[i].toString()));
				s.setAttribute('onclick', 'Hist['+i+'].call()');
				e.history.insertBefore(s, e.history.firstChild);
			}
		};
		// still allows for chaining
		return this.elements;
	};

	// TODO: Update one _oModel -> _cModel is speced
	// Sets the model's parent node
	// model can accept a model to give set the parent with
	Mesher.prototype.model = function (model) {
		if (typeof model == 'undefined'){
			m$._cProj._cModel.Three.setParent(this.elements);
		} else {
			model.Three.setParent(this.elements);
		}
		return this.elements;
	};

	// extends jQuery
	$.fn.mesher = function () {
		return new Mesher(this);
	};
})(jQuery, Mesher);