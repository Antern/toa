'use strict'

const path = require('path')

const { yaml } = require('../src/yaml')

describe('load', () => {
  it('should return object', async () => {
    const object = await yaml(path.resolve(__dirname, './yaml.yaml'))

    expect(object.foo).toEqual('bar')
  })

  it('should return array', async () => {
    const objects = await yaml.all(path.resolve(__dirname, './yaml.multi.yaml'))

    expect(objects).toStrictEqual([{ foo: 'bar' }, { baz: 1 }])
  })

  it('should throw on file read error', async () => {
    const attempt = async () => await yaml(path.resolve(__dirname, './no-file.yaml'))

    await expect(attempt).rejects.toThrow(/ENOENT/)
  })
})

describe('sync', () => {
  it('should return object', () => {
    const object = yaml.sync(path.resolve(__dirname, './yaml.yaml'))

    expect(object.foo).toEqual('bar')
  })

  it('should throw on file read error', () => {
    const attempt = () => yaml.sync(path.resolve(__dirname, './no-file.yaml'))

    expect(attempt).toThrow(/ENOENT/)
  })
})

describe('try', () => {
  it('should return object', async () => {
    const object = await yaml.try(path.resolve(__dirname, './yaml.yaml'))

    expect(object?.foo).toEqual('bar')
  })

  it('should return null on file read error', async () => {
    const object = await yaml.try(path.resolve(__dirname, './no-file.yaml'))

    expect(object).toBeNull()
  })
})

it('should dump', () => {
  expect(yaml.dump({ ok: 1 })).toBe('ok: 1\n')
})

it('should parse ', () => {
  expect(yaml.parse('{ok: {foo: 1}}')).toStrictEqual({ ok: { foo: 1 } })
})
