import { useAtom, useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { Color } from "pixi.js";
import {
  fileQueueAtom,
  pixiAnimationListAtom,
  pixiAppAtom,
  pixiAppSettingsGlobalAtom,
} from "../atoms";
import { initializePixiApp, addAnimation, removeAnimation } from "../utils";

export const PixiViewer = () => {
  const pixiContainer = useRef<HTMLDivElement | null>(null);

  const [app, setApp] = useAtom(pixiAppAtom);
  const appSettings = useAtomValue(pixiAppSettingsGlobalAtom);
  const [fileQueue, setFileQueue] = useAtom(fileQueueAtom);
  const [, setAnimationList] = useAtom(pixiAnimationListAtom);
  const newFile = fileQueue[0];

  useEffect(() => {
    const container = pixiContainer.current;
    const pixiApp = initializePixiApp();
    const view = pixiApp.view as HTMLCanvasElement;
    container?.appendChild(view);
    setApp(pixiApp);

    return () => {
      pixiApp.destroy(true, true);
      if (container?.contains(view)) {
        container.removeChild(view);
      }
      setApp(null);
      setAnimationList([]);
      setFileQueue([]);
    };
  }, [setAnimationList, setApp, setFileQueue]);

  useEffect(() => {
    const background = app?.renderer?.background;
    if (background) {
      // PixiJS exposes its renderer background as mutable external state.
      // eslint-disable-next-line react-hooks/immutability -- Syncing it belongs in this effect.
      background.color = new Color(appSettings.backgroundColor);
      background.alpha = appSettings.backgroundAlpha;
    }
  }, [app, appSettings]);

  useEffect(() => {
    if (!app || !newFile) {
      return;
    }

    const updateFile = async () => {
      if (newFile.method === "add") {
        const animation = await addAnimation(app, newFile);
        if (animation) {
          setAnimationList((previous) => [...previous, animation]);
        }
      } else {
        setAnimationList((previous) => removeAnimation(app, newFile, previous));
      }

      setFileQueue((previous) =>
        previous[0] === newFile ? previous.slice(1) : previous,
      );
    };

    void updateFile();
  }, [app, newFile, setAnimationList, setFileQueue]);

  return <div ref={pixiContainer} className="pixi-canvas-host" />;
};
