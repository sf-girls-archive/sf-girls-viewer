import "react-image-gallery/styles/css/image-gallery.css";

import { useEffect, useState } from "react";

import type { FC } from "react";
import type { EntityData } from "../types";

import Button from "../components/common/Button/Button";
import { entityMapAtom } from "../atoms";
import { FaTimes } from "react-icons/fa";
import ReactImageGallery from "react-image-gallery";
import { Spinner } from "../components/common/Spinner";
import { SubFolderName } from "../types";
import { useAtomValue } from "jotai";

const GalleryPage: FC = () => {
  const entityMap = useAtomValue(entityMapAtom);

  const [currentEntity, setCurrentEntity] = useState<EntityData | undefined>();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!entityMap) {
    return;
  }

  const openModal = (entity: EntityData) => {
    setCurrentEntity(entity);
    setIsLoading(true);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setCurrentEntity(undefined);
  };

  const getGalleryImages = () =>
    currentEntity
      ? [
          ...Object.values(currentEntity[SubFolderName.PORTRAIT] ?? {}).flat(),
          ...Object.values(currentEntity[SubFolderName.MINI] ?? {}).flat(),
        ].map((image) => ({
          original: `/${image}`,
          thumbnail: `/${image}`,
        }))
      : [];

  const renderItem = (item: any) => (
    <div className="gallery-image-wrap">
      <img
        src={item.original}
        alt={item.originalAlt ?? ""}
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
        className="gallery-image"
        loading="lazy"
      />
    </div>
  );

  const renderModal = () =>
    isOpen && (
      <div className="modal modal--visible" role="dialog" aria-modal="true" aria-label="Image gallery">
        <div
          className="modal-overlay"
          onClick={closeModal}
        />
        <div className="modal-content">
          <div className="modal-header u-flex u-center u-justify-space-between">
            <h5 className="modal-title mb-0">Images</h5>
            <Button className="btn btn-transparent" onClick={closeModal}>
              <FaTimes size={16} className="u-center" />
            </Button>
          </div>
          <div className="modal-body max-h-none">
            {isLoading && <Spinner />}
            <ReactImageGallery
              items={getGalleryImages()}
              renderItem={renderItem}
              showFullscreenButton
              showPlayButton={false}
            />
          </div>
        </div>
      </div>
    );

  return (
    <div className="container mt-10 h-100">
      <div className="mb-6 px-5 u-flex u-center">
        <input
          aria-label="Filter agents"
          placeholder="Search agents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="gallery-search"
        />
      </div>

      <ul className="justify-center gallery-list m-0">
        {Object.entries(entityMap)
          .filter(([entityKey]) =>
            entityKey.toLowerCase().includes(query.toLowerCase()),
          )
          .map(([entityKey, entity]) => {
            const totalCount =
              Object.values(entity.data[SubFolderName.PORTRAIT] ?? {}).flat()
                .length +
              Object.values(entity.data[SubFolderName.MINI] ?? {}).flat()
                .length;

            return (
              <li
                key={entityKey}
                onClick={() => openModal(entity.data)}
                className="agent-card"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    openModal(entity.data);
                }}
              >
                <div className="agent-card-body">
                  <div style={{ fontWeight: 600 }}>{entityKey}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {totalCount} image{totalCount !== 1 ? "s" : ""}
                  </div>
                </div>
              </li>
            );
          })}
      </ul>
      {renderModal()}
    </div>
  );
};

export default GalleryPage;
