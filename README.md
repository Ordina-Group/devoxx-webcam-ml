# Devoxx Webcam Electron Demo Application

This application provides a nice demo for running realtime object detection without requiring a live internet connection.
It uses the device's webcam as the input source.

## Running:

- Execute `npm install`
- On Mac OS: `npm run electron_mac`
- On other platforms: `npm run electron`
- A browser window will open and the app will start

## Different implementations:

- Master branch: Regular TensorFlow.js with node.js native tensorflow bindings (no gpu acceleration), using COCO-SSD with mobilenet V2(Lite)
- Webgl branch: Using fully web based TensorFlow.jh without native node bindings (allows for webgl acceleration), using COCO-SSD with mobilenet V2(Lite)
- Yolo branch: Using fully web based TensorFlow.jh without native node bindings (allows for webgl acceleration), using YoloV3
- Webworker branch: experimental, not working correctly