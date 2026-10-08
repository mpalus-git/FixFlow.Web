import { cn } from "cn";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { type KeyboardEvent, type Ref, useEffect, useEffectEvent, useId, useState } from "react";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "@/shared/ui/popover";

export type ComboboxOption = {
  value: string;
  label: string;
};

export type ComboboxProps = {
  id: string;
  name: string;
  label: string;
  selected: ComboboxOption | null;
  options: readonly ComboboxOption[] | undefined;
  isError?: boolean;
  placeholder: string;
  loadingText: string;
  emptyText: string;
  errorText: string;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  inputRef?: Ref<HTMLInputElement>;
  onQueryChange: (query: string) => void;
  onSelect: (option: ComboboxOption) => void;
  onBlur?: () => void;
};

export function Combobox({
  id,
  name,
  label,
  selected,
  options,
  isError = false,
  placeholder,
  loadingText,
  emptyText,
  errorText,
  disabled = false,
  invalid = false,
  describedBy,
  inputRef,
  onQueryChange,
  onSelect,
  onBlur,
}: ComboboxProps) {
  const listboxId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const debouncedQuery = useDebouncedValue(query);
  const changeQuery = useEffectEvent(onQueryChange);
  const visibleOptions = options ?? [];
  const activeOption = isOpen
    ? visibleOptions[Math.min(activeIndex, visibleOptions.length - 1)]
    : undefined;

  const activeOptionId =
    activeOption === undefined ? undefined : `${listboxId}-${activeOption.value}`;

  useEffect(() => {
    changeQuery(debouncedQuery.trim());
  }, [debouncedQuery]);

  useEffect(() => {
    if (activeOptionId !== undefined) {
      document.getElementById(activeOptionId)?.scrollIntoView({ block: "nearest" });
    }
  }, [activeOptionId]);

  function open() {
    if (!isOpen) {
      setQuery("");
      setActiveIndex(0);
      setIsOpen(true);
    }
  }

  function close() {
    setIsOpen(false);
    setQuery("");
  }

  function choose(option: ComboboxOption) {
    onSelect(option);
    close();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (isOpen) {
        setActiveIndex((index) => Math.min(index + 1, visibleOptions.length - 1));
      } else {
        open();
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && activeOption !== undefined) {
      event.preventDefault();
      choose(activeOption);
    } else if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      close();
    }
  }

  function message() {
    if (isError) {
      return errorText;
    }
    if (options === undefined) {
      return loadingText;
    }
    return options.length === 0 ? emptyText : null;
  }

  const statusMessage = message();

  return (
    <Popover
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          close();
        }
      }}
    >
      <PopoverAnchor asChild>
        <div className="relative">
          <Input
            id={id}
            name={name}
            ref={inputRef}
            role="combobox"
            autoComplete="off"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeOptionId}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            disabled={disabled}
            placeholder={placeholder}
            className="pr-8"
            value={isOpen ? query : (selected?.label ?? "")}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
              setIsOpen(true);
            }}
            onClick={open}
            onKeyDown={handleKeyDown}
            onBlur={onBlur}
          />
          <ChevronDownIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        tabIndex={0}
        className="max-h-72 w-(--radix-popover-trigger-width) gap-0 overflow-y-auto p-1"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (event.target instanceof Node && document.getElementById(id)?.contains(event.target)) {
            event.preventDefault();
          }
        }}
      >
        {statusMessage === null ? null : (
          <p className="px-2 py-1.5 text-muted-foreground">{statusMessage}</p>
        )}
        <ul id={listboxId} role="listbox" aria-label={label}>
          {visibleOptions.map((option) => {
            const isActive = option.value === activeOption?.value;
            const isSelected = option.value === selected?.value;
            return (
              <li
                key={option.value}
                id={`${listboxId}-${option.value}`}
                role="option"
                aria-selected={isSelected}
                className={cn(
                  "flex cursor-default items-center gap-2 rounded-md px-2 py-1.5",
                  isActive && "bg-accent text-accent-foreground",
                )}
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onMouseMove={() => {
                  setActiveIndex(visibleOptions.indexOf(option));
                }}
                onClick={() => {
                  choose(option);
                }}
              >
                <span className="min-w-0 flex-1">{option.label}</span>
                {isSelected ? <CheckIcon aria-hidden="true" className="size-4 shrink-0" /> : null}
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
