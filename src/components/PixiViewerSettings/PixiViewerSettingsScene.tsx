import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import Select from "react-select";
import { Spinner } from "../common/Spinner";
import {
  dropdownSelectionAtom,
  entityMapAtom,
  fileAtom,
  pixiAnimationListAtom,
  selectedMenuTabAtom,
} from "../../atoms";
import type { DropdownState, FileMeta } from "../../types";
import {
  getEntityOptions,
  getEntitySceneOptions,
  getSceneData,
  formatGroupLabel,
  menuItems,
} from "../../utils";

export const PixiViewerSettingsScene = () => {
  const [newFile, setNewFile] = useAtom(fileAtom);
  const [dropdownSelection, setDropdownSelection] = useAtom(
    dropdownSelectionAtom,
  );

  const entityMap = useAtomValue(entityMapAtom);
  const animationList = useAtomValue(pixiAnimationListAtom);
  const setSelectedTab = useSetAtom(selectedMenuTabAtom);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!newFile) {
      setIsLoading(false);
    }
  }, [newFile]);

  if (!entityMap) {
    return;
  }

  const entityOptions = getEntityOptions(entityMap);
  const sceneOptions = getEntitySceneOptions(
    entityMap,
    dropdownSelection.entity?.value,
  );

  const handleEntityChange = (option: DropdownState) =>
    setDropdownSelection({
      entity: option,
      scene: null,
    });

  const handleSceneChange = (option: DropdownState) =>
    setDropdownSelection((prev) => ({
      ...prev,
      scene: option,
    }));

  const removeScene = (file: FileMeta) => {
    setSelectedTab(menuItems[0]);
    setNewFile({ ...file, method: "remove" });
  };

  const loadScene = (index: number) => {
    const entity = dropdownSelection.entity?.value;
    const scene = dropdownSelection.scene?.value;

    if (!entity || !scene) {
      return;
    }

    const config = getSceneData(entityMap, entity, scene);
    const isLive2D = config.fileName?.includes(".model3.json");

    setNewFile({
      config: config,
      index,
      method: "add",
      name: entity,
      type: isLive2D ? "live2d" : "spine",
    });
    setIsLoading(true);
  };

  const renderAnimationTile = (file: FileMeta) => (
    <div
      key={`${file.index}-${file.config.fileName}`}
      className="loaded-scene"
    >
      <div className="loaded-scene__identity">
        <span className="loaded-scene__index">
          {String(file.index + 1).padStart(2, "0")}
        </span>
        <div>
          <strong>{file.name.replace(/_/g, " ")}</strong>
          <span>{file.config.name?.replace(/_/g, " ") ?? file.type}</span>
        </div>
      </div>
      <div className="loaded-scene__actions">
        <button
          className="scene-action-button"
          type="button"
          aria-label={`Adjust ${file.name.replace(/_/g, " ")}`}
          title="Adjust animation"
          onClick={() => setSelectedTab(file.index)}
        >
          Adjust
        </button>
        <button
          className="scene-action-button scene-action-button--remove"
          type="button"
          aria-label={`Remove ${file.name.replace(/_/g, " ")} from stage`}
          title="Remove from stage"
          onClick={() => removeScene(file)}
        >
          Remove
        </button>
      </div>
    </div>
  );

  return (
    <div className="settings-section">
      <div className="settings-section__intro">
        <span className="settings-section__number">01</span>
        <div>
          <h3>Load an animation</h3>
          <p>Pick an agent and bring one of their animations on stage.</p>
        </div>
      </div>

      <div className="scene-picker">
        <div className="settings-field">
          <label htmlFor="agent-select">Agent</label>
          <Select
            inputId="agent-select"
            classNamePrefix="studio-select"
            placeholder="Find an agent..."
            menuPortalTarget={document.body}
            menuPosition="fixed"
            menuPlacement="auto"
            components={{ DropdownIndicator: null, IndicatorSeparator: null }}
            value={dropdownSelection.entity}
            onChange={handleEntityChange}
            options={entityOptions}
            isSearchable
            formatGroupLabel={formatGroupLabel}
          />
        </div>
        <div className="settings-field">
          <label htmlFor="scene-select">Animation</label>
          <Select
            inputId="scene-select"
            classNamePrefix="studio-select"
            placeholder="Choose a motion..."
            menuPortalTarget={document.body}
            menuPosition="fixed"
            menuPlacement="auto"
            components={{ DropdownIndicator: null, IndicatorSeparator: null }}
            value={dropdownSelection.scene}
            onChange={handleSceneChange}
            options={sceneOptions}
            isSearchable
            formatGroupLabel={formatGroupLabel}
          />
        </div>
        <button
          className="button button--primary scene-load-button"
          type="button"
          disabled={!dropdownSelection.scene || isLoading}
          onClick={() => loadScene(animationList.length)}
        >
          <span>{isLoading ? "Loading scene" : "Load onto stage"}</span>
        </button>
      </div>

      <div className="loaded-scenes-heading">
        <span>ON STAGE</span>
        <span>{String(animationList.length).padStart(2, "0")}</span>
      </div>

      {animationList.length > 0 &&
        animationList.map((animation) => renderAnimationTile(animation.meta))}
      {animationList.length === 0 && !isLoading && (
        <p className="empty-list-note">
          Nothing loaded yet. Choose an agent and motion to get started.
        </p>
      )}
      {isLoading && (
        <div className="loading-note">
          <Spinner />
          <span>Preparing the scene...</span>
        </div>
      )}
    </div>
  );
};
