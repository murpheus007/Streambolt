import { useState } from 'react'
import { Helmet } from 'react-helmet-async'

const TELEGRAM_BOT_URL =
  import.meta.env.VITE_TELEGRAM_BOT_URL || 'https://t.me/your_bot_username'

const updates = [
  'Apr 06: Added dev support and feedback',
  'Apr 05: Official launch',
  'Apr 04: Ideation and development phase'
]

const faqs = [
  {
    question: 'Which sites are supported?',
    answer:
      'StreamBolt supports Facebook, YouTube, Instagram, TikTok, X, Vimeo, and many other public social media links.'
  },
  {
    question: 'Do I need to create an account?',
    answer:
      'No. Paste your link and the download will begin right away.'
  },
  {
    question: 'How does downloading work?',
    answer:
      'Paste a supported link, click download, and StreamBolt sends the request directly to the downloader.'
  },
  {
    question: 'Can I use the Telegram bot on mobile?',
    answer:
      'Yes. The Telegram bot is linked in the footer and works well for quick mobile downloads under 50MB.'
  }
]

const supportedPlatforms = [
  { name: 'Facebook', icon: FacebookIcon, colorClass: 'text-[#1877F2]' },
  { name: 'YouTube', icon: YouTubeIcon, colorClass: 'text-[#FF0000]' },
  { name: 'Instagram', icon: InstagramIcon, colorClass: 'text-[#E4405F]' },
  { name: 'TikTok', icon: TikTokIcon, colorClass: 'text-[#111111]' },
  { name: 'X / Twitter', icon: XIcon, colorClass: 'text-[#111111]' },
  { name: 'Vimeo', icon: VimeoIcon, colorClass: 'text-[#1AB7EA]' }
]

