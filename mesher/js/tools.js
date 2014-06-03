// Tool adding framework

// tool catalog
var toolCat = new Array();

// Tool accepts a map
function Tool(name, units, axes, range, fn){
    this.name = name || "Default"; // Name of tool
    this.units = units || "pt."; // unit value
    this.range = range || {min: -5, max: 5, step: 0.01, val: 0}; // map of range configs
    this.axes = axes || ['x', 'y', 'z']; // array of axes
    this.func = fn;
    // add to catalog
    this.index = toolCat.length;
    toolCat.push(this);
    // create it!
	this.go = function(){
        this.Button();
        this.Popover();
        this.Set();
    }
}

Tool.prototype.Button = function(){
	var html = ['<button id="', this.name, '-tool" class="list-group-item" style="width: 100%;">', this.name, '</button>'];
	this.button = html.join('');
};

Tool.prototype.Popover = function(){
	var popover = ['<!-- ', this.name, ' Tool -->'];

    // range config
    var rMax = (parseInt(this.range['max']) + parseInt(Math.abs(this.range['min']))) / parseFloat(this.range['step']);
    var rStep = 1/parseFloat(this.range['step']);
    var rMin = 0;
    var rOffset = parseInt(this.range['min']);
    var rVal = (parseInt(this.range['val']) - rOffset) * rStep;
    var rPrec = (String(this.range['step']).split('.')[1] || []).length


	// Axis independent addition of fields
	for (var i = 0; i < this.axes.length; i++){
		var axis = this.axes[i];
		popover.push('<!-- ', axis, ' ',this.name, ' --> <div class="input-group"> <span class="input-group-addon">', axis.toUpperCase(), '</span> <input id="', axis, '-', this.name, '" type="text" class="form-control" placeholder="', this.name, '" oninput="document.getElementById(\'', axis, '-', this.name, '-r\').value = (parseFloat(this.value).toFixed(', rPrec, ') - ', rOffset, ') * ', rStep, '" onchange="document.getElementById(\'', axis, '-', this.name, '-r\').value = (parseFloat(this.value).toFixed(', rPrec, ') - ', rOffset, ' ) * ', rStep, '"/> <span class="input-group-addon">', this.units, '</span> </div> <input id="', axis, '-', this.name, '-r" type="range" value="', rVal, '" min="', rMin, '" max="', rMax, '" oninput="document.getElementById(\'', axis, '-', this.name, '\').value = ((this.value / ', rStep, ') + ', rOffset, ').toFixed(', rPrec, ');" onchange="document.getElementById(\'', axis, '-', this.name, '\').value = ((this.value / ', rStep, ') + ', rOffset, ').toFixed(', rPrec, ');" />');
	}
    
    // Apply button
    popover.push('<!-- Apply Button --> <button class="btn btn-defualt" onclick="');
    var funcCall = new Array();
    for (var i = 0; i < this.axes.length; i++){
    	funcCall.push(['document.getElementById(\'', this.axes[i], '-', this.name, '\').value'].join(''));
    }
    popover.push('setTrans(', funcCall.join(', '), ', ', parseInt(this.range['val']), ',toolCat[', this.index, '].func);" style="width: 100%;">Apply</button> </div>');

    this.popover = popover.join('');
};

// sets button with prototype
Tool.prototype.Set = function(){
	// add button to layout
	appendStringAsNodes(document.getElementById('tool-bar'), this.button);
	// set button as popover
      $("#"+this.name+"-tool").popover({
        placement: 'left',
        title: this.name,
        html: true,
        content: this.popover,
      });
};

// Utilitarian functions
function appendStringAsNodes(element, html) {
    var frag = document.createDocumentFragment(),
        tmp = document.createElement('body'), child;
    tmp.innerHTML = html;
    // Append elements in a loop to a DocumentFragment, so that the browser does
    // not re-render the document for each node
    while (child = tmp.firstChild) {
        frag.appendChild(child);
    }
    element.appendChild(frag); // Now, append all elements at once
    frag = tmp = null;
}