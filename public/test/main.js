import * as THREE from '/three/three.module.js';
import { StarryBackground } from '../modulos/fondoEstrellado.js';
import { Karaoke } from '../modulos/karaoke.js';

// ======================================================
// ESCENA
// ======================================================

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.z = 40;

// ======================================================
// RENDERER
// ======================================================

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

document.body.appendChild(
    renderer.domElement
);

// ======================================================
// FONDO ESTRELLADO
// ======================================================

const spaceBackground =
    new StarryBackground(scene);

// ======================================================
// ELEMENTO HTML DE LETRAS
// ======================================================

const lyricsElement =
    document.getElementById('lyrics');

// ======================================================
// AUDIO
// ======================================================

const audio =
    new Audio('/assets/audio/te_amare.mp3');

audio.preload = 'auto';

audio.volume = 1;

// ======================================================
// CARGAR LRC
// ======================================================

const lrcText =
    await fetch(
        '/assets/letras/te_amare.lrc'
    ).then(
        response => response.text()
    );

// ======================================================
// KARAOKE
// ======================================================

const karaoke =
    new Karaoke(
        audio,
        lyricsElement,
        lrcText,

        // offset inicial en segundos
        1700 / 1000
    );

// ======================================================
// CONTROLES DE SINCRONIZACIÓN
// ======================================================

window.addEventListener(
    'keydown',
    (e) => {

        if (
            e.key === 'ArrowRight'
        ) {

            karaoke.forward(100);

        }

        if (
            e.key === 'ArrowLeft'
        ) {

            karaoke.backward(100);

        }

        if (
            e.key === ' '
        ) {

            e.preventDefault();

            if (
                audio.paused
            ) {

                audio.play();

            } else {

                audio.pause();

            }

        }

    }
);

// ======================================================
// INICIAR AUDIO
// ======================================================

document.addEventListener(
    'click',
    async () => {

        try {

            await audio.play();

            console.log(
                'Audio iniciado'
            );

        } catch (err) {

            console.error(
                err
            );

        }

    },
    {
        once: true
    }
);

// ======================================================
// RESPONSIVE
// ======================================================

window.addEventListener(
    'resize',
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);

// ======================================================
// LOOP
// ======================================================

function animate(time) {

    requestAnimationFrame(
        animate
    );

    const elapsedTime =
        time * 0.001;

    spaceBackground.update(
        elapsedTime
    );

    renderer.render(
        scene,
        camera
    );

}

animate();