function App() {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackStatus, setFeedbackStatus] = useState('')

  const trimmedUrl = url.trim()
  const downloadUrl = trimmedUrl
    ? `/api/download?url=${encodeURIComponent(trimmedUrl)}`
    : '#'

  function handlePrepare() {
    if (!trimmedUrl) {
      setError('Paste a social media video link to continue.')
      return
    }

    setError('')
    window.location.href = downloadUrl
  }

  async function handleFeedbackSubmit(event) {
    event.preventDefault()

    const message = feedbackMessage.trim()

    if (!message) {
      setFeedbackStatus('Write a quick message before sending feedback.')
      return
    }

    try {
      await navigator.clipboard.writeText(message)
      setFeedbackStatus(
        'Your message was copied. Telegram opened in a new tab so you can paste it to the dev.'
      )
    } catch {
      setFeedbackStatus(
        'Telegram opened in a new tab. Copy your message manually if clipboard access was blocked.'
      )
    }

    window.open(TELEGRAM_BOT_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <Helmet>
        <title>Social Media Video Downloader | StreamBolt</title>
        <meta
          name="description"
          content="StreamBolt is a social media video downloader for Facebook, YouTube, Instagram, TikTok, X, Vimeo, and more. Paste a link and start your download in seconds."
        />
        <meta
          name="keywords"
          content="social media video downloader, video downloader, facebook downloader, instagram downloader, tiktok downloader, youtube downloader"
        />
        <meta property="og:title" content="Social Media Video Downloader | StreamBolt" />
        <meta
          property="og:description"
          content="Download videos from major social media platforms with StreamBolt."
        />
        <meta name="twitter:title" content="Social Media Video Downloader | StreamBolt" />
        <meta
          name="twitter:description"
          content="Download videos from Facebook, YouTube, Instagram, TikTok, X, Vimeo, and more."
        />
      </Helmet>

      <div className="min-h-screen bg-stone-100 text-slate-900">
        <header className="fixed inset-x-0 top-0 z-40 border-b border-emerald-950 bg-emerald-800">
          <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <a href="#top" className="text-xl font-bold tracking-tight text-white">
              StreamBolt
            </a>

            <div className="flex items-center gap-5 text-sm font-medium text-white">
              <a href="#updates" className="transition hover:text-emerald-100">
                Updates
              </a>
              <a href="#faq" className="transition hover:text-emerald-100">
                FAQ
              </a>
              <a href="#feedback" className="transition hover:text-emerald-100">
                Feedback
              </a>
            </div>
          </nav>
        </header>

        <main
          id="top"
          className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-8 pt-24 sm:px-6 lg:px-8"
        >
          <section className="px-6 py-16 text-center sm:px-10">
            <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              Download videos from Facebook, YouTube, Instagram, TikTok, X, Vimeo, and more
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Paste a social media link below and StreamBolt will start your download right away.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 border-y border-stone-200 py-4">
              {supportedPlatforms.map((platform) => (
                <PlatformPill key={platform.name} {...platform} />
              ))}
            </div>

            <div className="mx-auto mt-8 max-w-4xl">
              <div className="flex w-full items-stretch">
                <label className="sr-only" htmlFor="video-url">
                  Video URL
                </label>
                <input
                  id="video-url"
                  type="url"
                  inputMode="url"
                  placeholder="Paste your video link here"
                  className="min-h-16 min-w-0 flex-1 border border-stone-400 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-emerald-800 rounded-none"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                />
                <button
                  type="button"
                  onClick={handlePrepare}
                  className="min-h-16 shrink-0 border border-l-0 border-emerald-800 bg-emerald-800 px-5 text-base font-semibold text-white transition hover:bg-emerald-700 rounded-none sm:px-8"
                >
                  Download
                </button>
              </div>

              <p className="mt-3 text-center text-sm text-slate-500">
                Download starts immediately.
              </p>

              {error ? (
                <p className="mt-3 border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700">
                  {error}
                </p>
              ) : null}
            </div>
          </section>

          <section
            id="updates"
            className="mt-8 border border-stone-200 bg-stone-50 px-6 py-10 sm:px-10"
          >
            <h2 className="text-2xl font-bold text-slate-950">Dev Updates</h2>
            <ul className="mt-6 divide-y divide-stone-200 border-y border-stone-200">
              {updates.map((item) => (
                <li key={item} className="py-4 text-sm text-slate-700 sm:text-base">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section id="faq" className="mt-8 border border-stone-200 bg-white px-6 py-10 sm:px-10">
            <h2 className="text-2xl font-bold text-slate-950">FAQ</h2>
            <div className="mt-6 border-y border-stone-200">
              {faqs.map((item) => (
                <details key={item.question} className="border-b border-stone-200 last:border-b-0">
                  <summary className="cursor-pointer list-none px-0 py-4 text-left text-base font-semibold text-slate-900">
                    {item.question}
                  </summary>
                  <p className="pb-4 pr-2 text-sm leading-7 text-slate-600 sm:text-base">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <section
            id="feedback"
            className="mt-8 border border-stone-200 bg-white px-6 py-10 sm:px-10"
          >
            <h2 className="text-2xl font-bold text-slate-950">Feedback</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Send a note to the dev if something broke, a platform changed, or you want to suggest a feature.
            </p>

            <form onSubmit={handleFeedbackSubmit} className="mt-6">
              <label className="sr-only" htmlFor="feedback-message">
                Your feedback
              </label>
              <textarea
                id="feedback-message"
                rows="6"
                value={feedbackMessage}
                onChange={(event) => setFeedbackMessage(event.target.value)}
                placeholder="Write your message here"
                className="w-full border border-stone-300 bg-stone-50 px-4 py-4 text-base text-slate-900 outline-none transition focus:border-emerald-500 rounded-none"
              />

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  className="border border-emerald-950 bg-emerald-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 rounded-none"
                >
                  Send Feedback
                </button>

                {feedbackStatus ? (
                  <p className="text-sm text-slate-600">{feedbackStatus}</p>
                ) : null}
              </div>
            </form>
          </section>

          <footer className="mt-8 border border-emerald-950 bg-emerald-800 px-6 py-6 text-white sm:px-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm sm:text-base">Made with love by Morphis</p>
              <a
                href={TELEGRAM_BOT_URL}
                target="_blank"
                rel="noreferrer"
                className="border border-white px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 rounded-none"
              >
                Open Telegram Bot
              </a>
            </div>
          </footer>
        </main>
      </div>
    </>
  )
}

function PlatformPill({ colorClass, icon, name }) {
  return (
    <div className="inline-flex items-center gap-2 px-1 py-2 rounded-none">
      <span className={`flex h-7 w-7 items-center justify-center ${colorClass}`}>
        {icon()}
      </span>
      <span className="text-sm font-medium text-slate-700">{name}</span>
    </div>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M13.5 21v-7h2.3l.4-3h-2.7V9.2c0-.9.2-1.5 1.5-1.5H16V5.1c-.6-.1-1.4-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.9V11H7.8v3h2.3v7h3.4Z" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M21.6 8.2a2.9 2.9 0 0 0-2-2C17.9 5.7 12 5.7 12 5.7s-5.9 0-7.6.5a2.9 2.9 0 0 0-2 2C2 9.9 2 12 2 12s0 2.1.4 3.8a2.9 2.9 0 0 0 2 2c1.7.5 7.6.5 7.6.5s5.9 0 7.6-.5a2.9 2.9 0 0 0 2-2c.4-1.7.4-3.8.4-3.8s0-2.1-.4-3.8ZM10 15.5v-7l6 3.5-6 3.5Z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="4" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.6" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M14.5 3c.4 1.8 1.5 3.1 3.5 3.6v2.6a6.6 6.6 0 0 1-3.4-1v5.4a5.1 5.1 0 1 1-5-5.1c.4 0 .8 0 1.2.1v2.7a2.9 2.9 0 1 0 1.2 2.3V3h2.5Z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M18.9 3H21l-4.6 5.3L21.8 21h-4.2l-3.3-4.7L10.1 21H8l5-5.8L2.7 3h4.3l3 4.3L13.8 3h5.1Zm-1.5 16h1.2L7.2 4.9H5.9L17.4 19Z" />
    </svg>
  )
}

function VimeoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M20.9 7.2c-.1 2.9-2.2 6.8-6.4 11.7-4.3 5-6.3 5.4-8.1 1.8L3.2 11c-.6-1.8-1.2-1.7-2.2-.8L0 8.9c2.4-2.1 4.8-4.2 5.4-4.2 1.5-.1 2.4.9 2.8 2.8.4 2.1.9 6.6 1.7 6.6.6 0 1.8-2 3.7-5.9.8-1.6.1-2.4-2-1.5.8-2.6 2.3-3.9 4.7-4 1.8-.1 4.7.5 4.6 4.5Z" />
    </svg>
  )
}

export default App
