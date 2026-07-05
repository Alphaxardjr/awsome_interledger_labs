# Min Connector

Min Connector is a small Interledger lab for learning how ILPv4 packets behave before bringing in the full complexity of a production system like Rafiki.

The project starts at the packet layer: create a `Prepare`, encode it into real ILP bytes, decode it back, return a `Fulfill`, validate the fulfillment against the original condition, and inspect a `Reject`.

The long-term goal is to grow this into a minimal connector model that makes forwarding, balances, expiry, liquidity, and failure handling visible in code.

## Focus

- Real ILPv4 packet encoding and decoding
- Conditions and fulfillments
- Prepare, Fulfill, and Reject flow
- Connector behavior in small pieces
- Balances, expiry, liquidity, and errors
- Mapping each concept back to Rafiki

## Stage 1: Packet Bench

The first lab demonstrates the three core ILP packet types:

- `Prepare` packet, type `12`
- `Fulfill` packet, type `13`
- `Reject` packet, type `14`

It also verifies the core security check:

```text
sha256(fulfillment) == executionCondition
```

## Mental Model

```text
Prepare goes forward: Alice -> Connector -> Bob
Fulfill goes backward: Bob -> Connector -> Alice
Reject goes backward: Bob/Connector -> Alice
```

## Running Locally

```powershell
pnpm install
pnpm stage1
```

Stage 1 does not simulate balances yet. It proves the first building block: JavaScript objects can become real ILP packet bytes, and those bytes can be decoded back into readable packet fields.
