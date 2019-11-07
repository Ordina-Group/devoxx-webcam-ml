const path = require('path');
const CLASSES = require(path.resolve(__dirname, '../../coco/classes')).CLASSES;

const framerate = 15;
const numOfWorkers = 3;
let enableLiveUpdate = true;

let frameNr = 0;
const renderedFrames = [];

window.onload = async () => {
    const workers = [];
    for (let i = 0; i < numOfWorkers; i++) {
        workers.push(new Worker(path.resolve(__dirname, 'js/worker.js')));
    }

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

    const previewCanvas = document.querySelector('canvas');
    previewCanvas.width = 1280;
    previewCanvas.height = 720;
    const previewContext = previewCanvas.getContext('2d');

    const webcamCanvas = new OffscreenCanvas(previewCanvas.width, previewCanvas.height);
    const webcamContext = webcamCanvas.getContext('2d');

    await update(video, previewCanvas, previewContext, webcamCanvas, webcamContext, workers);
};

async function update(video, previewCanvas, previewContext, webcamCanvas, webcamContext, workers) {
    webcamContext.drawImage(video, 0, 0, previewCanvas.width, previewCanvas.height);
    const imgData = webcamContext.getImageData(0, 0, previewCanvas.width, previewCanvas.height);

    const freeWorker = workers.shift();
    freeWorker.postMessage([{nr: frameNr++, width: previewCanvas.width, height: previewCanvas.height, imgData: imgData}]);
    workers.push(freeWorker);

    for (const worker of workers) {
        worker.onmessage = (message) => {
            renderedFrames.push({
                nr: message.data[0].nr,
                imgData: message.data[0].imgData,
                detections: message.data[0].detections
            });
        };
    }

    /*detectorWorker.postMessage([{nr: frameNr++, width: previewCanvas.width, height: previewCanvas.height, imgData: imgData}]);
    detectorWorker.onmessage = (message) => {
        renderedFrames.push({
            nr: message.data[0].nr,
            imgData: message.data[0].imgData,
            detections: message.data[0].detections
        });

        console.log('Frames in buffer: ' + renderedFrames.length);
        if (renderedFrames.length >= 10) {
            renderedFrames.sort((a, b) => {
                if(a.nr < b.nr) {
                    return 1;
                } else if(a.nr > b.nr) {
                    return -1;
                }
            });

            const frameToRender = renderedFrames.pop();
            updateList(frameToRender.detections);
            previewContext.putImageData(frameToRender.imgData, 0, 0);
        }
    };*/

    console.log('Frames in buffer: ' + renderedFrames.length);
    if (renderedFrames.length >= 1) {
        renderedFrames.sort((a, b) => {
            if(a.nr < b.nr) {
                return 1;
            } else if(a.nr > b.nr) {
                return -1;
            }
        });

        const frameToRender = renderedFrames.pop();
        updateList(frameToRender.detections);
        previewContext.putImageData(frameToRender.imgData, 0, 0);
    }

    if (enableLiveUpdate) {
        setTimeout(update, 1000 / framerate, video, previewCanvas, previewContext, webcamCanvas, webcamContext, workers);
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
    const values = Object.values(CLASSES);
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
