// Run: npx tsx scripts/eval-prose-quality.ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { validateChapterScenes } from "../src/lib/sceneContract";
import { scoreProseDraft } from "../src/lib/proseEditorRubric";
import { formatAgencyPack } from "../src/lib/characterProfiles";
import { styleCardPromptBlock } from "../src/lib/styleCards";

function loadJson(name: string) {
  return JSON.parse(
    readFileSync(join(process.cwd(), "scripts", "fixtures", name), "utf8")
  );
}

function main() {
  const echoFixture = loadJson("echo-fail.json");
  const passFixture = loadJson("contract-pass.json");

  const echoResult = validateChapterScenes(echoFixture.scenes);
  const passResult = validateChapterScenes(passFixture.scenes);

  const echoProse = scoreProseDraft(echoFixture.prose, {
    turn: echoFixture.scenes[0].turn,
    thesis: echoFixture.thesis,
    echoBans: echoFixture.echoBans,
  });
  const passProse = scoreProseDraft(passFixture.prose, {
    turn: passFixture.scenes[0].turn,
    thesis: passFixture.thesis,
  });

  const agency = formatAgencyPack(passFixture.characters, {
    castNames: ["Isabella"],
    povName: "Alex",
    max: 4,
  });

  const card = styleCardPromptBlock("dystopian_thriller");

  const lines = [
    `echo fixture scenes: ${echoResult.ok ? "FAIL expected fail" : "fail (good)"} ${echoResult.reason ?? ""}`,
    `diverse fixture scenes: ${passResult.ok ? "pass" : "FAIL " + (passResult.reason ?? "")}`,
    `echo fixture prose warnings: ${echoProse.warnings.join(",") || "(none)"}`,
    `diverse fixture prose warnings: ${passProse.warnings.join(",") || "(none)"}`,
    `agency pack has Isabella want: ${/Want:/.test(agency) && /Isabella/.test(agency)}`,
    `style card injected: ${card.includes("STYLE CARD")}`,
  ];
  console.log(lines.join("\n"));

  const ok =
    !echoResult.ok &&
    passResult.ok &&
    echoProse.warnings.length > 0 &&
    /Isabella/.test(agency) &&
    card.includes("STYLE CARD");
  if (!ok) {
    process.exit(1);
  }
}

main();
