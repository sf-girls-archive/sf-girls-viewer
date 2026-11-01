import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Select from "react-select";
import { Spinner } from "../common/Spinner";
import {
  dropdownSelectionAtom,
  entityMapAtom,
  fileQueueAtom,
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
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedAgentParam = searchParams.get("agent");
  const hasAgentParam = searchParams.has("agent");
  const selectedAnimationParam = searchParams.get("animation");
  const hasAnimationParam = searchParams.has("animation");

  const [fileQueue, setFileQueue] = useAtom(fileQueueAtom);
  const [dropdownSelection, setDropdownSelection] = useAtom(
    dropdownSelectionAtom,
  );

  const entityMap = useAtomValue(entityMapAtom);
  const animationList = useAtomValue(pixiAnimationListAtom);
  const setSelectedTab = useSetAtom(selectedMenuTabAtom);

  const isLoading = fileQueue.length > 0;

  useEffect(() => {
    if (!entityMap) {
      return;
    }

    const selectedEntity =
      getEntityOptions(entityMap)
        .flatMap(({ options }) => options)
        .find((option) => option.value === selectedAgentParam) ?? null;
    const selectedScene = selectedEntity
      ? getEntitySceneOptions(entityMap, selectedEntity.value)
          .flatMap((group) =>
            "options" in group ? group.options : [group],
          )
          .find((option) => option.value === selectedAnimationParam) ?? null
      : null;

    setDropdownSelection((previous) =>
      previous.entity?.value === selectedEntity?.value &&
      previous.scene?.value === selectedScene?.value
        ? previous
        : { entity: selectedEntity, scene: selectedScene },
    );

    if (
      (hasAgentParam && !selectedEntity) ||
      (hasAnimationParam && !selectedScene)
    ) {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          if (hasAgentParam && !selectedEntity) {
            next.delete("agent");
            next.delete("animation");
          } else if (hasAnimationParam && !selectedScene) {
            next.delete("animation");
          }
          return next;
        },
        { replace: true },
      );
    }
  }, [
    entityMap,
    hasAgentParam,
    hasAnimationParam,
    selectedAnimationParam,
    selectedAgentParam,
    setDropdownSelection,
    setSearchParams,
  ]);

  if (!entityMap) {
    return;
  }

  const entityOptions = getEntityOptions(entityMap);
  const sceneOptions = getEntitySceneOptions(
    entityMap,
    dropdownSelection.entity?.value,
  );

  const handleEntityChange = (option: DropdownState) => {
    setDropdownSelection({
      entity: option,
      scene: null,
    });
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (option) {
        next.set("agent", option.value);
      } else {
        next.delete("agent");
      }
      next.delete("animation");
      return next;
    });
  };

  const handleSceneChange = (option: DropdownState) => {
    setDropdownSelection((prev) => ({
      ...prev,
      scene: option,
    }));
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (option) {
        next.set("animation", option.value);
      } else {
        next.delete("animation");
      }
      return next;
    });
  };

  const removeScene = (file: FileMeta) => {
    setSelectedTab(menuItems[0]);
    setFileQueue((previous) => [...previous, { ...file, method: "remove" }]);
    setSearchParams((previous) => {
      const stages = previous.getAll("stage");
      stages.splice(file.index, 1);
      const next = new URLSearchParams(previous);
      next.delete("stage");
      stages.forEach((stage) => next.append("stage", stage));
      return next;
    });
  };

  const loadScene = (index: number) => {
    const entity = dropdownSelection.entity?.value;
    const scene = dropdownSelection.scene?.value;

    if (!entity || !scene) {
      return;
    }

    const config = getSceneData(entityMap, entity, scene);
    const isLive2D = config.fileName?.includes(".model3.json");

    setFileQueue((previous) => [
      ...previous,
      {
        config,
        index,
        method: "add",
        name: entity,
        scene,
        type: isLive2D ? "live2d" : "spine",
      },
    ]);
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.append("stage", `${entity}:${scene}`);
      return next;
    });
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
          disabled={isLoading}
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
