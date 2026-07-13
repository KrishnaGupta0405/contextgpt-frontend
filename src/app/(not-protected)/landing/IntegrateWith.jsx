"use client";

const integrations = [
  {
    name: "Make",
    bg: "bg-white",
    simple: false,
    iconContent: (
      <svg
        viewBox="0 0 48 48"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="24" cy="8" r="5" fill="#6d00cc" />
        <circle cx="8" cy="18" r="5" fill="#6d00cc" />
        <circle cx="40" cy="18" r="5" fill="#6d00cc" />
        <circle cx="8" cy="30" r="5" fill="#6d00cc" />
        <circle cx="40" cy="30" r="5" fill="#6d00cc" />
        <circle cx="24" cy="40" r="5" fill="#6d00cc" />
        <line x1="8" y1="18" x2="8" y2="30" stroke="#6d00cc" strokeWidth="3" />
        <line
          x1="40"
          y1="18"
          x2="40"
          y2="30"
          stroke="#6d00cc"
          strokeWidth="3"
        />
        <line x1="8" y1="18" x2="24" y2="8" stroke="#6d00cc" strokeWidth="3" />
        <line x1="40" y1="18" x2="24" y2="8" stroke="#6d00cc" strokeWidth="3" />
        <line x1="8" y1="30" x2="24" y2="40" stroke="#6d00cc" strokeWidth="3" />
        <line
          x1="40"
          y1="30"
          x2="24"
          y2="40"
          stroke="#6d00cc"
          strokeWidth="3"
        />
      </svg>
    ),
  },
  {
    name: "Zendesk Chat",
    bg: "bg-[#03363d]",
    iconContent: (
      <svg
        fill="white"
        viewBox="0 0 24 24"
        className="h-full w-full p-1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12.914 2.904V16.29L24 2.905H12.914zM0 2.906C0 5.966 2.483 8.45 5.543 8.45s5.542-2.484 5.543-5.544H0zm11.086 4.807L0 21.096h11.086V7.713zm7.37 7.84c-3.063 0-5.542 2.48-5.542 5.543H24c0-3.06-2.48-5.543-5.543-5.543z" />
      </svg>
    ),
  },
  {
    name: "Notion",
    bg: "bg-white",
    iconContent: (
      <svg
        viewBox="0 0 24 24"
        className="h-full w-full p-0.5"
        fill="black"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
      </svg>
    ),
  },
  {
    name: "Slack",
    bg: "bg-white",
    iconContent: (
      <svg
        viewBox="0 0 24 24"
        className="h-full w-full p-0.5"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"
          fill="#E01E5A"
        />
      </svg>
    ),
  },
  {
    name: "Stripe",
    bg: "bg-[#635bff]",
    iconContent: (
      <svg
        viewBox="0 0 24 24"
        className="h-full w-full p-1"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
      </svg>
    ),
  },
  {
    name: "Salesforce",
    bg: "bg-[#00a1e0]",
    iconContent: (
      <svg
        viewBox="0 0 101 70"
        className="h-full w-full p-1"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M41.8 9.2C46.2 4.5 52.3 1.7 59 1.7c8.9 0 16.7 4.9 20.9 12.2 3.6-1.6 7.6-2.5 11.8-2.5C106.3 11.4 118 23.1 118 37.7s-11.7 26.3-26.3 26.3c-1.8 0-3.5-.2-5.2-.5-3.7 6.4-10.6 10.7-18.5 10.7-3.3 0-6.4-.8-9.1-2.2C55.3 78.2 48 83 39.5 83c-9.2 0-17.1-5.3-21-13.1-1.5.3-3 .5-4.6.5C6.2 70.4 0 64.2 0 56.5s5.5-13.2 12.7-14c-.2-1-.3-2.1-.3-3.1 0-14.8 12-26.8 26.8-26.8 1 0 2.1.1 3.1.2-.2-.5-.4-2.3-.5-3.6z" />
      </svg>
    ),
  },
  {
    name: "HubSpot",
    bg: "bg-[#ff7a59]",
    iconContent: (
      <svg
        viewBox="0 0 24 24"
        className="h-full w-full p-1"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M18.164 7.931V5.085a2.198 2.198 0 0 0 1.257-1.97V3.07a2.199 2.199 0 0 0-2.199-2.199h-.044a2.199 2.199 0 0 0-2.199 2.2v.044a2.199 2.199 0 0 0 1.257 1.97v2.846a6.232 6.232 0 0 0-2.969 1.31L5.608 4.025a2.432 2.432 0 1 0-.88 1.198l9.44 5.178a6.232 6.232 0 0 0 .022 6.296l-2.754 2.754a1.95 1.95 0 1 0 1.064 1.064l2.754-2.754a6.232 6.232 0 1 0 2.91-9.83zM17.22 18.4a2.76 2.76 0 1 1 0-5.52 2.76 2.76 0 0 1 0 5.52z" />
      </svg>
    ),
  },
  {
    name: "Cal.com",
    bg: "bg-black",
    iconContent: (
      <span className="text-[11px] leading-none font-bold text-white">Cal</span>
    ),
  },
  {
    name: "Calendly",
    bg: "bg-[#006bff]",
    iconContent: (
      <svg
        viewBox="0 0 24 24"
        className="h-full w-full p-1"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 0C5.384 0 0 5.384 0 12s5.384 12 12 12 12-5.384 12-12S18.616 0 12 0zm5.707 16.253c-.424.693-.977 1.246-1.662 1.644-.685.4-1.47.6-2.353.6-.93 0-1.77-.22-2.516-.66a4.582 4.582 0 0 1-1.746-1.837c-.42-.784-.63-1.672-.63-2.663 0-1.004.215-1.9.645-2.688a4.649 4.649 0 0 1 1.784-1.845c.754-.44 1.607-.66 2.557-.66.877 0 1.658.198 2.343.594.685.396 1.24.944 1.664 1.641l-1.592.882c-.27-.432-.62-.767-1.045-1.004a2.862 2.862 0 0 0-1.414-.353c-.585 0-1.11.146-1.574.438a2.966 2.966 0 0 0-1.075 1.227c-.256.525-.384 1.13-.384 1.813 0 .674.128 1.273.384 1.796a3.01 3.01 0 0 0 1.075 1.234c.464.296.99.444 1.574.444.539 0 1.02-.118 1.444-.353.424-.235.773-.576 1.046-1.02l1.575.93z" />
      </svg>
    ),
  },
  {
    name: "Zapier",
    bg: "bg-[#ff4a00]",
    iconContent: (
      <svg
        viewBox="0 0 24 24"
        className="h-full w-full p-1"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M14.924 11.993A8.998 8.998 0 0 1 12 12.01a9.04 9.04 0 0 1-2.924-.468v.007a9.028 9.028 0 0 1-2.487-2.472l.003-.01A8.992 8.992 0 0 1 6.12 6.12l-.01-.01-.009-.461.009-.461.01-.01a8.992 8.992 0 0 1 .46-2.947l-.003-.01A9.028 9.028 0 0 1 9.067.731L9.076.74A9.04 9.04 0 0 1 12 .272a8.998 8.998 0 0 1 2.924.468l.009-.007A9.028 9.028 0 0 1 17.42 2.72l-.003.01A8.99 8.99 0 0 1 17.88 5.66l.01.009.009.461-.009.461-.01.01a8.99 8.99 0 0 1-.46 2.948l.003.01A9.028 9.028 0 0 1 14.933 12l-.009-.007zM12 7.5A4.5 4.5 0 1 0 12 16.5 4.5 4.5 0 0 0 12 7.5z" />
      </svg>
    ),
  },
  {
    // simple:true,
    // width: "110px",
    name: "Messenger",
    bg: "bg-gradient-to-tr from-blue-600 to-purple-500",
    iconContent: (
      <svg fill="white" viewBox="0 0 24 24" className="h-full w-full p-1">
        <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.488 5.513 3.82 7.23V22l3.48-1.92c1.23.344 2.535.534 3.88.534 6.242 0 10-4.145 10-9.258C23.18 6.145 18.703 2 12 2Zm1.083 12.336-2.825-3.02-5.503 3.02 6.04-6.425 2.87 3.02 5.46-3.02-6.042 6.425Z" />
      </svg>
    ),
  },
  {
    name: "Google Chat",
    bg: "bg-white",
    iconContent: (
      <svg
        viewBox="0 0 24 24"
        className="h-full w-full p-0.5"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 0H4C1.8 0 0 1.8 0 4v16l4-4h16c2.2 0 4-1.8 4-4V4c0-2.2-1.8-4-4-4z"
          fill="#1A73E8"
        />
        <circle cx="8" cy="11" r="1.5" fill="white" />
        <circle cx="12" cy="11" r="1.5" fill="white" />
        <circle cx="16" cy="11" r="1.5" fill="white" />
      </svg>
    ),
  },
  {
    simple: true,
    width: "140px",
    name: "Messenger",
    bg: "bg-gradient-to-br from-blue-600 to-purple-500",
    iconContent: (
      <svg fill="white" viewBox="0 0 24 24" className="h-full w-full p-1">
        <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.488 5.513 3.82 7.23V22l3.48-1.92c1.23.344 2.535.534 3.88.534 6.242 0 10-4.145 10-9.258C23.18 6.145 18.703 2 12 2Zm1.083 12.336-2.825-3.02-5.503 3.02 6.04-6.425 2.87 3.02 5.46-3.02-6.042 6.425Z" />
      </svg>
    ),
  },
  {
    name: "Zoho SalesIQ",
    bg: "bg-[#e42527]",
    iconContent: (
      <svg
        viewBox="0 0 100 30"
        className="h-full w-full p-1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <text
          x="2"
          y="24"
          fontFamily="Arial"
          fontWeight="bold"
          fontSize="26"
          fill="white"
        >
          zoho
        </text>
      </svg>
    ),
  },
  {
    name: "SharePoint",
    bg: "bg-[#036c70]",
    iconContent: (
      <svg
        viewBox="0 0 24 24"
        className="h-full w-full p-1"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M11.5 2a5.5 5.5 0 1 0 4.17 9.09A4.5 4.5 0 1 0 14.5 3.5a5.48 5.48 0 0 0-3-.63L11.5 2zm0 1a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zM2 14.5A4.5 4.5 0 1 0 11 14.5 4.5 4.5 0 0 0 2 14.5zm4.5-3.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm9 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
      </svg>
    ),
  },
  {
    simple: true,
    width: "130px",
    name: "SharePoint",
    bg: "bg-gradient-to-r from-yellow-400 to-orange-500",
    iconContent: (
      <svg
        viewBox="0 0 24 24"
        className="h-full w-full p-1"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M11.5 2a5.5 5.5 0 1 0 4.17 9.09A4.5 4.5 0 1 0 14.5 3.5a5.48 5.48 0 0 0-3-.63L11.5 2zm0 1a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zM2 14.5A4.5 4.5 0 1 0 11 14.5 4.5 4.5 0 0 0 2 14.5zm4.5-3.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zm9 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
      </svg>
    ),
  },
  {
    name: "GitBook",
    bg: "bg-[#3884FF]",
    iconContent: (
      <svg
        viewBox="0 0 24 24"
        className="h-full w-full p-1"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M10.802 17.77a.703.703 0 1 1-.002 1.406.703.703 0 0 1 .002-1.406m11.024-4.347a.703.703 0 1 1 .001-1.406.703.703 0 0 1-.001 1.406M8.218 19.774c-.711 0-1.286-.29-1.286-.648s.575-.648 1.286-.648c.711 0 1.286.29 1.286.648s-.575.648-1.286.648m13.771-4.383c0 .358-.575.648-1.286.648-.71 0-1.286-.29-1.286-.648s.576-.648 1.286-.648c.711 0 1.286.29 1.286.648M3.953 17.258l-.316-.678 15.629-7.26.316.679zm16.891-5.89L5.215 18.627l-.316-.679L20.528 10.69z" />
      </svg>
    ),
  },
  {
    name: "Freshchat",
    bg: "bg-[#25c16f]",
    iconContent: (
      <svg
        viewBox="0 0 24 24"
        className="h-full w-full p-1"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 6H13V6.5a1 1 0 0 1 1-1h3v3a.5.5 0 0 1-.5-.5zm-9 0V6h3a1 1 0 0 1 1 1v1.5H7.5A.5.5 0 0 1 7 8zm5 8.5h-1.5V13H11v3.5zm1.5 0V13h1.5v3.5H13zm-5-5h8v3H8v-3z" />
      </svg>
    ),
  },
  {
    name: "Confluence",
    bg: "bg-[#0052CC]",
    iconContent: (
      <svg
        viewBox="0 0 24 24"
        className="h-full w-full p-1"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M.87 18.08c-.28.45-.06 1.03.41 1.24l3.45 1.56c.46.21 1.01.02 1.26-.43.96-1.72 1.96-3.28 3.76-4.37a.55.55 0 0 0 .13-.83L7.2 12.37a.56.56 0 0 0-.85-.08C3.83 14.43 2.04 16.3.87 18.08zM23.13 5.92c.28-.45.06-1.03-.41-1.24L19.27 3.12c-.46-.21-1.01-.02-1.26.43-.96 1.72-1.96 3.28-3.76 4.37a.55.55 0 0 0-.13.83l2.71 2.91c.22.24.6.27.85.08 2.52-2.14 4.31-4.01 5.48-5.79z" />
        <path d="M11.93 8.19c-1.27 1.62-2.07 3.5-2.07 5.81 0 2.31.8 4.19 2.07 5.81.16.2.44.25.66.12l3.36-1.93c.26-.15.32-.49.14-.73-.94-1.27-1.51-2.65-1.51-4.27s.57-3 1.51-4.27c.18-.24.12-.58-.14-.73l-3.36-1.93a.51.51 0 0 0-.66.12z" />
      </svg>
    ),
  },
  {
    name: "Box",
    bg: "bg-[#0061D5]",
    iconContent: (
      <svg
        viewBox="0 0 24 24"
        className="h-full w-full p-1"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 10.238l-3.669 2.117V16.5l3.669 2.116L15.668 16.5v-4.144L12 10.238zM5.587 7.01L2 9.11v8.336l3.587 2.072V11.18l3.669-2.117-3.67-2.053zM18.413 7.01l-3.67 2.053L18.413 11.18v8.336L22 17.445V9.11l-3.587-2.1z" />
      </svg>
    ),
  },
  {
    name: "OneDrive",
    bg: "bg-[#0078D4]",
    iconContent: (
      <svg
        viewBox="0 0 24 24"
        className="h-full w-full p-1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10.5 13.5L6.75 10.5A5.25 5.25 0 0 1 17.12 9H17.25a3.75 3.75 0 0 1 .75 7.41V16.5H6.75a3 3 0 0 1-.75-5.91l4.5 2.91z"
          fill="white"
        />
        <path
          d="M14.25 13.5l3.75-3A3.75 3.75 0 0 0 10.86 9H10.5a3 3 0 0 0-3 2.41L6.75 13.5h7.5z"
          fill="white"
          opacity=".7"
        />
      </svg>
    ),
  },
  {
    name: "iCloud",
    bg: "bg-[#3478F6]",
    iconContent: (
      <svg
        viewBox="0 0 24 24"
        className="h-full w-full p-1"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M18.36 9.32A5.5 5.5 0 0 0 7.18 10.5 4 4 0 0 0 8 18.5h10.5a4.5 4.5 0 0 0 .64-8.96 5.5 5.5 0 0 0-.78-.22z" />
      </svg>
    ),
  },
  {
    name: "Crisp",
    bg: "bg-[#1972F5]",
    iconContent: (
      <svg
        viewBox="0 0 24 24"
        className="h-full w-full p-1"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2C6.477 2 2 6.253 2 11.5c0 2.7 1.15 5.14 3 6.87V22l4.05-2.16A10.52 10.52 0 0 0 12 20c5.523 0 10-4.253 10-9.5S17.523 2 12 2zm-1 13H7v-2h4v2zm6 0h-4v-2h4v2zm0-4H7V9h10v2z" />
      </svg>
    ),
  },
  {
    simple: true,
    width: "90px",
    name: "Crisp",
    bg: "bg-gradient-to-tl from-blue-600 to-cyan-400",
    iconContent: (
      <svg
        viewBox="0 0 24 24"
        className="h-full w-full p-1"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2C6.477 2 2 6.253 2 11.5c0 2.7 1.15 5.14 3 6.87V22l4.05-2.16A10.52 10.52 0 0 0 12 20c5.523 0 10-4.253 10-9.5S17.523 2 12 2zm-1 13H7v-2h4v2zm6 0h-4v-2h4v2zm0-4H7V9h10v2z" />
      </svg>
    ),
  },
  {
    name: "Google Drive",
    bg: "bg-white",
    iconContent: (
      <svg
        viewBox="0 0 24 24"
        className="h-full w-full p-0.5"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M7.71 3.5L1.15 15l3.28 5.5h6.57L4.42 9l3.29-5.5z" fill="#0066DA" />
        <path d="M16.29 3.5H7.71l3.29 5.5h8.57L16.29 3.5z" fill="#00AC47" />
        <path d="M22.85 15L16.29 3.5l-3.28 5.5L19.57 20.5l3.28-5.5z" fill="#FFBA00" />
        <path d="M4.43 20.5h15.14l3.28-5.5H7.71l-3.28 5.5z" fill="#2684FC" />
      </svg>
    ),
  },
  {
    name: "GitHub",
    bg: "bg-[#181717]",
    iconContent: (
      <svg
        viewBox="0 0 24 24"
        className="h-full w-full p-1"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.333-1.754-1.333-1.754-1.089-.744.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.235-3.22-.123-.303-.535-1.523.117-3.176 0 0 1.007-.322 3.3 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.241 2.873.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.807 5.625-5.48 5.92.43.372.814 1.102.814 2.222 0 1.606-.014 2.898-.014 3.293 0 .32.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    bg: "bg-white",
    iconContent: (
      <svg
        viewBox="0 0 24 24"
        className="h-full w-full p-0.5"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M23.5 6.2a3 3 0 0 0-2.12-2.12C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.58A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.12 2.12C4.5 20.5 12 20.5 12 20.5s7.5 0 9.38-.58a3 3 0 0 0 2.12-2.12A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8z"
          fill="#FF0000"
        />
        <path d="M9.6 15.6V8.4l6.4 3.6z" fill="white" />
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    bg: "bg-[#25D366]",
    iconContent: (
      <svg
        viewBox="0 0 24 24"
        className="h-full w-full p-1"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.02h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.14.82.84-3.06-.19-.31a8.19 8.19 0 0 1-1.26-4.35c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 8.24 8.24c0 4.55-3.7 8.23-8.25 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.17.24-.64.8-.78.97-.14.17-.29.19-.53.06-.25-.12-1.04-.38-1.99-1.22-.73-.66-1.23-1.46-1.37-1.71-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.24.25-.4.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.16 0-.43.06-.66.31s-.87.85-.87 2.07.89 2.4 1.01 2.57c.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.68-1.19.21-.58.21-1.08.14-1.19-.06-.11-.22-.17-.47-.29z" />
      </svg>
    ),
  },
  {
    name: "Intercom Chat",
    bg: "bg-[#1F8FFF]",
    iconContent: (
      <svg
        viewBox="0 0 24 24"
        className="h-full w-full p-1"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20 2H4a2 2 0 0 0-2 2v14.59A1 1 0 0 0 3.71 19.3L7 16h13a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM7 8h2v5H7V8zm4-1h2v6h-2V7zm4 2h2v4h-2V9z" />
      </svg>
    ),
  },
];

const ROW_CONFIG = [
  [50, 6],
  [0, 6],
  [100, 5],
  [2, 7],
  [80, 7],
];

function getIntegrationRows() {
  const rows = [];
  let integrationIndex = 0;

  for (const [, count] of ROW_CONFIG) {
    if (integrationIndex < integrations.length) {
      rows.push(integrations.slice(integrationIndex, integrationIndex + count));
      integrationIndex += count;
    }
  }

  return rows;
}

const integrationRows = getIntegrationRows();

function IntegrationBadge({ item }) {
  if (item.simple) {
    return (
      <div
        className={`h-10 shrink-0 rounded-full ${item.bg}`}
        style={{ width: item.width || "60px" }}
        title={item.name}
      >
        <span className="sr-only">{item.name}</span>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5">
      <div
        className={`flex h-6 w-6 items-center justify-center overflow-hidden rounded-full ${item.bg}`}
      >
        {item.iconContent}
      </div>
      <span className="text-sm font-medium whitespace-nowrap text-gray-700 dark:text-gray-200">
        {item.name}
      </span>
    </div>
  );
}

function MarqueeRow({ items, offset = 0 }) {
  return (
    <div className="overflow-hidden">
      <div className="flex w-max gap-2" style={{ marginLeft: offset }}>
        {items.map((item, i) => (
          <IntegrationBadge key={`${item.name}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function IntegrateWith() {
  return (
    <section className="py-6">
      <div className="rounded-2xl border border-gray-200 bg-white py-10">
        <div className="flex flex-col gap-32 lg:flex-row lg:items-center lg:justify-between">
          {/* Left text */}
          <div className="max-w-xs shrink-0 px-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Works with your tools
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Integrate diverse data sources to enrich your agent&apos;s
              knowledge and capabilities.
            </p>
          </div>

          {/* Right scrolling rows */}
          <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden">
            {integrationRows.map((row, index) => (
              <MarqueeRow
                key={index}
                items={row}
                offset={ROW_CONFIG[index][0]}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
