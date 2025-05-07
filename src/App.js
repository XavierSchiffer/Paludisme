import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
import Contacts from "./scenes/contacts";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Calendar from "./scenes/calendar/calendar";
import PatientList from "./scenes/patient_List";
import PatientRegistrationForm from "./add_Patient";
import PatientDetails from "./scenes/detail_Patient";
import EditPatient from "./scenes/edit_Patient";
import AnalyseFrottis from "./scenes/analyse_Frottis";
import PatientAnalyseList from "./scenes/analyse_list";
import PatientAnalysisDetails from "./scenes/analyse_patient_List";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Sidebar isSidebar={isSidebar} />
          <main className="content">
            <Topbar setIsSidebar={setIsSidebar} />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/team" element={<Team />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/form" element={<Form />} />
              <Route path="/bar" element={<Bar />} />
              <Route path="/pie" element={<Pie />} />
              <Route path="/line" element={<Line />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/geography" element={<Geography />} />
              
              <Route path="/list-patient" element={<PatientList />} />
              <Route path="/add-patient" element={<PatientRegistrationForm />} />
              <Route path="/patients/details/:patient_id" element={<PatientDetails />} />
              <Route path="/edit-patient/:patient_id" element={<EditPatient />} />
              <Route path="/analyse" element={<AnalyseFrottis />} />
              <Route path="/analyse-list" element={<PatientAnalyseList />} />
              <Route path="/patient-analyses/:patientId" element={<PatientAnalysisDetails />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
