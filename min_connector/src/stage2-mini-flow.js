import crypto from 'node:crypto'
import packet from 'ilp-packet'

const {
  serializeIlpPrepare,
  deserializeIlpPrepare,
  serializeIlpFulfill,
  deserializeIlpFulfill
} = packet


// Helper functions
function printStep(title) {
  console.log(`\n--- ${title} ---`)
}

function toHex(buffer) {
  return buffer.toString('hex')
}

function verifyFulfillment(fulfillment, executionCondition) {
  const calculatedCondition = crypto
    .createHash('sha256')
    .update(fulfillment)
    .digest()

  return calculatedCondition.equals(executionCondition)
}

function printPrepare(prepare) {
  console.log({
    amount: prepare.amount,
    expiresAt: prepare.expiresAt.toISOString(),
    executionCondition: toHex(prepare.executionCondition),
    destination: prepare.destination,
    data: prepare.data.toString()
  })
}

// Alice creates the secret fulfillment and puts only its hash in the Prepare.

const fulfillment = crypto.randomBytes(32)
const executionCondition = crypto
  .createHash('sha256')
  .update(fulfillment)
  .digest()

// Alice sends a Prepare packet to the connector.

const alicePrepare = {
  amount: '500',
  expiresAt: new Date(Date.now() + 30000),
  executionCondition,
  destination: 'test.bob',
  data: Buffer.from('payment from alice to bob')
}

const rawAlicePrepare = serializeIlpPrepare(alicePrepare)

printStep('Alice sends Prepare to Connector')
console.log('raw prepare:', toHex(rawAlicePrepare))

// The connector receives raw ILP bytes and decodes the Prepare.

const connectorIncomingPrepare = deserializeIlpPrepare(rawAlicePrepare)

printStep('Connector receives Prepare from Alice')
printPrepare(connectorIncomingPrepare)

printStep('Connector checks packet')
console.log('valid packet: yes')
console.log('route to destination: yes')
console.log('liquidity available: yes')

// The connector forwards a new Prepare to Bob.
// It may change amount and expiry, but keeps condition, destination, and data.

const connectorOutgoingPrepare = {
  amount: '480',
  expiresAt: new Date(connectorIncomingPrepare.expiresAt.getTime() - 5000),
  executionCondition: connectorIncomingPrepare.executionCondition,
  destination: connectorIncomingPrepare.destination,
  data: connectorIncomingPrepare.data
}

const rawConnectorPrepare = serializeIlpPrepare(connectorOutgoingPrepare)

printStep('Connector forwards Prepare to Bob')
console.log({
  originalAmount: connectorIncomingPrepare.amount,
  forwardedAmount: connectorOutgoingPrepare.amount,
  originalExpiry: connectorIncomingPrepare.expiresAt.toISOString(),
  forwardedExpiry: connectorOutgoingPrepare.expiresAt.toISOString(),
  conditionUnchanged: connectorOutgoingPrepare.executionCondition.equals(
    connectorIncomingPrepare.executionCondition
  ),
  destinationUnchanged:
    connectorOutgoingPrepare.destination === connectorIncomingPrepare.destination,
  dataUnchanged: connectorOutgoingPrepare.data.equals(
    connectorIncomingPrepare.data
  )
})
console.log('raw prepare:', toHex(rawConnectorPrepare))

// Bob receives the forwarded Prepare from the connector.

const bobIncomingPrepare = deserializeIlpPrepare(rawConnectorPrepare)

printStep('Bob receives Prepare from Connector')
printPrepare(bobIncomingPrepare)

printStep('Bob checks packet')
console.log('destination is Bob: yes')
console.log('amount is acceptable: yes')
console.log('packet is not expired: yes')

// Bob accepts and sends a Fulfill back to the connector.

const bobFulfill = {
  fulfillment,
  data: Buffer.from('bob accepted the packet')
}

const rawBobFulfill = serializeIlpFulfill(bobFulfill)

printStep('Bob sends Fulfill back to Connector')
console.log('raw fulfill:', toHex(rawBobFulfill))

// The connector verifies Bob's Fulfill before trusting it.

const connectorIncomingFulfill = deserializeIlpFulfill(rawBobFulfill)
const connectorAcceptsFulfill = verifyFulfillment(
  connectorIncomingFulfill.fulfillment,
  connectorOutgoingPrepare.executionCondition
)

printStep('Connector validates Fulfill')
console.log({
  fulfillment: toHex(connectorIncomingFulfill.fulfillment),
  data: connectorIncomingFulfill.data.toString(),
  matchesCondition: connectorAcceptsFulfill
})

if (!connectorAcceptsFulfill) {
  throw new Error('Connector rejected invalid fulfillment')
}

// The connector passes the same Fulfill back to Alice.

const rawConnectorFulfill = rawBobFulfill

printStep('Connector sends same Fulfill back to Alice')
console.log('raw fulfill:', toHex(rawConnectorFulfill))

// Alice verifies the Fulfill against her original Prepare condition.

const aliceIncomingFulfill = deserializeIlpFulfill(rawConnectorFulfill)
const aliceAcceptsFulfill = verifyFulfillment(
  aliceIncomingFulfill.fulfillment,
  alicePrepare.executionCondition
)

printStep('Alice validates Fulfill')
console.log({
  fulfillment: toHex(aliceIncomingFulfill.fulfillment),
  data: aliceIncomingFulfill.data.toString(),
  matchesOriginalCondition: aliceAcceptsFulfill
})

if (!aliceAcceptsFulfill) {
  throw new Error('Alice rejected invalid fulfillment')
}

printStep('Payment complete')
console.log('Alice -> Connector -> Bob succeeded')
