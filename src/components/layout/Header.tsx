import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { Link, NavLink, useLocation } from "react-router-dom";
import { assetIndexErrorAtom, assetIndexStatusAtom } from "../../atoms";

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  const assetIndexStatus = useAtomValue(assetIndexStatusAtom);
  const assetIndexError = useAtomValue(assetIndexErrorAtom);
  const statusLabel = {
    checking: "CHECKING ASSET INDEX",
    online: "ASSET INDEX ONLINE",
    offline: "ASSET INDEX OFFLINE",
  }[assetIndexStatus];

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand-lockup" to="/" aria-label="SF Girls Viewer">
          <span className="brand-copy">
            <strong>SF GIRLS</strong>
            <small>AGENT ANIMATIONS</small>
          </span>
        </Link>

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
          <NavLink to="/" end className="primary-nav__link">
            <span>Viewer</span>
            <small>01</small>
          </NavLink>
          <NavLink to="/agents" className="primary-nav__link">
            <span>Agents</span>
            <small>02</small>
          </NavLink>
        </nav>

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
