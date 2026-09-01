/**
 * ═══════════════════════════════════════════════════════════════
 *  SERVICE WORKER — pritësi i njoftimeve
 * ═══════════════════════════════════════════════════════════════
 *
 * Ky skedar rrjedh JASHTË faqes, te një kontekst i vetin që shfletuesi e
 * zgjon edhe kur aplikacioni është i mbyllur. Pikërisht kjo është arsyeja pse
 * njoftimet nuk mund t'i dërgojë aplikacioni: kur telefoni është në xhep, kodi
 * i faqes nuk rrjedh fare.
 *
 * ⚠️  Mbahet i vogël dhe pa varësi me qëllim. Shfletuesi e ngarkon nga e para
 *     sa herë e zgjon; çdo import shtesë është një dështim i mundshëm pikërisht
 *     në çastin kur njoftimi duhet të shfaqet.
 */

/* Aktivizohet menjëherë, pa pritur që skedat e vjetra të mbyllen. Përndryshe
   një version i mëparshëm do të vazhdonte të prisnte njoftimet. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

/**
 * Njoftimi mbërriti.
 *
 * Trupi vjen i kriptuar nga serveri dhe deshifrohet nga shfletuesi — serveri
 * nuk mund ta lexojë atë që dërgon. Nëse për ndonjë arsye nuk lexohet dot,
 * shfaqet një njoftim i përgjithshëm: një njoftim bosh është më mirë sesa
 * asnjë, sepse përdoruesi e hap aplikacionin dhe e gjen te zilja.
 */
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }

  const title = data.title || "Arte Gogo";
  const options = {
    body: data.body || "Koha për një moment qetësie.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    /*
     * `tag` bashkon njoftimet e së njëjtës lloj: kujtesa e mëngjesit
     * zëvendëson atë të mëparshme në vend që të mbledhë tre rreshta te ekrani
     * i kyçur. `renotify` e mban dridhjen edhe kur zëvendëson.
     */
    tag: data.tag || "artegogo",
    renotify: true,
    data: { meditationId: data.meditationId ?? null, url: data.url ?? "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

/**
 * Përdoruesi shtypi njoftimin.
 *
 * Nëse aplikacioni është hapur, sillet në plan të parë — hapja e një skede të
 * dytë do t'i humbte gjendjen (seanca në luajtje, seanca e ndërtuar).
 */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const target = event.notification.data?.url || "/";

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) {
        if ("focus" in client) {
          await client.focus();
          /* Aplikacioni vendos vetë ç'të bëjë me meditimin e propozuar. */
          client.postMessage({ type: "notification-click", data: event.notification.data });
          return;
        }
      }
      await self.clients.openWindow(target);
    })()
  );
});

/**
 * Abonimi u rrotullua nga shfletuesi.
 *
 * ⚠️  Ndodh vetë, pa asnjë veprim të përdoruesit, dhe pa këtë trajtim njoftimet
 *     thjesht pushojnë — në heshtje, pa asnjë gabim. Abonimi i ri i dërgohet
 *     serverit menjëherë.
 */
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      const key = event.oldSubscription?.options?.applicationServerKey;
      if (!key) return;

      const fresh = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key,
      });

      /* Token-i i hyrjes nuk është i arritshëm këtu, ndaj lajmërohet faqja kur
         hapet herën tjetër; `services/push.js` e ri-dërgon abonimin. */
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) {
        client.postMessage({ type: "push-resubscribe", subscription: fresh.toJSON() });
      }
    })()
  );
});
