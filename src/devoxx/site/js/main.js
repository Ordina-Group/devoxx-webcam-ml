const path = require('path');
const Loader = require(path.resolve(__dirname, '../../web-loader')).Loader;
const COCO_CLASSES = require(path.resolve(__dirname, '../../coco/classes')).CLASSES;

const framerate = 2;
let enableLiveUpdate = true;

window.onload = async () => {
    //const detector = await Loader.loadCoco(false, path.resolve(__dirname, '../../../'));
    const detector = await Loader.loadYolo(true, path.resolve(__dirname, '../../../'));

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

    await update(video, canvas, context, detector);
};

async function update(video, canvas, context, detector) {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const detectedClasses = await detector.detect(canvas);
    console.log(detectedClasses);
    Loader.anotateCanvas(canvas, detectedClasses);
    updateList(detectedClasses);

    if (enableLiveUpdate) {
        setTimeout(update, 1000 / framerate, video, canvas, context, detector);
    }
}

function updateList(detections) {
    const listSection = document.getElementById('list-section');
    listSection.style.width = (getBrowserWidth() - 1280) + 'px';

    const list = document.getElementById('detections');
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }

    for (const detection of detections) {
        const listItem = document.createElement('li');
        listItem.classList.add('list-item');

        const itemImg = document.createElement('img');
        itemImg.src = 'img/classes/' + getClassIdFromName(detection.class) + '.jpg';
        itemImg.width = 76;
        itemImg.height = 76;
        itemImg.classList.add('list-item-img');
        listItem.appendChild(itemImg);

        const itemText = document.createElement('p');
        itemText.classList.add('list-item-text');
        itemText.innerText = detection.class + ': ' + Math.round(detection.score * 100) + '%';
        listItem.appendChild(itemText);

        list.appendChild(listItem);
    }
}

function getClassIdFromName(name) {
    const values = Object.values(COCO_CLASSES);
    for (const value of values) {
        if(value.displayName === name) {
            return value.id;
        }
    }
}

function getBrowserWidth() {
    return Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
    );
}
