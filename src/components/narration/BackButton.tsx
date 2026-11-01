import { narration } from "@drincs/pixi-vn";
import { useQueryClient } from "@tanstack/react-query";
import { type FC, useState } from "react";
import {
  INTERFACE_DATA_USE_QUEY_KEY,
  useQueryCanGoBack,
  useQueryDialogue,
} from "../../use_query/useQueryInterface";

const BackButton: FC = () => {
  const queryClient = useQueryClient();
  const { data: canGoBack = false } = useQueryCanGoBack();
  const { data: { text } = {} } = useQueryDialogue();
  const [loading, setLoading] = useState(false);

  const backOnClick = async (): Promise<void> => {
    try {
      if (!narration.canGoBack) {
        return;
      }

      setLoading(true);
      narration
        .goBack(() => {
          // TODO: navigate in the url path
          // READ THIS: https://pixi-vn.web.app/start/interface.html#navigate-switch-between-ui-screens
        })
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: [INTERFACE_DATA_USE_QUEY_KEY],
          });
          setLoading(false);
        })
        .catch((e) => {
          console.error(e);
          setLoading(false);
        });

      return;
    } catch (e) {
      console.error(e);
    }
  };

  if (!canGoBack || !text) {
    return null;
  }

  return (
    <button
      className="button button--quiet button--small"
      type="button"
      onClick={backOnClick}
      disabled={loading}
    >
      Back
    </button>
  );
};

export default BackButton;
