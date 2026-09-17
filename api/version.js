import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

export default function handler(_req, res) {
  res.status(200).json({
    version: pkg.version,
    name: pkg.name
  })
}
