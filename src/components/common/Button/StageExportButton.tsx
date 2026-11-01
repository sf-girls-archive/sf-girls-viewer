import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { pixiAnimationListAtom, pixiAppAtom } from "../../../atoms";
import {
  DEFAULT_GIF_FRAME_RATE,
  DEFAULT_VIDEO_FRAME_RATE,
  exportStageGif,
  exportStageVideo,
  getStageExportDimensions,
  getSupportedVideoFormat,
  STAGE_EXPORT_DURATION_SECONDS,
  type StageExportDuration,
  type StageExportFrameRate,
  type StageExportOptions,
  type StageExportResolution,
} from "../../../utils";

type ExportFormat = "gif" | "video";
type FrameRateSelection = "format-default" | StageExportFrameRate;

const parseFrameRateSelection = (value: string): FrameRateSelection => {
  if (value === "12") {
    return 12;
  }
  if (value === "24") {
    return 24;
  }
  if (value === "30") {
    return 30;
  }
  return "format-default";
};

const parseDuration = (value: string): StageExportDuration => {
  if (value === "10") {
    return 10;
  }
  if (value === "15") {
    return 15;
  }
  return STAGE_EXPORT_DURATION_SECONDS;
};

const parseResolution = (value: string): StageExportResolution => {
  if (value === "720" || value === "1080") {
    return value;
  }
  return "original";
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

const StageExportButton = () => {
  const app = useAtomValue(pixiAppAtom);
  const animationList = useAtomValue(pixiAnimationListAtom);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(
    null,
  );
  const [resolution, setResolution] =
    useState<StageExportResolution>("original");
  const [frameRate, setFrameRate] =
    useState<FrameRateSelection>("format-default");
  const [durationSeconds, setDurationSeconds] = useState<StageExportDuration>(
    STAGE_EXPORT_DURATION_SECONDS,
  );
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const videoFormat = getSupportedVideoFormat();
  const videoFormatLabel = videoFormat?.format.toUpperCase() ?? "Video";
  const gifFrameRate =
    frameRate === "format-default" ? DEFAULT_GIF_FRAME_RATE : frameRate;
  const videoFrameRate =
    frameRate === "format-default" ? DEFAULT_VIDEO_FRAME_RATE : frameRate;
  const canExportVideo =
    videoFormat !== null &&
    typeof HTMLCanvasElement !== "undefined" &&
    typeof HTMLCanvasElement.prototype.captureStream === "function";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const closeDialog = () => {
    if (!exportingFormat) {
      setIsOpen(false);
    }
  };

  const runExport = async (format: ExportFormat) => {
    if (!app || exportingFormat) {
      return;
    }

    setExportingFormat(format);
    setProgress(0);
    setStatusMessage("");
    setErrorMessage(null);

    try {
      const options: StageExportOptions = {
        resolution,
        frameRate: format === "gif" ? gifFrameRate : videoFrameRate,
        durationSeconds,
      };
      let blob: Blob;
      let outputFormat: string;
      if (format === "gif") {
        blob = await exportStageGif(app, setProgress, options);
        outputFormat = "gif";
      } else {
        const video = await exportStageVideo(app, setProgress, options);
        blob = video.blob;
        outputFormat = video.format;
      }

      const formatLabel = outputFormat.toUpperCase();
      downloadBlob(blob, `sf-girls-stage.${outputFormat}`);
      setStatusMessage(`${formatLabel} download started.`);
    } catch (error) {
      const formatLabel = format === "gif" ? "GIF" : videoFormatLabel;
      console.error(`Failed to export the stage as ${formatLabel}:`, error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The stage could not be exported. Please try again.",
      );
    } finally {
      setExportingFormat(null);
    }
  };

  const isExporting = exportingFormat !== null;
  const animationCount = animationList.length;
  const stageCanvas = app?.renderer.view as HTMLCanvasElement | undefined;
  const sourceWidth = stageCanvas?.width ?? 0;
  const sourceHeight = stageCanvas?.height ?? 0;
  const exportDimensions = getStageExportDimensions(
    sourceWidth,
    sourceHeight,
    resolution,
  );
  const frameRateSummary =
    frameRate === "format-default"
      ? `${DEFAULT_GIF_FRAME_RATE} GIF / ${DEFAULT_VIDEO_FRAME_RATE} video FPS`
      : `${frameRate} FPS`;

  return (
    <>
      <button
        className="button button--quiet stage-text-button"
        type="button"
        onClick={() => {
          setStatusMessage("");
          setErrorMessage(null);
          setIsOpen(true);
        }}
        disabled={!app || animationCount === 0}
        aria-label={`Export the current stage as a GIF or ${videoFormatLabel}`}
        title="Export stage animation"
      >
        <svg
          className="ui-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M12 3.75v10.5m0 0 4-4m-4 4-4-4M5 15.75v3A1.5 1.5 0 0 0 6.5 20.25h11a1.5 1.5 0 0 0 1.5-1.5v-3" />
        </svg>
        <span className="stage-text-button__label">Export</span>
      </button>

      <dialog
        ref={dialogRef}
        className="export-dialog"
        aria-labelledby="stage-export-title"
        aria-describedby="stage-export-description"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeDialog();
          }
        }}
        onCancel={(event) => {
          if (isExporting) {
            event.preventDefault();
          }
        }}
        onClose={() => setIsOpen(false)}
      >
        <div className="export-dialog__content">
          <div className="export-dialog__header">
            <div>
              <p className="eyebrow">
                STAGE OUTPUT <span>/</span> 03
              </p>
              <h2 id="stage-export-title">Export animation</h2>
            </div>
            <button
              className="export-dialog__close"
              type="button"
              onClick={closeDialog}
              disabled={isExporting}
              aria-label="Close export dialog"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <p className="export-dialog__summary">
            {animationCount} {animationCount === 1 ? "animation" : "animations"}{" "}
            <span>/</span> {exportDimensions.width} × {exportDimensions.height}{" "}
            <span>/</span> {frameRateSummary} <span>/</span> {durationSeconds}{" "}
            seconds
          </p>
          <p
            className="export-dialog__description"
            id="stage-export-description"
          >
            The full canvas and everything currently on stage are included.
            Preview labels and controls stay out of the file.
          </p>

          <div className="export-dialog__settings">
            <label className="export-dialog__setting">
              <span>Resolution</span>
              <select
                value={resolution}
                disabled={isExporting}
                onChange={(event) =>
                  setResolution(parseResolution(event.currentTarget.value))
                }
              >
                <option value="original">
                  Original ({sourceWidth} × {sourceHeight})
                </option>
                <option value="720">720 px high</option>
                <option value="1080">1080 px high</option>
              </select>
            </label>

            <label className="export-dialog__setting">
              <span>Frame rate</span>
              <select
                value={frameRate}
                disabled={isExporting}
                onChange={(event) =>
                  setFrameRate(
                    parseFrameRateSelection(event.currentTarget.value),
                  )
                }
              >
                <option value="format-default">Format default</option>
                <option value="12">12 FPS</option>
                <option value="24">24 FPS</option>
                <option value="30">30 FPS</option>
              </select>
            </label>

            <label className="export-dialog__setting">
              <span>Duration</span>
              <select
                value={durationSeconds}
                disabled={isExporting}
                onChange={(event) =>
                  setDurationSeconds(parseDuration(event.currentTarget.value))
                }
              >
                <option value={5}>5 seconds</option>
                <option value={10}>10 seconds</option>
                <option value={15}>15 seconds</option>
              </select>
            </label>
          </div>
          <p className="export-dialog__settings-note">
            GIF frame timing uses 10 ms increments, so its playback rate is
            approximate.
          </p>

          <div className="export-dialog__formats">
            <button
              className="export-format-option"
              type="button"
              onClick={() => {
                void runExport("gif");
              }}
              disabled={isExporting}
            >
              <span className="export-format-option__badge">GIF</span>
              <span className="export-format-option__copy">
                <strong>
                  {exportingFormat === "gif" ? "Building GIF…" : "Animated GIF"}
                </strong>
                <small>
                  {gifFrameRate} FPS · {durationSeconds}-second loop · loops
                  forever
                </small>
              </span>
              <span className="export-format-option__arrow" aria-hidden="true">
                ↗
              </span>
            </button>

            <button
              className="export-format-option"
              type="button"
              onClick={() => {
                void runExport("video");
              }}
              disabled={isExporting || !canExportVideo}
              title={
                canExportVideo
                  ? `Export a ${durationSeconds}-second ${videoFormatLabel}`
                  : "Video recording is not supported by this browser"
              }
            >
              <span className="export-format-option__badge">
                {videoFormatLabel.toUpperCase()}
              </span>
              <span className="export-format-option__copy">
                <strong>
                  {exportingFormat === "video"
                    ? `Recording ${videoFormatLabel}…`
                    : `${videoFormatLabel} video`}
                </strong>
                <small>
                  {videoFrameRate} FPS · {durationSeconds}-second clip
                </small>
              </span>
              <span className="export-format-option__arrow" aria-hidden="true">
                ↗
              </span>
            </button>
          </div>

          {!canExportVideo && (
            <p className="export-dialog__note">
              Video recording is unavailable in this browser. GIF export is
              still supported.
            </p>
          )}

          {isExporting && (
            <div className="export-dialog__progress">
              <div>
                <span>
                  {exportingFormat === "gif"
                    ? "Encoding animated frames"
                    : `Recording ${videoFormatLabel}`}
                </span>
                <span className="export-dialog__progress-value">
                  {Math.round(progress * 100)}%
                </span>
              </div>
              <progress
                max={1}
                value={progress}
                aria-label={`${exportingFormat === "gif" ? "GIF" : videoFormatLabel} export progress`}
              />
            </div>
          )}

          {errorMessage && (
            <p className="export-dialog__message is-error" role="alert">
              {errorMessage}
            </p>
          )}
          {statusMessage && (
            <p className="export-dialog__message" role="status">
              {statusMessage}
            </p>
          )}
        </div>
      </dialog>
    </>
  );
};

export default StageExportButton;
