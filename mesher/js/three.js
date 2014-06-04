/			 		// set render function
		this.Render = function() {
			requestAnimationFrame(render);
			// model always lit from front
			directionalLight.position.set( camera.position.x,camera.position.y,camera.position.z );

			renderer.render(scene, camera);
			//Stats();
			controls.update();
		};*!
 * Mesher v0.1
 * THREE bindings
 */

(function (m$, THREE) {
	'use strict';
	
	// Three object
	// $3 is used interface the THREE.js package
	// & 'globals' are stored in the main object
	m$.Three = function () {
		// Canvas is child of node
		// Set through jQuery binding
		this.Parent;

		// map of references to THREE objects
		/*
		 * List of mapped objects for conveniece:
		 * Scene,
		 * Camera,
		 * Renderer,
		 * DirectionalLight,
		 * Controls,
		 * Render,
		 * Reader
		 */
		this.THREE = {}
	}
	// TODO: get rid of THREEx.WindowResize() & put code in as Three prototype.
	// init function
	// init creates a basic scene and supporting objects
	m$.Three.prototype.init = function () {
		
		// Create Scene, Camera, Renderer
		this.THREE.Scene = new THREE.Scene();
		this.THREE.Camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
		
		// Create & Add Renderer as child of Parent
		this.THREE.Renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
		this.THREE.Renderer.setSize(window.innerWidth, window.innerHeight);
		this.THREE.Renderer.setClearColor( 0x000000, 0);
		this.Parent.appendChild(this.THREE.Renderer.domElement);

		// Create & Add DirectionalLight to Scene 
		this.THREE.DirectionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
		this.THREE.DirectionalLight.position.set( 0, 0, 1 );
		scene.add( this.THREE.DirectionalLight );

		// set controls to container
		this.Controls = new THREE.OrbitControls(this.Camera, this.Parent.getElementsByTagName("canvas")[0]);

		// TODO: get rid of this line
		THREEx.WindowResize(renderer, camera);

		rhis.Reader = new FileReader();
	}

	// set render function
	m$.Three.prototype.Render = function() {
		// I don't really know...
		requestAnimationFrame(this.Render);
		// Shift DirectionalLight, Render Scene with Camera,
		// & Update Controls
		this.DirectionalLight.position.set( this.Camera.position.x, this.Camera.position.y, this.Camera.position.z );
		this.Renderer.render(this.Scene, this.Camera);
		this.Controls.update();
	};

	// TODO: set parent canvas parent?
	// Takes a value and assigns it to this.Parent
	m$.Three.prototype.setParent = function (value) {
		// set _oModel, so that
		// all future models are computed with that
		// as the parent of the canvas.
		this.Parent = this.elements;
	}
})(Mesher, THREE);