interface ParsedVersion {
  major: number
  minor: number
  patch: number
  prerelease: (string | number)[]
}

export function parseSemVer(version: string): ParsedVersion | null {
  const regex = /^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/
  const match = version.trim().match(regex)
  if (!match) return null

  const major = parseInt(match[1], 10)
  const minor = match[2] !== undefined ? parseInt(match[2], 10) : 0
  const patch = match[3] !== undefined ? parseInt(match[3], 10) : 0
  const prerelease = match[4] ? match[4].split('.').map((id) => (/^\d+$/.test(id) ? parseInt(id, 10) : id)) : []

  return { major, minor, patch, prerelease }
}

/**
 * Compare two semver strings.
 * Returns:
 *   1 if v1 > v2
 *  -1 if v1 < v2
 *   0 if v1 === v2
 */
export function compareVersions(v1: string, v2: string): number {
  if (v1 === v2) return 0
  const p1 = parseSemVer(v1)
  const p2 = parseSemVer(v2)

  if (!p1 || !p2) {
    return v1.localeCompare(v2, undefined, { numeric: true, sensitivity: 'base' })
  }

  if (p1.major !== p2.major) return p1.major > p2.major ? 1 : -1
  if (p1.minor !== p2.minor) return p1.minor > p2.minor ? 1 : -1
  if (p1.patch !== p2.patch) return p1.patch > p2.patch ? 1 : -1

  // Pre-release comparison
  if (p1.prerelease.length === 0 && p2.prerelease.length > 0) return 1
  if (p1.prerelease.length > 0 && p2.prerelease.length === 0) return -1
  if (p1.prerelease.length === 0 && p2.prerelease.length === 0) return 0

  const len = Math.max(p1.prerelease.length, p2.prerelease.length)
  for (let i = 0; i < len; i++) {
    const id1 = p1.prerelease[i]
    const id2 = p2.prerelease[i]

    if (id1 === undefined) return -1
    if (id2 === undefined) return 1
    if (id1 === id2) continue

    const isNum1 = typeof id1 === 'number'
    const isNum2 = typeof id2 === 'number'

    if (isNum1 && !isNum2) return -1
    if (!isNum1 && isNum2) return 1

    if (isNum1 && isNum2) {
      return (id1 as number) > (id2 as number) ? 1 : -1
    }

    return (id1 as string).localeCompare(id2 as string) > 0 ? 1 : -1
  }

  return 0
}
