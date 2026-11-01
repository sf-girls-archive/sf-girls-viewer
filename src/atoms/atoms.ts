import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { Application } from "pixi.js";
import {
  ModifiedLive2D,
  type DropdownSelection,
  type EntityMap,
  type FileMeta,
  type ModifiedSpine,
  type SettingsGlobal,
} from "../types";
import { menuItems } from "../utils";

export const pixiAppAtom = atom<Application | null>(null);
export const pixiAppSettingsGlobalAtom = atomWithStorage<SettingsGlobal>(
  "settings-global",
  {
    backgroundAlpha: 0,
    backgroundColor: "#000000",
  },
);
export const pixiAnimationListAtom = atom<
  Array<ModifiedLive2D | ModifiedSpine>
>([]);
export const dropdownSelectionAtom = atom<DropdownSelection>({
  entity: null,
  scene: null,
});
export const fileAtom = atom<FileMeta | null>(null);
export const entityMapAtom = atom<EntityMap | null>(null);
export type AssetIndexStatus = "checking" | "online" | "offline";
export const assetIndexStatusAtom = atom<AssetIndexStatus>("checking");
export const assetIndexErrorAtom = atom<string | null>(null);
export const selectedMenuTabAtom = atom<string | number>(menuItems[0]);
