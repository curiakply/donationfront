// src/App.js
import React, { useState, useEffect } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { SpeedInsights } from '@vercel/speed-insights/react';
import { FinancialYearProvider } from './pages/FinancialYearContext';
import { isAuthenticated, isSuperAdmin } from './utils/auth';
import Main from "./components/layout/Main";
import { Backdrop, CircularProgress, Typography, ThemeProvider, createTheme } from '@mui/material';

// Auth Pages
import LoginPage from './pages/LoginPage';
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";

// Core Pages
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import ParishAnalytics from "./pages/ParishAnalytics";
import AdminManagement from "./pages/AdminManagement"; 
import DatabaseBackup from "./pages/DatabaseBackup"; 
import PrintDesigner from "./pages/PrintDesigner";
import MarriagePage from "./pages/MarriagePage";
import MarriagePrintSetup from "./pages/MarriagePrintSetup";
import PrintPage from "./pages/PrintPage";
// Organization Pages
import Diocese from "./pages/Diocese";
import Priest from "./pages/Priest";
import Position from "./pages/Position";
import Congregation from "./pages/Congregation";
import Department from "./pages/Department";
import Forane from "./pages/Forane";
import Parish from "./pages/Parish";
import Koottayma from "./pages/Koottayma";
import Family from "./pages/Family";

// Finance Pages
import PersonManagement from "./pages/Finanace";
import FamilyFinanace from "./pages/FamilyFinanace";
import FamilyNew from "./pages/FamilyNew";
import FamilyNewjune14 from "./pages/FamilyNew june14";
import FamilyNew1 from "./pages/FamilyNew1";
import TransactionPage from "./pages/Transactionpage";
import TransactionListPage from './pages/TransactionListPage';
import Titheprint from "./pages/Titheprint";
import Assignmentpage from "./pages/Assignmentpage";

// Settings Pages
import FinanceSettings from "./pages/FinanceSettings";
import CommunitySettings from "./pages/communitysettings";
import OtherProjectSettings from "./pages/otherprojectsettings";
import ParishAllocSettings from "./pages/ParishallocSettings";
import ParishAllocSettings1 from "./pages/ParishallocSettings1";
import organization from "./pages/Organization";
import users from "./pages/Usermanagement";
import narration from "./pages/Narration";
// Other Pages
import MoveFamily from "./pages/movefamily";
import Community from "./pages/community";
import Project from "./pages/otherprojects";
import ChurchReportPage from './pages/ChurchReportPage';
import ComprehensiveReportsDashboard from './pages/ComprehensiveReportsDashboard';
import BulkFamilyPrintPage from './pages/BulkFamilyPrintPage';
import OpeningBalance from './pages/OpeningBalance';
import YearEndTransfer from './pages/YearEndTransfer';
import logout from './pages/logout';
import AuditDashboard from './pages/AuditDashboard';
import AdvancedFilterPage from './pages/AdvancedFilterPage';
import UnifiedDataFilter from './pages/UnifiedDataFilter';
import Donationpage from './pages/Donationpage';
import DonationReport from './pages/DonationReport';
import Organizationreport from './pages/Organizationreport'; 
import Curiadashboard from './pages/Curiadashboard';
import Priestledger from './pages/Priestledger';
import Databasebk from "./pages/Databasebk"; 
// Styles
import "antd/dist/antd.css";
import "./assets/styles/main.css";
import "./assets/styles/responsive.css";

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB',
      light: '#3B82F6',
      dark: '#1E40AF'
    },
    secondary: {
      main: '#10B981',
      light: '#34D399',
      dark: '#047857'
    }
  }
});

const LoadingOverlay = () => (
  <Backdrop
    open={true}
    sx={{
      zIndex: theme => theme.zIndex.drawer + 1,
      color: '#fff',
      flexDirection: 'column',
      backgroundColor: 'rgba(0, 0, 0, 0.7)'
    }}
  >
    <CircularProgress color="inherit" size={60} />
    <Typography variant="h6" sx={{ mt: 2 }}>
      Loading...
    </Typography>
  </Backdrop>
);

