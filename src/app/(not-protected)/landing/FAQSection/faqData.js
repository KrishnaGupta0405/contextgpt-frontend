export const faqCategories = [
  {
    label: "Chatbot Training and Support",
    value: "training",
    items: [
      {
        question: "Can you embed a chatbot on multiple websites?",
        answer:
          "Yes. You can embed the same chatbot on multiple websites by copying the embed script and pasting it into each site. There's no limit on the number of domains per chatbot.",
      },
      {
        question:
          "Do you have a plan for agencies to offer chatbots to their clients?",
        answer:
          "Absolutely. We offer an agency plan that lets you white-label and resell chatbots to your clients under your own brand.",
      },
      {
        question: "Is there a free plan?",
        answer:
          "No, there is no free plan. But, you have a 7-day free trial where you can try out everything. You can also try the demo bot at:",
        link: { href: "/demo", label: "ContextGPT.in/demo" },
      },
      {
        question: "Is there a demo that I can try?",
        parts: [
          "Yes, you can ",
          { type: "link", href: "/demo", label: "ContextGPT.in/demo" },
          " directly on our website without signing up. The demo bot is trained on the <span style='font-weight:bold; color: black;'>ContextGPT.in</span> website content itself, so you can ask any questions related to ContextGPT in that demo bot and it will answer them. You can also sign up for a 7-day free trial and try out everything on your own data.",
        ],
      },
      {
        question: "Will the chatbot update when my website content changes?",
        answer: "We are working, this feature would be available soon.",
      },
      {
        question: "Can I upload files to train the chatbot?",
        answer:
          "Yes. You can upload <span class='font-mono font-medium text-black'>CSV/TXT/PDF/DOCX/PPTX/MD</span> or any other text based files to train the chatbot. Each file is converted to pages based on its content (2,500 cleaned characters = 1 page). The page limits vary based on your plan.",
      },
      {
        question: "Some of my files are larger than 10 MB. What do I do?",
        answer:
          "Please contact us on <a href='mailto:support@contextgpt.co' class='font-mono font-semibold text-black text-xs'>`support@contextgpt.co`</a>. We can figure out a way for you to upload those files.",
      },
      {
        question: "How do I add the chatbot to my website?",
        answer:
          "Each chatbot has a unique URL; embed it on your site or link directly.",
      },
      {
        question: "How do I train the chatbot?",
        answer:
          "You can train the chatbot by adding a <code class='font-mono font-bold text-black'>website link</code>, <code class='font-mono font-bold text-black'>sitemap link</code>, <code class='font-mono font-bold text-black'>YouTube videos/playlists/channels</code>, <code class='font-mono font-bold text-black'>Zendesk Help Center link</code>, <code class='font-mono font-bold text-black'>GitBook link</code>. You can just enter a URL and the chatbot will be trained on all the content present on that URL. You can also upload <code class='font-mono font-bold text-black'>CSV/TXT/PDF/DOCX/MD</code> or any other text-based files to train the chatbot.",
      },
      {
        question: "How long does the training take?",
        answer:
          "It depends on the amount of content you are training. But usually, it should be done within a few minutes.",
      },
    ],
  },
  {
    label: "Pricing",
    value: "pricing",
    items: [
      {
        question: "Can you embed a chatbot on multiple websites?",
        answer:
          "Yes, you can deploy a chatbot across as many websites as needed for your visitors.",
      },
      {
        question:
          "Do you have a plan for agencies to offer chatbots to their clients?",
        answer:
          "Yes, reach out to us via email to learn more about agency plans.",
      },
      {
        question: "Is there a free plan?",
        answer:
          "No, we don’t offer a free plan. However, you get a 7-day free trial with full access. You can also try the demo at <a href='https://contextgpt.co/demo' class='text-blue-600 hover:underline'>contextgpt.co/demo</a>.",
      },
      {
        question: "Is there a demo that I can try?",
        answer:
          "Yes, visit <a href='https://contextgpt.co/demo' class='text-blue-600 hover:underline'>contextgpt.co/demo</a> to test the demo. The chatbot there is trained on <span class='font-bold text-black'>contextgpt.co</span> itself, so you can ask anything about the platform. You can also start a 7-day free trial to test it with your own data.",
      },
      {
        question: 'What is a "page" in the context of training limits?',
        answer:
          "A “page” equals 2,500 processed characters pulled from your sources (URLs, files, docs, etc.). This standard unit lets you train your chatbot with any mix of content types. For instance, a 5,000-character file counts as 2 pages. All plans now use a page-based quota instead of separate limits for links and files.",
      },
      {
        question: "Is there a limit on number of messages that can be sent?",
        answer:
          "Yes, each plan has message limits. Refer to the pricing section for details. You can also buy add-ons to extend the limits.",
      },
      {
        question:
          "Does it work on websites that are in other languages than English?",
        answer:
          "Yes, it supports any language. Your chatbot can understand and respond in multiple languages, regardless of your website’s language.",
      },
      {
        question:
          "My company needs a custom integration or custom feature that is not yet supported by ContextGPT. What should I do?",
        answer:
          "You can opt for an enterprise plan. We’ll work with you to build custom integrations and set pricing based on your requirements.",
      },
      {
        question: "Is there a whitelabel option available for ContextGPT?",
        answer:
          "Yes, contact <a href='mailto:support@contextgpt.co' class='font-mono font-semibold text-black text-xs'>`support@contextgpt.co`</a> for whitelabel options. Pricing depends on your use case.",
      },
      {
        question:
          "In every pricing plan, the message limits are written as Upto x messages per month. What does it mean?",
        answer:
          "GPT-4.1 messages cost 10× more than GPT-4.1-mini.<br/><br/>For example, in the <strong>$129/mo Growth plan</strong>, you get <strong>10k monthly messages</strong> with <strong>GPT-4.1-mini</strong>, or <strong>1k messages</strong> with <strong>GPT-4.1</strong>. You can also mix both models.",
      },
    ],
  },
  {
    label: "Technology and Integrations",
    value: "technology-and-integrations",
    items: [
      {
        question: "Can you embed a chatbot on multiple websites?",
        answer:
          "Yes, you can deploy a chatbot across any number of websites for user interaction.",
      },
      {
        question: "Do you have API for ContextGPT?",
        answer:
          "Yes, ContextGPT offers a comprehensive API. You can explore it at <a href='https://ContextGPT.ini/docs/api-reference' class='text-blue-600 hover:underline'>ContextGPT.ini/docs/api-reference</a>. Contact us for further details.",
      },
      {
        question: "What AI models does ContextGPT use?",
        answer:
          "ContextGPT leverages industry leading models, like OpenAI's GPT-4.1, Google's Gemini, Anthropic's Claude 3.5 and more to deliver high-quality customer interactions.",
      },
      {
        question: "How do I add the chatbot to my website?",
        answer:
          "Each chatbot has a unique URL. You can embed it using our provided code or directly link to it from your dashabord.",
      },
      {
        question:
          "Can I have the ContextGPT on Facebook Messenger? Do you have Facebook Messenger Integration?",
        answer:
          "Yes, Facebook Messenger integration is available. Contact <a href='mailto:support@contextgpt.co' class='font-mono font-semibold text-black text-xs'>`support@contextgpt.co`</a> to enable it.",
      },
      {
        question:
          "Can I have the ContextGPT on Whatsapp? Do you have Whatsapp Integration?",
        answer:
          "No, WhatsApp integration is not currently supported. However, you can contact us at <a href='mailto:support@contextgpt.co' class='font-mono font-semibold text-black text-xs'>`support@contextgpt.co`</a> to discuss a custom integration plan.",
      },
      {
        question:
          "Can I have the ContextGPT on Slack? Do you have Slack Integration?",
        answer:
          "Yes, Slack integration is supported. Reach out to <a href='mailto:support@contextgpt.co' class='font-mono font-semibold text-black text-xs'>`support@contextgpt.co`</a> to get it enabled.",
      },
      {
        question:
          "How does it integrate with other chat providers like Crisp, Intercom etc?",
        answer:
          "ContextGPT supports integrations with platforms like Google Chat, Messenger, Crisp, Slack, Freshdesk, Zendesk, Zoho, Intercom, and Zapier, with more being added. Custom integrations are also available on request—contact us to discuss.",
      },
      {
        question: 'What is considered as a "message"?',
        answer:
          "Both user inputs and chatbot replies (either sent by ai or human) are counted separately. For example, one user message and one chatbot response count as two messages.",
      },
      {
        question:
          "Does it integrate with ticketing platforms like Zendesk, Intercom, Freshdesk, Hubspot etc?",
        answer:
          "Yes, but currently limited to Enterprise plans. Contact <a href='mailto:support@contextgpt.co' class='font-mono font-semibold text-black text-xs'>`support@contextgpt.co`</a> to set up a custom plan.",
      },
      {
        question:
          "Will I be able to see the chats/interactions that the users are having with my chatbots?",
        answer:
          "Yes, you get full visibility into all chatbot interactions, including complete chat history. Future updates will also provide automated insights like common queries and unanswered questions.",
      },
      {
        question: "Can I customize the chatbot?",
        answer:
          "Yes, you can fully customize the chatbot, including colors, icon, name, suggestions, and more. You can customize almost anything you see in the chatbot.",
      },
      {
        question: "Do you store the chatbot messages?",
        answer:
          "Yes, we store all user queries and chatbot responses. IP addresses are also recorded for security and analytics. This data is accessible to chatbot owners via the dashboard.",
      },
      {
        question:
          "Does it work on websites that are in other languages than English?",
        answer:
          "Yes, it supports all languages. The chatbot can understand and respond in multiple languages regardless of your website’s language.",
      },
      {
        question: "Do you use OpenAI models or your own custom model?",
        answer:
          "We use OpenAI’s GPT-4.1 models and other industry leading models to generate accurate and high-quality responses.(To check list of available models refer the settings page)",
      },
      {
        question:
          "My company needs a custom integration or custom feature that is not yet supported by ContextGPT. What should I do?",
        answer:
          "You can opt for an enterprise plan. We’ll work with you to build custom features and define pricing based on your requirements.",
      },
    ],
  },
  {
    label: "Security and Compliance",
    value: "security",
    items: [
      {
        question: "Is my data secure?",
        answer:
          "Yes. All data is encrypted in transit (TLS 1.2+) and at rest (AES-256). We never use your data to train third-party models, and you retain full ownership of your content.",
      },
      // {
      //   question: "Are you GDPR compliant?",
      //   answer:
      //     "Yes. We are fully GDPR compliant. You can request data deletion at any time, and we provide a Data Processing Agreement (DPA) for enterprise customers.",
      // },
      {
        question: "Where is my data stored?",
        answer:
          "Our system mainly runs on AWS cloud. for futher detais refer <a href='https://contextgpt.co/legal/subprocesses' class='text-blue-600 underline'>ContextGPT Subprocesses</a>",
      },
      {
        question: "Do you have a Data Processeing Agreement (DPA)?",
        answer:
          "Yes. A DPA is available for Enterprise plan customers. You can generate one at <a href='http://localhost:3000/legal/dpa' class='text-blue-600 underline'>Data Processing Agreement (DPA)</a>. Contact us at <a href='mailto:support@contextgpt.co' class='font-mono font-semibold text-black text-xs'>`support@contextgpt.co`</a> for more details.",
      },
      {
        question: "Can I delete my data?",
        answer:
          "Yes. You can delete individual training sources, entire chatbots, or your full account from the dashboard. Deletion is permanent and processed within 30 days.",
      },
      {
        question: "Do you store chatbot messages ?",
        answer:
          "Yes, we log every visitor question along with the chatbot’s responses. We also capture IP addresses for security, abuse prevention, and to provide insight into where conversations originate. All conversation history is accessible to the chatbot owner within the dashboard. For instance, if you create a chatbot using ContextGPT, you can review all user interactions directly from your dashboard.",
      },
    ],
  },
];
