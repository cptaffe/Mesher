// Tools defined here.

(function (m$) {
	// Text Input
	m$.HTML.New({
		Name: "TextInput",
		New: function (map) {
			this.html = function () {
				var i = document.createElement('input');
				i.setAttribute('type', 'text');
				i.setAttribute('class', 'def-text-input');
				// sets name
				if (typeof map['name'] != 'undefined') {
					i.setAttribute('name', map['name']);
				} else {
					i.setAttribute('name', 'text');
				}
				// sets placeholder
				if (typeof map['def'] != 'undefined') {
					i.setAttribute('placeholder', map['def']);
				} // else is not set
				i.setAttribute('id', '')
				return i;
			};
		},
		Val: function () {
			return this.value;
		},
		Is: function () {
			if ($(this).hasClass('def-text-input')) {
				return true;
			} else { return false; }
		}
	});

	// Range Input
	m$.HTML.New({
		Name: "RangeInput",
		New: function (map) {
			this.html = function () {
				var i = document.createElement('input');
				i.setAttribute('type', 'range');
				i.setAttribute('class', 'def-range-input');
				if (typeof map['name'] != 'undefined') {
					i.setAttribute('name', map['name']);
				} else {
					i.setAttribute('name', 'color');
				}
				i.setAttribute('min', 0);
				i.setAttribute('max', (map['max']-map['min']) / map['prec']);
				i.setAttribute('prec', map['prec']);
				i.setAttribute('omin', map['min']);
				return i;
			};
		},
		Val: function () {
			var v = this.value;
			v = v + this.omin;
			v = v * this.prec;
			return v;
		},
		Is: function () {
			if ($(this).hasClass('def-range-input')) {
				return true;
			} else { return false; }
		}
	});

	// Color Input
	m$.HTML.New({
		Name: "ColorInput",
		New: function (map) {
			this.html = function () {
				var i = document.createElement('input');
				i.setAttribute('type', 'color');
				i.setAttribute('class', 'def-color-input');
				if (typeof map['name'] != 'undefined') {
					i.setAttribute('name', map['name']);
				} else {
					i.setAttribute('name', 'color');
				}
				return i;
			};
			return this;
		},
		Val: function () {
			return this.value;
		},
		Is: function () {
			if ($(this).hasClass('def-color-input')) {
				return true;
			} else { return false; }
		}
	});

	// Apply Input
	m$.HTML.New({
		Name: "ApplyInput",
		New: function (map) {
			this.html = function () {
				var i = document.createElement('button');
				$(i).attr('type', 'button');
				$(i).addClass('btn');
				$(i).addClass('btn-default');
				$(i).addClass('class', 'def-apply-input');
				$(i).attr('num', map['index']);
				if (typeof map['text'] != 'undefined') {
					i.appendChild(document.createTextNode(map['text']));
				} else {
					i.appendChild(document.createTextNode("Apply"));
				}
				$(i).on('click', function (event) {
					var elem = event.target;
					var elems = $(elem).siblings('input');
					var map = {};
					for (var i = 0; i < elems.length; i++) {
						map[elems[i].name] = Mesher.HTML.Val(elems[i]);
					}
					Mesher.tool.Do($(elem).attr('num'), map);
				})
				return i;
			};
			return this;
		},
		Val: function () {
			return null;
		},
		Is: function () {
			if ($(this).hasClass('def-apply-input')) {
				return true;
			} else { return false; }
		}
	});
})(Mesher);