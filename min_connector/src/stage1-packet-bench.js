import crypto from 'node:crypto'
import packet from 'ilp-packet'

const {
  serializeIlpPrepare,
  deserializeIlpPrepare,
  serializeIlpFulfill,
  deserializeIlpFulfill,
  serializeIlpReject,
  deserializeIlpReject
} = packet

function printSection(title) {
  console.log(`\n=== ${title} ===`)
}

function toHex(buffer) {
  return buffer.toString('hex')
}

// 1. Create the fulfillment secret and the execution condition.
// The Prepare packet carries the condition. The Fulfill packet carries the secret.

const fulfillment = crypto.randomBytes(32)
const executionCondition = crypto
  .createHash('sha256')
  .update(fulfillment)
  .digest()

// 2. Create a Prepare packet object on the sender side.

const prepare = {
  amount: '500',
  expiresAt: new Date(Date.now() + 30000),
  executionCondition,
  destination: 'test.bob',
  data: Buffer.from('hello bob')
}

// 3. Encode the Prepare object into real ILP packet bytes.

const rawPrepare = serializeIlpPrepare(prepare)

printSection('Prepare Packet')
console.log('Packet type: 12 / 0c')
console.log('Raw prepare buffer:', rawPrepare)
console.log('Raw prepare hex:', toHex(rawPrepare))

// 4. Decode the Prepare bytes back into a readable object.

const decodedPrepare = deserializeIlpPrepare(rawPrepare)

console.log('Decoded prepare:', {
  amount: decodedPrepare.amount,
  expiresAt: decodedPrepare.expiresAt.toISOString(),
  executionCondition: toHex(decodedPrepare.executionCondition),
  destination: decodedPrepare.destination,
  data: decodedPrepare.data.toString()
})

// 5. Create and encode a Fulfill packet from the receiver side.

const fulfill = {
  fulfillment,
  data: Buffer.from('accepted by bob')
}

const rawFulfill = serializeIlpFulfill(fulfill)

printSection('Fulfill Packet')
console.log('Packet type: 13 / 0d')
console.log('Raw fulfill hex:', toHex(rawFulfill))

// 6. Decode and validate the Fulfill against the Prepare condition.

const decodedFulfill = deserializeIlpFulfill(rawFulfill)
const calculatedCondition = crypto
  .createHash('sha256')
  .update(decodedFulfill.fulfillment)
  .digest()
const isValidFulfillment = calculatedCondition.equals(
  decodedPrepare.executionCondition
)

console.log('Decoded fulfill:', {
  fulfillment: toHex(decodedFulfill.fulfillment),
  data: decodedFulfill.data.toString()
})
console.log('Fulfillment matches Prepare condition:', isValidFulfillment)

// 7. Create and encode a Reject packet from a connector or receiver.

const reject = {
  code: 'T04',
  triggeredBy: 'test.connector',
  message: 'Insufficient liquidity',
  data: Buffer.from('connector cannot forward right now')
}

const rawReject = serializeIlpReject(reject)

printSection('Reject Packet')
console.log('Packet type: 14 / 0e')
console.log('Raw reject hex:', toHex(rawReject))

// 8. Decode the Reject bytes back into a readable object.

const decodedReject = deserializeIlpReject(rawReject)

console.log('Decoded reject:', {
  code: decodedReject.code,
  triggeredBy: decodedReject.triggeredBy,
  message: decodedReject.message,
  data: decodedReject.data.toString()
})
