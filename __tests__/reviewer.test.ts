import {
  calculateWeightedLines,
  determineReviewerCount,
  getReviewerResult,
  FileChange,
} from "../src/reviewer";
import { Threshold, FileWeight } from "../src/config";

const defaultThresholds: Threshold[] = [
  { lines: 50, reviewers: 1 },
  { lines: 200, reviewers: 2 },
  { lines: 500, reviewers: 3 },
  { lines: 1000, reviewers: 4 },
];

describe("determineReviewerCount", () => {
  it("returns 1 for very small changes", () => {
    expect(determineReviewerCount(10, defaultThresholds)).toBe(1);
  });

  it("returns 1 at the first threshold boundary", () => {
    expect(determineReviewerCount(50, defaultThresholds)).toBe(1);
  });

  it("returns 2 for medium changes", () => {
    expect(determineReviewerCount(200, defaultThresholds)).toBe(2);
  });

  it("returns 3 for large changes", () => {
    expect(determineReviewerCount(500, defaultThresholds)).toBe(3);
  });

  it("returns 4 for very large changes", () => {
    expect(determineReviewerCount(1500, defaultThresholds)).toBe(4);
  });

  it("returns 1 for zero lines", () => {
    expect(determineReviewerCount(0, defaultThresholds)).toBe(1);
  });

  it("works with custom thresholds", () => {
    const custom: Threshold[] = [
      { lines: 10, reviewers: 2 },
      { lines: 100, reviewers: 5 },
    ];
    expect(determineReviewerCount(50, custom)).toBe(2);
    expect(determineReviewerCount(100, custom)).toBe(5);
  });
});

describe("calculateWeightedLines", () => {
  const files: FileChange[] = [
    { filename: "src/index.ts", additions: 50, deletions: 10 },
    { filename: "src/utils.test.ts", additions: 100, deletions: 20 },
    { filename: "README.md", additions: 30, deletions: 5 },
  ];

  it("returns correct totals with no weights", () => {
    const result = calculateWeightedLines(files, []);
    expect(result.totalLines).toBe(215);
    expect(result.weightedLines).toBe(215);
  });

  it("applies weights to matching files", () => {
    const weights: FileWeight[] = [
      { glob: "**/*.test.ts", weight: 0.5 },
      { glob: "**/*.md", weight: 0.25 },
    ];
    const result = calculateWeightedLines(files, weights);
    expect(result.totalLines).toBe(215);
    // src/index.ts: 60 * 1.0 = 60
    // src/utils.test.ts: 120 * 0.5 = 60
    // README.md: 35 * 0.25 = 9 (rounded)
    expect(result.weightedLines).toBe(60 + 60 + 9);
  });

  it("returns zero for empty file list", () => {
    const result = calculateWeightedLines([], []);
    expect(result.totalLines).toBe(0);
    expect(result.weightedLines).toBe(0);
  });

  it("applies higher weight to critical paths", () => {
    const criticalFiles: FileChange[] = [
      { filename: "src/core/auth.ts", additions: 10, deletions: 5 },
    ];
    const weights: FileWeight[] = [{ glob: "src/core/**", weight: 2.0 }];
    const result = calculateWeightedLines(criticalFiles, weights);
    expect(result.totalLines).toBe(15);
    expect(result.weightedLines).toBe(30);
  });
});

describe("getReviewerResult", () => {
  it("returns correct result without file weights", () => {
    const files: FileChange[] = [
      { filename: "src/index.ts", additions: 150, deletions: 50 },
    ];
    const result = getReviewerResult(files, defaultThresholds, [], "reviewers");
    expect(result.reviewerCount).toBe(2);
    expect(result.totalLines).toBe(200);
    expect(result.weightedLines).toBe(200);
    expect(result.label).toBe("reviewers: 2");
  });

  it("uses weighted lines when file weights are provided", () => {
    const files: FileChange[] = [
      { filename: "src/index.ts", additions: 300, deletions: 200 },
      { filename: "test/index.test.ts", additions: 200, deletions: 100 },
    ];
    const weights: FileWeight[] = [{ glob: "test/**", weight: 0.5 }];
    // Total: 800, Weighted: 500 (src) + 150 (test) = 650
    const result = getReviewerResult(
      files,
      defaultThresholds,
      weights,
      "reviewers",
    );
    expect(result.reviewerCount).toBe(3);
    expect(result.totalLines).toBe(800);
    expect(result.weightedLines).toBe(650);
  });

  it("uses custom label prefix", () => {
    const files: FileChange[] = [
      { filename: "a.ts", additions: 10, deletions: 0 },
    ];
    const result = getReviewerResult(files, defaultThresholds, [], "effort");
    expect(result.label).toBe("effort: 1");
  });
});
