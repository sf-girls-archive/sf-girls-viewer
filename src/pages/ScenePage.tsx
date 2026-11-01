import "pixi-spine";

import type { FC } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useSearchParams } from "react-router-dom";
import {
  entityMapAtom,
  fileQueueAtom,
  pixiAnimationListAtom,
  pixiAppAtom,
} from "../atoms";
import { PixiViewer } from "../components/PixiViewer";
import { PixiViewerSettings } from "../components/PixiViewerSettings";
import ScreenshotButton from "../components/common/Button/ScreenshotButton";
import SidebarToggleButton from "../components/common/Button/SidebarToggleButton";
import StageExportButton from "../components/common/Button/StageExportButton";
import type { EntityMap, FileMeta } from "../types";
import {
  getEntitySceneOptions,
  getSceneData,
} from "../utils";

const getSceneOptions = (entityMap: EntityMap, agent: string) =>
  getEntitySceneOptions(entityMap, agent).flatMap((group) =>
    "options" in group ? group.options : [group],
  );

const parseStageParam = (value: string) => {
  const separator = value.indexOf(":");
  if (separator <= 0 || separator === value.length - 1) {
    return null;
  }

  return {
    agent: value.slice(0, separator),
    animation: value.slice(separator + 1),
  };
};

const ScenePage: FC = () => {
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [fileQueue, setFileQueue] = useAtom(fileQueueAtom);
  const entityMap = useAtomValue(entityMapAtom);
  const pixiApp = useAtomValue(pixiAppAtom);
  const animationList = useAtomValue(pixiAnimationListAtom);
  const stageParams = useMemo(
    () => searchParams.getAll("stage"),
    [searchParams],
  );
  const stageKey = JSON.stringify(stageParams);
  const lastRestoredStageKey = useRef<string | null>(null);
  const activeAnimation = animationList[animationList.length - 1];
  const rendererLabels = Array.from(
    new Set(animationList.map((animation) => animation.meta.type)),
  ).map((type) => type.toUpperCase());
  const rendererLabel = rendererLabels.join(" + ") || "NO AGENT";

  useEffect(() => {
    if (
      !entityMap ||
      !pixiApp ||
      fileQueue.length > 0 ||
      lastRestoredStageKey.current === stageKey
    ) {
      return;
    }

    const restoredEntries = stageParams.flatMap((stageParam) => {
      const entry = parseStageParam(stageParam);
      if (
        !entry ||
        !getSceneOptions(entityMap, entry.agent).some(
          (option) => option.value === entry.animation,
        )
      ) {
        return [];
      }

      return [entry];
    });
    const restoredFiles: FileMeta[] = restoredEntries.map(
      ({ agent, animation }, index) => {
        const config = getSceneData(entityMap, agent, animation);
        return {
          config,
          index,
          method: "add",
          name: agent,
          scene: animation,
          type: config.fileName?.includes(".model3.json")
            ? "live2d"
            : "spine",
        };
      },
    );
    const normalizedStageParams = restoredEntries.map(
      ({ agent, animation }) => `${agent}:${animation}`,
    );

    lastRestoredStageKey.current = stageKey;

    if (JSON.stringify(stageParams) !== JSON.stringify(normalizedStageParams)) {
      setSearchParams(
        (previous) => {
          if (JSON.stringify(previous.getAll("stage")) !== stageKey) {
            return previous;
          }

          const next = new URLSearchParams(previous);
          next.delete("stage");
          normalizedStageParams.forEach((stage) => next.append("stage", stage));
          return next;
        },
        { replace: true },
      );
    }

    const currentStage = animationList.map(({ meta }) =>
      `${meta.name}:${meta.scene}`,
    );
    if (
      JSON.stringify(currentStage) === JSON.stringify(normalizedStageParams)
    ) {
      return;
    }

    const removeFiles = [...animationList]
      .reverse()
      .map(({ meta }) => ({ ...meta, method: "remove" as const }));
    setFileQueue([...removeFiles, ...restoredFiles]);
  }, [
    animationList,
    entityMap,
    fileQueue.length,
    pixiApp,
    setFileQueue,
    setSearchParams,
    stageKey,
    stageParams,
  ]);

  return (
    <section className="studio-page">
      <h1 className="sr-only">Animation viewer</h1>
      <div
        className={`studio-workspace${isInspectorOpen ? "" : " studio-workspace--wide"}`}
      >
        <section className="stage-panel" aria-label="Animation preview stage">
          <div className="stage-panel__header">
            <div className="stage-title">
              <span className="stage-live-indicator" />
              <span>PREVIEW STAGE</span>
              <span className="stage-title__divider">/</span>
              <span className="stage-title__code">RENDER 001</span>
            </div>
            <div className="stage-actions">
              <span
                className={`renderer-badge${rendererLabels.length > 0 ? " is-active" : ""}`}
              >
                {rendererLabel}
              </span>
              <ScreenshotButton />
              <StageExportButton />
              <SidebarToggleButton
                isOpen={isInspectorOpen}
                onClick={() => setIsInspectorOpen((open) => !open)}
              />
            </div>
          </div>

          <div
            className={`stage-viewport${animationList.length === 0 ? " stage-viewport--empty" : ""}`}
          >
            <PixiViewer />
            {animationList.length === 0 && (
              <div className="stage-empty-state">
                <span className="stage-empty-state__index">STAGE / 001</span>
                <h2>No animation loaded.</h2>
                <p>Select an agent and animation in the inspector.</p>
                <span className="stage-empty-state__hint">
                  DRAG TO REPOSITION <span>/</span> CLICK TO PLAY
                </span>
              </div>
            )}
            {activeAnimation && (
              <div className="stage-subject-label">
                <span className="stage-subject-label__number">
                  {String(activeAnimation.meta.index + 1).padStart(2, "0")}
                </span>
                <span>{activeAnimation.meta.name.replace(/_/g, " ")}</span>
              </div>
            )}
          </div>

          <div className="stage-panel__footer">
            <span>
              <b>DRAG</b> TO REPOSITION <i /> <b>CLICK</b> TO TRIGGER
            </span>
            <span className="stage-resolution">
              {activeAnimation ? "INTERACTIVE VIEWPORT" : "AWAITING AGENT"}
            </span>
          </div>
        </section>

        {isInspectorOpen && <PixiViewerSettings />}
      </div>
    </section>
  );
};

export default ScenePage;
