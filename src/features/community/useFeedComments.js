import { useCallback } from "react";
import { usePersistentMap } from "../../hooks/usePersistentMap.js";

const STORAGE_KEY = "comments";

/**
 * Komentet e feed-it, të ruajtura lokalisht.
 *
 * Mbahen NË NJË VEND (te `FeedList`), jo brenda çdo `PostCard`: të gjitha
 * postimet ndajnë të njëjtin çelës ruajtjeje, ndaj dy kopje të pavarura
 * state-i do të shkruanin njëra mbi tjetrën dhe komentet e një postimi do
 * të zhdukeshin kur komentohej një tjetër.
 *
 * Deri sa të vijë backend-i, komentet janë vetëm në këtë pajisje — i njëjti
 * model si zakonet dhe gjendja emocionale.
 */
export function useFeedComments() {
  const { data, update } = usePersistentMap(STORAGE_KEY);

  const commentsFor = useCallback((postId) => data[postId] ?? [], [data]);

  const addComment = useCallback(
    (postId, text) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      update((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] ?? []), { text: trimmed, at: new Date().toISOString() }],
      }));
    },
    [update]
  );

  return { commentsFor, addComment };
}
