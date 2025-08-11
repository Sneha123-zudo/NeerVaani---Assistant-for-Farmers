import { cn } from "@/lib/utils";

export function Loader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent",
        className
      )}
    ></div>
  );
}
