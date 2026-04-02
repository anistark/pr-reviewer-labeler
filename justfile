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

# Publish a new release. Reads version from package.json, prompts for title.
publish:
    #!/usr/bin/env bash
    set -euo pipefail

    # Read version from package.json
    VERSION=$(node -p "require('./package.json').version")

    if ! echo "$VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
        echo "Error: invalid version '$VERSION' in package.json"
        exit 1
    fi

    MAJOR=$(echo "$VERSION" | cut -d. -f1)

    echo "Publishing v${VERSION}..."
    echo ""

    # Prompt for release title
    read -p "Release title (enter to use 'v${VERSION}'): " TITLE
    if [ -z "$TITLE" ]; then
        TITLE="v${VERSION}"
    fi

    # Run all checks first
    just all

    # Create and push the version tag
    git tag -a "v${VERSION}" -m "Release v${VERSION}"
    git push origin "v${VERSION}"

    # Move the major version tag (e.g., v1) for rolling updates
    git tag -fa "v${MAJOR}" -m "Update v${MAJOR} tag to v${VERSION}"
    git push origin "v${MAJOR}" --force

    # Create GitHub release with auto-generated notes
    # NOTE: For the first release, use the GitHub UI to check
    # "Publish this Action to the GitHub Marketplace".
    # Subsequent releases auto-appear on the marketplace.
    gh release create "v${VERSION}" \
        --title "$TITLE" \
        --generate-notes

    echo "Published v${VERSION} as '$TITLE' (v${MAJOR} tag updated)"
