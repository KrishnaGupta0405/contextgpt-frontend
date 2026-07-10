// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  blog: create.doc("blog", {"ai-customer-support-vs-traditional-chatbots.mdx": () => import("../content/blog/ai-customer-support-vs-traditional-chatbots.mdx?collection=blog"), "chatbot-security-best-practices.mdx": () => import("../content/blog/chatbot-security-best-practices.mdx?collection=blog"), "contextgpt-vs-intercom-vs-drift.mdx": () => import("../content/blog/contextgpt-vs-intercom-vs-drift.mdx?collection=blog"), "ecommerce-chatbot-case-study.mdx": () => import("../content/blog/ecommerce-chatbot-case-study.mdx?collection=blog"), "how-to-build-ai-chatbot-for-your-website.mdx": () => import("../content/blog/how-to-build-ai-chatbot-for-your-website.mdx?collection=blog"), "lead-generation-with-ai-chatbots.mdx": () => import("../content/blog/lead-generation-with-ai-chatbots.mdx?collection=blog"), "multilingual-chatbot-support-guide.mdx": () => import("../content/blog/multilingual-chatbot-support-guide.mdx?collection=blog"), "reduce-support-tickets-with-ai.mdx": () => import("../content/blog/reduce-support-tickets-with-ai.mdx?collection=blog"), "whats-new-march-2026.mdx": () => import("../content/blog/whats-new-march-2026.mdx?collection=blog"), }),
};
export default browserCollections;