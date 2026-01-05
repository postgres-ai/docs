#!/bin/bash
# Validate RSS and Atom feeds for XML correctness

set -e

echo "Building site to generate feeds..."
npm run build

echo ""
echo "Validating RSS/Atom feeds..."

BUILD_DIR="build"
FEEDS=("$BUILD_DIR/blog/rss.xml" "$BUILD_DIR/blog/atom.xml" "$BUILD_DIR/blog/feed.json")

EXIT_CODE=0

for feed in "${FEEDS[@]}"; do
  if [ ! -f "$feed" ]; then
    echo "❌ Feed not found: $feed"
    EXIT_CODE=1
    continue
  fi
  
  # For XML feeds (rss.xml, atom.xml), validate with xmllint
  if [[ "$feed" == *.xml ]]; then
    echo "Validating XML: $feed"
    if xmllint --noout "$feed" 2>&1; then
      echo "✅ Valid XML: $feed"
    else
      echo "❌ Invalid XML: $feed"
      echo "Showing first 50 lines around errors:"
      xmllint --noout "$feed" 2>&1 | head -20
      EXIT_CODE=1
    fi
  fi
  
  # For JSON feed, validate with jq
  if [[ "$feed" == *.json ]]; then
    echo "Validating JSON: $feed"
    if jq empty "$feed" 2>&1; then
      echo "✅ Valid JSON: $feed"
    else
      echo "❌ Invalid JSON: $feed"
      EXIT_CODE=1
    fi
  fi
done

echo ""
if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ All feeds are valid!"
else
  echo "❌ Feed validation failed!"
fi

exit $EXIT_CODE

