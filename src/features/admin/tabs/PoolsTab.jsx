import { Check } from "lucide-react";
import { T, radii } from "../../../theme/tokens.js";
import { defaultPools, listReminderSlots, listSubGroups } from "../../../services/contentRepository.js";
import { togglePoolEntry } from "../../../services/adminStore.js";
import { picksForDay } from "../../../domain/dailyPick.js";
import { dayKey } from "../../../lib/time.js";
import { useAdminState } from "../../../hooks/useAdmin.js";
import { Empty, Panel } from "../AdminUI.jsx";

/**
 * POOL-ET E NJOFTIMEVE (seksioni 11).
 *
 * Secili çast i ditës mban listën e nën-grupeve nga të cilat mund të dalë
 * meditimi i asaj dite. Zgjedhja bëhet me nën-grupe dhe jo me meditime një
 * nga një, sepse pool-i duhet të mbetet i madh: një pool i vogël do të
 * përsëriste të njëjtat meditime brenda javës.
 *
 * Ndryshimi duket menjëherë te "Meditimet e sotme" më poshtë — pikërisht ato
 * do të dërgoheshin sot.
 */
export function PoolsTab() {
  const admin = useAdminState();
  const pools = admin.pools ?? defaultPools();
  const groups = listSubGroups();
  const today = picksForDay(dayKey());

  return (
    <>
      <Panel
        title="Meditimet e sotme"
        note="Zgjedhja është e qëndrueshme brenda ditës — kjo është saktësisht ajo që do të dërgohej."
      >
        {today.map(({ slotId, meditation }) => {
          const slot = listReminderSlots().find((s) => s.id === slotId);
          return (
            <div
              key={slotId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 0",
                borderTop: `1px solid ${T.line}`,
              }}
            >
              <span style={{ color: T.sub, fontSize: 12.5, width: 62, flexShrink: 0 }}>
                {slot?.label}
              </span>
              <span style={{ color: meditation ? T.ink : T.live, fontSize: 13, fontWeight: 600 }}>
                {meditation ? meditation.title : "Pool bosh — s'ka çfarë të dërgohet"}
              </span>
            </div>
          );
        })}
      </Panel>

      {listReminderSlots().map((slot) => {
        const chosen = pools[slot.id] ?? [];
        const size = groups
          .filter((g) => chosen.includes(g.key))
          .reduce((sum, g) => sum + g.count, 0);

        return (
          <Panel
            key={slot.id}
            title={slot.label}
            note={`${chosen.length} nën-grupe · ${size} meditime në pool`}
          >
            {chosen.length === 0 && (
              <Empty>Pool bosh — asnjë njoftim nuk mund të dërgohet për këtë çast.</Empty>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {groups.map((group) => {
                const on = chosen.includes(group.key);
                return (
                  <button
                    key={group.key}
                    onClick={() => togglePoolEntry(slot.id, group.key, defaultPools())}
                    aria-pressed={on}
                    aria-label={`${group.subTheme} te ${slot.label}`}
                    className="ag-press"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      background: on ? "rgba(124,92,224,0.12)" : T.bg,
                      border: `1px solid ${on ? T.accent : T.line}`,
                      color: on ? T.accent : T.sub,
                      borderRadius: radii.pill,
                      padding: "7px 11px",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: on ? 700 : 500,
                    }}
                  >
                    {on && <Check size={11} />}
                    {group.subTheme}
                    <span style={{ color: T.faint, fontWeight: 500 }}>{group.count}</span>
                  </button>
                );
              })}
            </div>
          </Panel>
        );
      })}
    </>
  );
}
