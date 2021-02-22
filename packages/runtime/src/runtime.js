import IO from './io'

/**
 * Component lifecycle management, operations provisioning
 */
export default class Runtime {
  #operations = {}

  /**
   * @param operations {Array.<Invocation | Call>}
   */
  constructor (operations) {
    for (const operation of operations) {
      this.#operations[operation.name] = operation
    }
  }

  /**
   * Invoke operation
   * @returns {Promise<Object>}
   */
  async invoke (name) {
    if (!(name in this.#operations)) { throw new Error(`Operation '${name}' not found`) }

    const operation = this.#operations[name]

    const io = new IO()

    await operation.invoke(io)

    return io
  }
}
