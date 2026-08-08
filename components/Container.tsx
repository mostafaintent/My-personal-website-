import { ReactNode } from "react";
import clsx from "clsx";

export default function Container({
  children,
  className,
  narrow = false,
}: {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
}) {
  return (
    <div
      className={clsx(
        "mx-auto w-full px-6",
        narrow ? "max-w-2xl" : "max-w-3xl",
        className
      )}
    >
      {children}
    </div>
  );
}
