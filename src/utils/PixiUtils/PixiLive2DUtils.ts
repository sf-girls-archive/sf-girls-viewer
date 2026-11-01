import { Application, Ticker } from "pixi.js";
import {
  Live2DModel,
  type Cubism4InternalModel,
} from "pixi-live2d-display/cubism4";
import {
  addSprite,
  centerContainer,
  createContainer,
  setAnimationStyle,
} from "./PixiElementUtils";
import { setupInteractionEvents } from "./PixiEventUtils";
import { playFirstLive2DAnimation } from "./PixiAnimationUtils";
import { FileMeta, ModifiedContainer, ModifiedLive2D } from "../../types";

const ensureClippingManager = (animation: ModifiedLive2D) => {
  const internalModel = animation.internalModel as Cubism4InternalModel;
  const renderer = internalModel.renderer;

  // pixi-live2d-display dereferences the clipping manager even when a model has no masks.
  if (!internalModel.coreModel.isUsingMasking() && !renderer._clippingManager) {
    renderer._clippingManager = {
      _currentFrameNo: 0,
      _maskTexture: undefined,
      setGL: () => undefined,
      setupClippingContext: () => undefined,
      getClippingContextListForDraw: () => [],
      release: () => undefined,
    } as typeof renderer._clippingManager;
  }
};

const loadAndSetupLive2D = async (
  path: string,
  file: FileMeta,
  viewport: { width: number; height: number },
  isAdditional: boolean = false,
): Promise<ModifiedLive2D | undefined> => {
  try {
    const filePath = `/${file.config.fileName}`;
    const modelOptions = { ticker: Ticker.shared };

    const animation = (await Live2DModel.from(
      filePath,
      modelOptions,
    )) as ModifiedLive2D;

    if (!animation) {
      throw new Error(`Invalid Live2D data at ${path}`);
    }

    ensureClippingManager(animation);

    if (!isAdditional) {
      animation.meta = file;
    }

    setAnimationStyle(animation, viewport);
    playFirstLive2DAnimation(animation);

    return animation;
  } catch (error) {
    console.error(`Error loading Live2DModel from ${path}:`, error);
  }
};

export const addLive2D = async (
  app: Application,
  file: FileMeta,
): Promise<ModifiedLive2D | undefined> => {
  try {
    const animation = await loadAndSetupLive2D(
      `/${file.config.fileName}`,
      file,
      app.screen,
    );

    if (!animation) {
      throw new Error("Invalid Live2DModel");
    }

    const container = createContainer() as ModifiedContainer;
    app.stage.addChild(container);

    if (file.config.background) {
      addSprite(file.config.background, container, app.screen);
    }

    container.addChild(animation);

    if (file.config.foreground) {
      addSprite(file.config.foreground, container, app.screen);
    }

    centerContainer(container, app);
    setupInteractionEvents(container, animation);

    try {
      app.render();
      animation.update(0);
    } catch (error) {
      console.warn("Initial Live2D render failed:", error);
    }

    const preferred = playFirstLive2DAnimation(animation);
    if (preferred) {
      setTimeout(() => {
        void animation.motion(preferred).catch((error) => {
          console.warn("Failed to start Live2D motion:", error);
        });
      }, 50);
    }

    return animation;
  } catch (error) {
    console.error("Error loading Live2D:", { error, file });
  }
};
