#!/bin/sh

echo "- running npm run build"
rm -rf dist
npm run build

echo "- cloning shutterbug.js repo into temporary dir"
git clone git@github.com:concord-consortium/shutterbug.js.git --branch gh-pages __gh-pages-tmp__

echo "- copying /dist content into temporary dir"
rsync -av --delete dist/ __gh-pages-tmp__/ --exclude=".git/"
cd __gh-pages-tmp__

echo "- committing changes in gh-pages branch"
git add --all .
git commit -m "Auto-generated build commit"

echo "- pushing gh-pages branch"
git push origin gh-pages -f
cd ..

echo "- removing temporary dir"
rm -rf __gh-pages-tmp__
