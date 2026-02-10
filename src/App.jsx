import { lazy, Suspense } from 'react'
import { useRoutes, useLocation, Navigate } from 'react-router-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './components/LandingPage'
import { Providers } from './providers'
import Login from './Modules/Login'
import { ForgotPassword } from './Modules/ForgotPassword'
import { ResetPassword } from './Modules/ResetPassword'
import { About } from './Modules/About'
import { Demo } from './Modules/Demo'
import { NotFound } from './Modules/NotFound'
import { Contact } from './Modules/Contact'

// Lazy-loaded dash routes
const ListEvents = lazy(() => import('./Modules/ListEvents').then(m => ({ default: m.ListEvents })))
const EventDetails = lazy(() => import('./Modules/EventDetails').then(m => ({ default: m.EventDetails })))
const Contacts = lazy(() => import('./Modules/Contacts').then(m => ({ default: m.Contacts })))
const WorkerHistory = lazy(() => import('./Modules/WorkerHistory').then(m => ({ default: m.WorkerHistory })))
const CreateEvent = lazy(() => import('./Modules/CreateEvent').then(m => ({ default: m.CreateEvent })))
const QRScanner = lazy(() => import('./Modules/QRScanner').then(m => ({ default: m.QRScanner })))
const EditEvent = lazy(() => import('./Modules/EditEvent').then(m => ({ default: m.EditEvent })))
const AddCallTime = lazy(() => import('./Modules/AddCallTime').then(m => ({ default: m.AddCallTime })))
const EditCallTime = lazy(() => import('./Modules/EditCallTime').then(m => ({ default: m.EditCallTime })))
const Confirmations = lazy(() => import('./Modules/Confirmations').then(m => ({ default: m.Confirmations })))
const TimeSheet = lazy(() => import('./Modules/TimeSheet').then(m => ({ default: m.TimeSheet })))
const AddLaborToCall = lazy(() => import('./Modules/AddLaborToCall').then(m => ({ default: m.AddLaborToCall })))
const CallTimeRequestList = lazy(() => import('./Modules/CallTimeRequestList').then(m => ({ default: m.CallTimeRequestList })))
const FillRequestList = lazy(() => import('./Modules/FillRequestList').then(m => ({ default: m.FillRequestList })))
const EditLaborReqirement = lazy(() => import('./Modules/EditLaborReqirement').then(m => ({ default: m.EditLaborReqirement })))
const Skills = lazy(() => import('./Modules/Skills').then(m => ({ default: m.Skills })))
const Locations = lazy(() => import('./Modules/Locations').then(m => ({ default: m.Locations })))
const Owner = lazy(() => import('./Modules/Owner').then(m => ({ default: m.Owner })))
const StewardDashboard = lazy(() => import('./Modules/StewardDashboard').then(m => ({ default: m.StewardDashboard })))
const UserProfile = lazy(() => import('./Modules/UserProfile').then(m => ({ default: m.UserProfile })))

// Lazy-loaded token-based public routes
const ConfirmRequests = lazy(() => import('./Modules/ConfirmRequests').then(m => ({ default: m.ConfirmRequests })))
const StewardRegisterRedirect = lazy(() => import('./Modules/StewardRegisterRedirect').then(m => ({ default: m.StewardRegisterRedirect })))
const UserRegistration = lazy(() => import('./Modules/UserRegistration').then(m => ({ default: m.UserRegistration })))
const VerifyRegistration = lazy(() => import('./Modules/VerifyRegistration').then(m => ({ default: m.VerifyRegistration })))
const ConfirmTimeChange = lazy(() => import('./Modules/ConfirmTimeChange').then(m => ({ default: m.ConfirmTimeChange })))
const ClockInOut = lazy(() => import('./Modules/ClockInOut').then(m => ({ default: m.ClockInOut })))
const SignInStation = lazy(() => import('./Modules/SignInStation').then(m => ({ default: m.SignInStation })))


const routes = [
  { path: "/", element: <LandingPage /> },
  { path: "/about", element: <About /> },
  { path: "/demo", element: <Demo /> },
  { path: "/contact", element: <Contact /> },
  { path: "/login", element: <Login /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password/:token", element: <ResetPassword /> },
  { path: "event/:slug/confirm/:event_token", element: <ConfirmRequests /> },
  { path: "steward/register/:token", element: <StewardRegisterRedirect /> },
  { path: "user/register/", element: <UserRegistration /> },
  { path: "verify-registration/", element: <VerifyRegistration /> },
  { path: "call/confirm-time-change/:token", element: <ConfirmTimeChange /> },
  { path: "clock-in/:token", element: <ClockInOut /> },
  { path: "station/:token", element: <SignInStation /> },
  {
    path: "/dash",
    element: <Layout />,
    children: [
      { index: true, element: <ListEvents /> },
      { path: "contacts", element: <Contacts /> },
      { path: "workers/:slug/history", element: <WorkerHistory /> },
      { path: "create-event", element: <CreateEvent /> },
      { path: "event/:slug", element: <EventDetails /> },
      { path: "event/:slug/scan-qr", element: <QRScanner /> },
      { path: "event/:slug/edit", element: <EditEvent /> },
      { path: "events/:slug/add-call-time", element: <AddCallTime /> },
      { path: "events/:slug/call-times/:callTimeSlug/edit", element: <EditCallTime /> },
      { path: "events/:slug/call-times/:callTimeSlug/confirmations", element: <Confirmations /> },
      { path: "call-times/:slug/tracking", element: <TimeSheet /> },
      { path: "events/:slug/add-labor/:callTimeSlug", element: <AddLaborToCall /> },
      { path: "call-times/:slug/requests", element: <CallTimeRequestList /> },
      { path: "request/:slug/fill-list", element: <FillRequestList /> },
      { path: "skills", element: <Skills /> },
      { path: "labor/:laborSlug/edit", element: <EditLaborReqirement /> },
      { path: "locations", element: <Locations /> },
      { path: "company/settings", element: <Owner /> },
      { path: "steward", element: <StewardDashboard /> },
      { path: "profile", element: <UserProfile /> },
    ]
  },
  { path: "*", element: <NotFound /> }
]

function AppInner() {
  const location = useLocation()
  const element = useRoutes(routes)

  return <Suspense fallback={null}>{element}</Suspense>
}

export default function App() {
  return (
    <Providers>
      <Router>
        <AppInner />
      </Router>
    </Providers>
  )
}
