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

      <main>
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

      {/* Coming Soon - Mobile App */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/10 to-indigo/10 dark:from-dark-primary/20 dark:to-dark-indigo/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-primary/20 dark:bg-dark-primary/30 text-primary dark:text-dark-text-blue px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            Coming Soon
          </div>
          <h2 className="text-3xl font-bold text-text-heading dark:text-dark-text-primary mb-6">
            CallManager Mobile App
          </h2>
          <p className="text-lg text-text-secondary dark:text-dark-text-secondary mb-6 max-w-3xl mx-auto">
            We're building native mobile apps for Android and iOS to bring CallManager's full power
            to your pocket. Manage events, send SMS requests, track time, and respond to confirmations —
            all from your phone.
          </p>
          <div className="flex justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-3 text-text-secondary dark:text-dark-text-secondary">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.523 15.341c-.45-.656-.997-1.316-1.597-1.835a6.69 6.69 0 0 0-1.364-.879c.426-.489.792-1.073 1.068-1.72.276-.648.42-1.343.42-2.034 0-.943-.22-1.87-.637-2.692-.417-.822-1.016-1.527-1.738-2.047-.722-.52-1.56-.844-2.425-.938-.865-.094-1.74.014-2.536.313-.796.299-1.488.787-2.004 1.414-.516.627-.847 1.382-.961 2.187-.114.805-.008 1.633.307 2.398.315.765.83 1.438 1.493 1.948.663.51 1.451.839 2.283.953-.334.392-.622.825-.857 1.289-.235.465-.413.959-.529 1.468-.116.509-.168 1.031-.154 1.551.014.52.098 1.034.249 1.525.151.491.372.957.656 1.381.284.424.628.801 1.021 1.116.393.315.83.562 1.296.732.466.17.957.261 1.455.27.498.009.994-.056 1.47-.193.476-.137.93-.345 1.345-.617.415-.272.787-.605 1.102-.987.315-.382.568-.808.751-1.264.183-.456.293-.936.326-1.423.033-.487-.009-.975-.124-1.446-.115-.471-.304-.923-.562-1.34z"/>
              </svg>
              <span className="font-medium">iOS App</span>
            </div>
            <div className="flex items-center gap-3 text-text-secondary dark:text-dark-text-secondary">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24a11.43 11.43 0 0 0-8.94 0L5.65 5.67c-.19-.28-.54-.37-.83-.22-.3.16-.42.54-.26.85l1.84 3.18C4.8 11.16 3.5 13.84 3.5 16.5V19h17v-2.5c0-2.66-1.3-5.34-2.9-7.02zM7 17.25c-.41 0-.75-.34-.75-.75s.34-.75.75-.75.75.34.75.75-.34.75-.75.75zm10 0c-.41 0-.75-.34-.75-.75s.34-.75.75-.75.75.34.75.75-.34.75-.75.75z"/>
              </svg>
              <span className="font-medium">Android App</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-text-heading dark:text-dark-text-primary mb-4">
            Get in Touch
          </h2>
          <p className="text-text-secondary dark:text-dark-text-secondary mb-8">
            Interested in CallManager for your company? Reach out to our sales team.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-primary hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover text-white font-bold py-3 px-10 rounded-lg text-lg transition-colors shadow-lg"
          >
            Contact Us
          </Link>
        </div>
      </section>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-border-light dark:border-dark-border">
        <p className="text-center text-text-secondary dark:text-dark-text-secondary text-sm">
          &copy; {new Date().getFullYear()} Callman. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
