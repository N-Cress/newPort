import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let darkMode = false;
let model, mixer;
let isModelVisible = true; // Track visibility state

const loader = new GLTFLoader();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1500);
const light = new THREE.AmbientLight(0x404040, 4); // Soft white light
scene.add(light);

scene.background = new THREE.Color("rgb(255, 255, 255)");

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const pivot = new THREE.Object3D(); // Create a pivot object
scene.add(pivot); // Add the pivot to the scene

loader.load('./3_seconds_of_vacations/scene.gltf', function (gltf) {
    model = gltf.scene;
    model.scale.set(2, 2, 2);
    pivot.add(model); // Add the model to the pivot

    model.position.set(-9, -2, -9); // Adjust these values as needed
    
    mixer = new THREE.AnimationMixer(model);
    const clip = THREE.AnimationClip.findByName(gltf.animations, 'Take 01');
    const action = mixer.clipAction(clip);
    action.play();

    modifyModelMaterials(model);
    checkModelVisibility(); // Check initial visibility based on window size
}, undefined, function (error) {
    console.error(error);
});

// Initial camera position
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

// Handle window resize and adjust camera position
window.addEventListener('resize', () => {
    if (window.innerWidth < 800) {
        camera.position.set(-12, 2, -10); // Adjusted camera position for small screens
    } else {
        camera.position.set(5.287782524309437, 3.504097628621107, -23.815485509136916); // Default camera position
    }
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    checkModelVisibility(); // Check model visibility on resize
});

function checkModelVisibility() {
    const minWidth = 800; // Set the minimum width for showing the model

    if (window.innerWidth < minWidth && isModelVisible) {
        pivot.remove(model); // Remove the model from the pivot
        isModelVisible = false;
    } else if (window.innerWidth >= minWidth && !isModelVisible) {
        pivot.add(model); // Re-add the model to the pivot
        isModelVisible = true;
    }
}

function toggleContrast() {
    darkMode = !darkMode;
    scene.background = new THREE.Color(darkMode ? 0x000 : 0xffffff);
}

document.getElementById('contrastToggle').addEventListener('click', toggleContrast);
