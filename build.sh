#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting GameStop build process..."

# 1. Clean up and recreate the dist directory
echo "🧹 Cleaning previous build..."
rm -rf dist
mkdir -p dist

# 2. Copy all root HTML pages
echo "📄 Copying HTML pages..."
cp *.html dist/

# 3. Copy static asset folders
echo "🎨 Copying assets (Style, Script, Font)..."
cp -r Style dist/
cp -r Script dist/
cp -r Font dist/

# 4. Copy IMG folder to both dist/IMG and dist/Img to prevent Linux case-sensitivity issues
echo "🖼️ Copying IMG directory to both IMG and Img casings..."
cp -r IMG dist/IMG
cp -r IMG dist/Img

# 5. Copy Bootstrap CSS & JS from node_modules so that existing HTML relative paths resolve
echo "📦 Copying Bootstrap framework dependency..."
mkdir -p dist/node_modules/bootstrap
cp -r node_modules/bootstrap/dist dist/node_modules/bootstrap/dist

echo "🎉 Build finished successfully! Ready for publishing."
