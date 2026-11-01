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
      {isOpen ? "Hide controls" : "Show controls"}
    </button>
  );
};

export default SidebarToggleButton;
