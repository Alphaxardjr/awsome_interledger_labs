import 'dotenv/config'

export const config = {
  consumerKey: process.env.KCB_CONSUMER_KEY,
  consumerSecret: process.env.KCB_CONSUMER_SECRET,
  authUrl: process.env.KCB_AUTH_URL,
  baseUrl: process.env.KCB_BASE_URL,
}