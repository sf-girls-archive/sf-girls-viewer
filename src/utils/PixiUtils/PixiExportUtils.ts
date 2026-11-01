import { Rectangle, type Application } from "pixi.js";
import type { GifWriteFrameOptions } from "gifenc";

export const STAGE_EXPORT_DURATION_SECONDS = 5;

const GIF_FRAME_RATE = 12;
const MP4_FRAME_RATE = 30;
const MP4_MIME_TYPES = ["video/mp4;codecs=avc1.42E01E", "video/mp4"];
const MP4_BACKGROUND_FALLBACK = "#0b1120";

type ExportProgress = (progress: number) => void;

const getStageBackgroundColor = (app: Application) => {
  const stageCanvas = app.renderer.view as HTMLCanvasElement;
  const stageSurface = stageCanvas.closest(".stage-viewport");
  const surfaceColor = stageSurface
    ? getComputedStyle(stageSurface).backgroundColor
    : MP4_BACKGROUND_FALLBACK;

  return surfaceColor === "rgba(0, 0, 0, 0)"
    ? MP4_BACKGROUND_FALLBACK
    : surfaceColor;
};

const getStageCanvas = (app: Application) => {
  const frame = new Rectangle(0, 0, app.screen.width, app.screen.height);
  return app.renderer.extract.canvas(app.stage, frame);
};

const getStagePixels = (app: Application) => {
  const extractedCanvas = getStageCanvas(app);
  const canvas = document.createElement("canvas");
  canvas.width = extractedCanvas.width;
  canvas.height = extractedCanvas.height;

  const context = canvas.getContext("2d", {
    alpha: false,
    willReadFrequently: true,
  });
  if (!context) {
    throw new Error("Could not prepare the stage image.");
  }

  context.fillStyle = getStageBackgroundColor(app);
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(extractedCanvas as HTMLCanvasElement, 0, 0);

  return {
    imageData: context.getImageData(0, 0, canvas.width, canvas.height),
    width: canvas.width,
    height: canvas.height,
  };
};

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

export const exportStageGif = async (
  app: Application,
  onProgress: ExportProgress,
): Promise<Blob> => {
  const { applyPalette, GIFEncoder, quantize } = await import("gifenc");
  const encoder = GIFEncoder();
  const frameCount = GIF_FRAME_RATE * STAGE_EXPORT_DURATION_SECONDS;
  const frameDelay = Math.round(1000 / GIF_FRAME_RATE);
  const startTime = performance.now();
  const firstFrame = getStagePixels(app);
  const palette = quantize(firstFrame.imageData.data, 256);

  const writeFrame = (
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    isFirstFrame: boolean,
  ) => {
    const options: GifWriteFrameOptions = {
      delay: frameDelay,
    };

    if (isFirstFrame) {
      options.palette = palette;
      options.repeat = 0;
    }

    encoder.writeFrame(
      applyPalette(pixels, palette),
      width,
      height,
      options,
    );
  };

  writeFrame(
    firstFrame.imageData.data,
    firstFrame.width,
    firstFrame.height,
    true,
  );
  onProgress(1 / frameCount);

  for (let frameIndex = 1; frameIndex < frameCount; frameIndex += 1) {
    const nextFrameAt = startTime + frameIndex * frameDelay;
    const timeUntilFrame = nextFrameAt - performance.now();

    if (timeUntilFrame > 0) {
      await wait(timeUntilFrame);
    }

    const frame = getStagePixels(app);
    if (frame.width !== firstFrame.width || frame.height !== firstFrame.height) {
      throw new Error("The stage size changed during GIF export.");
    }

    writeFrame(frame.imageData.data, frame.width, frame.height, false);
    onProgress((frameIndex + 1) / frameCount);
  }

  encoder.finish();
  return new Blob([encoder.bytes()], { type: "image/gif" });
};

export const getSupportedMp4MimeType = (): string | null => {
  if (typeof MediaRecorder === "undefined") {
    return null;
  }

  return (
    MP4_MIME_TYPES.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) ??
    null
  );
};

export const exportStageMp4 = (
  app: Application,
  onProgress: ExportProgress,
): Promise<Blob> => {
  const mimeType = getSupportedMp4MimeType();
  if (!mimeType) {
    return Promise.reject(
      new Error("MP4 recording is not supported by this browser."),
    );
  }

  const stageCanvas = app.renderer.view as HTMLCanvasElement;
  if (typeof stageCanvas.captureStream !== "function") {
    return Promise.reject(
      new Error("Canvas video recording is not supported by this browser."),
    );
  }

  const firstFrame = getStagePixels(app);
  const recordingCanvas = document.createElement("canvas");
  recordingCanvas.width = firstFrame.width;
  recordingCanvas.height = firstFrame.height;

  const context = recordingCanvas.getContext("2d", { alpha: false });
  if (!context) {
    return Promise.reject(new Error("Could not prepare the video canvas."));
  }

  const drawStage = (frame = getStagePixels(app)) => {
    if (
      frame.width !== recordingCanvas.width ||
      frame.height !== recordingCanvas.height
    ) {
      throw new Error("The stage size changed during MP4 export.");
    }

    context.putImageData(frame.imageData, 0, 0);
  };

  drawStage(firstFrame);
  const stream = recordingCanvas.captureStream(MP4_FRAME_RATE);

  return new Promise<Blob>((resolve, reject) => {
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType });
    } catch (error) {
      stream.getTracks().forEach((track) => track.stop());
      reject(error instanceof Error ? error : new Error("Could not start MP4 recording."));
      return;
    }

    const chunks: Blob[] = [];
    let drawTimer: number | undefined;
    let progressTimer: number | undefined;
    let stopTimer: number | undefined;
    let settled = false;
    let startedAt = 0;

    const cleanup = () => {
      if (drawTimer !== undefined) {
        window.clearInterval(drawTimer);
      }
      if (progressTimer !== undefined) {
        window.clearInterval(progressTimer);
      }
      if (stopTimer !== undefined) {
        window.clearTimeout(stopTimer);
      }
      stream.getTracks().forEach((track) => track.stop());
    };

    const fail = (error: Error) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      if (recorder.state !== "inactive") {
        recorder.stop();
      }
      reject(error);
    };

    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    });

    recorder.addEventListener(
      "error",
      () => fail(new Error("The browser could not record the stage as MP4.")),
      { once: true },
    );

    recorder.addEventListener(
      "stop",
      () => {
        if (settled) {
          return;
        }

        settled = true;
        cleanup();

        if (chunks.length === 0) {
          reject(new Error("The MP4 recording did not contain any video frames."));
          return;
        }

        onProgress(1);
        resolve(new Blob(chunks, { type: mimeType }));
      },
      { once: true },
    );

    try {
      recorder.start(250);
      startedAt = performance.now();
      drawTimer = window.setInterval(() => {
        try {
          drawStage();
        } catch (error) {
          fail(
            error instanceof Error
              ? error
              : new Error("Could not capture the stage frame."),
          );
        }
      }, 1000 / MP4_FRAME_RATE);
      progressTimer = window.setInterval(() => {
        onProgress(
          Math.min(
            1,
            (performance.now() - startedAt) /
              (STAGE_EXPORT_DURATION_SECONDS * 1000),
          ),
        );
      }, 100);
      stopTimer = window.setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
        }
      }, STAGE_EXPORT_DURATION_SECONDS * 1000);
    } catch (error) {
      fail(error instanceof Error ? error : new Error("Could not start MP4 recording."));
    }
  });
};
