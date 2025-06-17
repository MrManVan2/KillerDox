
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthGate from './pages/AuthGate';
import Builder from './pages/Builder';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthGate />} />
        <Route 
          path="/builder" 
          element={
            <PrivateRoute>
              <Builder />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
