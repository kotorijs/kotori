import { loadConfig } from 'kotori-bot'
import { resolve } from 'node:path'
import colorMap from './color'

type RGBTuple = [number, number, number]

interface JapaneseColor {
  name: string
  romaji: string
  rgb: [number, number, number]
  hex: string
  cmyk: [number, number, number, number]
}

interface ChinaColor {
  name: string
  traName: string
  series: string
  pinyin: string
  isBright: boolean
  rgb: [number, number, number]
  hex: string
  cmyk: [number, number, number, number]
  description?: string
}

export function colorToRGB(color: string): RGBTuple | null {
  // Named Color
  const handleIndex = color.toLowerCase().trim()
  if (handleIndex in colorMap) return (colorMap as unknown as Record<string, RGBTuple>)[handleIndex]

  // Hex Color
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) {
    const hex = color.replace('#', '')
    return [
      Number.parseInt(hex.slice(0, 2), 16),
      Number.parseInt(hex.slice(2, 4), 16),
      Number.parseInt(hex.slice(4, 6), 16)
    ]
  }

  // Rgb Color
  const rgbMatch = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i)
  if (rgbMatch) {
    return [Number.parseInt(rgbMatch[1], 10), Number.parseInt(rgbMatch[2], 10), Number.parseInt(rgbMatch[3], 10)]
  }

  // Invalid Color
  return null
}

export function randomFromArray<T>(array: T[]) {
  return array[Math.floor(Math.random() * array.length)]
}

export function loadJapaneseColor() {
  return loadConfig(resolve(__dirname, '../database/jp-color.json'), 'json') as unknown as JapaneseColor[]
}

export function loadChinaColor() {
  return loadConfig(resolve(__dirname, '../database/cn-color.json'), 'json') as unknown as ChinaColor[]
}
