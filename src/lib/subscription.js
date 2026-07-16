export function hasSubscriptionAccess(subscription) {
  return subscription?.status === "active" || subscription?.status === "trialing";
}
