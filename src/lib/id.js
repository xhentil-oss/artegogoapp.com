/**
 * ID-të e përmbajtjes së krijuar nga admin-i.
 *
 * Duhen unike edhe PAS rifreskimit: një numërues i thjeshtë do të rinisej nga
 * 1 sa herë hapet aplikacioni dhe programi i ri do të merrte ID-në e një të
 * vjetri. `Date.now()` nuk mjafton vetëm — dy krijime brenda të njëjtit
 * milisekond do të përplaseshin.
 */

let fallbackCounter = 0;

export function nextId(prefix = "id") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  /* Shfletues të vjetër: koha plus numërues, që as brenda një milisekondi
     të mos dalin dy të njëjtë. */
  fallbackCounter += 1;
  return `${prefix}_${Date.now().toString(36)}${fallbackCounter.toString(36)}`;
}
