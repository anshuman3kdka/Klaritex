#!/bin/bash
# Remove SpaceVoidBackground from app/page.tsx
sed -i 's/<SpaceVoidBackground \/>/\{/* Phase 3: Background removed for Laboratory White constraint *\/\}/g' app/page.tsx
sed -i '/import { SpaceVoidBackground }/d' app/page.tsx
