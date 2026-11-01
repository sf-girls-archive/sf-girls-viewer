import { useAtomValue } from "jotai";
import { type ISpineDebugRenderer, SpineDebugRenderer } from "pixi-spine";
import { type ChangeEvent, useState } from "react";
import { pixiAnimationListAtom } from "../../atoms";
import type {
  ModifiedContainer,
  ModifiedLive2D,
  ModifiedSpine,
} from "../../types";
import {
  getAnimations,
  getIsLive2D,
  getSkins,
  handleTouchAnimationLive2D,
  handleTouchAnimationSpine,
  menuItems,
} from "../../utils";

type Props = {
  selectedTab: string | number;
  setSelectedTab: (value: string | number) => void;
};

type AnimationSettings = {
  x: number;
  y: number;
  alpha: number;
  angle: number;
  scale: number;
  skew: number;
  timeScale: number;
  allowClick: boolean;
  allowDrag: boolean;
  autoUpdate: boolean;
  debug: boolean;
};

type NumericSettingKey =
  | "x"
  | "y"
  | "alpha"
  | "angle"
  | "scale"
  | "skew"
  | "timeScale";

type RangeControlProps = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  output: string;
  disabled?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

const RangeControl = ({
  id,
  label,
  value,
  min,
  max,
  step,
  output,
  disabled = false,
  onChange,
}: RangeControlProps) => (
  <div className={`range-field${disabled ? " is-disabled" : ""}`}>
    <div className="range-field__heading">
      <label htmlFor={id}>{label}</label>
      <output htmlFor={id}>{output}</output>
    </div>
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      disabled={disabled}
      aria-valuetext={output}
    />
  </div>
);

const getSettings = (
  animation: ModifiedLive2D | ModifiedSpine,
): AnimationSettings => {
  const isLive2D = getIsLive2D(animation);
  const parent = animation.parent as ModifiedContainer;

  return {
    x: animation.x,
    y: animation.y,
    alpha: parent.alpha,
    angle: parent.angle,
    scale: parent.scale.x,
    skew: Math.min(1, Math.max(0, (parent.skew.x + Math.PI / 2) / Math.PI)),
    timeScale: isLive2D ? 1 : (animation as ModifiedSpine).state.timeScale,
    allowClick: parent.allowClick ?? true,
    allowDrag: parent.allowDrag ?? true,
    autoUpdate: isLive2D ? true : (animation as ModifiedSpine).autoUpdate,
    debug: isLive2D ? false : Boolean((animation as ModifiedSpine).debug),
  };
};

const defaultAnimationSettings: AnimationSettings = {
  x: 0,
  y: 0,
  alpha: 1,
  angle: 0,
  scale: 1,
  skew: 0.5,
  timeScale: 1,
  allowClick: true,
  allowDrag: true,
  autoUpdate: true,
  debug: false,
};

