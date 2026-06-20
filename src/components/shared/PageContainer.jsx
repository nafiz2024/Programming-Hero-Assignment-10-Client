import clsx from "clsx";

const sizeClasses = {
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-[1440px]",
};

export default function PageContainer({
  as: Component = "div",
  children,
  className,
  size = "xl",
}) {
  return (
    <Component
      className={clsx(
        "mx-auto w-full px-4 py-6 sm:px-5 sm:py-8 md:px-6 desktop:px-8",
        sizeClasses[size] || sizeClasses.xl,
        className,
      )}
    >
      {children}
    </Component>
  );
}
