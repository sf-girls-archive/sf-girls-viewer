export type FileType = "spine" | "live2d";

export type FileMeta = {
  config: SpineData;
  index: number;
  method: "add" | "remove";
  name: string;
  scene: string;
  type: FileType;
};

export type EntityType = "Agents" | "Seekers" | "Partyrooms";

export type EntityData = {
  [SubFolderName.CHIBI]?: SpineConfig;
  [SubFolderName.MINI]?: MiniOrPortraitConfig;
  [SubFolderName.PLAYROOM]?: SpineConfig;
  [SubFolderName.PORTRAIT]?: MiniOrPortraitConfig;
  [SubFolderName.SCENE]?: SpineConfig;
  [SubFolderName.SPINE]?: SpineConfig;
};

export type EntityMap = {
  [key: string]: {
    type: EntityType;
    data: EntityData;
  };
};

export type MiniOrPortraitConfig = {
  [key: string]: string[];
};

export type SpineConfig = Record<string, SpineData>;

export type SpineData = {
  name?: string;
  fileName?: string;
  background?: string;
  foreground?: string;
  addition?: string;
};

export enum SubFolderName {
  CHIBI = "Chibi",
  MINI = "Mini",
  PLAYROOM = "Playroom",
  PORTRAIT = "Portrait",
  SCENE = "Scene",
  SPINE = "Spine",
}
