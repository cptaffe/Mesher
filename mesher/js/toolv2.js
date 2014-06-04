// Mesher Tool API

// Used for declaring tools,
// Interfacing with tools,
// & parsing tool declarations.

(function (m$) {
	m$.Toool = function () {

		// Specs for tool
		this.hasUndo = false;
		this.Name = "default";

		// Map of parameters
		this.Params = {};

		// Functions to call
		this.do = function () { /* function */ };
		this.undo = function () { /* function */ };
	};
})(Mesher);