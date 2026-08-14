export type StyleCard = {
  id: string;
  label: string;
  rhythm: string;
  dialogueDensity: string;
  avoid: string;
  exemplar: string;
};

export const STYLE_CARDS: StyleCard[] = [
  {
    id: "dystopian_thriller",
    label: "Dystopian thriller",
    rhythm: "Short clauses under pressure; longer sentences only in aftermath. Cut lyric stacks.",
    dialogueDensity: "Lean — talk advances a deal, threat, or lie. Subtext over thesis.",
    avoid: "Repeating purity/cage slogans; camera-red-lens wallpaper; naming the theme.",
    exemplar:
      "The scanner hiccuped once. Green. He kept walking, envelope flat against his ribs, and did not look up at the lens that had already looked at him.",
  },
  {
    id: "literary_suspense",
    label: "Literary suspense",
    rhythm: "Quiet precision. One concrete object carries dread. White space between blows.",
    dialogueDensity: "Sparse, loaded. What is not said does the work.",
    avoid: "Ornate weather catalogs; explaining the metaphor; stacked adjectives.",
    exemplar:
      "She left the kettle screaming. In the next room the drawer that should have been empty was not, and the photograph on top was of a house they had sold.",
  },
  {
    id: "ya_speculative",
    label: "YA speculative",
    rhythm: "Direct, kinetic, interior but not essayistic. Motion between thoughts.",
    dialogueDensity: "High — friends argue, tease, withhold. Distinct slang without parody.",
    avoid: "Adult lecture voice; worldbuilding dumps; 'I felt' labels.",
    exemplar:
      "Mara jammed the badge into her pocket before it finished buzzing. 'If they already know,' she said, 'running still buys us a street.'",
  },
];

export function getStyleCard(id: string | null | undefined): StyleCard | null {
  if (!id) return null;
  return STYLE_CARDS.find((card) => card.id === id) ?? null;
}

export function styleCardPromptBlock(id: string | null | undefined): string {
  const card = getStyleCard(id);
  if (!card) return "";
  return `STYLE CARD (${card.label}):
- Rhythm: ${card.rhythm}
- Dialogue: ${card.dialogueDensity}
- Do not: ${card.avoid}
- Match this cadence (do not copy plot):
"""
${card.exemplar}
"""`;
}
