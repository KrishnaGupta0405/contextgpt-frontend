import React from 'react'
// import Image from 'next/image'

const TOOLS = [
  { src: '/icons/dropbox.svg', alt: 'Dropbox' },
  { src: '/icons/freshdesk.svg', alt: 'Freshdesk' },
  { src: '/icons/gdrive.svg', alt: 'Google Drive' },
  { src: '/icons/gitbook.svg', alt: 'GitBook' },
  { src: '/icons/hubspot.svg', alt: 'HubSpot' },
  { src: '/icons/notion.svg', alt: 'Notion' },
  { src: '/icons/slack.svg', alt: 'Slack' },
]

export default function WorkWithTools() {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <p className="text-[10px] text-muted-foreground tracking-[0.3px] uppercase">
        Works with your tools
      </p>
      <div className="flex flex-wrap items-center justify-center gap-8">
        {TOOLS.map((tool) => (
          <div
            key={tool.alt}
            className=""
          >
            <img
              src={tool.src}
              alt={tool.alt}
              width={30}
              height={30}
              className="object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
