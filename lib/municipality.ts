// Hardcoded demo ruleset. One city is enough to make local_hint concrete and
// citeable on stage; productionizes to a per-municipality config/API later.

export interface MunicipalityRule {
  code: string;
  name: string;
  softPlasticsBin: string;
  glassStream: string;
  paperBin: string;
  bioBin: string;
  electronicsTakeBack: string;
  textileEpr: string;
  notes: string;
}

export const MUNICIPALITIES: Record<string, MunicipalityRule> = {
  munich: {
    code: "munich",
    name: "Munich (München)",
    softPlasticsBin:
      "Wertstoffinsel / yellow recycling — soft plastics & packaging (Gelber Sack is not used city-wide; use the Wertstoffinsel containers)",
    glassStream: "container glass by colour: green / brown / clear (Altglascontainer)",
    paperBin: "blue paper bin (Papiertonne)",
    bioBin: "brown organic bin (Biotonne)",
    electronicsTakeBack:
      "any electronics retailer must take back small e-waste for free under the EU WEEE / ElektroG take-back law; or the Wertstoffhof",
    textileEpr:
      "textile containers (Altkleidercontainer) or charity drop-off; EU EPR for textiles applies from 2025",
    notes:
      "Munich (AWM) separates residual, bio, paper and packaging; batteries and electronics never go in household bins (fire risk).",
  },
};

export const DEFAULT_MUNICIPALITY = "munich";

export function getMunicipality(code?: string | null): MunicipalityRule {
  return MUNICIPALITIES[code ?? DEFAULT_MUNICIPALITY] ?? MUNICIPALITIES[DEFAULT_MUNICIPALITY];
}

export function municipalityBlock(rule: MunicipalityRule): string {
  return [
    `city: ${rule.name}`,
    `soft_plastics_and_packaging: ${rule.softPlasticsBin}`,
    `glass: ${rule.glassStream}`,
    `paper: ${rule.paperBin}`,
    `bio: ${rule.bioBin}`,
    `electronics_and_batteries: ${rule.electronicsTakeBack}`,
    `textiles: ${rule.textileEpr}`,
    `notes: ${rule.notes}`,
  ].join("\n");
}
