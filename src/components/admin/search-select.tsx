"use client";

import React from "react";
import { Search, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface SearchOption {
  value: string;
  label: string;
  sublabel?: string;
}

export function SearchSelect({
  options,
  value,
  onChange,
  placeholder = "Search...",
  emptyText = "No results",
}: {
  options: SearchOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [highlight, setHighlight] = React.useState(0);
  const rootRef = React.useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) || null;

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.sublabel || "").toLowerCase().includes(q)
    );
  }, [options, query]);

  React.useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  React.useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  function pick(opt: SearchOption) {
    onChange(opt.value);
    setQuery(opt.label);
    setOpen(false);
  }

  const shown = query || selected?.label || "";

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={shown}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selected) onChange("");
            setOpen(true);
          }}
          onFocus={(e) => {
            setOpen(true);
            e.target.select();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setHighlight((h) => Math.min(h + 1, filtered.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlight((h) => Math.max(h - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              const o = filtered[highlight];
              if (o) pick(o);
            }
          }}
          placeholder={placeholder}
          className="pl-9 pr-8"
          autoComplete="off"
        />
        {selected && (
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange("");
              setQuery("");
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-30 mt-1 w-full rounded-md border border-border bg-background shadow-lg max-h-60 overflow-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">{emptyText}</div>
          ) : (
            filtered.map((o, idx) => (
              <button
                key={o.value}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(o);
                }}
                onMouseEnter={() => setHighlight(idx)}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-sm text-left",
                  idx === highlight ? "bg-muted" : "hover:bg-muted/60"
                )}
              >
                <span className="min-w-0">
                  <span className="font-medium">{o.label}</span>
                  {o.sublabel && (
                    <span className="ml-2 text-xs text-muted-foreground">{o.sublabel}</span>
                  )}
                </span>
                {o.value === value && <Check className="h-4 w-4 text-primary shrink-0" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
