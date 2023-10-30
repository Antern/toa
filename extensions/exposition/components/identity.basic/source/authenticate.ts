import { atob } from 'buffer'
import { compare } from 'bcryptjs'
import { type Query, type Maybe } from '@toa.io/types'
import { type Context } from './types'

export async function computation (input: string, context: Context): Promise<Maybe<Output>> {
  const [username, password] = atob(input).split(':')
  const query: Query = { criteria: `username==${username}` }
  const credentials = await context.local.observe({ query })

  if (credentials instanceof Error)
    return credentials

  if (credentials === null)
    return ERR_NOT_FOUND

  const spicy = password + context.configuration.pepper
  const match = await compare(spicy, credentials.password)

  if (match) return { identity: { id: credentials.id } }
  else return ERR_PASSWORD_MISMATCH
}

const ERR_NOT_FOUND = new Error('NOT_FOUND')
const ERR_PASSWORD_MISMATCH = new Error('PASSWORD_MISMATCH')

interface Output {
  identity: {
    id: string
  }
}
