import { createBrowserRouter } from 'react-router-dom';
import Landing from './pages/landing';
import PairingInterface from './components/pairing-interface';
import Dashboard from './pages/dashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/pair',
    element: <PairingInterface />,
  },
  {
    path: '/dashboard/:role',
    element: <Dashboard />,
  },
]);