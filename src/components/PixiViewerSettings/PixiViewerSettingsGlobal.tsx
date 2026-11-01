import { useAtom, useAtomValue } from "jotai";
import { type ChangeEvent } from "react";
import { pixiAppAtom, pixiAppSettingsGlobalAtom } from "../../atoms";

export const PixiViewerSettingsGlobal = () => {
  const app = useAtomValue(pixiAppAtom);
  const [settings, setSettings] = useAtom(pixiAppSettingsGlobalAtom);

  if (!app) {
    return <p className="empty-list-note">Preparing the renderer...</p>;
  }

  const handleChange =
    (key: string) => (event: ChangeEvent<HTMLInputElement>) => {
      const stringValue = event.target.value;
      const numberValue = Number(stringValue);
      const value = isNaN(numberValue) ? stringValue : numberValue;
      setSettings((prev) => ({ ...prev, [key]: value }));
    };

  return (
      <div className="settings-section">
        <div className="settings-section__intro">
          <span className="settings-section__number">02</span>
          <div>
            <h3>Stage finish</h3>
            <p>Tune the canvas beneath your agent.</p>
          </div>
        </div>

        <div className="settings-field settings-field--color">
          <label htmlFor="stage-color">Canvas color</label>
          <div className="color-control">
            <span
              className="color-swatch"
              style={{ backgroundColor: settings.backgroundColor }}
            />
            <input
              id="stage-color"
              type="color"
              name="color"
              value={settings.backgroundColor}
              onChange={handleChange("backgroundColor")}
            />
            <output htmlFor="stage-color">{settings.backgroundColor}</output>
          </div>
        </div>

        <div className="range-field">
          <div className="range-field__heading">
            <label htmlFor="stage-alpha">Canvas opacity</label>
            <output htmlFor="stage-alpha">
              {Math.round(settings.backgroundAlpha * 100)}%
            </output>
          </div>
          <input
            id="stage-alpha"
            type="range"
            name="alpha"
            min="0"
            max="1"
            step={0.01}
            value={settings.backgroundAlpha}
            onChange={handleChange("backgroundAlpha")}
            aria-valuetext={`${Math.round(settings.backgroundAlpha * 100)} percent`}
          />
          <div className="range-field__scale">
            <span>TRANSPARENT</span>
            <span>OPAQUE</span>
          </div>
        </div>

        <div className="settings-note">
          <span className="settings-note__mark">i</span>
          <p>
            Scene artwork sits above this color. Set opacity to zero to use the
            studio backdrop.
          </p>
        </div>
      </div>
    );
};
