import { SearchIcon } from "lucide-react";
import { useEffect, useEffectEvent, useId, useState } from "react";
import { searchDebounceMs } from "@/shared/lib/useDebouncedValue";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

export type SearchInputProps = {
  label: string;
  placeholder: string;
  value: string;
  maxLength: number;
  onSearch: (value: string) => void;
};

export function SearchInput({ label, placeholder, value, maxLength, onSearch }: SearchInputProps) {
  const id = useId();
  const [text, setText] = useState(value);
  const [committedValue, setCommittedValue] = useState(value);
  const search = useEffectEvent(onSearch);

  if (value !== committedValue) {
    setCommittedValue(value);
    setText(value);
  }

  useEffect(() => {
    const trimmedText = text.trim();
    if (trimmedText === committedValue) {
      return undefined;
    }
    const timeout = setTimeout(() => {
      search(trimmedText);
    }, searchDebounceMs);
    return () => {
      clearTimeout(timeout);
    };
  }, [text, committedValue]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
      <SearchIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        id={id}
        type="search"
        className="pl-8"
        placeholder={placeholder}
        maxLength={maxLength}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
        }}
      />
    </div>
  );
}
