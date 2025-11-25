
import { BrowserRouter } from 'react-router-dom';
import { Suspense } from 'react';
import { AppRoutes } from './router';
import EngineeringBackground from './components/effects/EngineeringBackground';
import PageTransition from './components/effects/PageTransition';
import LoadingSpinner from './components/effects/LoadingSpinner';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={__BASE_PATH__}>
        <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
          {/* Engineering animated background */}
          <EngineeringBackground />
          
          {/* Main content with page transitions */}
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner
                  size="xl"
                  variant="engineering"
                  text="Loading NPPE Pro..."
                />
              </div>
            }
          >
            <PageTransition>
              <AppRoutes />
            </PageTransition>
          </Suspense>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
