import * as core from "@actions/core";
import * as yaml from "js-yaml";

export interface Threshold {
  lines: number;
  reviewers: number;
}

export interface FileWeight {
  glob: string;
  weight: number;
}

export interface Config {
  repoToken: string;
  thresholds: Threshold[];
  addLabel: boolean;
  addComment: boolean;
  labelPrefix: string;
  fileWeights: FileWeight[];
}

export function parseThresholds(input: string): Threshold[] {
  if (!input.trim()) {
    return getDefaultThresholds();
  }

  let parsed: unknown;
  try {
    parsed = yaml.load(input);
  } catch {
    core.warning("Invalid thresholds YAML, using defaults");
    return getDefaultThresholds();
  }

  if (!Array.isArray(parsed)) {
    core.warning("Invalid thresholds format, using defaults");
    return getDefaultThresholds();
  }

  const thresholds = parsed
    .filter(
      (t) => typeof t.lines === "number" && typeof t.reviewers === "number",
    )
    .sort((a, b) => a.lines - b.lines);

  if (thresholds.length === 0) {
    core.warning("No valid thresholds found, using defaults");
    return getDefaultThresholds();
  }

  return thresholds;
}

export function parseFileWeights(input: string): FileWeight[] {
  if (!input.trim()) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = yaml.load(input);
  } catch {
    core.warning("Invalid file-weights YAML, ignoring");
    return [];
  }

  if (!Array.isArray(parsed)) {
    core.warning("Invalid file-weights format, ignoring");
    return [];
  }

  return parsed.filter(
    (w) => typeof w.glob === "string" && typeof w.weight === "number",
  );
}

export function getConfig(): Config {
  return {
    repoToken: core.getInput("repo-token", { required: true }),
    thresholds: parseThresholds(core.getInput("thresholds")),
    addLabel: core.getBooleanInput("add-label"),
    addComment: core.getBooleanInput("add-comment"),
    labelPrefix: core.getInput("label-prefix") || "reviewers",
    fileWeights: parseFileWeights(core.getInput("file-weights")),
  };
}

function getDefaultThresholds(): Threshold[] {
  return [
    { lines: 50, reviewers: 1 },
    { lines: 200, reviewers: 2 },
    { lines: 500, reviewers: 3 },
    { lines: 1000, reviewers: 4 },
  ];
}
