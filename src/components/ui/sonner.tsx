import { useTheme } from "@/components/theme-provider"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CheckCircleIcon, InfoIcon, WarningIcon, XCircleIcon, SpinnerIcon } from "@phosphor-icons/react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      duration={2000}
      icons={{
        success: (
          <CheckCircleIcon className="size-4 text-green-500" weight="fill" />
        ),
        info: (
          <InfoIcon className="size-4 text-blue-500" weight="fill" />
        ),
        warning: (
          <WarningIcon className="size-4 text-amber-500" weight="fill" />
        ),
        error: (
          <XCircleIcon className="size-4 text-red-500" weight="fill" />
        ),
        loading: (
          <SpinnerIcon className="size-4 animate-spin text-muted-foreground" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "4px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:w-fit group-[.toaster]:min-w-[260px] group-[.toaster]:max-w-[320px] group-[.toaster]:p-3 group-[.toaster]:gap-2.5 group-[.toaster]:text-xs group-[.toaster]:rounded-[4px]",
          title: "group-[.toast]:text-xs group-[.toast]:font-semibold",
          description: "group-[.toast]:text-[11px] group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
