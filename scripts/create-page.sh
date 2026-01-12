#!/usr/bin/env bash
 
set -e  # Exit on error
set -u  # Exit on undefined variable
 
PAGE_NAME="$*"
 
# Validate input
if [ -z "$PAGE_NAME" ]; then
    echo "❌ Error: Page name is required"
    echo "Usage: yarn create:page \"Page Name\""
    exit 1
fi
 
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
 
# Validate that allowed-paths.ts exists
if [ ! -f "$ALLOWED_PATHS_FILE" ]; then
    echo "❌ Error: $ALLOWED_PATHS_FILE not found"
    exit 1
fi
 
# Check if path already exists
if grep -q "'$NEW_PATH'" "$ALLOWED_PATHS_FILE" 2>/dev/null; then
    echo "⚠️  Path $NEW_PATH already exists in allowed-paths.ts"
else
    # Create a backup before modifying
    BACKUP_FILE="${ALLOWED_PATHS_FILE}.bak"
    cp "$ALLOWED_PATHS_FILE" "$BACKUP_FILE"
   
    # Insert the new path at the first index (after the opening bracket)
    # Create a temporary file for cross-platform compatibility
    TEMP_DIR="${TMPDIR:-${TEMP:-/tmp}}"
    TEMP_FILE="$TEMP_DIR/allowed-paths-$$.ts"
    # Fallback to current directory if temp directory doesn't work
    [ ! -d "$TEMP_DIR" ] && TEMP_FILE="allowed-paths-$$.ts"
   
    # Read the file and insert the new path after the opening bracket line
    # Using \047 for single quote (octal escape) to avoid quote escaping issues
    if awk -v new_path="$NEW_PATH" '
        /export const ALLOWED_PATHS: string\[\] = \[/ {
            print $0
            print "    \047" new_path "\047,"
            next
        }
        { print }
    ' "$ALLOWED_PATHS_FILE" > "$TEMP_FILE"; then
        mv "$TEMP_FILE" "$ALLOWED_PATHS_FILE"
        rm -f "$BACKUP_FILE"  # Remove backup on success
        echo "✅ Added $NEW_PATH to allowed-paths.ts at first index"
    else
        # Restore backup on failure
        mv "$BACKUP_FILE" "$ALLOWED_PATHS_FILE"
        echo "❌ Error: Failed to update allowed-paths.ts. Backup restored."
        exit 1
    fi
fi
 