import { createRequire } from 'node:module'
import { describe, expect, it, vi } from 'vitest'

type OpenPayload = {
  args: string[]
  cwd: string
}

type OpenPayloadQueue = {
  queueOpenPayload: (payload: OpenPayload) => boolean
  markRendererReady: () => boolean
  markRendererUnavailable: () => void
  getPendingOpenPayload: () => OpenPayload | null
}

const require = createRequire(import.meta.url)
const { createOpenPayloadQueue } = require('./open-payload-queue.cjs') as {
  createOpenPayloadQueue: (sendPayload: (payload: OpenPayload) => void) => OpenPayloadQueue
}

describe('createOpenPayloadQueue', () => {
  it('holds open payloads until the renderer is ready', () => {
    const send = vi.fn()
    const queue = createOpenPayloadQueue(send)
    const payload = { args: ['electron', 'app', 'D:/docs/中文 path.md'], cwd: 'D:/docs' }

    expect(queue.queueOpenPayload(payload)).toBe(false)
    expect(send).not.toHaveBeenCalled()

    expect(queue.markRendererReady()).toBe(true)
    expect(send).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith(payload)
    expect(queue.getPendingOpenPayload()).toBeNull()
  })

  it('replaces older pending payloads and sends only once', () => {
    const send = vi.fn()
    const queue = createOpenPayloadQueue(send)

    queue.queueOpenPayload({ args: ['old.md'], cwd: 'D:/old' })
    queue.queueOpenPayload({ args: ['new.md'], cwd: 'D:/new' })
    queue.markRendererReady()
    queue.markRendererReady()

    expect(send).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith({ args: ['new.md'], cwd: 'D:/new' })
  })
})
