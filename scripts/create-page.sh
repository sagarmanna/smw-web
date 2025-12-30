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
