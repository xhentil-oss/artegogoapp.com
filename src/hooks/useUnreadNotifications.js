import { useEffect, useState } from "react";
import { onUnreadChange, sentNotifications, unreadNow } from "../services/notifications.js";
import { onTokenChange } from "../services/api.js";

/**
 * Sa njoftime të palexuara ka — numri i kuq mbi zile.
 *
 * ⚠️  Lexohet një herë në montim dhe pastaj ndiqet me dëgjues. Pa dëgjuesin,
 *     "Shëno të lexuara" brenda fletës do ta fshinte listën e palexuar dhe
 *     pulla do të mbetej aty derisa faqja të rifreskohej — pra numri do të
 *     tregonte diçka që përdoruesi sapo e kishte mbyllur.
 *
 * `onTokenChange` e rilexon pas hyrjes: efekti rrjedh në montim, kur ende nuk
 * ka token, dhe një llogari e sapohapur do të mbetej pa pullë.
 */
export function useUnreadNotifications() {
  const [count, setCount] = useState(unreadNow);

  useEffect(() => {
    sentNotifications();

    const stopUnread = onUnreadChange(setCount);
    const stopToken = onTokenChange(() => sentNotifications());

    return () => {
      stopUnread();
      stopToken();
    };
  }, []);

  return count;
}
