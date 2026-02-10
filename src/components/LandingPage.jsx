import { useNavigate } from 'react-router-dom';
import { PublicHeader } from './PublicHeader';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-body-bg dark:bg-dark-body-bg">
      <title>CallManager — Event Staffing Software | Staff Smarter, Not Harder</title>
      <meta name="description" content="CallManager is the all-in-one platform for event staffing. Automate SMS requests, schedule labor, track time, and manage your workforce from a single dashboard." />
      <meta property="og:title" content="CallManager — Event Staffing Software" />
      <meta property="og:description" content="Automate SMS requests, schedule labor, track time, and manage your workforce from a single dashboard." />
      <meta property="og:type" content="website" />
      <PublicHeader />

      <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-indigo dark:from-dark-primary dark:to-dark-indigo py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Staff Smarter.<br />Not Harder.
          </h1>
          <p className="text-lg md:text-xl text-blue-50 dark:text-blue-100 mb-10 max-w-2xl mx-auto">
            CallManager is the all-in-one platform for event staffing — automate SMS requests,
            schedule labor, track time, and manage your workforce from a single dashboard.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-white text-primary font-bold py-3 px-10 rounded-lg text-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-text-heading dark:text-dark-text-primary text-center mb-12">
            Everything You Need
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* SMS Automation */}
            <div className="bg-card-bg dark:bg-dark-card-bg rounded-xl shadow-md p-6">
              <div className="mb-4">
                <svg className="w-10 h-10 text-primary dark:text-dark-text-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-text-heading dark:text-dark-text-primary mb-2">SMS Automation</h3>
              <p className="text-text-secondary dark:text-dark-text-secondary text-sm">
                Send availability requests and reminders to your workforce via text message with one click.
              </p>
            </div>

            {/* Real-Time Tracking */}
            <div className="bg-card-bg dark:bg-dark-card-bg rounded-xl shadow-md p-6">
              <div className="mb-4">
                <svg className="w-10 h-10 text-success dark:text-dark-text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-text-heading dark:text-dark-text-primary mb-2">Real-Time Tracking</h3>
              <p className="text-text-secondary dark:text-dark-text-secondary text-sm">
                Clock in/out, meal breaks, and time sheets — all tracked live with instant updates.
              </p>
            </div>

            {/* Smart Scheduling */}
            <div className="bg-card-bg dark:bg-dark-card-bg rounded-xl shadow-md p-6">
              <div className="mb-4">
                <svg className="w-10 h-10 text-indigo dark:text-dark-text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-text-heading dark:text-dark-text-primary mb-2">Smart Scheduling</h3>
              <p className="text-text-secondary dark:text-dark-text-secondary text-sm">
                Create events, call times, and labor requirements — then fill positions fast.
              </p>
            </div>

            {/* Steward Management */}
            <div className="bg-card-bg dark:bg-dark-card-bg rounded-xl shadow-md p-6">
              <div className="mb-4">
                <svg className="w-10 h-10 text-yellow dark:text-dark-text-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-text-heading dark:text-dark-text-primary mb-2">Steward Management</h3>
              <p className="text-text-secondary dark:text-dark-text-secondary text-sm">
                Delegate on-site oversight to stewards with scoped access to their assigned events.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-card-bg dark:bg-dark-card-bg">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-text-heading dark:text-dark-text-primary text-center mb-14">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="w-14 h-14 bg-primary dark:bg-dark-primary rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-lg font-bold text-text-heading dark:text-dark-text-primary mb-2">Create Events & Call Times</h3>
              <p className="text-text-secondary dark:text-dark-text-secondary text-sm">
                Set up your events, define call times, and specify the labor positions you need filled.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-primary dark:bg-dark-primary rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-lg font-bold text-text-heading dark:text-dark-text-primary mb-2">Request Workers via SMS</h3>
              <p className="text-text-secondary dark:text-dark-text-secondary text-sm">
                Send availability requests to your workforce. Workers confirm or decline by text.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-primary dark:bg-dark-primary rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-lg font-bold text-text-heading dark:text-dark-text-primary mb-2">Track Time & Generate Reports</h3>
              <p className="text-text-secondary dark:text-dark-text-secondary text-sm">
                Workers clock in/out on-site. Review time sheets, meal breaks, and export reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Contact */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-text-heading dark:text-dark-text-primary mb-4">
            Ready to Streamline Your Staffing?
          </h2>
          <p className="text-text-secondary dark:text-dark-text-secondary mb-3">
            Contact our sales team to schedule a demo.
          </p>
          <p className="text-primary dark:text-dark-text-blue font-medium mb-8">
            sales@callman.work
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-primary hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover text-white font-bold py-3 px-10 rounded-lg text-lg transition-colors shadow-lg"
          >
            Login
          </button>
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
  );
}
