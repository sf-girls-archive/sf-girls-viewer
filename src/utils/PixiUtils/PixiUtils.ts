import { Application } from "pixi.js";
import { addLive2D } from "./PixiLive2DUtils";
import { addSpine } from "./PixiSpineUtils";
import { FileMeta, ModifiedLive2D, ModifiedSpine } from "../../types";

// TODO: scale should come from config file or mapper?
// => something like a map that returns an offset for the entity?
// or maybe just resize the background files so it fits the spine?
// or calculate scale by width and height of spine to fit view + background/foreground?

export const addAnimation = async (
  app: Application,
  file: FileMeta,
): Promise<ModifiedLive2D | ModifiedSpine | undefined> => {
  return file.type === "live2d"
    ? await addLive2D(app, file)
    : file.type === "spine"
      ? await addSpine(app, file)
      : undefined;
};

export const removeAnimation = (
  app: Application,
  file: FileMeta,
  animationList: Array<ModifiedLive2D | ModifiedSpine>,
): Array<ModifiedLive2D | ModifiedSpine> =>
  animationList
    .filter((animation) => {
      const matches =
        animation.meta.config.fileName === file.config.fileName &&
        animation.meta.index === file.index;

      if (matches) {
        const container = animation.parent;
        if (animation.meta.type === "live2d") {
          (animation as ModifiedLive2D).automator.destroy();
        }
        app.stage.removeChild(container);
        container.destroy({ children: true });
      }

      return !matches;
    })
    .map((animation, index) => {
      animation.meta.index = index;
      return animation;
    });
