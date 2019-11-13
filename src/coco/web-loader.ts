import {createCocoModel, ObjectDetection} from "./coco";

export class Loader {

    public static async loadCoco(useLiteModel: boolean, basePath?:string): Promise<Detector> {
        const model: ObjectDetection = await createCocoModel(useLiteModel, basePath);
        return {
            async detect(canvas: HTMLCanvasElement, logResults: boolean = false): Promise<Detection[]> {
                const start = Date.now();

                const results = await model.detect(canvas);

                if (logResults) {
                    Loader.printProcessDuration('COCO', start);
                    Loader.printResults(results);
                }
                return results;
            }
        };
    }

    public static anotateCanvas(canvas: HTMLCanvasElement, detections: Detection[]) {
        const ctx = canvas.getContext('2d');
        for (const detection of detections) {
            Loader.drawRect(ctx, detection.bbox);
            Loader.drawText(ctx, detection);
        }
    }

    private static drawRect(ctx: any, bbox: number[]): void {
        ctx.strokeStyle = 'rgba(255,0,0,1)';
        ctx.lineWidth = 2;
        ctx.strokeRect(bbox[0], bbox[1], bbox[2], bbox[3]);
    }

    private static drawText(ctx: any, detection: Detection): void {
        ctx.font = '16px Arial';
        ctx.fillStyle = 'red';
        ctx.fillText(detection.class + ': ' + Math.round(detection.score * 100) + '%', detection.bbox[0] + 5, detection.bbox[1] + 15);
    }

    private static printProcessDuration(name: string, start: number): void {
        console.log(name + ' processing took: ' + (Date.now() - start) + 'ms');
    }

    private static printResults(results: any[]): void {
        for (const result of results) {
            console.log('==> Detected: ' + result.class + ' [' + Math.round(result.score * 100) + '%]');
        }
    }
}

export interface Detection {
    class: string;
    score: number;
    bbox: number[];
}

export interface Detector {
    detect(image: HTMLCanvasElement, logResults?: boolean): Promise<Detection[]>
}
