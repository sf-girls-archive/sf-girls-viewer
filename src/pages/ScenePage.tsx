import type { FC } from "react";
import { useState } from "react";
import { useAtomValue } from "jotai";
import { pixiAnimationListAtom } from "../atoms";
import { PixiViewer } from "../components/PixiViewer";
import { PixiViewerSettings } from "../components/PixiViewerSettings";
import ScreenshotButton from "../components/common/Button/ScreenshotButton";
import SidebarToggleButton from "../components/common/Button/SidebarToggleButton";

const ScenePage: FC = () => {
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const animationList = useAtomValue(pixiAnimationListAtom);
  const activeAnimation = animationList[animationList.length - 1];

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
                className={`renderer-badge${activeAnimation ? " is-active" : ""}`}
              >
                {activeAnimation
                  ? activeAnimation.meta.type === "live2d"
                    ? "LIVE2D"
                    : "SPINE"
                  : "NO AGENT"}
              </span>
              <ScreenshotButton />
              <SidebarToggleButton
                isOpen={isInspectorOpen}
                onClick={() => setIsInspectorOpen((open) => !open)}
              />
            </div>
          </div>

          <div className="stage-viewport">
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
