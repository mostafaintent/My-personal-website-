import { ReactNode } from "react";
import clsx from "clsx";

export default function Container({
  children,
  className,
  narrow = false,
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
  wide?: boolean;
}) {
  return (
    <div
      className={clsx(
        "mx-auto w-full px-[0.5cm] sm:px-6",
        wide ? "max-w-5xl" : narrow ? "max-w-2xl" : "max-w-3xl",
        className
      )}
    >
      {children}
    </div>
  );
}
