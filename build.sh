#!/bin/bash
set -e

npm --prefix ./back install
npm --prefix ./back run build

npm --prefix ./front install
npm --prefix ./front run build

VERSION=$(node -p -e "require('./back/package.json').version")
docker build -t cyrilbr/pagemaster:$VERSION -t cyrilbr/pagemaster:latest .