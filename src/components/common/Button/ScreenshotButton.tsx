import { useAtomValue } from "jotai";
import { pixiAppAtom } from "../../../atoms";

const ScreenshotButton = () => {
  const app = useAtomValue(pixiAppAtom);

  const takeScreenshot = async () => {
    if (!app) {
      return;
    }

    app.stop();
    try {
      const url = await app.renderer.extract.base64(app.stage);
      const anchor = document.createElement("a");

      document.body.append(anchor);
      anchor.download = "sf-girls-stage.png";
      anchor.href = url;
      anchor.click();
      anchor.remove();
    } finally {
      app.start();
    }
  };

  return (
    <button
      className="button button--quiet stage-text-button"
      type="button"
      onClick={takeScreenshot}
      disabled={!app}
      aria-label="Save a screenshot of the stage"
      title="Save screenshot"
    >
      <svg
        className="ui-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M4.5 7.5h3l1.4-2h6.2l1.4 2h3A1.5 1.5 0 0 1 21 9v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18V9a1.5 1.5 0 0 1 1.5-1.5Z" />
        <circle cx="12" cy="13.5" r="3" />
      </svg>
      <span className="stage-text-button__label">Save</span>
    </button>
  );
};

export default ScreenshotButton;