export const PixiViewerSettingsAnimation = ({
  selectedTab,
  setSelectedTab,
}: Props) => {
  const animationList = useAtomValue(pixiAnimationListAtom);
  const animation = animationList.find(
    (listItem) => listItem.meta.index === selectedTab,
  );
  const [settingsAnimation, setSettingsAnimation] = useState(animation);
  const [settings, setSettings] = useState<AnimationSettings>(() =>
    animation ? getSettings(animation) : defaultAnimationSettings,
  );

  if (animation !== settingsAnimation) {
    setSettingsAnimation(animation);
    setSettings(animation ? getSettings(animation) : defaultAnimationSettings);
  }

  if (!animation) {
    return (
      <p className="empty-list-note">
        Select a loaded agent to adjust its motion.
      </p>
    );
  }

  const isLive2D = getIsLive2D(animation);
  const animations = getAnimations(animation, isLive2D);
  const skins = getSkins(animation, isLive2D);

  const handleChange =
    (key: NumericSettingKey) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.target.value);

      switch (key) {
        case "x":
          animation.x = value;
          break;
        case "y":
          animation.y = value;
          break;
        case "alpha":
          animation.parent.alpha = value;
          break;
        case "angle":
          animation.parent.angle = value;
          break;
        case "scale":
          animation.parent.scale.set(value);
          break;
        case "skew":
          animation.parent.skew.set(value * Math.PI - Math.PI / 2);
          break;
        case "timeScale":
          if (!isLive2D) {
            (animation as ModifiedSpine).state.timeScale = value;
          }
          break;
      }

      setSettings((previous) => ({ ...previous, [key]: value }));
    };

  const handleToggle =
    (key: "allowClick" | "allowDrag" | "autoUpdate" | "debug") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const { checked } = event.target;
      const parent = animation.parent as ModifiedContainer;

      switch (key) {
        case "autoUpdate":
          if (!isLive2D) {
            (animation as ModifiedSpine).autoUpdate = checked;
          }
          break;
        case "allowClick":
          parent.allowClick = checked;
          break;
        case "allowDrag":
          parent.allowDrag = checked;
          break;
        case "debug":
          if (!isLive2D) {
            (animation as ModifiedSpine).debug = checked
              ? new SpineDebugRenderer()
              : (null as unknown as ISpineDebugRenderer);
          }
          break;
      }

      setSettings((previous) => ({ ...previous, [key]: checked }));
    };

  const playAnimation = (animationName: string) => {
    if (isLive2D) {
      handleTouchAnimationLive2D(animation as ModifiedLive2D, animationName);
    } else {
      handleTouchAnimationSpine(animation as ModifiedSpine, animationName);
    }
  };

  const changeSkin = (skinName: string) => {
    (animation as ModifiedSpine).skeleton.setSkinByName(skinName);
  };

  return (
    <div className="animation-editor">
      <div className="selected-subject">
        <button
          className="back-to-scenes"
          type="button"
          onClick={() => setSelectedTab(menuItems[0])}
          aria-label="Back to scene controls"
          title="Back to scene controls"
        >
          <svg
            className="ui-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
        </button>
        <div className="selected-subject__copy">
          <span className="eyebrow">SELECTED AGENT</span>
          <h3>{animation.meta.name.replace(/_/g, " ")}</h3>
          <p>{animation.meta.config.name?.replace(/_/g, " ") ?? "Animation"}</p>
        </div>
        <span className="renderer-badge is-active">
          {isLive2D ? "LIVE2D" : "SPINE"}
        </span>
      </div>

      <div className="animation-editor__scroll">
        <details className="control-group" open>
          <summary>
            <span className="control-group__number">01</span>
            <span>Transform</span>
            <small>POSITION / ROTATION / SCALE</small>
          </summary>
          <div className="control-group__body">
            <RangeControl
              id="animation-x"
              label="Horizontal position"
              value={settings.x}
              min={-1000}
              max={1000}
              step={1}
              output={`${Math.round(settings.x)} px`}
              onChange={handleChange("x")}
            />
            <RangeControl
              id="animation-y"
              label="Vertical position"
              value={settings.y}
              min={-1000}
              max={1000}
              step={1}
              output={`${Math.round(settings.y)} px`}
              onChange={handleChange("y")}
            />
            <RangeControl
              id="animation-alpha"
              label="Opacity"
              value={settings.alpha}
              min={0}
              max={1}
              step={0.01}
              output={`${Math.round(settings.alpha * 100)}%`}
              onChange={handleChange("alpha")}
            />
            <RangeControl
              id="animation-angle"
              label="Rotation"
              value={settings.angle}
              min={0}
              max={360}
              step={1}
              output={`${Math.round(settings.angle)} deg`}
              onChange={handleChange("angle")}
            />
            <RangeControl
              id="animation-scale"
              label="Scale"
              value={settings.scale}
              min={0}
              max={4}
              step={0.01}
              output={`${settings.scale.toFixed(2)}x`}
              onChange={handleChange("scale")}
            />
            <RangeControl
              id="animation-skew"
              label="Skew"
              value={settings.skew}
              min={0}
              max={1}
              step={0.01}
              output={settings.skew.toFixed(2)}
              onChange={handleChange("skew")}
            />
          </div>
        </details>

        <details className="control-group" open>
          <summary>
            <span className="control-group__number">02</span>
            <span>Playback</span>
            <small>{animations.length} CLIPS</small>
          </summary>
          <div className="control-group__body">
            <RangeControl
              id="animation-speed"
              label="Playback speed"
              value={settings.timeScale}
              min={0}
              max={4}
              step={0.05}
              output={`${settings.timeScale.toFixed(2)}x`}
              disabled={isLive2D}
              onChange={handleChange("timeScale")}
            />
            {isLive2D && (
              <p className="control-hint">
                Speed adjustment is available for Spine animations.
              </p>
            )}
            {animations.length > 0 ? (
              <div className="motion-list">
                {animations.map((animationName, index) => (
                  <button
                    key={animationName}
                    className="motion-choice"
                    type="button"
                    onClick={() => playAnimation(animationName)}
                  >
                    <span className="motion-choice__index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{animationName.replace(/_/g, " ")}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="control-hint">No named motions were found.</p>
            )}
            <label className="toggle-row">
              <span>
                <strong>Click to trigger</strong>
                <small>Play a reaction when you tap the model.</small>
              </span>
              <input
                type="checkbox"
                checked={settings.allowClick}
                onChange={handleToggle("allowClick")}
              />
              <span className="toggle-switch" aria-hidden="true" />
            </label>
            <label className="toggle-row">
              <span>
                <strong>Drag to reposition</strong>
                <small>Move the agent around the stage.</small>
              </span>
              <input
                type="checkbox"
                checked={settings.allowDrag}
                onChange={handleToggle("allowDrag")}
              />
              <span className="toggle-switch" aria-hidden="true" />
            </label>
            <label className={`toggle-row${isLive2D ? " is-disabled" : ""}`}>
              <span>
                <strong>Auto update</strong>
                <small>Advance Spine animation state each frame.</small>
              </span>
              <input
                type="checkbox"
                checked={settings.autoUpdate}
                onChange={handleToggle("autoUpdate")}
                disabled={isLive2D}
              />
              <span className="toggle-switch" aria-hidden="true" />
            </label>
          </div>
        </details>

        {skins.length > 0 && (
          <details className="control-group">
            <summary>
              <span className="control-group__number">03</span>
              <span>Costume</span>
              <small>{skins.length} SKINS</small>
            </summary>
            <div className="control-group__body">
              <div className="skin-list">
                {skins.map((skinName) => (
                  <button
                    key={skinName}
                    className="skin-choice"
                    type="button"
                    onClick={() => changeSkin(skinName)}
                  >
                    {skinName.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>
          </details>
        )}

        <details className="control-group">
          <summary>
            <span className="control-group__number">
              {skins.length > 0 ? "04" : "03"}
            </span>
            <span>Diagnostics</span>
            <small>ADVANCED</small>
          </summary>
          <div className="control-group__body">
            <label className={`toggle-row${isLive2D ? " is-disabled" : ""}`}>
              <span>
                <strong>Debug rendering</strong>
                <small>Show the Spine skeleton and bounds.</small>
              </span>
              <input
                type="checkbox"
                checked={settings.debug}
                onChange={handleToggle("debug")}
                disabled={isLive2D}
              />
              <span className="toggle-switch" aria-hidden="true" />
            </label>
          </div>
        </details>
      </div>
    </div>
  );
};
