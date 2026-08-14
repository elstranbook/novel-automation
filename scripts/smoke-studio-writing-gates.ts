// Run: npx tsx scripts/smoke-studio-writing-gates.ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assertChapterContracts,
  clearAllSpineApprovals,
  clearSpineApprovalsForChapter,
  hasClosedEnding,
  parseChapterScenes,
} from "../src/lib/studioWritingGates";

function loadJson(name: string) {
  return JSON.parse(
    readFileSync(join(process.cwd(), "scripts", "fixtures", name), "utf8")
  );
}

function fail(label: string, detail?: string): never {
  console.error(`FAIL ${label}${detail ? `: ${detail}` : ""}`);
  process.exit(1);
}

function main() {
  if (hasClosedEnding({ chosen_ending: "too short" })) {
    fail("short ending should not pass");
  }
  if (hasClosedEnding({ chosen_ending: "   " })) {
    fail("blank ending should not pass");
  }
  if (
    !hasClosedEnding({
      chosen_ending:
        "Alex exposes the Enclave archive and Isabella dies with the covenant, closing the bloodline lie.",
    })
  ) {
    fail("closed ending of 40+ chars should pass");
  }

  const echoFixture = loadJson("echo-fail.json");
  const encoded = echoFixture.scenes.map((scene: unknown) =>
    JSON.stringify(scene)
  );
  const echoGate = assertChapterContracts(parseChapterScenes(encoded));
  if (echoGate.ok) {
    fail("Ch1 echo fixture should fail contracts");
  }

  const approvals = {
    "0:0": true,
    "4:0": true,
    "8:0": true,
  };
  const afterChapter = clearSpineApprovalsForChapter(approvals, 0);
  if (afterChapter["0:0"] || !afterChapter["4:0"] || !afterChapter["8:0"]) {
    fail(
      "clearSpineApprovalsForChapter should drop only that chapter",
      JSON.stringify(afterChapter)
    );
  }
  const afterAll = clearAllSpineApprovals();
  if (Object.keys(afterAll).length) {
    fail("clearAllSpineApprovals should return empty object");
  }

  console.log(
    [
      "short ending: fail (good)",
      "closed ending: pass",
      `Ch1 echo fixture: fail (good) ${echoGate.reason ?? echoGate.message}`,
      "clear chapter 0 approvals: pass",
      "clear all approvals: pass",
    ].join("\n")
  );
}

main();
