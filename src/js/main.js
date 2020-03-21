var camera, controls, scene, renderer;

init();
animate();

function init() {
    var aspect = window.innerWidth / window.innerHeight;

    camera = new THREE.PerspectiveCamera( 60, aspect, 1, 1000 );
    camera.position.z = 10;

    scene = new THREE.Scene();

    var geo = new THREE.SphereGeometry(1, 100, 100);
    var mat = new THREE.MeshBasicMaterial();
    var box = new THREE.Mesh(geo, mat);
    scene.add(box);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    createControls( camera );
}

function createControls( camera ) {
    controls = new THREE.TrackballControls( camera, renderer.domElement );

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.2;

    controls.keys = [ 65, 83, 68];
}

function animate() {
    requestAnimationFrame( animate );
    controls.update();
    render();
}

function render() {
    renderer.render( scene, camera );
}