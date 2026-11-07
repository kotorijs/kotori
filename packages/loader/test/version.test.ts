import { describe, expect, test } from 'vitest'
import { compareVersions, parseSemVer } from '../src/utils/version'

describe('SemVer parser and comparator', () => {
  test('parses standard semver versions', () => {
    expect(parseSemVer('1.2.3')).toEqual({ major: 1, minor: 2, patch: 3, prerelease: [] })
    expect(parseSemVer('v1.2.3')).toEqual({ major: 1, minor: 2, patch: 3, prerelease: [] })
    expect(parseSemVer('1.8.6-beta.1')).toEqual({ major: 1, minor: 8, patch: 6, prerelease: ['beta', 1] })
    expect(parseSemVer('2.0.0-rc.2+build.123')).toEqual({ major: 2, minor: 0, patch: 0, prerelease: ['rc', 2] })
  })

  test('compares major, minor, patch correctly', () => {
    expect(compareVersions('1.8.7', '1.8.6')).toBe(1)
    expect(compareVersions('1.8.6', '1.8.6')).toBe(0)
    expect(compareVersions('1.8.5', '1.8.6')).toBe(-1)
    expect(compareVersions('2.0.0', '1.9.9')).toBe(1)
    expect(compareVersions('1.9.0', '1.8.9')).toBe(1)
    expect(compareVersions('1.8.0', '1.9.0')).toBe(-1)
  })

  test('compares pre-release versions according to semver spec', () => {
    // Release version is greater than pre-release of the same tuple
    expect(compareVersions('1.8.6', '1.8.6-beta.1')).toBe(1)
    expect(compareVersions('1.8.6-beta.1', '1.8.6')).toBe(-1)

    // Pre-release tag comparison
    expect(compareVersions('1.8.6-beta.2', '1.8.6-beta.1')).toBe(1)
    expect(compareVersions('1.8.6-beta.1', '1.8.6-alpha.9')).toBe(1)
    expect(compareVersions('1.8.6-alpha.1', '1.8.6-beta.1')).toBe(-1)

    // Higher major/minor/patch takes precedence over pre-release
    expect(compareVersions('1.8.7-beta.1', '1.8.6')).toBe(1)
    expect(compareVersions('1.8.6', '1.8.7-alpha.1')).toBe(-1)
  })
})
