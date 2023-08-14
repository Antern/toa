import { type Dependency, type Variable, type Variables } from '@toa.io/operations'
import * as schemas from '@toa.io/schemas'
import { encode, overwrite } from '@toa.io/generic'
import { type Manifest } from './manifest'
import * as validators from './schemas'
import type { context } from '@toa.io/norm'

export function deployment (instances: Instance[], annotation: Annotation): Dependency {
  validators.annotation.validate(annotation)

  const variables: Variables = {}

  for (const instance of instances) {
    const values = annotation[instance.locator.id]

    if (values === undefined) continue

    validate(instance, values)

    variables[instance.locator.label] = [{
      name: PREFIX + instance.locator.uppercase,
      value: encode(values)
    }]

    const secrets = createSecrets(values)

    variables[instance.locator.label].push(...secrets)
  }

  return { variables }
}

function createSecrets (values: object): Variable[] {
  const secrets: Variable[] = []

  for (const value of Object.values(values)) {
    if (typeof value !== 'string') continue

    const match = value.match(SECRET_RX)

    if (match === null) continue

    const name = match.groups?.variable as string

    secrets.push({
      name: PREFIX + '_' + name,
      secret: {
        name: 'toa-configuration',
        key: name
      }
    })
  }

  return secrets
}

function validate (instace: Instance, values: object): void {
  const defaults = instace.manifest.defaults ?? {}
  const configuration = overwrite(defaults, values)
  const schema = schemas.schema(instace.manifest.schema)

  schema.validate(configuration)
}

export const SECRET_RX = /^\$(?<variable>[A-Z0-9_]{1,32})$/
export const PREFIX = 'TOA_CONFIGURATION_'

export type Annotation = Record<string, object>
export type Instance = context.Dependency<Manifest>
