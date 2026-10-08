import { T, layout } from "../../theme/tokens.js";
import { sx } from "../../theme/styles.js";
import {
  listCategories,
  listTechniques,
  techniqueFolder,
  categoryFolder,
  totalMeditations,
} from "../../services/contentRepository.js";
import { useNavigation } from "../../store/NavigationContext.jsx";
import { SectionHead } from "../../components/ui/SectionHead.jsx";
import { TechniqueGrid } from "./TechniqueGrid.jsx";
import { CategoryList } from "./CategoryList.jsx";

/**
 * Zemra e bibliotekës — dy pamjet e klasifikimit të dyfishtë.
 *
 *   Eksploro praktikat  → zgjedh një TEKNIKË, brenda saj grupohet sipas kategorive
 *   Eksploro kategoritë → zgjedh një KATEGORI, brenda saj grupohet sipas teknikave
 *
 * I njëjti meditim shfaqet në të dyja; nuk kopjohet askund.
 */
export function LibraryScreen() {
  const { openFolder } = useNavigation();

  const techniques = listTechniques();
  const categories = listCategories();

  return (
    <div style={sx.screen}>
      <div style={{ padding: `8px ${layout.gutter}px 0` }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: T.ink, margin: "0 0 8px", letterSpacing: -0.5 }}>
          Meditime
        </h2>
        <p style={{ fontSize: 15, color: T.sub, margin: 0, lineHeight: 1.5 }}>
          Praktika të udhëhequra për ndërgjegjësim, relaksim dhe transformim.
        </p>
        {/* numrat llogariten nga të dhënat, nuk shkruhen me dorë */}
        <p style={{ fontSize: 13.5, color: T.faint, margin: "8px 0 0" }}>
          {totalMeditations()} meditime · {techniques.length} teknika · {categories.length} kategori
        </p>
      </div>

      {/* ---------- PAMJA 1: sipas teknikës — grid 2-kolonësh ---------- */}
      <SectionHead title="Eksploro" accent="praktikat" hint="si bëhet" />
      <div style={{ padding: `0 ${layout.gutter}px` }}>
        <TechniqueGrid techniques={techniques} onOpen={(t) => openFolder(techniqueFolder(t.id))} />
      </div>

      {/* ---------- PAMJA 2: sipas qëllimit — listë kutish ---------- */}
      <SectionHead title="Eksploro" accent="kategoritë" hint="për çfarë qëllimi" />
      <CategoryList categories={categories} onOpen={(c) => openFolder(categoryFolder(c.id))} />

      {/*
        ⚠️  "Seri të kuruara" dhe "Zgjedhjet popullore" u hoqën nga këtu
            (kërkesë e klientes, 8 tetor 2026). Biblioteka mban tani vetëm dy
            pamjet e klasifikimit — praktikat dhe kategoritë — pra një rrugë të
            vetme hyrjeje, jo katër. Seritë e kuruara jetojnë te skeda
            "Programe", si "Meditime të kuruara".
      */}
    </div>
  );
}
