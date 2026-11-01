import type { FC } from "react";
import { useQueryDialogue } from "../../use_query/useQueryInterface";

const NarrationScreen: FC = () => {
  const { data: { text, character } = {} } = useQueryDialogue();

  if (!text) {
    return null;
  }

  return (
    <div className="narration-line">
      {character?.icon && (
        <img
          className="narration-line__portrait"
          src={character.icon}
          loading="lazy"
          alt=""
        />
      )}
      <div className="narration-line__copy">
        {character && character.name && (
          <strong>{character.name}</strong>
        )}
        <p>{text}</p>
      </div>
    </div>
  );
};

export default NarrationScreen;
