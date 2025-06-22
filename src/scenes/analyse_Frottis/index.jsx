import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Button, Typography, MenuItem, Select, InputLabel, FormControl, 
  CircularProgress, IconButton, Paper, Grid, Card, CardMedia, Alert
} from '@mui/material';
import { Camera, Upload, X, Download } from 'lucide-react';
import { apiMalaria } from "../../api";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Header from '../../components/Header';
import { tokens } from '../../theme';
import { useTheme } from '@mui/material/styles';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AnalyseFrottis = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedPatientData, setSelectedPatientData] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [resultat, setResultat] = useState(null);
  const [error, setError] = useState('');
  const [pdfError, setPdfError] = useState('');
  const theme = useTheme(); 
  const colors = tokens(theme.palette.mode);
  const isDarkMode = theme.palette.mode === 'dark';

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await apiMalaria.get('/showpatient/');
        setPatients(response.data);
      } catch (err) {
        console.error("Erreur lors du chargement des patients", err);
        setError("Impossible de charger la liste des patients.");
      }
    };

    fetchPatients();
  }, []);

  // Récupérer les données du patient sélectionné
  useEffect(() => {
    if (selectedPatient) {
      const patient = patients.find(p => p.id.toString() === selectedPatient.toString());
      setSelectedPatientData(patient);
    } else {
      setSelectedPatientData(null);
    }
  }, [selectedPatient, patients]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setResultat(null);
      setError('');
      setPdfError('');
      
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleCameraTrigger = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleFileUploadTrigger = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    setResultat(null);
    setPdfError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleAnalyse = async (e) => {
    e.preventDefault();

    if (!selectedPatient || !image) {
      setError("Veuillez sélectionner un patient et une image.");
      return;
    }

    setLoading(true);
    setResultat(null);
    setError('');
    setPdfError('');

    const formData = new FormData();
    formData.append('id_patient', selectedPatient);
    formData.append('image', image);

    try {
      const response = await apiMalaria.post('/analyse/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResultat(response.data);
    } catch (err) {
      console.error("Erreur lors de l'envoi de l'image:", err);
      setError("Erreur lors de l'analyse du frottis.");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour télécharger le rapport PDF
  const handleDownloadPDF = async () => {
    if (!selectedPatient || !selectedPatientData) {
      setPdfError("Aucune donnée patient disponible pour générer le rapport.");
      return;
    }

    setDownloadingPdf(true);
    setPdfError('');
    
    try {
      const response = await apiMalaria.post('/rapportpdf/', {
        id_patient: selectedPatient
      }, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Créer un blob et déclencher le téléchargement
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport_${selectedPatientData.nom || 'patient'}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error("Erreur lors du téléchargement du PDF:", err);
      setPdfError("Impossible de générer le rapport PDF. Assurez-vous que l'analyse a bien été sauvegardée.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Data for the chart
  const chartData = {
    labels: ['Parasitized', 'Uninfected'],
    datasets: [
      {
        label: 'Taux d infection (%)',
        data: [
          resultat ? (resultat.resultats.Parasitized * 100).toFixed(2) : 0,
          resultat ? (resultat.resultats.Uninfected * 100).toFixed(2) : 0,
        ],
        backgroundColor: [
          resultat && resultat.resultats.Parasitized > 0 ? 'rgba(240, 16, 65, 0.8)' : 'rgba(8, 230, 174, 0.8)',
          resultat && resultat.resultats.Uninfected > 0 ? 'rgba(1, 170, 99, 0.8)' : 'rgba(99, 255, 242, 0.8)',
        ],
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          beginAtZero: true,
        },
      },
    },
  };

  return (
    <Box m="20px">
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="space-between" 
        mb={2}
      >
        <Header 
          title="Analyse de frottis sanguin"
          subtitle="Analyse de frottis sanguin et résultat." 
        />
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: isDarkMode ? '#1F2A40' : '#ffffff', }}>
        <form onSubmit={handleAnalyse}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Patient</InputLabel>
                <Select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  required
                >
                  {patients.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.nom} ({p.code_patient})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <Typography variant="subtitle1">Image du frottis:</Typography>
                
                <IconButton 
                  onClick={handleCameraTrigger}
                  sx={{ 
                    backgroundColor: 'primary.main', 
                    color: 'white',
                    '&:hover': { backgroundColor: 'primary.dark' } 
                  }}
                >
                  <Camera size={24} />
                </IconButton>
                
                <IconButton 
                  onClick={handleFileUploadTrigger}
                  sx={{ 
                    backgroundColor: 'secondary.main', 
                    color: 'white',
                    '&:hover': { backgroundColor: 'secondary.dark' } 
                  }}
                >
                  <Upload size={24} />
                </IconButton>
                
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  ref={cameraInputRef}
                  style={{ display: 'none' }}
                />
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
              </Box>

              <Box mt={3}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  disabled={loading || !image}
                  sx={{ 
                    py: 1.5, 
                    px: 3, 
                    fontWeight: 'bold',
                    width: '100%',
                    maxWidth: '300px'
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : "Analyser l'image"}
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {imagePreview ? (
                <Box position="relative" sx={{ width: '100%', height: '240px' }}>
                  <Card sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CardMedia
                      component="img"
                      image={imagePreview}
                      alt="Aperçu du frottis"
                      sx={{ 
                        objectFit: 'contain', 
                        maxHeight: '240px', 
                        maxWidth: '100%' 
                      }}
                    />
                  </Card>
                  <IconButton 
                    onClick={handleRemoveImage}
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8, 
                      backgroundColor: 'rgba(32, 31, 31, 0.6)', 
                      color: 'white',
                      '&:hover': { backgroundColor: 'rgba(255,0,0,0.7)' } 
                    }}
                  >
                    <X size={20} />
                  </IconButton>
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: '240px', 
                    border: '2px dashed #ccc', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    backgroundColor: 'rgba(241, 225, 225, 0.03)'
                  }}
                >
                  <Typography variant="body1" color="textSecondary">
                    Aperçu de l'image
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {pdfError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPdfError('')}>
          {pdfError}
        </Alert>
      )}

      {resultat && (
        <Paper elevation={3} sx={{ p: 3, mt: 3, backgroundColor: isDarkMode ? ' #1F2A40' : '#ffffff', }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
              Résultat d'analyse
            </Typography>
            
            {/* Bouton de téléchargement PDF */}
            <Button
              onClick={handleDownloadPDF}
              disabled={downloadingPdf || !selectedPatientData}
              variant="contained"
              startIcon={downloadingPdf ? <CircularProgress size={20} /> : <Download size={20} />}
              sx={{
                backgroundColor: colors.blueAccent[700],
                color: colors.grey[100],
                fontSize: "14px",
                fontWeight: "bold",
                padding: "10px 20px",
                "&:hover": {
                  backgroundColor: colors.blueAccent[800],
                },
                "&:disabled": {
                  backgroundColor: colors.grey[600],
                  color: colors.grey[300],
                }
              }}
            >
              {downloadingPdf ? "Génération..." : "Télécharger le rapport PDF"}
            </Button>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6">Détails de l'analyse</Typography>
                
                {/* Informations du patient */}
                {selectedPatientData && (
                  <Box sx={{ mt: 2, p: 2, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Patient analysé:
                    </Typography>
                    <Typography variant="body2">
                      <strong>Nom:</strong> {selectedPatientData.nom}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Code:</strong> {selectedPatientData.code_patient}
                    </Typography>
                    {selectedPatientData.age && (
                      <Typography variant="body2">
                        <strong>Âge:</strong> {selectedPatientData.age} ans
                      </Typography>
                    )}
                    {selectedPatientData.sexe && (
                      <Typography variant="body2">
                        <strong>Sexe:</strong> {selectedPatientData.sexe}
                      </Typography>
                    )}
                  </Box>
                )}

                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ mt: 1 }}>
                    <strong>Parasitized:</strong> {resultat.resultats.Parasitized ? (resultat.resultats.Parasitized * 100).toFixed(2) : 0}%
                  </Typography>
                  <Typography>
                    <strong>Uninfected:</strong> {resultat.resultats.Uninfected ? (resultat.resultats.Uninfected * 100).toFixed(2) : 0}%
                  </Typography>
                  
                  <Typography sx={{ mt: 3, fontWeight: 'bold', color: 'primary.main' }}>
                    Diagnostic: {' '}
                    <span style={{ 
                      color: resultat.resultats.Parasitized > resultat.resultats.Uninfected ? '#e53935' : '#4caf50',
                      fontSize: '1.1rem'
                    }}>
                      {resultat.resultats.Parasitized > resultat.resultats.Uninfected ? 'Présence de parasites' : 'Échantillon sain'}
                    </span>
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={7}>
              <Box sx={{ width: '75%', height: 300 }}>
                <Bar data={chartData} options={chartOptions} />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default AnalyseFrottis;