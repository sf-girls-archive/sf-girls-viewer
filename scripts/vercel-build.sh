#!/bin/bash

# Inject token into submodule URL
echo "Injecting token into submodule URL..."
git config -f .gitmodules submodule.public/sf-girls-assets.url https://$GIT_TOKEN@github.com/sf-girls-archive/sf-girls-assets.git

git submodule sync
git submodule update --init --recursive

# Setup LFS
git lfs install
cd public/sf-girls-assets
git lfs pull
cd ../../

# React build
npm install
npm run build
