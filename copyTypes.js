// copyTypes.mjs (or copyTypes.js if "type": "module" is set in package.json)

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

// Recreate __dirname / __filename in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Destination folder inside frontend repo
const destinationFolder = join(__dirname, 'shared/types')

// Files to copy from backend → frontend
const files = [
  {
    src: join(__dirname, '../tabulation-strapi/types/generated/contentTypes.d.ts'),
    dest: join(destinationFolder, 'contentTypes.d.ts'),
  },
  {
    src: join(__dirname, '../tabulation-strapi/types/generated/components.d.ts'),
    dest: join(destinationFolder, 'components.d.ts'),
  },
]

function copyFile({ src, dest }) {
  const destinationDir = dirname(dest)

  if (!fs.existsSync(src)) {
    console.error(`❌ Source file does not exist: ${src}`)
    process.exit(1)
  }

  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir, { recursive: true })
  }

  fs.copyFileSync(src, dest)
  console.log(`✅ Copied ${src} → ${dest}`)
}

files.forEach(copyFile)
