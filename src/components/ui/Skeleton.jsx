import clsx from "clsx";

export default function Skeleton({ className }) {
  return <div className={clsx("pf-shimmer rounded-md", className)} />;
}
