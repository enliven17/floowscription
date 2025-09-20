// Flow blockchain configuration
import * as fcl from "@onflow/fcl"

// Configure FCL
fcl.config({
  "accessNode.api": "https://rest-testnet.onflow.org", // Testnet
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn", // Testnet
  "0xSubscriptionManager": "0x...", // Contract address will be set after deployment
})

// Transaction to create subscription
export const createSubscriptionTx = `
import SubscriptionManager from 0xSubscriptionManager

transaction(plan: String, amount: UFix64, interval: UInt64) {
  prepare(signer: AuthAccount) {
    log("Creating subscription")
  }
  
  execute {
    let subscriptionId = SubscriptionManager.createSubscription(
      subscriber: signer.address,
      plan: plan,
      amount: amount,
      interval: interval
    )
    log("Subscription created with ID: ".concat(subscriptionId.toString()))
  }
}
`

// Script to get subscription details
export const getSubscriptionScript = `
import SubscriptionManager from 0xSubscriptionManager

pub fun main(subscriptionId: UInt64): SubscriptionManager.Subscription? {
  return SubscriptionManager.getSubscription(id: subscriptionId)
}
`

// Helper functions
export const authenticate = () => fcl.authenticate()
export const unauthenticate = () => fcl.unauthenticate()
export const getCurrentUser = () => fcl.currentUser.snapshot()

export const createSubscription = async (plan, amount, interval) => {
  const transactionId = await fcl.mutate({
    cadence: createSubscriptionTx,
    args: (arg, t) => [
      arg(plan, t.String),
      arg(amount.toFixed(8), t.UFix64),
      arg(interval, t.UInt64)
    ],
    proposer: fcl.authz,
    payer: fcl.authz,
    authorizations: [fcl.authz],
    limit: 1000
  })
  
  return transactionId
}

export const getSubscription = async (subscriptionId) => {
  const subscription = await fcl.query({
    cadence: getSubscriptionScript,
    args: (arg, t) => [
      arg(subscriptionId, t.UInt64)
    ]
  })
  
  return subscription
}