type Props = {
  isOpen: boolean;
  onClick: () => void;
};

const SidebarToggleButton = ({ isOpen, onClick }: Props) => {
  return (
    <button
      className="button button--quiet stage-text-button"
      type="button"
      onClick={onClick}
      aria-label={isOpen ? "Hide inspector panel" : "Show inspector panel"}
      aria-expanded={isOpen}
      aria-controls="stage-inspector"
      title={isOpen ? "Hide controls" : "Show controls"}
    >
      <svg
        className="ui-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="3.5" y="4" width="17" height="16" rx="2" />
        <path d="M14.5 4v16" />
        {isOpen ? (
          <path d="m17 9 3 3-3 3" />
        ) : (
          <path d="m17 9-3 3 3 3" />
        )}
      </svg>
      <span className="stage-text-button__label">
        {isOpen ? "Hide controls" : "Show controls"}
      </span>
    </button>
  );
};

export default SidebarToggleButton;
