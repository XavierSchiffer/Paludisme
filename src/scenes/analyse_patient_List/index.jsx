import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, Grid, Button, IconButton, CircularProgress, 
  Paper, Divider, Chip, Tooltip, Alert 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  ArrowBackOutlined as BackIcon,
  RefreshOutlined as RefreshIcon,
  ScienceOutlined as AnalysisIcon,
  BugReportOutlined as ParasiteIcon,
  CheckCircleOutlined as UninfectedIcon,
  AddOutlined as AddIcon,
  PrintOutlined as PrintIcon,
  DownloadOutlined as DownloadIcon,
  WarningAmberOutlined as WarningIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import { tokens } from '../../theme';
import { apiMalaria } from '../../api';

const PatientAnalysisDetails = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { patientId } = useParams();

  const [analyses, setAnalyses] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';


  // Charger les données patient + analyses
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const patientResponse = await apiMalaria.get(`/patientdetail/${patientId}/`);
        setPatient(patientResponse.data);
        const analysesResponse = await apiMalaria.get(`/getresultdetail/${patientId}/`);
        setAnalyses(Array.isArray(analysesResponse.data) ? analysesResponse.data : []);
      } catch (err) {
        console.error("Erreur de chargement:", err);
        setError("Impossible de charger les données du patient ou ses analyses.");
      } finally {
        setLoading(false);
      }
    };

    if (patientId) fetchData();
  }, [patientId]);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiMalaria.get(`/getresultdetail/${patientId}/`);
      setAnalyses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erreur de rafraîchissement:", err);
      setError("Impossible de rafraîchir les données des analyses.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnalysis = () => navigate(`/add-analysis/${patientId}`);

  const handlePrint = () => window.print();

  const handleExport = () => {
    const exportData = analyses.map((a) => {
      let parasitized = 0, uninfected = 0;
      try {
        const statusObj = JSON.parse(a.status.replace(/\(/g, '[').replace(/\)/g, ']'));
        parasitized = statusObj[0][1] * 100;
        uninfected = statusObj[1][1] * 100;
      } catch (e) {
        console.error("Erreur parsing status:", e);
      }

      return {
        "Code Patient": a.code_patient,
        "Nom Patient": a.nom_patient,
        "Status": parasitized > 90 ? "Parasité" : "Non infecté",
        "Parasité (%)": parasitized.toFixed(2),
        "Non infecté (%)": uninfected.toFixed(2),
        "Date": new Date().toLocaleDateString()
      };
    });

    if (!exportData.length) return;

    const headers = Object.keys(exportData[0]).join(',');
    const rows = exportData.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient_${patientId}_analyses.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const parseStatus = (str) => {
    try {
      // Tenter de parser d'abord
      const cleaned = str
        .replace(/\(/g, '[')
        .replace(/\)/g, ']')
        .replace(/'/g, '"');
  
      const data = JSON.parse(cleaned);
  
      // Cas 1 : tableau
      if (Array.isArray(data) && data[0] && Array.isArray(data[0])) {
        return {
          parasitized: { label: data[0][0], value: data[0][1] * 100 },
          uninfected: { label: data[1][0], value: data[1][1] * 100 }
        };
      }
  
      // Cas 2 : dictionnaire
      if (data && typeof data === 'object') {
        return {
          parasitized: { label: "Parasitized", value: (data["Parasitized"] || 0) * 100 },
          uninfected: { label: "Uninfected", value: (data["Uninfected"] || 0) * 100 }
        };
      }
  
      throw new Error("Format inattendu");
    } catch (err) {
      console.error("Erreur parsing status:", err, str);
      return {
        parasitized: { label: "Parasitized", value: 0 },
        uninfected: { label: "Uninfected", value: 0 }
      };
    }
  };
  
  const getDiagnosisStatus = (statusData) => {
    if (statusData.parasitized.value > statusData.uninfected.value) {
      return "Parasité";
    } else {
      return "Non infecté";
    }
  };
  
const renderStatusChip = (status) => (
    <Chip
      icon={
        status === "Parasité"
          ? <WarningIcon sx={{ color: 'orange' }} />
          : <UninfectedIcon />
      }
      label={status}
      color={status === "Parasité" ? "warning" : "success"}
      variant="outlined"
      sx={{ fontWeight: "bold" }}
    />
  );
  

  const handleBackToList = () => navigate('/patients');

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m="20px">
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button startIcon={<BackIcon />} onClick={handleBackToList} variant="contained">
          Retour à la liste des patients
        </Button>
      </Box>
    );
  }

  return (
    <Box m="20px">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center">
          {/* <IconButton onClick={handleBackToList} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton> */}
          <Header 
            title={`ANALYSES DE ${patient?.nom?.toUpperCase() || 'PATIENT'}`}
            subtitle={`Code patient: ${patient?.code_patient || 'Non disponible'}`}
          />
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Rafraîchir les données"><IconButton onClick={handleRefresh} color="primary"><RefreshIcon /></IconButton></Tooltip>
          {/* <Tooltip title="Ajouter une analyse"><Button variant="contained" startIcon={<AddIcon />} onClick={handleAddAnalysis} sx={{ bgcolor: colors.greenAccent[600] }}>Nouvelle analyse</Button></Tooltip> */}
          <Tooltip title="Imprimer"><IconButton onClick={handlePrint} color="primary"><PrintIcon /></IconButton></Tooltip>
          <Tooltip title="Exporter (CSV)"><IconButton onClick={handleExport} color="primary"><DownloadIcon /></IconButton></Tooltip>
        </Box>
      </Box>

      {/* Info patient */}
      <Paper elevation={3} sx={{ p: 2, mb: 3, bgcolor: colors.primary[400], borderLeft: `6px solid ${colors.blueAccent[500]}` }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}><Typography><strong>Nom:</strong> {patient?.nom || 'Non disponible'}</Typography></Grid>
          <Grid item xs={12} md={7}><Typography><strong>Code patient:</strong> {patient?.code_patient || 'Non disponible'}</Typography></Grid>
          <Grid item xs={12} md={4}><Typography><strong>Nombre d'analyses:</strong> {analyses.length}</Typography></Grid>
          {patient?.sexe && <Grid item xs={12} md={4}><Typography><strong>Sexe:</strong> {patient.sexe}</Typography></Grid>}
          {patient?.age && <Grid item xs={12} md={4}><Typography><strong>Âge:</strong> {patient.age} ans</Typography></Grid>}
        </Grid>
      </Paper>

      {/* Résultats */}
      {analyses.length === 0 ? (
        <Alert severity="info">Aucune analyse disponible pour ce patient.</Alert>
      ) : (
        <Grid container spacing={3}>
          {analyses.map((analysis, index) => {
            const statusData = parseStatus(analysis.status);
            const diagnosisStatus = getDiagnosisStatus(statusData);

            return (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{
                  backgroundColor: isDarkMode ? '#1F2A40' : '#ffffff',
                  height: '100%',
                  borderRadius: 2,
                  boxShadow: 3,
                  border: `1px solid ${diagnosisStatus.includes("Parasité") ? colors.redAccent[400] : colors.greenAccent[400]}`
                }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Box display="flex" alignItems="center">
                        <AnalysisIcon sx={{ mr: 1, color: colors.blueAccent[400] }} />
                        <Typography variant="h6">Analyse #{index + 1}</Typography>
                      </Box>
                      {renderStatusChip(diagnosisStatus)}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      {/* Parasité */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2">Parasité</Typography>
                        <Box display="flex" alignItems="center">
                          <Box flex={1} sx={{ height: 8, bgcolor: colors.redAccent[200], borderRadius: 1, overflow: 'hidden' }}>
                            <Box sx={{ height: '100%', bgcolor: colors.redAccent[500], width: `${statusData.parasitized.value}%` }} />
                          </Box>
                          <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
                            {statusData.parasitized.value.toFixed(2)}%
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Non infecté */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2">Non infecté</Typography>
                        <Box display="flex" alignItems="center">
                          <Box flex={1} sx={{ height: 8, bgcolor: colors.greenAccent[200], borderRadius: 1, overflow: 'hidden' }}>
                            <Box sx={{ height: '100%', bgcolor: colors.greenAccent[500], width: `${statusData.uninfected.value}%` }} />
                          </Box>
                          <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
                            {statusData.uninfected.value.toFixed(2)}%
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="body2" sx={{ mt: 2 }}>
                      <strong>Diagnostic:</strong> {diagnosisStatus}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default PatientAnalysisDetails;
