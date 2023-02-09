import * as _io from '../../../types'

declare namespace comq.features {

  type Context = {
    io: _io.IO
    reply?: any
    events?: Record<string, any>
  }

}
