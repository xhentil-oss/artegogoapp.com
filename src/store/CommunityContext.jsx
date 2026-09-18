import { createContext, useCallback, useContext, useMemo } from "react";
import { STORAGE_KEYS } from "../services/storage.js";
import { usePersistentMap } from "../hooks/usePersistentMap.js";

/**
 * PËLQIMET DHE TË RUAJTURAT E POSTIMEVE
 *
 * Mbahen KËTU, jo brenda `PostCard`, sepse i shkruan feed-i dhe i lexon
 * profili. Më parë ishin dy `useState` te kartela: pëlqimi dhe ruajtja
 * zhdukeshin sapo ekrani rivizatohej — pra edhe kur kalonte te një skedë
 * tjetër dhe kthehej — dhe lista e "të ruajturave" nuk ekzistonte fare.
 *
 * ⚠️  Shkrimi shkon te serveri (`services/userData.js` → `/me/post-likes`,
 *     `/me/post-saves`), ndaj pëlqimi shihet edhe nga pajisja tjetër dhe
 *     numri te kartela është i njëjti për të gjithë. `localStorage` mbetet
 *     kujtesë e ndërmjetme, që lista të hapet edhe pa internet.
 */
const CommunityContext = createContext(null);

export function CommunityProvider({ children }) {
  const likes = usePersistentMap(STORAGE_KEYS.postLikes);
  const saves = usePersistentMap(STORAGE_KEYS.postSaves);

  /* ---------- pëlqimet ---------- */
  const isLiked = useCallback((postId) => Boolean(likes.data[postId]), [likes.data]);

  const toggleLike = useCallback(
    (postId) => {
      if (!postId) return false;
      let tani = false;
      likes.update((prev) => {
        const next = { ...prev };
        if (next[postId]) delete next[postId];
        else {
          next[postId] = new Date().toISOString();
          tani = true;
        }
        return next;
      });
      return tani;
    },
    [likes]
  );

  /**
   * Numri i pëlqimeve që shfaqet.
   *
   * ⚠️  `post.likes` vjen nga serveri dhe PËRMBAN tashmë pëlqimin tim, nëse e
   *     kam bërë. Prandaj zbritet `post.liked` — gjendja që dinte serveri në
   *     çastin e leximit — dhe shtohet ajo e tanishme. Pa këtë zbritje, numri
   *     rritej me një njësi shtesë sapo faqja rifreskohej: 1 → 2 → 3 për një
   *     pëlqim të vetëm.
   */
  const likeCount = useCallback(
    (post) => {
      const base = Number(post?.likes) || 0;
      const nga = post?.liked ? 1 : 0;
      const deri = isLiked(post?.id) ? 1 : 0;
      return Math.max(0, base - nga + deri);
    },
    [isLiked]
  );

  /* ---------- të ruajturat ---------- */
  const isSaved = useCallback((postId) => Boolean(saves.data[postId]), [saves.data]);

  /**
   * Ruan ose heq një postim.
   *
   * Merr POSTIMIN e plotë, jo id-në: përmbajtja ruhet bashkë me të, që lista
   * te profili të vizatohet edhe kur postimi ka rrëshqitur jashtë feed-it.
   *
   * @returns {boolean} `true` kur u ruajt, `false` kur u hoq
   */
  const toggleSave = useCallback(
    (post) => {
      if (!post?.id) return false;
      let tani = false;
      saves.update((prev) => {
        const next = { ...prev };
        if (next[post.id]) delete next[post.id];
        else {
          next[post.id] = { at: new Date().toISOString(), post };
          tani = true;
        }
        return next;
      });
      return tani;
    },
    [saves]
  );

  /** Të ruajturat, më e reja e para — gati për t'u vizatuar te profili. */
  const savedPosts = useMemo(
    () =>
      Object.entries(saves.data)
        .map(([id, entry]) => ({ id, at: entry?.at ?? "", post: entry?.post ?? null }))
        .filter((entry) => entry.post)
        .sort((a, b) => String(b.at).localeCompare(String(a.at)))
        .map((entry) => entry.post),
    [saves.data]
  );

  const value = useMemo(
    () => ({
      isLiked,
      toggleLike,
      likeCount,
      isSaved,
      toggleSave,
      savedPosts,
      /* `ready` i të dyve: profili nuk duhet të thotë "asgjë e ruajtur" para
         se ruajtja të lexohet. */
      ready: likes.ready && saves.ready,
    }),
    [isLiked, toggleLike, likeCount, isSaved, toggleSave, savedPosts, likes.ready, saves.ready]
  );

  return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>;
}

export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error("useCommunity duhet të përdoret brenda <CommunityProvider>");
  return ctx;
}
