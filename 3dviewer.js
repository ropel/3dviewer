
//Load remote
let remote = require('electron').remote
paths = remote.getGlobal('sharedObj').objpath;

const { Button } = require('./gui');
button = new Button();


/**
 * Centers obj in zero
 * @param {THREE.Object3D} obj 
 */
function centerObject3D(obj) {
	let children = obj.children,
		completeBoundingBox = new THREE.Box3();

	for (let i = 0, j = children.length; i < j; i++) {
		children[i].geometry.computeBoundingBox();
		let box = children[i].geometry.boundingBox.clone();
		box.translate(children[i].position);
		completeBoundingBox.set(box.max, box.min);
	}
	let objectCenter = completeBoundingBox.center()

	obj.position.x -= objectCenter.x;
	obj.position.y -= objectCenter.y;
	obj.position.z -= objectCenter.z;
}

/**
 * Sets all material in obj to mat
 * @param {THREE.Object3D} obj 
 * @param {THREE.Material} mat 
 */
function setObject3DMaterial(obj, mat) {
    obj.traverse( function(child) {
        if ( child instanceof THREE.Mesh ) {
            child.material = mat;
        }
    } );
}

/**
 * Uniformly rescales obj so that it fits in a bounding box of size(scale)
 * @param {*} obj 
 * @param {*} scale 
 */
function rescaleObject3D(obj, scale=1.0){
	let bb = new THREE.Box3().setFromObject(obj);
	const bbSize = new THREE.Vector3();
	bb.getSize(bbSize);
	dims = [bbSize.x, bbSize.y, bbSize.z];

	maxDim = 0.0;
	for(let i=0; i<3; ++i) {
		if(dims[i] > maxDim) {
			maxDim = dims[i];
		}
	}

	obj.scale.set(scale/maxDim, scale/maxDim, scale/maxDim);
}

/**
 * Place objects in grid of dimension gsize*gsize
 * @param {*} objs 
 * @param {*} gsize 
 */
function placeObjsOnGrid(objs, gsize, spacing=1.0) {
	let initPos = new THREE.Vector3(-((gsize - 1) * spacing + gsize) / 2.0,
		0.0,
		-((gsize-1)*spacing + gsize)/2.0);

	for(let i=0; i<objs.length; ++i){
		let currentPos = initPos.clone();
		currentPos.x += (1.0+spacing) * (i % gsize);
		currentPos.z += (1.0+spacing) * Math.floor(i / gsize);

		objs[i].position.x = currentPos.x;
		objs[i].position.z = currentPos.z;
	}
}

//Gets console
let nodeConsole = require('console');
let shellConsole = new nodeConsole.Console(process.stdout, process.stderr);

//Setup scene
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
let objLoader = new THREE.OBJLoader();

//Loads all objects
let objs = [];
let loadingObjsCompleted = false;
let loadedObjs = 0;
let nObjs = paths.length;
for(let i=0; i<nObjs; i++) {
	objLoader.load(paths[i], function(object) {
		objs.push(object);
		scene.add(object);

		let matColor = new THREE.Color();
		matColor.setHSL(i/(nObjs-1.0), 1.0, 0.6);
		let material = new THREE.MeshStandardMaterial({color: matColor});

		setObject3DMaterial(object, material)
		centerObject3D(object);
		rescaleObject3D(object);

		shellConsole.log(`Loaded ${paths[i]}.`);
		loadedObjs += 1;
	});
	loadingObjsCompleted = true;
}

let renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//Camera control
let orbit = new THREE.OrbitControls(camera, renderer.domElement);

let directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
scene.add(directionalLight);

let ambientLight = new THREE.AmbientLight(0x777777);
scene.add(ambientLight);

camera.position.z = 5;

//Main loop
function animate() {
	requestAnimationFrame( animate );

	if (loadingObjsCompleted) {
		placeObjsOnGrid(objs, Math.round(Math.sqrt(objs.length)), 0.2)
	}
	renderer.render(scene, camera);
};

animate();
