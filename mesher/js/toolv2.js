// Mesher Tool API

// Used for declaring tools,
// Interfacing with tools,
// & parsing tool declarations.

(function (m$) {

	// Array of Tool types (tools)
	m$.Tool = function () {
		this.Tools = [];
	};

	m$.Tool.prototype.New = function (name, do, undo, toString, check, prepare) {

		var tool = function (project) {
			this.Params = aruguments;
			this.Project = project;
		}

		// set undo function
		if (undo === false){
			tool.prototype.undo = function () { return false; };
		} else {
			tool.prototype.undo = undo;
		}

		// sets name
		tool.name = name;

		// Does the transformation
		tool.prototype.do = do;

		// Returns a string like "Transform(12, 2)"
		tool.prototype.toString = toString;

		tool.prototype.check = check;
		tool.prototype.prepare = prepare;

		this.Tools.push(tool);
	};

})(Mesher);