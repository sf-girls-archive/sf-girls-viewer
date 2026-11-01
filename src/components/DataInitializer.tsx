import { useEffect } from "react";
import { useSetAtom } from "jotai";
import {
  assetIndexErrorAtom,
  assetIndexStatusAtom,
  entityMapAtom,
} from "../atoms";
import type { EntityMap } from "../types";

export const DataInitializer = () => {
  const setEntityMap = useSetAtom(entityMapAtom);
  const setStatus = useSetAtom(assetIndexStatusAtom);
  const setError = useSetAtom(assetIndexErrorAtom);

  useEffect(() => {
    const fetchEntityMap = async () => {
      setStatus("checking");
      setError(null);

      try {
        const response = await fetch("/entityMap.json");
        if (!response.ok) {
          throw new Error(
            `Asset index request failed with status ${response.status}.`,
          );
        }

        const data: EntityMap = await response.json();
        setEntityMap(data);
        setStatus("online");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown request error.";
        console.error("Failed to load /entityMap.json:", error);
        setEntityMap(null);
        setError(message);
        setStatus("offline");
      }
    };

    void fetchEntityMap();
  }, [setEntityMap, setStatus, setError]);

  return null;
};
