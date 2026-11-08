import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.ComponentProps<"div"> {
  size?: "sm" | "default" | "lg" | "xl"
}

const sizeClasses = {
  sm: "h-7 w-7 text-[11px]",
  default: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
  xl: "h-12 w-12 text-base",
}

function Avatar({ className, size = "default", ...props }: AvatarProps) {
  return (
    <div
      data-slot="avatar"
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold border border-border/80 shadow-2xs select-none",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  src,
  alt,
  ...props
}: React.ComponentProps<"img">) {
  const [hasError, setHasError] = React.useState(false)

  if (!src || hasError) return null

  return (
    <img
      data-slot="avatar-image"
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-fallback"
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
