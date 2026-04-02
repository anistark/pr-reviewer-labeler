# PR Reviewer Labeler

# Install dependencies
install:
    pnpm install

# Format source files
format:
    pnpm exec prettier --write 'src/**/*.ts' '__tests__/**/*.ts'

# Check formatting without writing
format-check:
    pnpm exec prettier --check 'src/**/*.ts' '__tests__/**/*.ts'

# Run linter
lint:
    pnpm exec prettier --check 'src/**/*.ts' '__tests__/**/*.ts'

# Type-check without emitting
check:
    pnpm exec tsc --noEmit

# Run tests
test:
    pnpm test

# Build the dist bundle
build:
    pnpm run build

# Run all checks (format, typecheck, test, build)
all: format-check check test build

# Publish a new release. Usage: just publish 1.0.0 or just publish 1.0.0 "My release title"
publish version title="":
    #!/usr/bin/env bash
    set -euo pipefail

    # Validate version format
    if ! echo "{{version}}" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
        echo "Error: version must be semver (e.g., 1.0.0)"
        exit 1
    fi

    MAJOR=$(echo "{{version}}" | cut -d. -f1)
    TITLE="{{title}}"
    if [ -z "$TITLE" ]; then
        TITLE="v{{version}}"
    fi

    # Run all checks first
    just all

    # Create and push the version tag
    git tag -a "v{{version}}" -m "Release v{{version}}"
    git push origin "v{{version}}"

    # Move the major version tag (e.g., v1) for rolling updates
    git tag -fa "v${MAJOR}" -m "Update v${MAJOR} tag to v{{version}}"
    git push origin "v${MAJOR}" --force

    # Create GitHub release with auto-generated notes
    # NOTE: For the first release, use the GitHub UI to check
    # "Publish this Action to the GitHub Marketplace".
    # Subsequent releases auto-appear on the marketplace.
    gh release create "v{{version}}" \
        --title "$TITLE" \
        --generate-notes

    echo "Published v{{version}} as '$TITLE' (v${MAJOR} tag updated)"
