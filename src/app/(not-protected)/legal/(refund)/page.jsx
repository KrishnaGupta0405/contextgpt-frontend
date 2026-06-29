import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";
export const metadata = {
  title: "ContextGPT | Refund Policy",
  description: "Read ContextGPT's refund policy — understand your rights and how to request a refund.",
  alternates: { canonical: "https://contextgpt.in/legal/refund" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "ContextGPT | Refund Policy",
    description: "Read ContextGPT's refund policy.",
    url: "https://contextgpt.in/legal/refund",
  },
};

export default function Refund() {
  return (
    <div className="bg-white ">
      <div className="bg-linear-to-b from-indigo-50/70 to-white px-4 py-4 sm:px-8 lg:px-24 sm:px-6 lg:px-8">
              <AnimatedGridPattern 
                  numSquares={10}
                  maxOpacity={0.1}
                  duration={2}
                  repeatDelay={1}
                  height={180}
                  width={180}
                  className={cn(
                    "mask-[radial-gradient(500px_circle_at_center,white,transparent)]",
                    "inset-x-0 inset-y-[-20%] h-[100%] "
                  )}
                />
                {/* Hero */}
              <div className="p-[8rem] flex justify-center items-center flex-col gap-4 ">
                <p className="text-center text-sm font-bold text-blue-600">Privacy Policy</p>
                <h1 className="text-center text-6xl">Privacy Policy</h1>
                <p className="text-center text-xl pt-4 text-gray-500">
                  By continuing to use our platform, you agree that you read the privacy policy.
                </p>
              </div>
            </div>
      <article className="prose prose-slate mx-auto max-w-3xl px-8 mb-20">
        

        <h2>1. Free Trial</h2>
        <p>
          All paid plans come with a <strong>7-day free trial</strong>. You will
          not be charged during the trial period. If you cancel before the trial
          ends, you will not be billed at all.
        </p>

        <h2>2. Monthly Plans</h2>
        <p>
          If you are on a monthly plan and wish to cancel, you can do so at any
          time from your dashboard. Your plan will remain active until the end
          of the current billing cycle, and you will not be charged again.
        </p>
        <p>
          We do <strong>not</strong> offer partial refunds for unused days on
          monthly plans. 
          {/* However, if you experience a significant service issue,
          please contact us and we will review your case on an individual basis. */}
        </p>
 
        <h2>3. Yearly Plans</h2>
        <p>
          If you are on a yearly plan and wish to cancel, you can do so at any
          time from your dashboard. Your plan will remain active until the end
          of the current billing cycle, and you will not be charged again.
        </p>
        <p>
          We do <strong>not</strong> offer partial refunds for unused days on
          yearly plans. 
          {/* However, if you experience a significant service issue,
          please contact us and we will review your case on an individual basis. */}
        </p>

        <h2>4. Plan Upgrades &amp; Proration</h2>
        <p>
          When you upgrade your plan, our system evaluates your current usage
          across all quotas to determine whether you receive a credit for your
          old plan. We measure your <strong>usage ratio</strong> — how much of
          your allotted messages and indexed pages you have consumed — and apply
          the following rules:
        </p>
        <ul>
          <li>
            <strong>Less than 25% quota used:</strong> You upgraded early,
            before extracting significant value from your current plan. You
            receive a time-based prorated credit for the remaining unused period.
          </li>
          {/* <li>
            <strong>25% – 70% quota used:</strong> You are in a neutral zone and
            have consumed a meaningful portion of your quota. No credit is
            issued; you are charged the full price of the new plan.
          </li>
          <li>
            <strong>More than 70% quota used:</strong> You have consumed the
            majority of your quota. No credit is issued; you are charged the
            full price of the new plan.
          </li> */}
          <li>
            <strong>25% or more quota used:</strong> You have consumed a meaningful portion of your quota. No credit is issued; you are charged the full price of the new plan.
          </li>
        </ul>
        <p>
          Your usage ratio is calculated as the highest consumption percentage
          across your quotas (messages sent/received and pages indexed). The
          25% threshold exists because below it, a time-based credit fairly
          compensates early upgrades without over-rewarding users who have
          already extracted substantial value from their plan.
        </p>

        <h3>Examples</h3>
        <div style={{ marginBottom: "20px" }}>
          <h4>Example 1: Early Upgrade (Less than 25% quota used) → Receive <strong>time-based prorated credit</strong> Credit</h4>
          <p>
            <strong>Your Plan:</strong> Starter ($50/month) with 4,000 messages and 8,000 pages<br />
            <strong>Upgrade To:</strong> Scale ($80/month) with 20,000 messages and 30,000 pages<br />
            <strong>Billing Period:</strong> January 1–31 (30 days)<br />
            <strong>Upgrade Date:</strong> January 10 (20 days remaining in period)
          </p>
          <p>
            <strong>Your Usage at Upgrade:</strong> 500 messages used (12.5% of 4,000), 1,000 pages indexed (12.5% of 8,000)<br />
            <strong>Usage Ratio:</strong> max(12.5%, 12.5%) = <strong>12.5%</strong> &lt; 25% ✓
          </p>
          <p>
            <strong>Result:</strong> You receive a <strong>time-based prorated credit</strong>
          </p>
          <p>
            <strong>What You Pay:</strong><br />
            • Paddle credits you ~$33 for the 20 unused days on Starter<br />
            • You pay $80 for Scale upgrade<br />
            • <strong>Your net cost this month: ~$47 instead of $80</strong>
          </p>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <h4>Example 2: Heavy Usage (25% or more quota used) → No Credit</h4>
          <p>
            <strong>Your Plan:</strong> Starter ($50/month) with 4,000 messages and 8,000 pages<br />
            <strong>Upgrade To:</strong> Scale ($80/month) with 20,000 messages and 30,000 pages<br />
            <strong>Billing Period:</strong> January 1–31 (30 days)<br />
            <strong>Upgrade Date:</strong> January 10 (20 days remaining in period)
          </p>
          <p>
            <strong>Your Usage at Upgrade:</strong> 2,000 messages used (50% of 4,000), 6,000 pages indexed (75% of 8,000)<br />
            <strong>Usage Ratio:</strong> max(50%, 75%) = <strong>75%</strong> ≥ 25% ✓
          </p>
          <p>
            <strong>Result:</strong> <strong>No time-based proration credit issued</strong> — you've already extracted substantial value from Starter
          </p>
          <p>
            <strong>What You Pay:</strong><br />
            • No credit from Starter<br />
            • You pay the full $80 for Scale upgrade<br />
            • <strong>Your cost this month: $80</strong>
          </p>
        </div>

        <p className="text-sm text-slate-400">
          Note: The plans, prices, and quotas above are illustrative examples
          only. For current plan details and pricing, please refer to your{" "}
          <a href="/billing">Billing</a> page.
        </p>

        {/* <p>
          For full details, see our{" "}
          <a href="/legal/terms">Terms &amp; Conditions</a> (Section 5: Proration
          &amp; Plan Changes).
        </p> */}

        <h2>5. Plan Downgrades</h2>
        <p>
          Downgrades take effect at the next billing period. No refund is issued
          for the current period, as you retain access to the current plan
          until current period end.
        </p>

        <h2>6. Add-Ons</h2>
        <p>
          Add-ons (e.g., extra messages, branding removal) are non-refundable
          once activated for the current billing period.
        </p>
        <p>
          Add-ons are independent of, and not contingent upon, any plan or
          subscription. An active subscription is required to make use of an
          add-on; however, should your subscription be cancelled, downgraded,
          or otherwise lapse, any unused add-on quota will remain available to
          you until the end of its own respective validity period. You may, at
          your discretion, elect to consume add-on quota (e.g., messages or
          pages) prior to consuming the quota allotted under your plan
          subscription.
        </p>

        <h2>7. How to Request a Refund</h2>
        <p>
          <strong>No refunds are allowed</strong> once a subscription has been purchased. However, you have the flexibility to manage your subscription:
        </p>
        <ul>
          <li>
            When you <strong>cancel your subscription</strong>, auto-billing will stop immediately, and no charges will occur in the next billing interval (whether monthly or yearly, depending on your subscription type).
          </li>
          <li>
            Your access to your current plan will remain active until the end of your current billing period.
          </li>
          <li>
            For questions or special circumstances, you may email us at{" "}
            <a href="mailto:billing@contextgpt.in">billing@contextgpt.in</a>, and we will review your request.
             However, refunds are generally not issued except in cases of billing errors .
          </li>
        </ul>
        {/* <p>
          For more details on subscription management and cancellation, please refer to our{" "}
          <a href="/terms">Terms &amp; Conditions</a> (Section 6: Billing &amp; Subscriptions).
        </p> */}

        <h2>8. Exceptions</h2>
        <p>
          We reserve the right to deny refund requests in cases of abuse,
          violation of our Terms &amp; Conditions, or fraudulent activity.
          refer <a href="/terms">Terms &amp; Conditions</a>
        </p>

<h2>Amendments To Terms</h2>
        <p>
          We may amend Terms at any time by posting the amended terms on this
          site. It is your responsibility to review these Terms periodically.
        </p>
        <p>
          Your continued use of the Platform following the posting of revised
          Terms means that you accept and agree to the changes. You are expected
          to check this page frequently so you are aware of any changes, as they
          are binding on you.
        </p>
        <p>
          By continuing to access or use our Service after any revisions become
          effective, you agree to be bound by the revised terms. If you do not
          agree to the new terms, you are no longer authorized to use Service.
        </p>
      </article>
    </div>
  ); 
}
