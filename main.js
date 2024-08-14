import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const loader = new GLTFLoader();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 1500);
const light = new THREE.AmbientLight(0x404040, 4); // soft white light
scene.add(light);

const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let mixer;
let pivot = new THREE.Object3D(); // Create a pivot object
scene.add(pivot); // Add the pivot to the scene

loader.load('./3_seconds_of_vacations/scene.gltf', function (gltf) {
    const model = gltf.scene;
    model.scale.set(2, 2, 2);
    pivot.add(model); // Add the model to the pivot
    mixer = new THREE.AnimationMixer(model);
    const animation = gltf.animations; // Array<THREE.AnimationClip>
    const clip = THREE.AnimationClip.findByName(animation, 'Take 01');
    const action = mixer.clipAction(clip);
    action.play();

    modifyModelMaterials(model);
}, undefined, function (error) {
    console.error(error);
});

camera.position.set(-1.980818688937644, -0.44095440945966846, 10.200077869706641); // Set the initial camera position
controls.target.set(0, 0, 0); // Set the control target to the center of the pivot
controls.update(); // Update controls

renderer.setAnimationLoop(animate);

const clock = new THREE.Clock();

function animate() {
    if (mixer) {
        mixer.update(clock.getDelta());
    }

    // Rotate the pivot to make the camera orbit around the model
     // Adjust the rotation speed as needed
	 pivot.rotation.y += 0.001;
    renderer.render(scene, camera);
    controls.update();
}

function modifyModelMaterials(model) {
    model.traverse((child) => {
        if (child.isMesh) {
            const material = child.material;

            if (Array.isArray(material)) {
                material.forEach(mat => {
                    mat.transparent = false;
                    mat.opacity = 1;
                    mat.side = THREE.FrontSide;
                });
            } else {
                material.transparent = false;
                material.opacity = 1;
                material.side = THREE.FrontSide;
            }
        }
    });
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

