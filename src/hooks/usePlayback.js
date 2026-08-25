import { useCallback } from "react";
import { toSequence } from "../domain/sequence.js";
import { useSession } from "../store/SessionContext.jsx";
import { useNavigation } from "../store/NavigationContext.jsx";
import { usePlayer } from "../store/PlayerContext.jsx";

/**
 * Pika e vetme e hyrjes për "kliko dhe luaj".
 *
 * Bashkon tre gjëra që përpara përsëriteshin në çdo kartelë:
 *   1. a është përmbajtja e kyçur për këtë përdorues
 *   2. nëse është — hap upsell-in
 *   3. nëse jo — kthej blloqet në sekuencë dhe nise player-in
 *
 * Kështu kartelat nuk kanë më nevojë për props `isPremium` / `onUpsell` / `onPlay`.
 */
export function usePlayback() {
  const { isPremium } = useSession();
  const { openUpsell } = useNavigation();
  const { play } = usePlayer();

  /** A është një meditim i kyçur për këtë përdorues? */
  const isLocked = useCallback(
    (item) => Boolean(item?.premium) && !isPremium,
    [isPremium]
  );

  /** Luaj një bllok ose listë blloqesh; kyçjen e trajton vetë. */
  const playItems = useCallback(
    (blockOrList) => {
      const list = Array.isArray(blockOrList) ? blockOrList : [blockOrList];
      if (list.length === 0) return;
      if (list.some(isLocked)) {
        openUpsell();
        return;
      }
      play(toSequence(list));
    },
    [isLocked, openUpsell, play]
  );

  return { isLocked, playItems, isPremium, openUpsell };
}
