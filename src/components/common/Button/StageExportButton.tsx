import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import { pixiAnimationListAtom, pixiAppAtom } from "../../../atoms";
import {
  exportStageGif,
  exportStageMp4,
  getSupportedMp4MimeType,
  STAGE_EXPORT_DURATION_SECONDS,
} from "../../../utils";

type ExportFormat = "gif" | "mp4";

const formatLabels: Record<ExportFormat, string> = {
  gif: "GIF",
  mp4: "MP4",
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
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mp4MimeType = getSupportedMp4MimeType();
  const canExportMp4 =
    mp4MimeType !== null &&
    typeof HTMLCanvasElement !== "undefined" &&
    "captureStream" in HTMLCanvasElement.prototype;

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
      const blob =
        format === "gif"
          ? await exportStageGif(app, setProgress)
          : await exportStageMp4(app, setProgress);

      downloadBlob(blob, `sf-girls-stage.${format}`);
      setStatusMessage(`${formatLabels[format]} download started.`);
    } catch (error) {
      console.error(`Failed to export the stage as ${formatLabels[format]}:`, error);
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
  const stageWidth = Math.round(app?.screen.width ?? 0);
  const stageHeight = Math.round(app?.screen.height ?? 0);

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
        aria-label="Export the current stage as a GIF or MP4"
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
            <span>/</span> {stageWidth} × {stageHeight}{" "}
            <span>/</span> {STAGE_EXPORT_DURATION_SECONDS} seconds
          </p>
          <p
            className="export-dialog__description"
            id="stage-export-description"
          >
            The full canvas and everything currently on stage are included.
            Preview labels and controls stay out of the file.
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
                <small>12 frames/sec · loops forever</small>
              </span>
              <span className="export-format-option__arrow" aria-hidden="true">
                ↗
              </span>
            </button>

            <button
              className="export-format-option"
              type="button"
              onClick={() => {
                void runExport("mp4");
              }}
              disabled={isExporting || !canExportMp4}
              title={
                canExportMp4
                  ? "Export a five-second MP4"
                  : "MP4 recording is not supported by this browser"
              }
            >
              <span className="export-format-option__badge">MP4</span>
              <span className="export-format-option__copy">
                <strong>
                  {exportingFormat === "mp4" ? "Recording MP4…" : "MP4 video"}
                </strong>
                <small>30 frames/sec · five-second clip</small>
              </span>
              <span className="export-format-option__arrow" aria-hidden="true">
                ↗
              </span>
            </button>
          </div>

          {!canExportMp4 && (
            <p className="export-dialog__note">
              MP4 recording is unavailable in this browser. GIF export is still
              supported.
            </p>
          )}

          {isExporting && (
            <div className="export-dialog__progress">
              <div>
                <span>
                  {exportingFormat === "gif"
                    ? "Encoding animated frames"
                    : "Recording the canvas"}
                </span>
                <span className="export-dialog__progress-value">
                  {Math.round(progress * 100)}%
                </span>
              </div>
              <progress
                max={1}
                value={progress}
                aria-label={`${formatLabels[exportingFormat]} export progress`}
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
