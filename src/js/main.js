var camera, controls, scene, renderer, objects, light;

class SpaceObject {
    constructor(name, initial_position={x: 0.0, y: 0.0, z: 0.0}, initial_velocity={x: 0.0, y: 0.0, z: 0.0}, mass=1.0) {
        this.name = name;
        this.initial_position = initial_position;
        this.initial_velocity = initial_velocity;
        this.mass = mass;

        this.gui = new dat.GUI();
        this.gui.add(this, 'name');

        this.positionFolder = this.gui.addFolder('Position');
        this.positionFolder.add(this.initial_position, 'x');
        this.positionFolder.add(this.initial_position, 'y');
        this.positionFolder.add(this.initial_position, 'z');

        this.velocityFolder = this.gui.addFolder('Velocity');
        this.velocityFolder.add(this.initial_velocity, 'x');
        this.velocityFolder.add(this.initial_velocity, 'y');
        this.velocityFolder.add(this.initial_velocity, 'z');

        this.gui.add(this, 'mass').min(0.0);

        this.functionFolder = this.gui.addFolder('Functions');

        this.functionFolder.add(this, 'update');
        this.functionFolder.add(this, 'delete');
    }

    update() {
        this.size = Math.log10(this.mass + 1);
        if (this.sphere != undefined) {
            scene.remove(scene.getObjectByName(this.sphere.name));
        }

        this.geometry = new THREE.SphereGeometry(this.size, 50, 50);
        this.material = new THREE.MeshLambertMaterial({color: 0x00ffff});
        this.sphere = new THREE.Mesh(this.geometry, this.material);
        this.sphere.name = this.name;

        this.sphere.position.x = this.initial_position.x;
        this.sphere.position.y = this.initial_position.y;
        this.sphere.position.z = this.initial_position.z;

        scene.add(this.sphere);
    }

    delete() {
        this.gui.destroy();
        scene.remove(scene.getObjectByName(this.sphere.name));
        delete objects.objectlist[this.name];
    }
}

class SpaceSimulation {
    constructor() {
        this.spaceObjectList = {};
        this.timesteps = 1000;
        this.deltaT = 1.0;
        this.playbackSpeed = 100.0;
        this.results =  null;

        this.gui = new dat.GUI();
        this.gui.add(this, 'timesteps');
        this.gui.add(this, 'deltaT');
        this.gui.add(this, 'playbackSpeed');
        this.gui.add(this, 'addObject');
        this.gui.add(this, 'calculate');
        this.gui.add(this, 'play');
    }
    
    addObject() {
        var name = window.prompt("Enter a name:");
        if (name) this.spaceObjectList[name] = new SpaceObject(name);
    }

    calculate() {
        var message = {
            timesteps: this.timesteps,
            deltaT: this.deltaT,
            spaceObjects: []
        };
        for (const key of Object.keys(this.spaceObjectList)) {
            message.spaceObjects.push({
                name: this.spaceObjectList[key].name,
                mass: this.spaceObjectList[key].mass,
                initial_position: this.spaceObjectList[key].initial_position,
                initial_velocity: this.spaceObjectList[key].initial_velocity
            });
        }
        console.log("Sending");
        var xhr = new XMLHttpRequest();
        xhr.open("POST", 'http://localhost:8080')
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                objects.results = JSON.parse(xhr.responseText);
                console.log("Recieved");

            }
        }
        xhr.send(JSON.stringify(message));
    }

    play() {
        this._play();
    }

    async _play() {
        console.log("Playing");
        for (var key in this.spaceObjectList) {
            this.spaceObjectList[key].update();
        }
        var steps = Math.floor(this.results[Object.keys(this.results)[0]].length / this.playbackSpeed);
        for (var i = 0; i < steps; i++) {
            for (var key in objects.results) {
                objects.spaceObjectList[key].sphere.position.set(...objects.results[key][i * objects.playbackSpeed]);
            }
            await sleep(10);
        }
    }
}

init();
animate();

function init() {
    var aspect = window.innerWidth / window.innerHeight;

    camera = new THREE.PerspectiveCamera(60, aspect, 1, 1000);
    camera.position.z = 10;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createControls(camera);

    scene.add(new THREE.AmbientLight(0x333333));

    light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(50, 200, 50);
    scene.add(light);
}

function createControls( camera ) {
    controls = new THREE.TrackballControls(camera, renderer.domElement);

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.2;

    controls.keys = [65, 83, 68];
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    render();
}

function render() {
    renderer.render(scene, camera);
}

function makePath( points ) { // points is an array of Vector3
    var material = new THREE.LineBasicMaterial({color: 0xffffff});
    var geometry = new THREE.BufferGeometry().setFromPoints(points);
    var line = new THREE.Line(geometry, material);
    return line;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


window.onload = function() {
    objects = new SpaceSimulation();
}