import { Link } from 'react-router-dom'
import { PublicHeader } from '../components/PublicHeader'

export function About() {
  return (
    <div className="min-h-screen bg-body-bg dark:bg-dark-body-bg">
      <title>About CallManager — Event Staffing Software for the Entertainment Industry</title>
      <meta name="description" content="CallManager helps event staffing companies save hours every week. Automate SMS requests, track time with QR codes, and manage your workforce — all from one platform. No per-employee pricing." />
      <meta property="og:title" content="About CallManager — Event Staffing Software" />
      <meta property="og:description" content="Give your call-fillers their time back. Automate SMS requests, schedule labor, and track time for event staffing." />
      <meta property="og:type" content="website" />
      <PublicHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-indigo dark:from-dark-primary dark:to-dark-indigo py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            About CallManager
          </h1>
          <p className="text-lg text-blue-100 dark:text-blue-200 max-w-2xl mx-auto">
            Give your call-fillers their time back. Stop drowning in texts and spreadsheets — let CallManager handle the busywork.
          </p>
        </div>
      </section>

      {/* Product Overview */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-text-heading dark:text-dark-text-primary text-center mb-12">
            What We Do
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-card-bg dark:bg-dark-card-bg rounded-xl shadow-md p-8">
              <h3 className="text-xl font-bold text-text-heading dark:text-dark-text-primary mb-4">
                Get Hours Back Every Week
              </h3>
              <p className="text-text-secondary dark:text-dark-text-secondary mb-4">
                If you're the person filling calls, you know the drill — sending dozens of texts,
                scrolling through replies, manually tracking who said yes, who didn't respond, and
                who backed out. CallManager eliminates that grind.
              </p>
              <p className="text-text-secondary dark:text-dark-text-secondary mb-4">
                One click sends availability requests to your entire roster. Workers confirm or
                decline by text. You see the results in real time — no more chasing replies or
                updating spreadsheets by hand.
              </p>
              <p className="text-text-secondary dark:text-dark-text-secondary">
                Built from the ground up for the entertainment industry and its unique needs,
                CallManager turns hours of call-filling into minutes.
              </p>
            </div>
            <div className="bg-card-bg dark:bg-dark-card-bg rounded-xl shadow-md p-8">
              <h3 className="text-xl font-bold text-text-heading dark:text-dark-text-primary mb-4">
                Built for Event Staffing Companies
              </h3>
              <ul className="space-y-3 text-text-secondary dark:text-dark-text-secondary">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-success dark:text-dark-text-green mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>One-click SMS blasts — no more sending individual texts or reading hundreds of replies</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-success dark:text-dark-text-green mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Automatic confirmation tracking — see who's in, who's out, and who hasn't responded</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-success dark:text-dark-text-green mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>QR clock in/out — no paper timesheets to collect or decipher</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-success dark:text-dark-text-green mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Delegate on-site oversight to stewards so you don't have to be everywhere at once</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-success dark:text-dark-text-green mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Exportable time sheets with meal breaks — skip the end-of-event data entry marathon</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Differentiator */}
      <section className="py-20 px-6 bg-card-bg dark:bg-dark-card-bg">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-text-heading dark:text-dark-text-primary mb-6">
            Pricing That Makes Sense for Staffing
          </h2>
          <p className="text-lg text-text-secondary dark:text-dark-text-secondary mb-6 max-w-3xl mx-auto">
            Other platforms charge per employee. That means in slow months you're paying for
            people who aren't working — or worse, you're forced to offboard workers just to keep
            costs down, only to re-add them when things pick up again.
          </p>
          <p className="text-lg text-text-secondary dark:text-dark-text-secondary max-w-3xl mx-auto">
            CallManager doesn't work that way. Whether your roster has 10 people or 10,000,
            your cost stays the same. Keep your entire workforce on the platform year-round
            and never pay a penalty for having a deep bench.
          </p>
        </div>
      </section>

      {/* Company / Mission */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-text-heading dark:text-dark-text-primary mb-6">
            Our Mission
          </h2>
          <p className="text-lg text-text-secondary dark:text-dark-text-secondary mb-6 max-w-3xl mx-auto">
            CallManager started in the field. We built it because we needed it — and nothing
            on the market understood how entertainment staffing actually works. The result is
            a tool shaped by real calls, real events, and real deadlines.
          </p>
          <p className="text-lg text-text-secondary dark:text-dark-text-secondary max-w-3xl mx-auto">
            We're focused on one thing: making the people who fill calls more effective at every
            scale, from a single crew to hundreds of workers across multiple events. Every feature
            we build starts with that goal.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-text-heading dark:text-dark-text-primary mb-4">
            Get in Touch
          </h2>
          <p className="text-text-secondary dark:text-dark-text-secondary mb-3">
            Interested in CallManager for your company? Reach out to our sales team.
          </p>
          <p className="text-primary dark:text-dark-text-blue font-medium mb-8">
            sales@callman.work
          </p>
          <Link
            to="/login"
            className="inline-block bg-primary hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover text-white font-bold py-3 px-10 rounded-lg text-lg transition-colors shadow-lg"
          >
            Login
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-border-light dark:border-dark-border">
        <p className="text-center text-text-secondary dark:text-dark-text-secondary text-sm">
          &copy; {new Date().getFullYear()} Callman. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
