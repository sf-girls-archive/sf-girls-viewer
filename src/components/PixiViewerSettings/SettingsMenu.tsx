import { useAtom } from "jotai";
import { selectedMenuTabAtom } from "../../atoms";
import { menuItems } from "../../utils";
import {
  PixiViewerSettingsAnimation,
  PixiViewerSettingsGlobal,
  PixiViewerSettingsScene,
} from "../../components/PixiViewerSettings";

const tabComponents = {
  [menuItems[0]]: PixiViewerSettingsScene,
  [menuItems[1]]: PixiViewerSettingsGlobal,
  default: PixiViewerSettingsAnimation,
};

export const SettingsMenu = () => {
  const [selectedTab, setSelectedTab] = useAtom(selectedMenuTabAtom);

  const SelectedComponent = tabComponents[selectedTab] ?? tabComponents.default;

  return (
    <div className="inspector-content">
      <div
        className="inspector-tabs"
        role="tablist"
        aria-label="Inspector sections"
      >
        {menuItems.map((item, index) => {
          const isSelected = selectedTab === item;
          const label = item === "Global" ? "Canvas" : "Load";

          return (
            <button
              key={item}
              id={`inspector-tab-${item.toLowerCase()}`}
              className={`inspector-tab${isSelected ? " is-selected" : ""}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls="inspector-tab-panel"
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSelectedTab(item)}
            >
              <span>{label}</span>
              <small>0{index + 1}</small>
            </button>
          );
        })}
      </div>
      <div
        className="inspector-tab-panel"
        id="inspector-tab-panel"
        role="tabpanel"
        aria-labelledby={
          typeof selectedTab === "string"
            ? `inspector-tab-${selectedTab.toLowerCase()}`
            : undefined
        }
      >
        <SelectedComponent
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />
      </div>
    </div>
  );
};
