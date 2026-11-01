/* eslint-disable react-hooks/exhaustive-deps */
import { narration } from "@drincs/pixi-vn";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useEffect, useState, type FC } from "react";
import NarrationScreen from "./narration/NarrationScreen";
import NextButton from "./narration/NextButton";
// import BackButton from "./narration/BackButton";
import { pixiAnimationListAtom } from "../atoms";
import type { ModifiedSpine } from "../types";
import { loadNarration } from "../utils";
import { INTERFACE_DATA_USE_QUEY_KEY } from "../use_query/useQueryInterface";

const PixiVN: FC = () => {
  const queryClient = useQueryClient();
  const animationList = useAtomValue(pixiAnimationListAtom);
  const [hideNarration, setHideNarration] = useState(true);

  useEffect(() => {
    const initNarration = async () => {
      const startLabel = await loadNarration(scene as ModifiedSpine);
      narration.callLabel(startLabel, {}).then(() => {
        queryClient.invalidateQueries({
          queryKey: [INTERFACE_DATA_USE_QUEY_KEY],
        });
        setHideNarration(false);
      });
    };

    const scene = animationList.find((animation) =>
      animation.meta.config.fileName?.toLowerCase().includes("scene"),
    );

    if (scene) {
      initNarration();
    }
  }, [animationList]);

  if (hideNarration) {
    return;
  }

  return (
    <div className="narration-card">
      <NarrationScreen />
      <div className="narration-card__actions">
        <NextButton />
      </div>
      {/* TODO: Add narration navigation settings. */}
    </div>
  );
};

export default PixiVN;
