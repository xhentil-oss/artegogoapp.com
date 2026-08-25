import { createContext, useCallback, useContext, useMemo } from "react";
import { STORAGE_KEYS } from "../services/storage.js";
import { findMeditations } from "../services/contentRepository.js";
import { usePersistentMap } from "../hooks/usePersistentMap.js";

/**
 * LISTAT E PËRDORUESIT — të krijuara, të preferuara, të shkarkuara.
 *
 * Të treja mbahen KËTU, jo brenda ekraneve, sepse shkruhen nga një vend
 * (player-i, përmbyllja) dhe lexohen nga një tjetër (profili). Dy kopje
 * state-i do të shkruanin njëra mbi tjetrën.
 *
 * Ruhen vetëm ID; meditimet zgjidhen nga katalogu në lexim, që të mos mbeten
 * të dhëna të vjetruara kur ndryshon titulli ose kohëzgjatja.
 */
const CollectionsContext = createContext(null);

export function CollectionsProvider({ children }) {
  const favorites = usePersistentMap(STORAGE_KEYS.favorites);
  const downloads = usePersistentMap(STORAGE_KEYS.downloads);
  const sessions = usePersistentMap(STORAGE_KEYS.customSessions);

  /* ---------- të preferuarat ---------- */
  const isFavorite = useCallback((id) => Boolean(favorites.data[id]), [favorites.data]);

  const toggleFavorite = useCallback(
    (id) =>
      favorites.update((prev) => {
        const next = { ...prev };
        if (next[id]) delete next[id];
        else next[id] = new Date().toISOString();
        return next;
      }),
    [favorites]
  );

  /* ---------- të shkarkuarat ---------- */
  const isDownloaded = useCallback((id) => Boolean(downloads.data[id]), [downloads.data]);

  const toggleDownload = useCallback(
    (id) =>
      downloads.update((prev) => {
        const next = { ...prev };
        if (next[id]) delete next[id];
        else next[id] = new Date().toISOString();
        return next;
      }),
    [downloads]
  );

  /* ---------- seancat e krijuara ---------- */
  const savedSessions = useMemo(
    () =>
      Object.values(sessions.data)
        .map((session) => ({ ...session, blocks: findMeditations(session.blockIds) }))
        .filter((session) => session.blocks.length > 0)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [sessions.data]
  );

  const saveSession = useCallback(
    (name, blocks) => {
      const trimmed = name.trim();
      if (!trimmed || !blocks?.length) return null;
      const id = `s${Date.now()}`;
      sessions.update((prev) => ({
        ...prev,
        [id]: {
          id,
          name: trimmed,
          blockIds: blocks.map((b) => b.id),
          createdAt: new Date().toISOString(),
        },
      }));
      return id;
    },
    [sessions]
  );

  const removeSession = useCallback(
    (id) =>
      sessions.update((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      }),
    [sessions]
  );

  /** Listat e zgjidhura, gati për t'u shfaqur te profili. */
  const favoriteItems = useMemo(() => findMeditations(Object.keys(favorites.data)), [favorites.data]);
  const downloadedItems = useMemo(() => findMeditations(Object.keys(downloads.data)), [downloads.data]);

  const value = useMemo(
    () => ({
      isFavorite,
      toggleFavorite,
      favoriteItems,
      isDownloaded,
      toggleDownload,
      downloadedItems,
      savedSessions,
      saveSession,
      removeSession,
    }),
    [
      isFavorite,
      toggleFavorite,
      favoriteItems,
      isDownloaded,
      toggleDownload,
      downloadedItems,
      savedSessions,
      saveSession,
      removeSession,
    ]
  );

  return <CollectionsContext.Provider value={value}>{children}</CollectionsContext.Provider>;
}

export function useCollections() {
  const ctx = useContext(CollectionsContext);
  if (!ctx) throw new Error("useCollections duhet të përdoret brenda <CollectionsProvider>");
  return ctx;
}
