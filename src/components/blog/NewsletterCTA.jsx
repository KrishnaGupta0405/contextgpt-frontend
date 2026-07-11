"use client";

// UI-only — not wired to an email service. Hook up the onSubmit handler
// to a real subscribe endpoint (e.g. Resend, Mailchimp, ConvertKit) before relying on this.
export default function NewsletterCTA() {
  function handleSubmit(e) {
    e.preventDefault();
  }

  return (
    <div className="my-12 rounded-2xl border border-blue-100 bg-blue-50 p-6 sm:p-8">
      <h3 className="text-lg font-bold text-slate-900">Get new posts in your inbox</h3>
      <p className="mt-1.5 text-sm text-slate-600">
        No spam. Unsubscribe anytime.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          placeholder="you@company.com"
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-400 sm:flex-1"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}
