import { match } from '@toa.io/match'
import { Factory } from './Factory'
import { Storage } from './Storage'
import { open, rnd } from './.test/util'
import { type Entry } from './Entry'

let storage: Storage
let dir: string

const factory = new Factory()

beforeEach(() => {
  dir = '/' + rnd()
  storage = factory.createStorage('tmp://storage-test')
})

it('should be', async () => {
  expect(storage).toBeInstanceOf(Storage)
})

it('should return error if entry is not found', async () => {
  const result = await storage.get('not-found')

  match(result,
    Error, (error: Error) => expect(error.message).toBe('NOT_FOUND'))
})

describe('put', () => {
  let lenna: Entry

  beforeEach(async () => {
    const handle = await open('lenna.png')
    const stream = handle.createReadStream()

    lenna = await storage.put(dir, stream) as Entry
  })

  it('should not return error', async () => {
    expect(lenna).not.toBeInstanceOf(Error)
  })

  it('should return entry id', async () => {
    expect(lenna.id).toBeDefined()
  })

  it('should return id as checksum', async () => {
    const handle = await open('lenna.png')
    const stream = handle.createReadStream()
    const dir2 = '/' + rnd()
    const copy = await storage.put(dir2, stream) as Entry

    expect(copy.id).toBe(lenna.id)
  })

  it('should detect file type', async () => {
    expect(lenna.type).toBe('image/png')
  })

  it('should return entry', async () => {
    expect(lenna).toMatchObject({
      id: lenna.id,
      type: 'image/png',
      hidden: false,
      variants: [],
      meta: {}
    })
  })

  it('should create entry', async () => {
    const entry = await storage.get(`${dir}/${lenna.id}`)

    match(entry,
      {
        id: lenna.id,
        type: 'image/png',
        hidden: false,
        variants: [],
        meta: {}
      }, undefined)
  })

  it('should set timestamp', async () => {
    const now = Date.now()
    const entry = await storage.get(`${dir}/${lenna.id}`) as Entry

    expect(entry.created).toBeLessThanOrEqual(now)
    expect(entry.created).toBeGreaterThan(now - 100)
  })

  describe('existing entry', () => {
    it('should ', async () => {
      expect(0).toBe(1)
    })
  })
})

describe('list', () => {
  let albert: Entry
  let lenna: Entry

  beforeEach(async () => {
    const handle0 = await open('albert.jpg')
    const stream0 = handle0.createReadStream()
    const handle1 = await open('lenna.png')
    const stream1 = handle1.createReadStream()

    albert = await storage.put(dir, stream0) as Entry
    lenna = await storage.put(dir, stream1) as Entry
  })

  it('should return entries', async () => {
    const entries = await storage.list(dir)

    expect(entries).toMatchObject([
      { id: albert.id },
      { id: lenna.id }
    ])
  })

  it('should exclude hidden', async () => {
    const path = `${dir}/${lenna.id}`

    await storage.conceal(path)

    const entries = await storage.list(dir)

    expect(entries.length).toBe(1)
  })
})

describe('hidden', () => {
  let lenna: Entry

  beforeEach(async () => {
    const handle = await open('lenna.png')
    const stream = handle.createReadStream()

    lenna = await storage.put(dir, stream) as Entry
  })

  it('should set hidden', async () => {
    const path = `${dir}/${lenna.id}`

    await storage.conceal(path)

    const entry = await storage.get(path)

    match(entry,
      { hidden: true }, undefined)
  })

  it('should unhide', async () => {
    const path = `${dir}/${lenna.id}`

    await storage.conceal(path)
    await storage.reveal(path)

    const entry = await storage.get(path)

    match(entry,
      { hidden: false }, undefined)
  })
})

describe('annotate', () => {
  let lenna: Entry

  beforeEach(async () => {
    const handle = await open('lenna.png')
    const stream = handle.createReadStream()

    lenna = await storage.put(dir, stream) as Entry
  })

  it('should set meta', async () => {
    const path = `${dir}/${lenna.id}`

    await storage.annotate(path, 'foo', 'bar')

    const state0 = await storage.get(path) as Entry

    expect(state0.meta).toMatchObject({ foo: 'bar' })

    await storage.annotate(path, 'foo')

    const state1 = await storage.get(path) as Entry

    expect('foo' in state1.meta).toBe(false)
  })
})

describe('variants', () => {
  let lenna: Entry

  beforeEach(async () => {
    const handle = await open('lenna.png')
    const stream = handle.createReadStream()

    lenna = await storage.put(dir, stream) as Entry
  })

  it('should add variant', async () => {
    const handle = await open('sample.jpeg')
    const stream = handle.createReadStream()
    const path = `${dir}/${lenna.id}`

    await storage.fork(path, 'foo', stream)

    const state = await storage.get(path) as Entry

    expect(state.variants).toMatchObject([{ name: 'foo', type: 'image/jpeg' }])
  })

  it('should replace variant', async () => {
    const handle0 = await open('sample.jpeg')
    const stream0 = handle0.createReadStream()
    const handle1 = await open('sample.webp')
    const stream1 = handle1.createReadStream()
    const path = `${dir}/${lenna.id}`

    await storage.fork(path, 'foo', stream0)
    await storage.fork(path, 'foo', stream1)

    const state = await storage.get(path) as Entry

    expect(state.variants).toMatchObject([{ name: 'foo', type: 'image/webp' }])
  })
})

describe('fetch', () => {
  it('should fetch', async () => {
    expect(0).toBe(1)
  })
})

it.each(['jpeg', 'gif', 'webp', 'heic'])('should detect image/%s',
  async (type) => {
    const handle = await open('sample.' + type)
    const stream = handle.createReadStream()
    const entry = await storage.put(dir, stream) as Entry

    expect(entry.type).toBe('image/' + type)
  })

it('should return error if type doesnt match', async () => {
  const handle = await open('sample.jpeg')
  const stream = handle.createReadStream()
  const result = await storage.put(dir, stream, 'image/png')

  match(result,
    Error, (error: Error) => expect(error.message).toBe('TYPE_MISMATCH'))
})

it('should not return error if type application/octet-stream', async () => {
  const handle = await open('sample.jpeg')
  const stream = handle.createReadStream()
  const result = await storage.put(dir, stream, 'application/octet-stream')

  expect(result).not.toBeInstanceOf(Error)
  expect(result).toMatchObject({ type: 'image/jpeg' })
})
