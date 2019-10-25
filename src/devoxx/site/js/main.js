const path = require('path');
const Loader = require(path.resolve(__dirname, '../../coco/web-loader')).Loader;

const framerate = 7;

window.onload = async () => {
    const detector = await Loader.loadCoco(false, path.resolve(__dirname, '../../../'));
    const stream = await navigator.mediaDevices
        .getUserMedia({
            video: {
                width: 1280,
                height: 720,
                frameRate: framerate
            }
        });

    let video = document.querySelector('video');
    video.srcObject = stream;
    video.onloadedmetadata = () => {
        video.play();
    };

    const canvas = document.querySelector('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    await draw(video, canvas, context, detector);
};

async function draw(video, canvas, context, detector) {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const detectedClasses = await detector.detect(canvas);
    console.log(detectedClasses);
    Loader.anotateCanvas(canvas, detectedClasses);

    setTimeout(draw, 1000 / framerate, video, canvas, context, detector);
}
