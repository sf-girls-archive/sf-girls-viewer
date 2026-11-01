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
            GitHub
          </a>
          <a
            className="header-text-link"
            href="https://www.buymeacoffee.com/ox7f"
            target="_blank"
            rel="noopener noreferrer"
          >
            Support
          </a>
        </div>
      </div>
    </header>
  );
};
