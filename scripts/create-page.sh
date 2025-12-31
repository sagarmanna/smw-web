#!/usr/bin/env bash

PAGE_NAME="$*"

# Next.js dynamic route folder
BASE_PATH="src/app/[location]"

# kebab-case: Test Email → test-email
KEBAB=$(echo "$PAGE_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g')

# PascalCase: Test Email → TestEmail
PASCAL=$(echo "$PAGE_NAME" | sed 's/\b\(.\)/\u\1/g' | sed 's/ //g')

TARGET_DIR="$BASE_PATH/$KEBAB"

mkdir -p "$TARGET_DIR"

cat > "$TARGET_DIR/page.tsx" <<EOF
import React from 'react'

const ${PASCAL}Page = () => {
  return (
    <div>
      <h1>${PAGE_NAME}</h1>
    </div>
  )
}

export default ${PASCAL}Page
EOF

echo "✅ Created $TARGET_DIR/page.tsx"

# Add path to allowed-paths.ts at the first index
ALLOWED_PATHS_FILE="src/components/PageAccessControl/allowed-paths.ts"
NEW_PATH="/$KEBAB"

# Check if path already exists
if grep -q "'$NEW_PATH'" "$ALLOWED_PATHS_FILE" 2>/dev/null; then
    echo "⚠️  Path $NEW_PATH already exists in allowed-paths.ts"
else
    # Insert the new path at the first index (after the opening bracket)
    # Create a temporary file for cross-platform compatibility
    TEMP_DIR="${TMPDIR:-${TEMP:-/tmp}}"
    TEMP_FILE="$TEMP_DIR/allowed-paths-$$.ts"
    # Fallback to current directory if temp directory doesn't work
    [ ! -d "$TEMP_DIR" ] && TEMP_FILE="allowed-paths-$$.ts"
    
    # Read the file and insert the new path after the opening bracket line
    # Using \047 for single quote (octal escape) to avoid quote escaping issues
    awk -v new_path="$NEW_PATH" '
        /export const ALLOWED_PATHS: string\[\] = \[/ {
            print $0
            print "    \047" new_path "\047,"
            next
        }
        { print }
    ' "$ALLOWED_PATHS_FILE" > "$TEMP_FILE" && mv "$TEMP_FILE" "$ALLOWED_PATHS_FILE"
    
    echo "✅ Added $NEW_PATH to allowed-paths.ts at first index"
fi