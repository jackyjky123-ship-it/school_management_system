import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectContextValue {
  value?: string
  onValueChange?: (val: string) => void
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  triggerRef: React.RefObject<HTMLButtonElement | null>
  selectedLabel?: string
  setSelectedLabel: React.Dispatch<React.SetStateAction<string | undefined>>
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelect() {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error("Select components must be used within a <Select>")
  }
  return context
}

interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (val: string) => void
  disabled?: boolean
  children: React.ReactNode
}

function Select({
  value: controlledValue,
  defaultValue,
  onValueChange,
  children,
}: SelectProps) {
  const [internalValue, setInternalValue] = React.useState<string | undefined>(defaultValue)
  const [open, setOpen] = React.useState(false)
  const [selectedLabel, setSelectedLabel] = React.useState<string | undefined>(undefined)
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)

  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
      setOpen(false)
    },
    [isControlled, onValueChange]
  )

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        open,
        setOpen,
        triggerRef,
        selectedLabel,
        setSelectedLabel,
      }}
    >
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  )
}

interface SelectTriggerProps extends React.ComponentProps<"button"> {
  children?: React.ReactNode
}

function SelectTrigger({
  className,
  children,
  disabled,
  ...props
}: SelectTriggerProps) {
  const { open, setOpen, triggerRef } = useSelect()

  return (
    <button
      ref={triggerRef}
      type="button"
      role="combobox"
      aria-expanded={open}
      disabled={disabled}
      onClick={() => setOpen((prev) => !prev)}
      className={cn(
        "flex h-8 w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 py-1 text-xs text-foreground transition-all outline-none",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:bg-input/20",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60 transition-transform duration-200" />
    </button>
  )
}

function SelectValue({
  placeholder = "Select an option",
  className,
}: {
  placeholder?: string
  className?: string
}) {
  const { value, selectedLabel } = useSelect()
  const display = selectedLabel || value || placeholder
  const isPlaceholder = !selectedLabel && !value

  return (
    <span
      className={cn(
        "truncate text-xs",
        isPlaceholder ? "text-muted-foreground" : "font-medium text-foreground",
        className
      )}
    >
      {display}
    </span>
  )
}

function SelectContent({
  className,
  children,
  align = "start",
}: {
  className?: string
  children: React.ReactNode
  align?: "start" | "end"
}) {
  const { open, setOpen, triggerRef } = useSelect()
  const contentRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!open) return

    function handleClickOutside(event: MouseEvent) {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, setOpen, triggerRef])

  if (!open) return null

  return (
    <div
      ref={contentRef}
      role="listbox"
      className={cn(
        "absolute z-50 mt-1 max-h-60 w-full min-w-[8rem] overflow-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95",
        align === "end" ? "right-0" : "left-0",
        className
      )}
    >
      {children}
    </div>
  )
}

function SelectItem({
  value,
  children,
  className,
  disabled,
}: {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}) {
  const { value: selectedValue, onValueChange, setSelectedLabel } = useSelect()
  const isSelected = selectedValue === value

  React.useEffect(() => {
    if (isSelected && typeof children === "string") {
      setSelectedLabel(children)
    }
  }, [isSelected, children, setSelectedLabel])

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={() => {
        if (!disabled) {
          if (typeof children === "string") setSelectedLabel(children)
          onValueChange?.(value)
        }
      }}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center justify-between rounded-md px-2 py-1.5 text-xs outline-none transition-colors",
        isSelected
          ? "bg-accent font-semibold text-accent-foreground"
          : "hover:bg-muted hover:text-foreground text-slate-700 dark:text-slate-200",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      <span className="truncate">{children}</span>
      {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
    </div>
  )
}

function SelectGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("p-1", className)} {...props} />
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("px-2 py-1 text-[11px] font-semibold text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
}
