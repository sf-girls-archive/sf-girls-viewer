import { Application, Assets } from "pixi.js";
import { ISkeletonData, Spine } from "pixi-spine";
import {
  addSprite,
  centerContainer,
  createContainer,
  setAnimationStyle,
} from "./PixiElementUtils";
import {
  setupInteractionEvents,
  setupSpineClickEvents,
} from "./PixiEventUtils";
import { findPreferredIdleAnimationName } from "./PixiAnimationUtils";
import type { FileMeta, ModifiedContainer, ModifiedSpine } from "../../types";

const createSpineAnimation = (data: ISkeletonData): Spine => {
  const animation = new Spine(data);

  const { spineData } = animation;
  const firstSkin = spineData.skins[1] ?? spineData.skins[0];
  const animations = spineData.animations.map((a) => a.name);

  const preferredIdle = findPreferredIdleAnimationName(animations);

  if (firstSkin) {
    animation.skeleton.setSkinByName(firstSkin.name);
  }

  if (preferredIdle) {
    animation.state.setAnimation(0, preferredIdle, true);
  }

  return animation;
};

const loadAndSetupSpine = async (
  path: string,
  file: FileMeta,
  viewport: { width: number; height: number },
  isAdditional: boolean = false,
): Promise<ModifiedSpine | undefined> => {
  try {
    const { spineData } = await Assets.load(path);

    if (!spineData) {
      throw new Error(`Invalid Spine data at ${path}`);
    }

    const animation = createSpineAnimation(spineData) as ModifiedSpine;

    if (!isAdditional) {
      animation.meta = file;
    }

    setAnimationStyle(animation, viewport);

    return animation;
  } catch (error) {
    console.error(`Error loading Spine from ${path}:`, error);
  }
};

export const addSpine = async (
  app: Application,
  file: FileMeta,
): Promise<ModifiedSpine | undefined> => {
  try {
    const filePath = `/${file.config.fileName}`;
    const additionalAnimationPromise = file.config.addition
      ? loadAndSetupSpine(
          `/${file.config.addition}`,
          file,
          app.screen,
          true,
        )
      : Promise.resolve(undefined);
    const [animation, additionalAnimation] = await Promise.all([
      loadAndSetupSpine(filePath, file, app.screen),
      additionalAnimationPromise,
    ]);

    if (!animation) {
      additionalAnimation?.destroy({ children: true });
      throw new Error("Invalid Spine data for animation");
    }

    const container = createContainer() as ModifiedContainer;
    app.stage.addChild(container);

    if (additionalAnimation) {
      setupSpineClickEvents(container, additionalAnimation);
      container.addChild(additionalAnimation);
    }

    // TODO: Yukako Playroom Skin 2 + Rei Playroom Wedding => Background/Foreground is an animation...
    if (file.config.background) {
      addSprite(file.config.background, container, app.screen);
    }

    container.addChild(animation);

    if (file.config.foreground) {
      addSprite(file.config.foreground, container, app.screen);
    }

    centerContainer(container, app);
    setupInteractionEvents(container, animation);

    // Force an initial render to ensure renderer internals are prepared
    // (prevents runtime errors in some Spine/renderer edge-cases).
    try {
      app.render();
    } catch (e) {
      console.warn("Initial PIXI render failed:", e);
    }

    return animation;
  } catch (error) {
    console.error("Error loading Spine:", { error, file });
  }
};
