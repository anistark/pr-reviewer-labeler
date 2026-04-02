import { minimatch } from "minimatch";
import { Threshold, FileWeight } from "./config";

export interface FileChange {
  filename: string;
  additions: number;
  deletions: number;
}

export interface ReviewerResult {
  reviewerCount: number;
  totalLines: number;
  weightedLines: number;
  label: string;
}

export function calculateWeightedLines(
  files: FileChange[],
  fileWeights: FileWeight[],
): { totalLines: number; weightedLines: number } {
  let totalLines = 0;
  let weightedLines = 0;

  for (const file of files) {
    const fileLines = file.additions + file.deletions;
    totalLines += fileLines;

    const weight = getFileWeight(file.filename, fileWeights);
    weightedLines += Math.round(fileLines * weight);
  }

  return { totalLines, weightedLines };
}

function getFileWeight(filename: string, fileWeights: FileWeight[]): number {
  for (const fw of fileWeights) {
    if (minimatch(filename, fw.glob)) {
      return fw.weight;
    }
  }
  return 1.0;
}

export function determineReviewerCount(
  lines: number,
  thresholds: Threshold[],
): number {
  // Default to 1 reviewer for very small changes
  let reviewers = 1;

  for (const threshold of thresholds) {
    if (lines >= threshold.lines) {
      reviewers = threshold.reviewers;
    } else {
      break;
    }
  }

  return reviewers;
}

export function getReviewerResult(
  files: FileChange[],
  thresholds: Threshold[],
  fileWeights: FileWeight[],
  labelPrefix: string,
): ReviewerResult {
  const { totalLines, weightedLines } = calculateWeightedLines(
    files,
    fileWeights,
  );

  // Use weighted lines if file weights are configured, otherwise use total
  const effectiveLines = fileWeights.length > 0 ? weightedLines : totalLines;
  const reviewerCount = determineReviewerCount(effectiveLines, thresholds);

  return {
    reviewerCount,
    totalLines,
    weightedLines,
    label: `${labelPrefix}: ${reviewerCount}`,
  };
}
