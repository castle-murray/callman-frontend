import { useRoutes, useLocation, Navigate } from 'react-router-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './components/LandingPage'
import { Providers } from './providers'
import { ListEvents } from './Modules/ListEvents'
import { EventDetails } from './Modules/EventDetails'
import { Contacts } from './Modules/Contacts'
import { WorkerHistory } from './Modules/WorkerHistory'
import { CreateEvent } from './Modules/CreateEvent'
import { QRScanner } from './Modules/QRScanner'
import { ClockInOut } from './Modules/ClockInOut'
import { EditEvent } from './Modules/EditEvent'
import { AddCallTime } from './Modules/AddCallTime'
import { EditCallTime } from './Modules/EditCallTime'
import { ConfirmTimeChange } from './Modules/ConfirmTimeChange'
import { Confirmations } from './Modules/Confirmations'
import { TimeSheet } from './Modules/TimeSheet'
import { AddLaborToCall } from './Modules/AddLaborToCall'
import { CallTimeRequestList } from './Modules/CallTimeRequestList'
import { FillRequestList } from './Modules/FillRequestList'
import { EditLaborReqirement } from './Modules/EditLaborReqirement'
import { Skills } from './Modules/Skills'
import Login from './Modules/Login'
import { Locations } from './Modules/Locations'
import { Owner } from './Modules/Owner'
import { StewardDashboard } from './Modules/StewardDashboard'
import { ConfirmRequests } from './Modules/ConfirmRequests'
import { UserRegistration } from './Modules/UserRegistration'
import { VerifyRegistration } from './Modules/VerifyRegistration'
import { StewardRegisterRedirect } from './Modules/StewardRegisterRedirect'
import { UserProfile } from './Modules/UserProfile'
import { ForgotPassword } from './Modules/ForgotPassword'
import { ResetPassword } from './Modules/ResetPassword'
import { About } from './Modules/About'
import { Demo } from './Modules/Demo'
import { NotFound } from './Modules/NotFound'
import { SignInStation } from './Modules/SignInStation'


const routes = [
  { path: "/", element: <LandingPage /> },
  { path: "/about", element: <About /> },
  { path: "/demo", element: <Demo /> },
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

  return element
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
