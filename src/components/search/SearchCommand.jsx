"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useUnsavedChanges } from "@/context/UnsavedChangesContext";
import { useChatbot } from "@/context/ChatbotContext";
import { searchIndex, buildHref, SEARCH_GROUPS } from "@/lib/search-index";
import { AGENT_ALLOWED_URLS } from "@/lib/routes";

const SearchCommandContext = createContext(null);

export function useSearchCommand() {
  const ctx = useContext(SearchCommandContext);
  if (!ctx)
    throw new Error("useSearchCommand must be used inside SearchCommandProvider");
  return ctx;
}

export function SearchCommandProvider({ children }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);

  return (
    <SearchCommandContext.Provider value={value}>
      {children}
      <SearchCommand />
    </SearchCommandContext.Provider>
  );
}

function SearchCommand() {
  const { open, setOpen } = useSearchCommand();
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { guardNavigation } = useUnsavedChanges();
  const { selectedChatbot } = useChatbot();
  const isAgent = selectedChatbot?.userRole === "AGENT";

  // Mirror the sidebar's exact-match predicate so palette and sidebar agree.
  const entries = useMemo(
    () =>
      isAgent
        ? searchIndex.filter((entry) => AGENT_ALLOWED_URLS.includes(entry.url))
        : searchIndex,
    [isAgent],
  );

  // cmdk's built-in scorer only matches the rendered value string, so it can
  // never match the keywords array. Fuse drives filtering instead.
  const fuse = useMemo(
    () =>
      new Fuse(entries, {
        keys: [
          { name: "title", weight: 3 },
          { name: "keywords", weight: 2 },
          { name: "section", weight: 1 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [entries],
  );

  // Loose second-pass index, only consulted when the strict pass finds nothing.
  // Kept separate rather than raising the main threshold so that typo recovery
  // never dilutes the ranking of queries that already match cleanly.
  const looseFuse = useMemo(
    () =>
      new Fuse(entries, {
        keys: [
          { name: "title", weight: 3 },
          { name: "keywords", weight: 2 },
          { name: "section", weight: 1 },
        ],
        threshold: 0.6,
        ignoreLocation: true,
      }),
    [entries],
  );

  // TODO(semantic-search): keywords + fuzzy recovery only relate queries we
  // anticipated. To relate genuinely unseen phrasings ("how do I stop it
  // replying at night") we'd embed each entry at build time, ship the vectors
  // as a static JSON, and score cosine similarity client-side — no runtime
  // model, no per-keystroke network call. Not worth it at this index size;
  // revisit once curated keywords start missing more than they catch.
  const { groups, isFuzzy } = useMemo(() => {
    const trimmed = query.trim();

    let matches;
    let fuzzy = false;

    if (!trimmed) {
      matches = entries;
    } else {
      matches = fuse.search(trimmed).map((result) => result.item);
      if (matches.length === 0) {
        matches = looseFuse.search(trimmed).map((result) => result.item);
        fuzzy = matches.length > 0;
      }
    }

    const grouped = Object.entries(SEARCH_GROUPS)
      .map(([key, label]) => [key, label, matches.filter((e) => e.group === key)])
      .filter(([, , items]) => items.length > 0);

    return { groups: grouped, isFuzzy: fuzzy };
  }, [query, fuse, looseFuse, entries]);

  // Ctrl+K / Cmd+K. The sidebar owns "b", so there is no collision here.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key?.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setOpen]);

  // Clear the query whenever the palette closes, so reopening starts fresh.
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const handleSelect = useCallback(
    (entry) => {
      // Close inside the callback: guardNavigation defers the action when a form
      // is dirty, and closing first would hide the palette behind the confirm
      // dialog and drop the user's query if they choose "Go Back".
      guardNavigation(() => {
        setOpen(false);
        setQuery("");
        router.push(buildHref(entry));
      });
    },
    [guardNavigation, router, setOpen],
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search"
      description="Search for a page or setting"
      commandProps={{ shouldFilter: false }}
    >
      <CommandInput
        placeholder="Search pages, settings and sections..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {isFuzzy && (
          <div className="text-muted-foreground px-3 pt-3 pb-1 text-xs">
            No exact match. Did you mean:
          </div>
        )}
        {groups.map(([key, label, items]) => (
          <CommandGroup key={key} heading={label}>
            {items.map((entry) => (
              <CommandItem
                key={entry.id}
                value={entry.id}
                onSelect={() => handleSelect(entry)}
              >
                {entry.icon && <entry.icon />}
                <span>{entry.title}</span>
                {entry.section && (
                  <span className="text-muted-foreground ml-auto text-xs">
                    {entry.section}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
