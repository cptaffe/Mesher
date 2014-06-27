// Tools defined here.

(function (m$) {
// Rename Tool Definition
	// TODO: Relocate
	//(name, does, undo, toString, check, prepare)
	m$.tool.New({
		name: "Rename",
		icon: "fa-quote-right", // Font-Awesome Icon
		do: function () {
			var name = this.Params.name;
			// stores model by ref.
			this.model = this.Project.SelectedModels[0];
			this.OldName = this.Project.SelectedModels[0].name;
			this.model.name = name;
			m$.ModelTag.SelectTagByUUID(this.model.uuid).html(document.createTextNode(name));
			return true;
		},
		undo: function () {
			this.model.name = this.OldName;
			m$.ModelTag.SelectTagByUUID(this.model.uuid).html(document.createTextNode(this.OldName));
			return true;
		},
		redo: function () {
			var name = this.Params.name;
			this.model.name = name;
			m$.ModelTag.SelectTagByUUID(this.model.uuid).html(document.createTextNode(name));
			return true;
		},
		check: function (proj) {
			return (proj.SelectedModels.length == 1);
		},
		prep: function (proj) {
			this.UIstack.push(m$.HTML.TextInput({
				def: "name"
			}));
		}
	});
})(Mesher);