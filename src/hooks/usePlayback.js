import { useCallback } from "react";
import { toSequence } from "../domain/sequence.js";
import { isFreeMeditation } from "../domain/access.js";
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

  /**
   * A është një meditim i kyçur për këtë përdorues?
   *
   * Kyçur = gjithçka që nuk është një nga tre meditimet falas. Pyetja i
   * drejtohet `domain/access`, jo një flamuri te vetë përmbajtja: rregulli i
   * modelit është një, dhe qëndron në një vend të vetëm.
   */
  const isLocked = useCallback(
    (item) => !isPremium && !isFreeMeditation(item),
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

  /**
   * Çfarë duhet të tregojë distinktivi mbi kapak.
   * Për një abonent të dyja janë false — asgjë nuk shënohet, gjithçka e hapur.
   */
  const accessBadge = useCallback(
    (item) => ({
      locked: !isPremium && !isFreeMeditation(item),
      free: !isPremium && isFreeMeditation(item),
    }),
    [isPremium]
  );

  return { isLocked, accessBadge, playItems, isPremium, openUpsell };
}
