import { ConsumeMessage, Options } from 'amqplib'

declare namespace comq {

  namespace channels {

    type consumer = (message: ConsumeMessage) => void | Promise<void>

  }

  interface Channel {
    consume(queue: string, persistent: boolean, consumer: channels.consumer): Promise<void>

    subscribe(exchange: string, queue: string, consumer: channels.consumer): Promise<void>

    deliver(queue: string, buffer: Buffer, properties?: Options.Publish): Promise<void>

    send(queue: string, buffer: Buffer, properties?: Options.Publish): Promise<void>

    publish(exchange: string, buffer: Buffer, properties?: Options.Publish): Promise<void>

    close(): Promise<void>
  }

}

export type Channel = comq.Channel
