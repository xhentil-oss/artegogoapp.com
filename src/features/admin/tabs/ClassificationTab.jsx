import { useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { T, radii } from "../../../theme/tokens.js";
import { allCategories, allTechniques, listSubGroups, unclassified } from "../../../services/contentRepository.js";
import { setClassification } from "../../../services/adminStore.js";
import { useAdminState } from "../../../hooks/useAdmin.js";
import { Empty, Panel, Select, TextInput } from "../AdminUI.jsx";

/**
 * CAKTIMI TEKNIKË + KATEGORI (seksioni 11).
 *
 * Caktimi bëhet për nën-grup, jo për meditim më vete: 244 meditime do të
 * kërkonin 244 zgjedhje, ndërsa nën-grupi ("Zemra", "Gjumi") është pikërisht
 * njësia me të cilën mendon përmbajtja. Meditimet e një nën-grupi ndajnë
 * gjithnjë të njëjtën teknikë dhe kategori.
 *
 * `data/classification.js` mban caktimin automatik të prototipit; çdo
 * ndryshim këtu e mbishkruan atë dhe duket menjëherë te biblioteka.
 */
export function ClassificationTab() {
  const admin = useAdminState();
  const [query, setQuery] = useState("");

  /* Pa memoizim me qëllim: `listSubGroups()` lexon meditimet e rindërtuara
     nga mbishkrimet, ndaj një cache i varur nga `query` do të tregonte
     etiketat e vjetra sapo ndryshohej njëra. Lista ka ~43 zëra; filtrimi në
     çdo render nuk matet dot. */
  const all = listSubGroups();
  const needle = query.trim().toLowerCase();
  const groups = needle
    ? all.filter((g) => `${g.subTheme} ${g.collectionId}`.toLowerCase().includes(needle))
    : all;

  const missing = unclassified();
  const edited = Object.keys(admin.classification).length;

  return (
    <>
      <Panel
        title="Teknika dhe kategoria"
        note={`${groups.length} nën-grupe · ${edited} të ndryshuara nga ti. Ndryshimi duket menjëherë te biblioteka.`}
      >
        {missing.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 9,
              alignItems: "center",
              background: "rgba(224,169,60,0.12)",
              border: `1px solid rgba(224,169,60,0.4)`,
              borderRadius: radii.md,
              padding: "10px 12px",
              marginBottom: 12,
            }}
          >
            <AlertTriangle size={15} color={T.gold} />
            <span style={{ color: T.ink, fontSize: 12.5 }}>
              {missing.length} meditime pa etiketë — nuk shfaqen në asnjë folder.
            </span>
          </div>
        )}

        <TextInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Kërko nën-grup…"
          aria-label="Kërko nën-grup"
        />
      </Panel>

      {groups.length === 0 && <Empty>Asnjë nën-grup nuk përputhet.</Empty>}

      {groups.map((group) => {
        const changed = Boolean(admin.classification[group.key]);
        return (
          <section
            key={group.key}
            style={{
              background: T.bg,
              border: `1px solid ${changed ? T.accent : T.line}`,
              borderRadius: radii.lg,
              padding: 13,
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ color: T.ink, fontSize: 14, fontWeight: 800 }}>{group.subTheme}</span>
              <span style={{ color: T.faint, fontSize: 11.5 }}>{group.count} meditime</span>
              {changed && (
                <span
                  style={{
                    marginLeft: "auto",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                    color: T.accent,
                    fontSize: 10.5,
                    fontWeight: 800,
                  }}
                >
                  <Check size={11} /> NDRYSHUAR
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <Select
                value={group.techniqueId}
                onChange={(e) => setClassification(group.key, { techniqueId: e.target.value })}
                options={allTechniques()}
                placeholder="Teknika…"
                aria-label={`Teknika për ${group.subTheme}`}
              />
              <Select
                value={group.categoryId}
                onChange={(e) => setClassification(group.key, { categoryId: e.target.value })}
                options={allCategories()}
                placeholder="Kategoria…"
                aria-label={`Kategoria për ${group.subTheme}`}
              />
            </div>
          </section>
        );
      })}
    </>
  );
}
