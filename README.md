# PR Reviewer Labeler

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-PR%20Reviewer%20Labeler-blue?logo=github)](https://github.com/marketplace/actions/pr-reviewer-labeler)
[![GitHub Release](https://img.shields.io/github/v/release/anistark/pr-reviewer-labeler)](https://github.com/anistark/pr-reviewer-labeler/releases)
[![CI](https://github.com/anistark/pr-reviewer-labeler/actions/workflows/ci.yml/badge.svg)](https://github.com/anistark/pr-reviewer-labeler/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A GitHub Action that automatically labels pull requests with the ideal number of reviewers based on the size and complexity of changes.

## Features

- **Size-based reviewer recommendations** — configurable thresholds mapping lines changed to reviewer count
- **File-type weighting** — weight certain file types higher or lower (e.g., tests count less, core code counts more)
- **PR labels** — automatically applies labels like `reviewers: 2`
- **PR comments** — posts a summary table with the recommendation
- **Idempotent** — updates existing labels and comments instead of creating duplicates

## Installation

Install from the [GitHub Marketplace](https://github.com/marketplace/actions/pr-reviewer-labeler), or add directly to your workflow:

```yml
- uses: anistark/pr-reviewer-labeler@v1
```

## Quick Start

**1. Create `.github/workflows/reviewer-labeler.yml`:**

```yml
name: Reviewer Labeler
on:
  - pull_request_target

jobs:
  label:
    permissions:
      contents: read
      pull-requests: write
    runs-on: ubuntu-latest
    steps:
      - uses: anistark/pr-reviewer-labeler@v1
```

That's it! With zero configuration, it uses these defaults:

| Lines Changed | Suggested Reviewers |
|--------------|-------------------|
| < 50         | 1                 |
| 50–199       | 1                 |
| 200–499      | 2                 |
| 500–999      | 3                 |
| 1000+        | 4                 |

## Configuration

### Custom Thresholds

```yml
- uses: anistark/pr-reviewer-labeler@v1
  with:
    thresholds: |
      - lines: 30
        reviewers: 1
      - lines: 150
        reviewers: 2
      - lines: 400
        reviewers: 3
      - lines: 800
        reviewers: 4
```

### File-Type Weighting

Reduce noise from tests and docs, amplify critical paths:

```yml
- uses: anistark/pr-reviewer-labeler@v1
  with:
    file-weights: |
      - glob: "**/*.test.*"
        weight: 0.5
      - glob: "**/*.md"
        weight: 0.25
      - glob: "src/core/**"
        weight: 1.5
```

### All Inputs

| Input | Default | Description |
|-------|---------|-------------|
| `repo-token` | `${{ github.token }}` | GitHub token |
| `thresholds` | See defaults above | YAML mapping lines → reviewers |
| `add-label` | `true` | Add a label like `reviewers: 2` |
| `add-comment` | `true` | Post a comment with recommendation |
| `label-prefix` | `reviewers` | Prefix for the label (e.g., `effort`) |
| `file-weights` | (none) | YAML mapping globs → weight multipliers |

### Outputs

| Output | Description |
|--------|-------------|
| `reviewer-count` | The recommended number of reviewers |
| `total-lines` | Total lines changed (additions + deletions) |
| `weighted-lines` | Weighted lines after applying file weights |
| `label` | The label that was applied |

### Using Outputs

```yml
steps:
  - id: reviewers
    uses: anistark/pr-reviewer-labeler@v1

  - if: steps.reviewers.outputs.reviewer-count >= 3
    run: echo "This is a large PR — consider splitting it up."
```

## Pairing with actions/labeler

This action is a great companion to [actions/labeler](https://github.com/actions/labeler). While `actions/labeler` labels PRs based on **which files or branches** changed, `pr-reviewer-labeler` labels based on **how much** changed — and recommends a reviewer count accordingly.

Use them together for a complete labeling setup:

```yml
name: PR Labels
on:
  - pull_request_target

jobs:
  label:
    permissions:
      contents: read
      pull-requests: write
    runs-on: ubuntu-latest
    steps:
      # Label by file paths and branches
      - uses: actions/labeler@v6

      # Label by change size and recommend reviewers
      - uses: anistark/pr-reviewer-labeler@v1
```

| Action | Labels based on | Example labels |
|--------|----------------|---------------|
| `actions/labeler` | File paths, branch names | `frontend`, `docs`, `feature` |
| `pr-reviewer-labeler` | Lines changed, file weights | `reviewers: 2`, `reviewers: 3` |

## How It Works

1. Fetches the list of changed files in the PR via the GitHub API
2. Calculates total lines changed (additions + deletions)
3. If file weights are configured, applies weight multipliers based on glob patterns
4. Matches the (weighted) line count against the configured thresholds
5. Applies a label and/or posts a comment with the recommendation

## License

MIT - see [LICENSE](LICENSE)
