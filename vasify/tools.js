// Tool adding framework

function Tool(name, units){
	this.name = name;
	this.units = units;
	this.Button();
	this.Popover();
	this.Set();
}

Tool.prototype.Button = function(){
	var html = ['<button id="', this.name, '-tool" class="list-group-item" style="width: 100%;">', this.name, '</button>'];
	this.button = html.join('');
};

Tool.prototype.Popover = function(){
	var popover = ['<!-- ', this.name, ' Tool -->'];

	var axes = ['x', 'y', 'z']

	// Axis independent addition of fields
	for (var i = 0; i < axes.length; i++){
		var axis = axes[i];
		popover.push('<!-- ', axis, ' ',this.name, ' --> <div class="input-group"> <span class="input-group-addon">', axis, '</span> <input id="', axis, '-', this.name, '" type="text" class="form-control" placeholder="', this.name, '" oninput="document.getElementById(\"', axis, '-', this.name, '-r\").value = parseFloat(this.value) * 100" onchange="document.getElementById(\"', axis, '-', this.name, '-r\").value = parseFloat(this.value) * 100"/> <span class="input-group-addon">', this.units, '</span> </div> <input id="', axis, '-', this.name, '-r" type="range" value="100" min="1" max="300" oninput="document.getElementById(\"', axis, '-', this.name, '\").value = this.value / 100;" onchange="document.getElementById(\"', axis, '-', this.name, '\").value = this.value / 100;" />');
	}
    
    // Apply button
    popover.push('<!-- Apply Button --> <button class="btn btn-defualt" onclick="setTrans(');
    for (var i = 0; i < axes.length; i++){
    	popover.push('document.getElementById("', axes[0], '-', this.name, '").value, ');
    }
    popover.push(this.name, ');" style="width: 100%;">Apply</button> </div>');

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