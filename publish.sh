#!/bin/bash
set -e


VERSION=$(node -p -e "require('./back/package.json').version")
docker push cyrilbr/pagemaster:$VERSION
docker push cyrilbr/pagemaster:latest