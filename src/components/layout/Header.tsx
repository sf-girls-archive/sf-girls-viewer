import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { Link, NavLink, useLocation } from "react-router-dom";
import { assetIndexErrorAtom, assetIndexStatusAtom } from "../../atoms";

type Theme = "dark" | "light";

const themeStorageKey = "sf-girls-viewer-theme";

const getInitialTheme = (): Theme => {
  const savedTheme = window.localStorage.getItem(themeStorageKey);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
};

const PrimaryNavigation = ({ search }: { search: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        className={`mobile-nav-toggle${isOpen ? " is-open" : ""}`}
        type="button"
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={isOpen}
        aria-controls="primary-navigation"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "Close" : "Menu"}
      </button>

      <nav
        className={`primary-nav${isOpen ? " is-open" : ""}`}
        id="primary-navigation"
        aria-label="Primary navigation"
      >
        <NavLink
          to={{ pathname: "/", search }}
          end
          className="primary-nav__link"
        >
          <span>Viewer</span>
          <small>01</small>
        </NavLink>
        <NavLink
          to={{ pathname: "/agents", search }}
          className="primary-nav__link"
        >
          <span>Agents</span>
          <small>02</small>
        </NavLink>
      </nav>
    </>
  );
};

export const Header = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const { pathname, search } = useLocation();
  const assetIndexStatus = useAtomValue(assetIndexStatusAtom);
  const assetIndexError = useAtomValue(assetIndexErrorAtom);
  const statusLabel = {
    checking: "CHECKING ASSET INDEX",
    online: "ASSET INDEX ONLINE",
    offline: "ASSET INDEX OFFLINE",
  }[assetIndexStatus];

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(themeStorageKey, theme);
    document
      .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "light" ? "#f3f7fd" : "#09111d");
  }, [theme]);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link
          className="brand-lockup"
          to={{ pathname: "/", search }}
          aria-label="SF Girls Viewer"
        >
          <span className="brand-copy">
            <strong>SF GIRLS</strong>
            <small>AGENT ANIMATIONS</small>
          </span>
        </Link>

        <PrimaryNavigation key={pathname} search={search} />

        <div className="site-header__actions">
          <span
            className={`asset-status asset-status--${assetIndexStatus}`}
            role="status"
            aria-live="polite"
            title={assetIndexError ?? undefined}
          >
            <span className="status-dot" />
            {statusLabel}
          </span>
          <button
            className="header-text-link theme-toggle"
            type="button"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            aria-pressed={theme === "light"}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            onClick={() =>
              setTheme((current) => (current === "dark" ? "light" : "dark"))
            }
          >
            <svg
              className="ui-icon header-text-link__icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              {theme === "dark" ? (
                <>
                  <circle cx="12" cy="12" r="3.5" />
                  <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
                </>
              ) : (
                <path d="M20.2 15.1A8.3 8.3 0 0 1 8.9 3.8 8.4 8.4 0 1 0 20.2 15.1Z" />
              )}
            </svg>
          </button>
          <a
            className="header-text-link"
            href="https://github.com/sf-girls-archive/sf-girls-viewer"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              className="ui-icon header-text-link__icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path d="m8 8-4 4 4 4" />
              <path d="m16 8 4 4-4 4" />
              <path d="m14 5-4 14" />
            </svg>
            <span>GitHub</span>
          </a>
          <a
            className="header-text-link"
            href="https://www.buymeacoffee.com/ox7f"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              className="ui-icon header-text-link__icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M5 8h12v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z" />
              <path d="M17 10h1a2.5 2.5 0 0 1 0 5h-1" />
              <path d="M9 5c0-1 .8-1.5.8-2.5M13 5c0-1 .8-1.5.8-2.5" />
            </svg>
            <span>Support</span>
          </a>
        </div>
      </div>
    </header>
  );
};