// Protected Route Component for Super Admin
const SuperAdminRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      isAuthenticated() && isSuperAdmin() ? (
        <Component {...props} />
      ) : (
        <Redirect to="/home" />
      )
    }
  />
);

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <ThemeProvider theme={theme}>
      <FinancialYearProvider>
        <div className="App">
          <Switch>
            {/* Root path handling */}
            <Route exact path="/">
              {isAuthenticated() ? (
                isSuperAdmin() ? (
                  <Redirect to="/home" />
                ) : (
                  <Redirect to="/home" />
                )
              ) : (
                <Redirect to="/login" />
              )}
            </Route>

            {/* Auth routes */}
            <Route exact path="/login">
              {isAuthenticated() ? (
                isSuperAdmin() ? (
                  <Redirect to="/home" />
                ) : (
                  <Redirect to="/home" />
                )
              ) : (
                <LoginPage />
              )}
            </Route>
            <Route exact path="/sign-up" component={SignUp} />
            <Route exact path="/sign-in" component={SignIn} />

            {/* Protected routes with Main layout */}
            {isAuthenticated() ? (
              <Main>
                <Switch>
                  {/* Super Admin Dashboard */} 
                  <SuperAdminRoute exact path="/super-admin" component={SuperAdminDashboard} />
                   <SuperAdminRoute exact path="/parishAnalytics" component={ParishAnalytics} />
                    <SuperAdminRoute exact path="/mgm" component={AdminManagement} />
                    <SuperAdminRoute exact path="/database-backup" component={DatabaseBackup} />
                       <SuperAdminRoute exact path="/filter" component={UnifiedDataFilter} />
                        <SuperAdminRoute exact path="/users" component={users} />
                  {/* Core routes */}
                  <Route exact path="/home" component={Home} />
                  <Route exact path="/dashboard" component={Home} />
                  <Route exact path="/profile" component={Profile} />

                  {/* Organization routes */}
                   <Route exact path="/congregation" component={Congregation} />
                         <Route exact path="/diocese" component={Diocese} />
                         <Route exact path="/priest" component={Priest} />
                            <Route exact path="/position" component={Position} />
                                   <Route exact path="/department" component={Department} />
                  <Route exact path="/forane" component={Forane} />
                  <Route exact path="/parish" component={Parish} />
                  <Route exact path="/koottayma" component={Koottayma} />
                  <Route exact path="/Family" component={Family} />
                  <Route exact path="/print-designer" component={PrintDesigner} />
                  <Route exact path="/printPage" component={PrintPage} />
                  <Route exact path="/marriagePage" component={MarriagePage} />
                  <Route exact path="/organization" component={organization} />
                  <Route exact path="/narration" component={narration} />
                  <Route exact path="/marriagePrintSetup" component={MarriagePrintSetup} />
                  <Route exact path="/donationReport" component={DonationReport} />
                  <Route exact path="/priestledger" component={Priestledger} />
                  <Route exact path="/organizationreport" component={Organizationreport} />
                 
                  {/* Finance routes */}
                  <Route exact path="/PersonManagement" component={PersonManagement} />
                  <Route exact path="/FamilyFinanace" component={FamilyFinanace} />
                  <Route exact path="/FamilyFinance" component={FamilyNewjune14} />
                  <Route exact path="/FamilyFinance1" component={FamilyNew1} />
                  <Route exact path="/transactions/new" component={TransactionListPage} />
                  <Route exact path="/transactions" component={TransactionPage} />
                  <Route exact path="/Titheprint" component={Titheprint} />
                  <Route exact path="/FamilyNewjune14" component={FamilyNew} />
                  <Route exact path="/Assignment" component={Assignmentpage} />
       <Route exact path="/donationpage" component={Donationpage} />
        <Route exact path="/curiadashboard" component={Curiadashboard} />
            
                  {/* Settings routes */}
                  <Route exact path="/FinanceSettings" component={FinanceSettings} />
                  <Route exact path="/communitysettings" component={CommunitySettings} />
                  <Route exact path="/otherprojectsettings" component={OtherProjectSettings} />
                  <Route exact path="/parishallocsettings" component={ParishAllocSettings} />
                  <Route exact path="/parishallocsettings1" component={ParishAllocSettings1} />

                  {/* Other routes */}
                  <Route exact path="/movefamily" component={MoveFamily} />
                  <Route exact path="/community" component={Community} />
                  <Route exact path="/project" component={Project} />
                  <Route exact path="/report" component={ChurchReportPage} />
                  <Route exact path="/ReportsDashboard" component={ComprehensiveReportsDashboard} />
                  <Route exact path="/family-print" component={BulkFamilyPrintPage} />
                  <Route exact path="/print-family/:id" component={BulkFamilyPrintPage} />
                  <Route exact path="/addopening" component={OpeningBalance} />
                  <Route exact path="/yearendtransfer" component={YearEndTransfer} />
                  <Route exact path="/AuditDashboard" component={AuditDashboard} />
                  <Route exact path="/AdvancedFilterPage" component={AdvancedFilterPage} />
                  <Route exact path="/databasebk" component={Databasebk} />
                  <Route exact path="/logout" component={logout} />

                  {/* Catch all route - redirect to home */}
                  <Route path="*">
                    <Redirect to="/home" />
                  </Route>
                </Switch>
              </Main>
            ) : (
              <Redirect to="/login" />
            )}
          </Switch>
          <SpeedInsights />
        </div>
      </FinancialYearProvider>
    </ThemeProvider>
  );
}

export default App;