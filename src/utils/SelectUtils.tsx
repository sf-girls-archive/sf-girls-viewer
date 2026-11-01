import { DropdownOption } from "../types";

type Group = {
  label: string;
  options: DropdownOption[];
};

export const formatGroupLabel = (group: Group) => (
  <div className="select-group-label">
    <span>{group.label}</span>
    <span className="select-group-label__count">{group.options.length}</span>
  </div>
);
