import { Application, Container, Sprite } from "pixi.js";
import type { ModifiedLive2D, ModifiedSpine } from "../../types";

type ViewportSize = {
  width: number;
  height: number;
};

const getBufferFactor = (width: number) => {
  if (width > 3500) return 0.9;
  if (width > 2000) return 0.85;
  if (width > 1500) return 0.75;
  if (width > 1000) return 0.65;
  return 0.95;
};

const calculateScaleFactor = (
  bounds: { width: number; height: number },
  viewportWidth: number,
  viewportHeight: number,
) => {
  let skeletonWidth = bounds.width;
  let skeletonHeight = bounds.height;

  if (skeletonWidth <= 1 || skeletonHeight <= 1) {
    console.warn("Invalid skeleton bounds, using fallback dimensions.");
    skeletonWidth = 1024;
    skeletonHeight = 1024;
  }

  // Compute how much the skeleton would need to be scaled to fit the
  // viewport. If the skeleton already fits (ratio >= 1) we keep its
  // original size (no upscaling). If it's larger than the viewport we
  // scale it down to fit and apply a small buffer factor.
  const fitRatio = Math.min(
    viewportWidth / skeletonWidth,
    viewportHeight / skeletonHeight,
  );

  if (fitRatio >= 1) {
    return 1; // keep original size, do not upscale
  }

  // apply buffer when scaling down to avoid edges touching viewport
  const scaleFactor = Math.abs(fitRatio * getBufferFactor(skeletonWidth));
  return scaleFactor;
};

export const setAnimationStyle = (
  element: ModifiedLive2D | ModifiedSpine | Sprite,
  viewport: ViewportSize,
): void => {
  let { height, width } = element.getLocalBounds();

  if (width <= 1 || height <= 1) {
    width = (element as Sprite)._texture.baseTexture.height;
    height = (element as Sprite)._texture.baseTexture.width;
  }

  let scaleFactor = calculateScaleFactor(
    { width, height },
    viewport.width,
    viewport.height,
  );

  const metaName =
    "meta" in element && element.meta
      ? element.meta.config?.fileName || element.meta.name
      : element.name;
  if (typeof metaName === "string" && metaName.toLowerCase().includes("chibi")) {
    scaleFactor /= 2;
  }

  element.scale.set(scaleFactor);

  if ("anchor" in element && element.anchor.set) {
    element.anchor.set(0.5);
  }
};

export const addSprite = (
  path: string,
  container: Container,
  viewport: ViewportSize,
): void => {
  const sprite = Sprite.from(path);
  setAnimationStyle(sprite, viewport);
  container.addChild(sprite);
};

export const createContainer = (): Container => {
  const container = new Container();
  container.eventMode = "dynamic";
  return container;
};

export const centerContainer = (
  container: Container,
  app: Application,
): void => {
  const bounds = container.getLocalBounds();
  container.pivot.set(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
  );
  container.position.set(app.screen.width / 2, app.screen.height / 2);
};

export const initializePixiApp = (): Application =>
  new Application({
    width: 900,
    height: 600,
    backgroundAlpha: 0,
    resolution: window.devicePixelRatio ?? 1,
    autoDensity: true,
  });
