import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Avatar, 
  IconButton, 
  Tooltip,
  Chip
} from '@mui/material';
import { 
  ArrowBackIosNew as BackIcon, 
  PersonOutline as ProfileIcon,
  EmailOutlined as EmailIcon,
  WcOutlined as GenderIcon,
  CalendarTodayOutlined as AgeIcon,
  QrCodeOutlined as CodeIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { tokens } from '../../theme';
import { apiMalaria } from '../../api';
import Header from "../../components/Header";

const PatientDetails = () => {
  const { patient_id  } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [nombreAnalyses, setNombreAnalyses] = useState(0);

useEffect(() => {
  const fetchAnalyses = async () => {
    try {
      const response = await apiMalaria.get('getresults');
      const toutesAnalyses = response.data;

      if (patient?.code_patient) {
        const analysesPatient = toutesAnalyses.filter(
          (item) => item.code_patient === patient.code_patient
        );
        setNombreAnalyses(analysesPatient.length);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des analyses :", error);
    }
  };

  if (patient?.code_patient) {
    fetchAnalyses();
  }
}, [patient]);


  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const response = await apiMalaria.get(`patientdetail/${patient_id }/`);

        console.log("Données du patient :", response.data);
  
        // Vérification des données reçues
        if (response.data) {
          setPatient(response.data);
        } else {
          setError("Détails du patient non trouvés");
        }
      } catch (error) {
        console.error("❌ Erreur lors du chargement des détails du patient :", error);
        setError("Impossible de charger les détails du patient");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [patient_id ]);

  const handleGoBack = () => {
    navigate('/list-patient');
  };

  const getAvatarText = (patient) => {
    if (patient && patient.nom) {
      return patient.nom.charAt(0).toUpperCase();
    }
    return "P";
  };
  
  const getAvatarColor = (sexe) => {
    return sexe === 'Masculin' ? colors.blueAccent[500] : colors.redAccent[500];
  };

  const renderDetailSection = (title, children) => (
    <Paper 
      elevation={3} 
      sx={{ 
        backgroundColor: colors.primary[400], 
        p: 3, 
        mb: 2, 
        borderRadius: 2 
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          color: colors.greenAccent[400], 
          mb: 2, 
          borderBottom: `2px solid ${colors.greenAccent[400]}`,
          pb: 1 
        }}
      >
        {title}
      </Typography>
      {children}
    </Paper>
  );

  const renderDetailRow = (icon, label, value) => (
    <Grid container spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
      <Grid item xs={1} sx={{ display: 'flex', justifyContent: 'center' }}>
        {icon}
      </Grid>
      <Grid item xs={4}>
        <Typography variant="body1" fontWeight="bold" color={colors.grey[100]}>
          {label}
        </Typography>
      </Grid>
      <Grid item xs={7}>
        <Typography variant="body1" color={colors.grey[200]}>
          {value !== undefined && value !== null && value !== '' ? value : 'N/A'}
        </Typography>
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Box m="20px">
        <Typography>Chargement des détails du patient...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box m="20px">
        <Typography color="error">{error}</Typography>
        <Box mt={2}>
          <IconButton onClick={handleGoBack} color="primary">
            <BackIcon /> Retour à la liste des patients
          </IconButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box m="20px">
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={3}
      >
        <Header 
          title="DÉTAILS DU PATIENT" 
          subtitle={`Dossier de ${patient.nom}`} 
        />
        <Tooltip title="Retour à la liste">
          <IconButton onClick={handleGoBack} color="primary">
            <BackIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {/* Résumé du profil */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              backgroundColor: colors.primary[400], 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              borderRadius: 2
            }}
          >
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120, 
                mb: 2, 
                bgcolor: getAvatarColor(patient.sexe)
              }}
            >
              {getAvatarText(patient)}
            </Avatar>
            <Typography 
              variant="h4" 
              color={colors.grey[100]} 
              sx={{ mb: 1 }}
            >
              {patient.nom}
            </Typography>
            <Chip
              label={patient.sexe}
              color={patient.sexe === 'Masculin' ? 'info' : 'error'}
              sx={{ mt: 1 }}
            />
            <Typography 
              variant="subtitle1" 
              color={colors.grey[300]}
              sx={{ mt: 2 }}
            >
              {`${patient.age} ans`}
            </Typography>
            {patient.code_patient && (
              <Typography 
                variant="body2" 
                color={colors.greenAccent[400]}
                sx={{ mt: 2, fontFamily: 'monospace', letterSpacing: '0.1em' }}
              >
                Code: {patient.code_patient}
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Informations détaillées */}
        <Grid item xs={12} md={8}>
          {renderDetailSection("Informations du Patient", (
            <>
              {renderDetailRow(
                <CodeIcon color="primary" />, 
                "Code Patient", 
                patient.code_patient
              )}
              {renderDetailRow(
                <ProfileIcon color="primary" />, 
                "Nom", 
                patient.nom
              )}
              {renderDetailRow(
                <GenderIcon color="primary" />, 
                "Sexe", 
                patient.sexe
              )}
              {renderDetailRow(
                <AgeIcon color="primary" />, 
                "Âge", 
                `${patient.age} ans`
              )}
              {renderDetailRow(
                <EmailIcon color="primary" />, 
                "Email", 
                patient.email
              )}
            </>
          ))}
          
          {/* Section pour les résultats d'analyses si disponibles à l'avenir */}
          {renderDetailSection("Analyses de Frottis Sanguin", (
        <Typography variant="body1" color={colors.grey[300]}>
            Nombre d’analyses enregistrées : {nombreAnalyses}
        </Typography>
        ))}

        </Grid>
      </Grid>
    </Box>
  );
};

export default PatientDetails;