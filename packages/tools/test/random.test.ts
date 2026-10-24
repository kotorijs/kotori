import { describe, expect, test } from 'vitest'
import { random } from '../src/common/random'

describe('Tools random', () => {
  test('returns integer within range', () => {
    const val = random.int(1, 10)
    expect(val).toBeGreaterThanOrEqual(1)
    expect(val).toBeLessThanOrEqual(10)
  })

  test('picks random element from list', () => {
    const list = ['a', 'b', 'c']
    expect(list).toContain(random.choice(list))
  })

  test('shuffles list without mutating length', () => {
    const list = [1, 2, 3, 4, 5]
    const shuffled = random.shuffle(list)
    expect(shuffled).toHaveLength(5)
    expect(shuffled.sort()).toEqual(list)
  })
})
