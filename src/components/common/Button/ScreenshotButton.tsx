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
      Save
    </button>
  );
};

export default ScreenshotButton;
