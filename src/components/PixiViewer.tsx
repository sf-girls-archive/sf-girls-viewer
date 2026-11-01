import { useAtom, useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { Color } from "pixi.js";
import {
  fileAtom,
  pixiAnimationListAtom,
  pixiAppAtom,
  pixiAppSettingsGlobalAtom,
} from "../atoms";
import { initializePixiApp, addAnimation, removeAnimation } from "../utils";

export const PixiViewer = () => {
  const pixiContainer = useRef<HTMLDivElement | null>(null);

  const [app, setApp] = useAtom(pixiAppAtom);
  const appSettings = useAtomValue(pixiAppSettingsGlobalAtom);
  const [newFile, setNewFile] = useAtom(fileAtom);
  const [, setAnimationList] = useAtom(pixiAnimationListAtom);

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
    };
  }, [setAnimationList, setApp]);

  useEffect(() => {
    const background = app?.renderer?.background;
    if (background) {
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
        setAnimationList((previous) =>
          removeAnimation(app, newFile, previous),
        );
      }

      setNewFile(null);
    };

    void updateFile();
  }, [app, newFile, setAnimationList, setNewFile]);

  return <div ref={pixiContainer} className="pixi-canvas-host" />;
};
