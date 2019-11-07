const path = require('path');
const Loader = require(path.resolve(__dirname, '../../../coco/web-loader')).Loader;

let detector;
let canvas;
let context;

(async function () {
    detector = await Loader.loadCoco(false, path.resolve(__dirname, '../../../../'));
    console.log('Worker started!');
})();

onmessage = async function(message) {
    if(!canvas || !context) {
        canvas = new OffscreenCanvas(message.data[0].width, message.data[0].height);
        context = canvas.getContext('2d');
    }
    context.putImageData(message.data[0].imgData, 0, 0);

    const detectedClasses = await detector.detect(canvas);
    Loader.anotateCanvas(canvas, detectedClasses);
    const imgData = context.getImageData(0, 0, canvas.width, canvas.height);

    postMessage([{nr: message.data[0].nr, detections: detectedClasses, imgData: imgData}]);
};
