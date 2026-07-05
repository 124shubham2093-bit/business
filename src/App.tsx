import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { InvestigationsPage } from './pages/InvestigationsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NewInvestigationPage } from './pages/NewInvestigationPage';
import { InvestigationPipelinePage } from './pages/InvestigationPipelinePage';
import { KnowledgeGraphPage } from './pages/KnowledgeGraphPage';
import { DecisionCenterPage } from './pages/DecisionCenterPage';
import { StartupDrawer } from './components/dashboard/StartupDrawer';
import { CogneeVerifyPage } from './pages/CogneeVerifyPage';
import { MockInvestigationService } from './services/investigation/MockInvestigationService';
import type { Startup, Activity } from './services/investigation/investigationTypes';

function App() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  // Load initial databases asynchronously
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      MockInvestigationService.getAllInvestigations(),
      MockInvestigationService.getRecentActivity()
    ]).then(([loadedStartups, loadedActivities]) => {
      setStartups(loadedStartups);
      setActivities(loadedActivities);
      setIsLoading(false);
    }).catch((err) => {
      console.error('Failed to load initial data:', err);
      setIsLoading(false);
    });
  }, []);

  // Monitor location state to append a newly completed investigation
  useEffect(() => {
    if (location.state && (location.state as any).newStartup) {
      const stateData = location.state as any;
      const { newStartup, highlightId, openDrawerImmediate } = stateData;

      // Prevent duplicate appends
      if (!startups.some((s) => s.id === newStartup.id)) {
        setIsLoading(true);
        MockInvestigationService.createInvestigation(newStartup).then(() => {
          // Re-load list and activities
          Promise.all([
            MockInvestigationService.getAllInvestigations(),
            MockInvestigationService.getRecentActivity()
          ]).then(([loadedStartups, loadedActivities]) => {
            setStartups(loadedStartups);
            setActivities(loadedActivities);
            setIsLoading(false);
          });
        }).catch((err) => {
          console.error(err);
          setIsLoading(false);
        });

        if (highlightId) {
          setNewlyCreatedId(highlightId);
          // Highlight row pulsing stays visible for 6 seconds
          setTimeout(() => {
            setNewlyCreatedId(null);
          }, 6000);
        }

        if (openDrawerImmediate) {
          setSelectedStartup(newStartup);
        }
      }

      // Clear navigation state buffer to prevent loop refreshes
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, startups, navigate, location.pathname]);

  // Update startup attributes (Status, Risk Level) and log actions
  const handleUpdateStartup = (updated: Startup) => {
    MockInvestigationService.updateStartup(updated).then((saved) => {
      setStartups(startups.map((s) => (s.id === saved.id ? saved : s)));
      MockInvestigationService.getRecentActivity().then(setActivities);

      // Keep drawer in sync with updated values
      if (selectedStartup && selectedStartup.id === saved.id) {
        setSelectedStartup(saved);
      }
    }).catch((err) => {
      console.error('Failed to update startup:', err);
    });
  };

  return (
    <ThemeProvider>
      {isLoading && startups.length === 0 ? (
        <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center text-[var(--text-primary)] transition-colors duration-200">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-[var(--text-secondary)] font-mono">Loading InvestIQ Telemetry...</span>
          </div>
        </div>
      ) : (
        <>
          <Routes>
            <Route
              path="/"
              element={
                <DashboardLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              }
            >
              <Route
                index
                element={
                  <DashboardPage
                    startups={startups}
                    activities={activities}
                    searchQuery={searchQuery}
                    onSelectStartup={setSelectedStartup}
                    newlyCreatedId={newlyCreatedId}
                  />
                }
              />
              <Route
                path="investigations"
                element={
                  <InvestigationsPage
                    startups={startups}
                    searchQuery={searchQuery}
                    onSelectStartup={setSelectedStartup}
                  />
                }
              />
              <Route path="analytics" element={<AnalyticsPage startups={startups} />} />
              <Route path="new-investigation" element={<NewInvestigationPage />} />
              <Route path="cognee-verify" element={<CogneeVerifyPage />} />
            </Route>
            
            {/* Immersive full-screen pipeline screen */}
            <Route path="/investigations/pipeline" element={<InvestigationPipelinePage />} />
            
            {/* Full-screen knowledge graph page */}
            <Route path="/knowledge-graph" element={<KnowledgeGraphPage />} />

            {/* Explainable Decision Center page */}
            <Route path="/decision-center" element={<DecisionCenterPage />} />
          </Routes>

          {/* Slide-over diligence details drawer */}
          <StartupDrawer
            startup={selectedStartup}
            onClose={() => setSelectedStartup(null)}
            onUpdateStartup={handleUpdateStartup}
          />
        </>
      )}
    </ThemeProvider>
  );
}

export default App;
