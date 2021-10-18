import * as THREE from './three.js/build/three.module.js'
import {Vector3} from './three.js/build/three.module.js'
import {OrbitControls} from "./three.js/examples/jsm/controls/OrbitControls.js"
import {GLTFLoader} from "./three.js/examples/jsm/loaders/GLTFLoader.js"
import {RectAreaLightUniformsLib} from "./three.js/examples/jsm/lights/RectAreaLightUniformsLib.js"

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(50, 50, 50)

const renderer = new THREE.WebGLRenderer({antialias: true})

//Shadow Map
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
renderer.setSize(window.innerWidth, window.innerHeight)

const control = new OrbitControls(camera, renderer.domElement)
control.maxDistance = 250

//Ambient Light
const ambientLight = new THREE.AmbientLight(0xFFFFFFF, 0.1)
scene.add(ambientLight)

//Rectangle Area Light
RectAreaLightUniformsLib.init()
const width = 500
const height = 500
const intensity = 1
const rectLight = new THREE.RectAreaLight(0xFFFFFFF, intensity, width, height)
rectLight.position.set(new Vector3(10, 0, 0))
rectLight.lookAt(0, 0, 0)

scene.add(rectLight)

//Skybox
function makeSkybox() {
    let skyBoxMaterial = []
    let px = new THREE.TextureLoader().load('../assets/skybox/px.png')
    let nx = new THREE.TextureLoader().load('../assets/skybox/nx.png')
    let py = new THREE.TextureLoader().load('../assets/skybox/py.png')
    let ny = new THREE.TextureLoader().load('../assets/skybox/ny.png')
    let pz = new THREE.TextureLoader().load('../assets/skybox/pz.png')
    let nz = new THREE.TextureLoader().load('../assets/skybox/nz.png')

    skyBoxMaterial.push(new THREE.MeshBasicMaterial({map: nx}))
    skyBoxMaterial.push(new THREE.MeshBasicMaterial({map: px}))
    skyBoxMaterial.push(new THREE.MeshBasicMaterial({map: py}))
    skyBoxMaterial.push(new THREE.MeshBasicMaterial({map: ny}))
    skyBoxMaterial.push(new THREE.MeshBasicMaterial({map: nz}))
    skyBoxMaterial.push(new THREE.MeshBasicMaterial({map: pz}))
    
    skyBoxMaterial.forEach(sm => {
        sm.side = THREE.BackSide
    })

    let boxGeometry = new THREE.BoxGeometry(500, 500, 500)
    let skybox = new THREE.Mesh(boxGeometry, skyBoxMaterial)

    scene.add(skybox)
}

let planets = [];
let sun = null;

let planet1
let planet2
let planet3
let planet4

//Planets
function addPlanets() {
        const planet1Texture = new THREE.TextureLoader().load('../assets/planets/planet1-texture.png')
        const planet2Texture = new THREE.TextureLoader().load('../assets/planets/planet2-texture.jpg')
        const planet3Texture = new THREE.TextureLoader().load('../assets/planets/planet3-texture.jpg')
        const planet4Texture = new THREE.TextureLoader().load('../assets/planets/planet4-texture.jpg')
        
        planet1 = new THREE.Mesh(
            new THREE.SphereGeometry(12, 32, 32),
            new THREE.MeshStandardMaterial({
                map: planet1Texture
            })
        )

        planet1.castShadow = true
        planet1.receiveShadow = true
        
        planet2 = new THREE.Mesh(
            new THREE.SphereGeometry(12, 32, 32),
            new THREE.MeshStandardMaterial({
                map: planet2Texture
            })
        )

        planet2.castShadow = true
        planet2.receiveShadow = true
        
        planet3 = new THREE.Mesh(
            new THREE.SphereGeometry(12, 32, 32),
            new THREE.MeshStandardMaterial({
                map: planet3Texture
            })
        )

        planet3.castShadow = true
        planet3.receiveShadow = true
        
        planet4 = new THREE.Mesh(
            new THREE.SphereGeometry(12, 32, 32),
            new THREE.MeshStandardMaterial({
                map: planet4Texture
            })
        )

        planet4.castShadow = true
        planet4.receiveShadow = true

        planets = [planet1, planet2, planet3, planet4]

        planets.forEach(planet => {
            const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(150))
    
            planet.position.set(x, y, z)

            scene.add(planet)
        });

}

