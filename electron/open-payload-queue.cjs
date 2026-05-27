function createOpenPayloadQueue(sendPayload) {
  let pendingOpenPayload = null
  let rendererReady = false

  function flushOpenPayload() {
    if (!rendererReady || !pendingOpenPayload) return false
    sendPayload(pendingOpenPayload)
    pendingOpenPayload = null
    return true
  }

  return {
    queueOpenPayload(payload) {
      pendingOpenPayload = payload
      return flushOpenPayload()
    },
    markRendererReady() {
      rendererReady = true
      return flushOpenPayload()
    },
    markRendererUnavailable() {
      rendererReady = false
    },
    getPendingOpenPayload() {
      return pendingOpenPayload
    },
  }
}

module.exports = { createOpenPayloadQueue }
