import './style.css';

import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const FRUSTRUM_ANGLE = 75;
const TIME_CONSTANT = 1;
const SIZE_CONSTANT = 4; // 1/23_454
const SUN_SIZE_CONSTANT = 0.1; // Forced not to respect scale to have a decent result

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( FRUSTRUM_ANGLE, window.innerWidth / window.innerHeight, 0.1, 10_000 );

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
});

renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight);
camera.position.setZ(30);

renderer.render( scene, camera );

const controls = new OrbitControls(camera, renderer.domElement);
const gridHepler = new THREE.GridHelper(6300, 50);
const ambientLight = new THREE.AmbientLight(0xffffff);

scene.add(gridHepler); // Grid ?
scene.add(ambientLight);

const spaceTexture = new THREE.TextureLoader().load('multimedia/space.jpg');
scene.background = spaceTexture;

const sunTexture = new THREE.TextureLoader().load('multimedia/sun.jpg');
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(109 * SUN_SIZE_CONSTANT, 32, 32),
  new THREE.MeshStandardMaterial( { map: sunTexture }),
);

scene.add(sun);

class Planet {
  constructor(distanceFromSun, rotationSpeed, size, planetTexture, orbitColor) {
    this.distanceFromSun = distanceFromSun;
    this.rotationSpeed = rotationSpeed;
    this.angle = Math.random() * Math.PI * 2; // Anywhere
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(size * SIZE_CONSTANT, 32, 32),
      new THREE.MeshStandardMaterial( planetTexture ),
    );
    let curve = new THREE.EllipseCurve(
      0,  0,
      distanceFromSun, distanceFromSun,
      0,  2 * Math.PI,
      false, 0
    );
    const points = curve.getPoints( 200 );
    this.orbit = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints( points ),
      new THREE.LineBasicMaterial( { color: orbitColor } ),
    );
    this.orbit.rotation.x = -1.5708;
    scene.add(this.mesh, this.orbit);
  }

  static update(star) {
    star.mesh.rotation.y += 0.001;
    star.angle += star.rotationSpeed;
    star.mesh.position.x = Math.cos(star.angle) * star.distanceFromSun;
    star.mesh.position.z = Math.sin(star.angle) * star.distanceFromSun;
  }
}

// From Wikipedia
const planetsData = {
  mercury: {
    distanceFromSun: 40,
    orbitDuration: 88,
    radius: 0.38,
    mapPath: "multimedia/mercury.jpg",
    normalPath: "multimedia/mercury-normal.jpg",
  },
  venus: {
    distanceFromSun: 70,
    orbitDuration: 225,
    radius: 0.95,
    mapPath: "multimedia/venus.jpg",
    normalPath: "multimedia/venus-normal.jpg",
  },
  earth: {
    distanceFromSun: 100,
    orbitDuration: 365.25,
    radius: 1,
    mapPath: "multimedia/earth.jpg",
    // normalPath: "multimedia/earth-normal.jpg",
  },
  mars: {
    distanceFromSun: 150,
    orbitDuration: 687,
    radius: 0.53,
    mapPath: "multimedia/mars.jpg",
    normalPath: "multimedia/mars-normal.jpg",
  },
  jupiter: {
    distanceFromSun: 520,
    orbitDuration: 4_332.59,
    radius: 11.2,
    mapPath: "multimedia/jupiter.jpg",
  },
  saturn: {
    distanceFromSun: 950,
    orbitDuration: 10_759.22,
    radius: 9,
    mapPath: "multimedia/saturn.jpg",
  },
  uranus: {
    distanceFromSun: 1920,
    orbitDuration: 30_688.5,
    radius: 3.95,
    mapPath: "multimedia/uranus.jpg",
  },
  neptune: {
    distanceFromSun: 3010,
    orbitDuration: 60_182,
    radius: 3.85,
    mapPath: "multimedia/neptune.jpg",
  },
}

const renderPlanet = (planetData) => {
  const texture = new THREE.TextureLoader().load(planetData.mapPath);
  const normal = planetData.normalPath ? new THREE.TextureLoader().load(planetData.normalPath) : null;
  return new Planet(planetData.distanceFromSun, TIME_CONSTANT / planetData.orbitDuration, planetData.radius, {map: texture, normalMap: normal}, 0xffff00);
}

const planets = Object.values(planetsData).map(renderPlanet);
console.log(Object.values(planetsData));

// Loop
const animate = () => {
  requestAnimationFrame( animate );

  controls.update();

  planets.forEach(Planet.update);

  renderer.render(scene, camera);
}

animate();

/*
Make the planete rotate -> incline the axes -> Euler axis ??
Add asteroids
Add rings to planets that have some
Add the ability to click on the planets
*/

/*
USEFUL LINKS
textures : http://planetpixelemporium.com/
*/

// Old code that can be useful

/*
function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({color: 0xffffff});
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(()=> THREE.MathUtils.randFloatSpread( 100 ));

  star.position.set(x ,y , z);
  scene.add(star);

}

Array(200).fill().forEach(addStar);

const moveCamera = () => {

  const t = document.body.getBoundingClientRect().top;
  moon.rotation.x += 0.05;
  moon.rotation.y += 0.075;
  moon.rotation.z += 0.05;

  jeff.rotation.y += 0.01;
  jeff.rotation.z += 0.01;

  camera.position.z = t * -0.01;
  camera.position.x = t * -0.0002;
  camera.position.y = t * -0.0002;

}

document.body.onscroll = moveCamera;

document.addEventListener('mousedown', onMouseDown, false);

var collisionObject = jeff.position;

function onMouseDown(e) {

    var vectorMouse = new THREE.Vector3( //vector from camera to mouse
        -(window.innerWidth/2-e.clientX)*2/window.innerWidth,
        (window.innerHeight/2-e.clientY)*2/window.innerHeight,
        -1/Math.tan(FRUSTRUM_ANGLE/2*Math.PI/180));

    vectorMouse.applyQuaternion(camera.quaternion);
    vectorMouse.normalize();        

    var vectorObject = new THREE.Vector3(); //vector from camera to object
    vectorObject.set(collisionObject.x - camera.position.x,
                     collisionObject.y - camera.position.y,
                     collisionObject.z - camera.position.z);

    vectorObject.normalize();
    let val = vectorMouse.angleTo(vectorObject)*180/Math.PI;
    if (val < 1) { // 1 is a value that can change depending on the distance
        alert("You clicked the cube");
    }
}
*/