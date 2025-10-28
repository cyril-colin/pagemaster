#!/bin/bash
set -e

VERSION=$(node -p -e "require('./back/package.json').version")
git commit -am "chore: release $VERSION"
git tag -a "$VERSION" -m "Release $VERSION"
git push
git push --tags