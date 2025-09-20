// SubscriptionManager.cdc
// Smart contract for managing subscriptions on Flow blockchain

pub contract SubscriptionManager {
    
    // Events
    pub event SubscriptionCreated(id: UInt64, subscriber: Address, plan: String)
    pub event SubscriptionCanceled(id: UInt64, subscriber: Address)
    pub event PaymentProcessed(subscriptionId: UInt64, amount: UFix64)
    
    // Subscription structure
    pub struct Subscription {
        pub let id: UInt64
        pub let subscriber: Address
        pub let plan: String
        pub let amount: UFix64
        pub let interval: UInt64 // in seconds
        pub let startTime: UFix64
        pub var isActive: Bool
        pub var lastPayment: UFix64
        
        init(id: UInt64, subscriber: Address, plan: String, amount: UFix64, interval: UInt64) {
            self.id = id
            self.subscriber = subscriber
            self.plan = plan
            self.amount = amount
            self.interval = interval
            self.startTime = getCurrentBlock().timestamp
            self.isActive = true
            self.lastPayment = getCurrentBlock().timestamp
        }
        
        pub fun cancel() {
            self.isActive = false
        }
    }
    
    // Storage paths
    pub let SubscriptionStoragePath: StoragePath
    pub let SubscriptionPublicPath: PublicPath
    
    // Subscription counter
    pub var nextSubscriptionId: UInt64
    
    // Subscriptions mapping
    access(self) var subscriptions: {UInt64: Subscription}
    
    init() {
        self.SubscriptionStoragePath = /storage/SubscriptionManager
        self.SubscriptionPublicPath = /public/SubscriptionManager
        self.nextSubscriptionId = 1
        self.subscriptions = {}
    }
    
    // Create new subscription
    pub fun createSubscription(subscriber: Address, plan: String, amount: UFix64, interval: UInt64): UInt64 {
        let subscription = Subscription(
            id: self.nextSubscriptionId,
            subscriber: subscriber,
            plan: plan,
            amount: amount,
            interval: interval
        )
        
        self.subscriptions[self.nextSubscriptionId] = subscription
        
        emit SubscriptionCreated(
            id: self.nextSubscriptionId,
            subscriber: subscriber,
            plan: plan
        )
        
        self.nextSubscriptionId = self.nextSubscriptionId + 1
        
        return subscription.id
    }
    
    // Get subscription by ID
    pub fun getSubscription(id: UInt64): Subscription? {
        return self.subscriptions[id]
    }
    
    // Cancel subscription
    pub fun cancelSubscription(id: UInt64) {
        if let subscription = self.subscriptions[id] {
            subscription.cancel()
            emit SubscriptionCanceled(id: id, subscriber: subscription.subscriber)
        }
    }
    
    // Process payment for subscription
    pub fun processPayment(subscriptionId: UInt64) {
        if let subscription = self.subscriptions[subscriptionId] {
            if subscription.isActive {
                // Payment logic here
                emit PaymentProcessed(subscriptionId: subscriptionId, amount: subscription.amount)
            }
        }
    }
}