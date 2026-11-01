import { SettingsMenu } from "../../components/PixiViewerSettings";

export const PixiViewerSettings = () => {
  return (
    <aside
      className="inspector-panel"
      id="stage-inspector"
      aria-label="Stage controls"
    >
      <div className="inspector-panel__heading">
        <div>
          <p className="eyebrow">CONTROL DECK <span>/</span> 02</p>
          <h2>Inspector</h2>
        </div>
        <span className="inspector-live">LIVE</span>
      </div>
      <SettingsMenu />
    </aside>
  );
};
