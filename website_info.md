# ContextGPT Frontend Dashboard Structure

Based on an inspection of the file tree in the Next.js `src/app` directory, the website is separated into `(not-protected)` and `(protected)` directories. Here is a breakdown of the available routes.

## Public Pages (Indexed by Search Engines)
These pages are intended for marketing, SEO attraction, and basic information dissemination. They are primarily placed within the `(not-protected)` route group.

- `/` (Home page)
- `/aboutus` - Information about the company and team.
- `/blog` - Content marketing and updates.
- `/contact` - Contact forms and reach-out information.
- `/features` - Details about the AI chatbot features.
- `/integration` - Marketing page about platform integrations.
- `/landing` - Likely alternate landing pages.
- `/lead-generation` - Focused on AI lead generation benefits.
- `/partners` - Affiliate/Partner program details.
- `/pricing` - Subscription plans and features.
- `/privacy` - Privacy policy.
- `/refund` - Refund policy.
- `/terms` - Terms of service.

### SEO Tools Directory
A robust set of free tools to drive organic traffic:

**General Tools Section**
- `/tools` - Main tools hub.

**AI Generators**
- `/tools/ai-generators/ai-prompt-optimizer`
- `/tools/ai-generators/ai-reply-generator`
- `/tools/ai-generators/ai-saas-brand-name-generator`

**Convert to Markdown**
- `/tools/convert-to-markdown` - Main markdown tools index.
- `/tools/convert-to-markdown/convert-csv-to-markdown`
- `/tools/convert-to-markdown/convert-docx-to-markdown`
- `/tools/convert-to-markdown/convert-google-docs-to-markdown`
- `/tools/convert-to-markdown/convert-html-to-markdown`
- `/tools/convert-to-markdown/convert-json-to-markdown`
- `/tools/convert-to-markdown/convert-notion-to-markdown`
- `/tools/convert-to-markdown/convert-paste-to-markdown`
- `/tools/convert-to-markdown/convert-pdf-to-markdown`
- `/tools/convert-to-markdown/convert-rtf-to-markdown`
- `/tools/convert-to-markdown/convert-webpage-to-markdown`
- `/tools/convert-to-markdown/convert-xml-to-markdown`

**Other Tools**
- `/tools/other-tools` - Index of other diverse utilities.
- `/tools/other-tools/ai-chatbot-conversation-analysis`
- `/tools/other-tools/chatbot-roi-calculator`
- `/tools/other-tools/email-signature-generator`
- `/tools/other-tools/sitemap-finder-checker`
- `/tools/other-tools/sitemap-url-extractor`
- `/tools/other-tools/sitemap-validator`
- `/tools/other-tools/website-url-extractor`
- `/tools/other-tools/xml-sitemap-generator`

## Protected Dashboard Pages (Excluded from Search Engine Indexing)
These routes are application views meant for logged-in users and are within the `(protected)` route group. They should be blocked from web crawlers.

- `/account`
- `/appearance`
- `/auto-sync`
- `/billing` (with subroutes like `/billing/addons`)
- `/chat-history`
- `/conversation-followups`
- `/conversation-starters`
- `/custom-responses`
- `/dashboard`
- `/installation`
- `/integrations` (Note: internal dashboard integrations setup)
- `/leads`
- `/members`
- `/referral`
- `/settings`
- `/text-snippets`
- `/usage`
- `/website-files`
- `/website-links`
- `/select-chatbot`

## Action Items Executed
- Created `website_info.md` to document the found structure.
- Generated `public/sitemap.xml` covering all `(not-protected)` pages to ensure spiders index the public funnel routes and tools.
- Generated `public/robots.txt` explicitly disallowing spiders from `/dashboard` and other account-restricted routes.
- Generated `public/llm.txt` for AI crawlers emphasizing the public information.
