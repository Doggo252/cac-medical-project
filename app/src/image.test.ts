import { expect, test } from 'vitest'
import { fitWithin } from './image'

test('a big phone photo is shrunk so its longest side is the max', () => {
  expect(fitWithin(4032, 3024, 2200)).toEqual({ width: 2200, height: 1650 })
})

test('a tall photo is shrunk by its height', () => {
  expect(fitWithin(3024, 4032, 2200)).toEqual({ width: 1650, height: 2200 })
})

test('a small picture is left alone', () => {
  expect(fitWithin(800, 600, 2200)).toEqual({ width: 800, height: 600 })
})

test('a picture exactly at the max is left alone', () => {
  expect(fitWithin(2200, 1000, 2200)).toEqual({ width: 2200, height: 1000 })
})
