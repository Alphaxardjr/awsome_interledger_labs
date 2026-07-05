# Awesome Interledger Labs

A public learning lab for exploring Interledger from the protocol level upward.

This repository documents my hands-on path through ILPv4, real packet encoding, fulfillment validation, connector behavior, balances, liquidity, and eventually Rafiki. The goal is to turn protocol concepts into small runnable experiments that are easy to inspect, explain, and extend.

## Projects

### Min Connector

`min_connector` is a tiny connector-focused lab. It starts with real ILP packet encoding and decoding, then grows toward a minimal connector model with Prepare, Fulfill, Reject, expiry, balances, and liquidity.

## Learning Focus

- ILPv4 packet structure
- ASN.1/OER packet encoding through real libraries
- Conditions and fulfillments
- Connector forwarding behavior
- Reject codes and failure handling
- Settlement, balances, and liquidity concepts
- Mapping small examples back to Rafiki

## Status

This is a learning repository, not a production connector. Each project is intentionally small and focused so the protocol mechanics stay visible.

