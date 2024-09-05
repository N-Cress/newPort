import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let darkMode = false;

const loader = new GLTFLoader();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1500);
const light = new THREE.AmbientLight(0x404040, 4); // soft white light
scene.add(light);

scene.background = new THREE.Color("rgb(255, 255, 255)");

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let mixer;
let pivot = new THREE.Object3D(); // Create a pivot object
scene.add(pivot); // Add the pivot to the scene

loader.load('./3_seconds_of_vacations/scene.gltf', function (gltf) {
    const model = gltf.scene;
    model.scale.set(2, 2, 2);
    pivot.add(model); // Add the model to the pivot

    // Set the model's or pivot's position to move it from the center
    model.position.set(-9, -2, -9); // Adjust these values as needed
    
    mixer = new THREE.AnimationMixer(model);
    const animation = gltf.animations; // Array<THREE.AnimationClip>
    const clip = THREE.AnimationClip.findByName(animation, 'Take 01');
    const action = mixer.clipAction(clip);
    action.play();

    modifyModelMaterials(model);
}, undefined, function (error) {
    console.error(error);
});

// Set the camera's initial position and look at the model
camera.position.set(5.287782524309437, 3.504097628621107, -23.815485509136916);
camera.lookAt(new THREE.Vector3(0, 0, 0)); // Adjust this to point at the center of the pivot or model

renderer.setAnimationLoop(animate);

const clock = new THREE.Clock();

function animate() {
    if (mixer) {
        mixer.update(clock.getDelta());
    }
   
    renderer.render(scene, camera);
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
    const width = window.innerWidth;

    // Adjust camera's aspect ratio and renderer size
    camera.aspect = width / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(width, window.innerHeight);

    // Adjust the camera position to maintain centering
    camera.position.x = (camera.position.x / renderer.domElement.clientWidth) * width;
    camera.position.z = (camera.position.z / renderer.domElement.clientWidth) * width;

    // Ensure the camera is looking at the scene's center
    camera.lookAt(new THREE.Vector3(0, 0, 0));
});

function toggleContrast() {
    darkMode = !darkMode;
    if (darkMode) {
        scene.background = new THREE.Color(0x000);
    } else {
        scene.background = new THREE.Color("rgb(255, 255, 255)");
    }
}

document.getElementById('contrastToggle').addEventListener('click', toggleContrast);
