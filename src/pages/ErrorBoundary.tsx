import type { FC } from "react";
import { useNavigate } from "react-router-dom";

export const ErrorBoundary: FC = () => {
  const navigate = useNavigate();

  return (
    <main className="error-page">
      <div className="error-card">
        <span className="eyebrow">VIEWER / ERROR</span>
        <h1>That frame slipped.</h1>
        <p>Something unexpected interrupted the scene. Try a fresh take.</p>
        <div className="error-card__actions">
          <button
            className="button button--primary"
            type="button"
            onClick={() => window.location.reload()}
          >
            Refresh scene
          </button>
          <button
            className="button button--quiet"
            type="button"
            onClick={() => navigate("/")}
          >
            Back to studio
          </button>
        </div>
      </div>
    </main>
  );
};

export default ErrorBoundary;
