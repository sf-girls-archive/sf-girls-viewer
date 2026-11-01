import type { Live2DModel } from "pixi-live2d-display";
import type { Spine } from "pixi-spine";
import type { ModifiedLive2D, ModifiedSpine } from "../types";

const customSort = (arr: string[]): string[] => {
  return (
    arr
      // sort by number
      .sort((a, b) => {
        const numA = a.toLowerCase().split(" ")[1];
        const numB = b.toLowerCase().split(" ")[1];

        return parseInt(numA) - parseInt(numB);
      })
      // move actions to the end
      .sort((a, b) => {
        const stringA = a.toLowerCase();
        const stringB = b.toLowerCase();

        const includesActionA = stringA.includes("action");
        const includesActionB = stringB.includes("action");

        if (includesActionA && !includesActionB) {
          return 1;
        }

        if (!includesActionA && includesActionB) {
          return -1;
        }

        return 0;
      })
  );
};

export const getIsLive2D = (
  animation: ModifiedLive2D | ModifiedSpine,
): boolean => animation?.meta.type === "live2d";

export const getAnimations = (
  animation: Live2DModel | Spine,
  isLive2D: boolean,
): string[] => {
  const animations: string[] = isLive2D
    ? Object.keys(
        (animation as ModifiedLive2D).internalModel.motionManager.definitions,
      )
    : ((animation as ModifiedSpine)?.spineData?.animations.map(
        (animation) => animation.name,
      ) ?? []);

  const relevantAnimations = animations.filter((animation) => {
    // exclude background/foreground animations
    for (const animationName of ["action", "idle", "touch", "attack", "dead"]) {
      if (animation.toLowerCase().includes(animationName)) {
        return true;
      }
    }
    return false;
  });

  return customSort(relevantAnimations);
};

export const getSkins = (
  animation: Live2DModel | Spine,
  isLive2D: boolean,
): string[] => {
  if (isLive2D) {
    return [];
  }

  return (
    (animation as Spine)?.spineData?.skins
      ?.filter((skin) => skin.name.toLowerCase() !== "default")
      .map((skin) => skin.name) ?? []
  );
};
