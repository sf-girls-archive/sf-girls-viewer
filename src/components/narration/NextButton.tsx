import { narration } from "@drincs/pixi-vn";
import { useQueryClient } from "@tanstack/react-query";
import { type FC, useState } from "react";
import {
  INTERFACE_DATA_USE_QUEY_KEY,
  useQueryCanGoNext,
  useQueryDialogue,
} from "../../use_query/useQueryInterface";

const NextButton: FC = () => {
  const queryClient = useQueryClient();
  const { data: canGoNext = false } = useQueryCanGoNext();
  const { data: { text } = {} } = useQueryDialogue();
  const [isLoading, setIsLoading] = useState(false);

  const nextOnClick = async (): Promise<void> => {
    try {
      if (!narration.canGoNext) {
        return;
      }

      setIsLoading(true);
      narration
        .goNext({})
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: [INTERFACE_DATA_USE_QUEY_KEY],
          });
          setIsLoading(false);
        })
        .catch((e) => {
          console.error(e);
          setIsLoading(false);
        });

      return;
    } catch (e) {
      console.error(e);
    }
  };

  if (!canGoNext || !text) {
    return null;
  }

  return (
    <button
      className="button button--primary button--small"
      type="button"
      onClick={nextOnClick}
      disabled={isLoading}
    >
      {isLoading ? "Loading..." : "Next"}
    </button>
  );
};

export default NextButton;