//Sun
function addSun() {
    //Point Light
    const pointLight = new THREE.PointLight(0xFFB875, 1.2)

    const sunTexture = new THREE.TextureLoader().load('../assets/planets/sun-texture.png')

    sun = new THREE.Mesh(
        new THREE.SphereGeometry(25, 32, 32),
        new THREE.MeshBasicMaterial({
            map: sunTexture
        })
    )

    sun.castShadow = true

    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(150))

    sun.position.set(x, y, z)

    pointLight.position.set(x, y, z)

    scene.add(sun, pointLight)
}

let plane
let planeBoundingBox
let planeGeometry

function addPlane() {
    const planeLoader = new GLTFLoader()

    planeLoader.load(
        './assets/plane/model.gltf',
        
        function(gltf) {
            gltf.scene.scale.setScalar(10)
            gltf.scene.traverse(function(plane) {
                if(plane.isMesh) {
                    plane.geometry.center()
                    planeGeometry = plane.geometry
                }
            })
            plane = gltf.scene
            planeBoundingBox = new THREE.Box3().setFromObject(plane)
            scene.add(plane)
            main()
        }
    )
}

camera.position.z = 100;

let planeCam
let planeCamPos

function changeCamera() {
    planeCam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    planeCamPos = new THREE.Object3D
    
    plane.add(planeCam)
    
    planeCam.position.set(0.16, 0.07, -0.005)
    
    planeCam.lookAt(plane.position)
}

let isPlaneCamera = false
let isForward = false
let isUp = false
let isDown = false
let isRight = false
let isLeft = false
let velo = 0
let acc = 0
let isHavingCollision = false

function animate() {
	requestAnimationFrame(animate);

    //Move Plane
    if(plane) {
        if(isForward) {
            acc = 0.1
        }
        else {
            acc = -0.02
        }

        if(isLeft) {
            plane.rotateY(Math.PI / 100)
        }

        if(isRight) {
            plane.rotateY(Math.PI / -100)
        }

        if(isUp) {
            plane.rotateZ(Math.PI / -100)
        }

        if(isDown) {
            plane.rotateZ(Math.PI / 100)
        }

        velo += acc
        velo = THREE.MathUtils.clamp(velo, 0, 1)
        plane.translateX(isHavingCollision ? velo : -velo)
        plane.position.clamp(
            new Vector3(-200, -200, -200),
            new Vector3(200, 200, 200)
        )
    }

    //Planet Rotation
    planets.forEach(planet => {
        planet.rotateY(THREE.Math.degToRad(0.9));
    });

    const planeBox = new THREE.Box3().setFromObject(plane)

    //Plane Collision
    isHavingCollision = [...planets, sun].some(planet => {
        const planetBox = new THREE.Box3().setFromObject(planet)
        return planeBox.intersectsBox(planetBox)
    })

    sun.rotateY(THREE.Math.degToRad(0.45));
    
    control.update()

    if(isPlaneCamera) {
        renderer.render(scene, planeCam);
    }
    else {
        renderer.render(scene, camera);
    }
    
}
addPlane()
function main() {
    changeCamera()
    makeSkybox()
    addSun()
    addPlanets()
    animate()
}

document.addEventListener('keydown', e => {
    if(e.code === 'Space') {
        isForward = true
    }
    if(e.code === 'KeyA') {
        isLeft = true
    }
    if(e.code === 'KeyD') {
        isRight = true
    }
    if(e.code === 'KeyW') {
        isUp = true
    }
    if(e.code === 'KeyS') {
        isDown = true
    }
    if(e.code === 'KeyC') {
        isPlaneCamera = !isPlaneCamera
    }
})

document.addEventListener('keyup', e => {
    if(e.code === 'Space') {
        isForward = false
    }
    if(e.code === 'KeyA') {
        isLeft = false
    }
    if(e.code === 'KeyD') {
        isRight = false
    }
    if(e.code === 'KeyW') {
        isUp = false
    }
    if(e.code === 'KeyS') {
        isDown = false
    }
})