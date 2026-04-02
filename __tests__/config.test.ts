import { parseThresholds, parseFileWeights } from "../src/config";

describe("parseThresholds", () => {
  it("parses valid YAML thresholds", () => {
    const input = `
- lines: 50
  reviewers: 1
- lines: 200
  reviewers: 2
`;
    const result = parseThresholds(input);
    expect(result).toEqual([
      { lines: 50, reviewers: 1 },
      { lines: 200, reviewers: 2 },
    ]);
  });

  it("sorts thresholds by lines ascending", () => {
    const input = `
- lines: 500
  reviewers: 3
- lines: 50
  reviewers: 1
`;
    const result = parseThresholds(input);
    expect(result[0].lines).toBe(50);
    expect(result[1].lines).toBe(500);
  });

  it("returns defaults for empty input", () => {
    const result = parseThresholds("");
    expect(result.length).toBe(4);
    expect(result[0]).toEqual({ lines: 50, reviewers: 1 });
  });

  it("returns defaults for invalid YAML", () => {
    const result = parseThresholds("not: valid: yaml: array");
    expect(result.length).toBe(4);
  });

  it("filters out entries with missing fields", () => {
    const input = `
- lines: 50
  reviewers: 1
- lines: 200
- reviewers: 3
`;
    const result = parseThresholds(input);
    expect(result).toEqual([{ lines: 50, reviewers: 1 }]);
  });
});

describe("parseFileWeights", () => {
  it("parses valid file weights", () => {
    const input = `
- glob: "**/*.test.ts"
  weight: 0.5
- glob: "**/*.md"
  weight: 0.25
`;
    const result = parseFileWeights(input);
    expect(result).toEqual([
      { glob: "**/*.test.ts", weight: 0.5 },
      { glob: "**/*.md", weight: 0.25 },
    ]);
  });

  it("returns empty array for empty input", () => {
    const result = parseFileWeights("");
    expect(result).toEqual([]);
  });

  it("returns empty array for invalid YAML", () => {
    const result = parseFileWeights("not: valid: yaml");
    expect(result).toEqual([]);
  });

  it("filters out entries with missing fields", () => {
    const input = `
- glob: "**/*.ts"
  weight: 0.5
- glob: "**/*.md"
- weight: 0.25
`;
    const result = parseFileWeights(input);
    expect(result).toEqual([{ glob: "**/*.ts", weight: 0.5 }]);
  });
});
