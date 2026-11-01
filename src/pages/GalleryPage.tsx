import "react-image-gallery/styles/css/image-gallery.css";

import { useEffect, useRef, useState } from "react";
import type { FC } from "react";
import ReactImageGallery, {
  type ReactImageGalleryItem,
} from "react-image-gallery";
import { useAtomValue } from "jotai";
import { entityMapAtom } from "../atoms";
import type { EntityData, EntityType } from "../types";
import { SubFolderName } from "../types";
import { Spinner } from "../components/common/Spinner";

type GalleryFilter = "All" | EntityType;
type SelectedEntity = {
  name: string;
  data: EntityData;
};

const filters: GalleryFilter[] = ["All", "Agents", "Seekers", "Partyrooms"];

const getImages = (entity: EntityData) => [
  ...Object.values(entity[SubFolderName.PORTRAIT] ?? {}).flat(),
  ...Object.values(entity[SubFolderName.MINI] ?? {}).flat(),
];

const getCoverImage = (entity: EntityData) =>
  Object.values(entity[SubFolderName.PORTRAIT] ?? {}).flat()[0] ??
  Object.values(entity[SubFolderName.MINI] ?? {}).flat()[0];

const assetUrl = (path: string) => (path.startsWith("/") ? path : `/${path}`);

const GalleryPage: FC = () => {
  const entityMap = useAtomValue(entityMapAtom);
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<GalleryFilter>("All");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedEntity) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedEntity(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedEntity]);

  useEffect(() => {
    if (!selectedEntity) {
      return;
    }

    galleryRef.current
      ?.querySelector<HTMLButtonElement>(".image-gallery-thumbnail.active")
      ?.scrollIntoView({ block: "nearest", inline: "center", behavior: "auto" });
  }, [activeImageIndex, selectedEntity]);

  if (!entityMap) {
    return (
      <div className="gallery-loading">
        <Spinner />
        <span>Opening the cast archive...</span>
      </div>
    );
  }

  const entities = Object.entries(entityMap);
  const filterCounts: Record<GalleryFilter, number> = {
    All: entities.length,
    Agents: entities.filter(([, entity]) => entity.type === "Agents").length,
    Seekers: entities.filter(([, entity]) => entity.type === "Seekers").length,
    Partyrooms: entities.filter(([, entity]) => entity.type === "Partyrooms")
      .length,
  };
  const normalizedQuery = query.trim().toLowerCase();
  const visibleEntities = entities.filter(([name, entity]) => {
    const matchesQuery = name.toLowerCase().includes(normalizedQuery);
    const matchesFilter = activeFilter === "All" || entity.type === activeFilter;
    return matchesQuery && matchesFilter;
  });
  const imageItems = selectedEntity
    ? getImages(selectedEntity.data).map((path) => ({
        original: assetUrl(path),
        thumbnail: assetUrl(path),
        originalAlt: `${selectedEntity.name.replace(/_/g, " ")} artwork`,
      }))
    : [];

  const openEntity = (name: string, data: EntityData) => {
    const images = getImages(data);
    setIsLoading(images.length > 0);
    setActiveImageIndex(0);
    setSelectedEntity({ name, data });
  };

  const renderItem = (item: ReactImageGalleryItem) => (
    <div className="gallery-lightbox__image-wrap">
      <img
        src={item.original}
        alt={item.originalAlt ?? ""}
        className="gallery-lightbox__image"
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
        loading="lazy"
      />
    </div>
  );

  return (
    <section className="gallery-page">
      <h1 className="sr-only">Agents</h1>
      <div className="archive-toolbar">
        <div className="archive-filters" role="group" aria-label="Filter by group">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`filter-chip${activeFilter === filter ? " is-active" : ""}`}
              type="button"
              aria-pressed={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
            >
              <span>{filter}</span>
              <small>{String(filterCounts[filter]).padStart(2, "0")}</small>
            </button>
          ))}
        </div>
        <label className="archive-search">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a character"
            aria-label="Search characters"
          />
        </label>
      </div>

      <div className="archive-results">
        <span>
          {String(visibleEntities.length).padStart(2, "0")} CHARACTERS
        </span>
        <span>PORTRAITS / MINIATURES / MOTION FRAMES</span>
      </div>

      {visibleEntities.length > 0 ? (
        <ul className="cast-grid">
          {visibleEntities.map(([name, entity], index) => {
            const imageCount = getImages(entity.data).length;
            const cover = getCoverImage(entity.data);
            const displayName = name.replace(/_/g, " ");

            return (
              <li className="cast-grid__item" key={name}>
                <button
                  className="cast-card"
                  type="button"
                  onClick={() => openEntity(name, entity.data)}
                  aria-label={`Open ${displayName} archive, ${imageCount} images`}
                >
                  <span className="cast-card__image">
                    {cover ? (
                      <img
                        src={assetUrl(cover)}
                        alt=""
                        loading="lazy"
                        className="cast-card__portrait"
                      />
                    ) : (
                      <span className="cast-card__no-image">NO PORTRAIT</span>
                    )}
                    <span className="cast-card__serial">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="cast-card__image-count">
                      {String(imageCount).padStart(2, "0")} FRAMES
                    </span>
                  </span>
                  <span className="cast-card__details">
                    <span className="cast-card__group">{entity.type}</span>
                    <strong>{displayName}</strong>
                    <span className="cast-card__open-icon" aria-hidden="true">
                      <svg
                        className="ui-icon"
                        viewBox="0 0 24 24"
                        focusable="false"
                      >
                        <path d="M5 12h14" />
                        <path d="m13 6 6 6-6 6" />
                      </svg>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="archive-empty">
          <span className="archive-empty__label">NO MATCHES</span>
          <h2>No agents match that search.</h2>
          <p>Try another search or choose a different group.</p>
          <button
            className="button button--quiet"
            type="button"
            onClick={() => {
              setQuery("");
              setActiveFilter("All");
            }}
          >
            Reset filters
          </button>
        </div>
      )}

      {selectedEntity && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-lightbox-title"
        >
          <button
            className="gallery-lightbox__backdrop"
            type="button"
            aria-label="Close image archive"
            onClick={() => setSelectedEntity(null)}
          />
          <section className="gallery-lightbox__panel">
            <header className="gallery-lightbox__header">
              <div>
                <span className="eyebrow">AGENT IMAGES</span>
                <h2 id="gallery-lightbox-title">
                  {selectedEntity.name.replace(/_/g, " ")}
                </h2>
              </div>
              <button
                className="button button--quiet gallery-lightbox__close"
                type="button"
                aria-label="Close image archive"
                onClick={() => setSelectedEntity(null)}
              >
                Close
              </button>
            </header>
            <div className="gallery-lightbox__body">
              {isLoading && <Spinner />}
              {imageItems.length > 0 ? (
                <div className="gallery-lightbox__gallery" ref={galleryRef}>
                  <ReactImageGallery
                    items={imageItems}
                    renderItem={renderItem}
                    onSlide={setActiveImageIndex}
                    showFullscreenButton={false}
                    showNav={imageItems.length > 1}
                    showPlayButton={false}
                  />
                </div>
              ) : (
                <p className="empty-list-note">
                  This agent does not have any portraits yet.
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </section>
  );
};

export default GalleryPage;
