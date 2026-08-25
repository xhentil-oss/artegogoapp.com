import { useEffect } from "react";

/**
 * Bllokon scroll-in e faqes poshtë ndërsa një fletë është e hapur.
 *
 * Pa këtë, në telefon rrëshqitja brenda fletës "kalon" në trupin e faqes dhe
 * përmbajtja poshtë lëviz — fletja duket se kërcen kur e mbyll.
 *
 * Numëratori mban kohën kur dy fletë hapen njëra mbi tjetrën (p.sh. folder →
 * upsell): scroll-i lirohet vetëm kur mbyllet e fundit.
 */
let openCount = 0;
let restoreOverflow = "";
let restoreOverscroll = "";

export function useBodyScrollLock(active = true) {
  useEffect(() => {
    if (!active) return undefined;

    const { body } = document;
    if (openCount === 0) {
      restoreOverflow = body.style.overflow;
      restoreOverscroll = body.style.overscrollBehavior;
      body.style.overflow = "hidden";
      body.style.overscrollBehavior = "contain";
    }
    openCount += 1;

    return () => {
      openCount -= 1;
      if (openCount === 0) {
        body.style.overflow = restoreOverflow;
        body.style.overscrollBehavior = restoreOverscroll;
      }
    };
  }, [active]);
}
