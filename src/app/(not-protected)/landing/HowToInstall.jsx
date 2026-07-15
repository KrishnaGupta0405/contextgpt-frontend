import React from 'react'

const HowToInstall = () => {
  const steps = [
    {
      number: '1',
      title: 'Sync training data',
      description: 'Enter your URL for ContextGPT to scan, or upload files, or drop in raw text content.',
      chatMessage: 'How do I sync my website or files as training data for my chatbot?'
    },
    {
      number: '2',
      title: 'Install on your site',
      description: 'Embed a chatbot on as many sites as you want — your marketing site, in-app, help center, or wherever.',
      chatMessage: 'How do I install ContextGPT on my website?'
    },
    {
      number: '3',
      title: 'Learn and refine',
      description: 'Use real chat history to improve your chatbot by providing feedback that allows it to improve with every interaction.',
      chatMessage: 'How can I improve my chatbot with real chat history?'
    }
  ]

  return (
    <div className="py-20">
      <h2 className="text-2xl md:text-6xl text-center mb-4">
        You're only <span className="text-blue-600">three quick steps</span> from <br/> launching your own personalized <br/> AI support chatbot.
      </h2>
      <p className="text-center text-gray-600 mb-16 text-xl">
        Get started in minutes and transform your customer support experience
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((item) => (
          <div key={item.number} className="flex flex-col">
            <div className="bg-blue-600 text-white rounded-lg w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">
              {item.number}
            </div>
            <h3
              onClick={() => window.$cgpt?.push(["do", "message:send", item.chatMessage])}
              className="text-2xl font-bold mb-3 text-gray-900 underline decoration-dotted cursor-pointer hover:text-blue-600 hover:decoration-blue-500"
            >
              {item.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HowToInstall