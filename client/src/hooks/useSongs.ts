import { useState, useEffect, useCallback, useRef } from "react";
import { songs as songsApi } from "@/services/api";
import type { Song, Category, BrowseMode } from "@/types";
import { sortByName } from "@/utils/sort";

interface UseSongsOptions {
  category?: Category;
  browseMode?: BrowseMode;
  searchQuery?: string;
}

export function useSongs({ category, browseMode = "songs", searchQuery }: UseSongsOptions) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchSongs = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      let data: Song[];

      if (searchQuery && searchQuery.trim().length > 0) {
        data = await songsApi.search(searchQuery, category);
      } else if (browseMode === "known") {
        data = await songsApi.getKnown(category);
      } else if (browseMode === "learning") {
        data = await songsApi.getLearning(category);
      } else {
        data = await songsApi.getAll(category);
      }

      setSongs(sortByName(data, "title"));
    } catch (e: any) {
      if (e.name !== "AbortError") {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }, [category, browseMode, searchQuery]);

  useEffect(() => {
    fetchSongs();
    return () => abortRef.current?.abort();
  }, [fetchSongs]);

  return { songs, loading, error, refetch: fetchSongs };
}
