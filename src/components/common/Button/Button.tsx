import { PropsWithChildren } from "react";

type Props = {
  onClick: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
};

const Button = ({
  children,
  className,
  onClick,
  type = "button",
}: PropsWithChildren<Props>) => (
  <button onClick={onClick} className={className} type={type}>
    {children}
  </button>
);

export default Button;
