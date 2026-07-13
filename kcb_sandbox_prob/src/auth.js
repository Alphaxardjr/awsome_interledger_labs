import { config } from "./config.js";

function requireValue(name, value) {
  if (!value) {
    throw new Error(`Missing ${name} in .env`)
  }
}

requireValue('KCB_CONSUMER_KEY', config.consumerKey)
requireValue('KCB_CONSUMER_SECRET', config.consumerSecret)
requireValue('KCB_AUTH_URL', config.authUrl)




const basicToken = Buffer.from (
    `${config.consumerKey}:${config.consumerSecret}`
).toString('base64')

const tokenUrl = `${config.authUrl}/token?grant_type=client_credentials`

const response = await fetch(tokenUrl, {
  method: 'POST',
  headers: {
    Authorization: `Basic ${basicToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

const body = await response.json()

console.log(body)