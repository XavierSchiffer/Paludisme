import { Box, Button, IconButton, Typography, useTheme, TextField } from "@mui/material";
import { tokens } from "../../theme";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import WcIcon from "@mui/icons-material/Wc";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import GeographyChart from "../../components/GeographyChart";
import BarChart from "../../components/BarChart";
import StatBox from "../../components/StatBox";
import ProgressCircle from "../../components/ProgressCircle";
import { useState, useEffect } from "react";
import { apiMalaria } from "../../api";
import BugReportIcon from "@mui/icons-material/BugReport";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AssessmentIcon from "@mui/icons-material/Assessment";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // État pour la date sélectionnée
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // État pour stocker les données des patients
  const [patientsData, setPatientsData] = useState({
    masculin: 0,
    feminin: 0,
    total: 0,
    loading: true
  });
  
  const [parasiteData, setParasiteData] = useState({
    parasites: 0,
    non_parasites: 0,
    date: '',
    loading: true
  });

  const [repartitionAgeData, setRepartitionAgeData] = useState({
    data: [],
    loading: true
  });
  
  // État pour les données d'évolution mensuelle
  const [evolutionData, setEvolutionData] = useState({
    data: [],
    loading: true
  });

  // État pour les données de répartition par sexe
  const [repartitionSexeData, setRepartitionSexeData] = useState({
    data: [],
    loading: true
  });

  // État pour le total des analyses effectuées
  const [totalAnalysesData, setTotalAnalysesData] = useState({
    total: 0,
    loading: true
  });

  // Fonction pour récupérer le total des analyses effectuées
  const fetchTotalAnalysesData = async () => {
    try {
      const response = await apiMalaria.get('/totalanalyse/');
      const data = response.data;
      
      setTotalAnalysesData({
        total: data["Nombre d'analyse effectuees"] || 0,
        loading: false
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du total des analyses:', error);
      setTotalAnalysesData(prev => ({ ...prev, loading: false }));
    }
  };

  // Fonction pour récupérer les données de répartition par sexe
  const fetchRepartitionSexeData = async () => {
    try {
      const response = await apiMalaria.get('/repartitionsexeparasite/');
      const data = response.data;
      
      // Transformer les données pour le graphique en barres
      const chartData = [
        {
          sexe: 'Masculin',
          'Cas Parasitaires': data.M || data.Masculin || 0,
          'Cas ParasitairesColor': colors.blueAccent[600]
        },
        {
          sexe: 'Féminin', 
          'Cas Parasitaires': data.F || data.Feminin || 0,
          'Cas ParasitairesColor': colors.redAccent[600]
        }
      ];

      setRepartitionSexeData({
        data: chartData,
        loading: false
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des données de répartition par sexe:', error);
      setRepartitionSexeData(prev => ({ ...prev, loading: false }));
    }
  };

  // Fonction pour récupérer les données d'évolution mensuelle
  const fetchEvolutionData = async () => {
    try {
      const response = await apiMalaria.get('/evolutionmensuelleparasite/');
      const data = response.data;
      
      // Transformer les données pour le graphique
      const months = [
        'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
        'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
      ];
      
      // Obtenir l'année courante
      const currentYear = new Date().getFullYear();
      
      // Créer un tableau complet pour tous les mois de l'année
      const formattedData = months.map((month, index) => {
        const monthKey = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
        return {
          x: month,
          y: data[monthKey] || 0
        };
      });

      const chartData = [
        {
          id: "Cas Parasitaires",
          color: colors.redAccent[500],
          data: formattedData
        }
      ];

      setEvolutionData({
        data: chartData,
        loading: false
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des données d\'évolution:', error);
      setEvolutionData(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchParasiteData = async (date = null) => {
    try {
      const targetDate = date || selectedDate;
      const response = await apiMalaria.get(`/analyserepartie/?date=${targetDate}`);
      const data = response.data;
  
      setParasiteData({
        parasites: data.parasites,
        non_parasites: data.non_parasites,
        date: data.date,
        loading: false
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des données parasites:', error);
      setParasiteData(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDateChange = (event) => {
    const newDate = event.target.value;
    setSelectedDate(newDate);
    fetchParasiteData(newDate);
  };

  // État pour stocker les derniers patients analysés
  const [derniersPatients, setDerniersPatients] = useState({
    data: [],
    loading: true
  });

  // Fonction pour récupérer les données des patients
  const fetchPatientsData = async () => {
    try {
      const response = await apiMalaria.get('/patientparsexe/');
      const data = response.data;
  
      setPatientsData({
        masculin: data.masculin,
        feminin: data.feminin,
        total: data.masculin + data.feminin,
        loading: false
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des données patients:', error);
      setPatientsData(prev => ({ ...prev, loading: false }));
    }
  };

  // Fonction pour analyser le status et déterminer le résultat
  const analyserStatus = (statusString) => {
    if (!statusString || statusString.trim() === '') {
      return {
        resultat: 'EN COURS',
        pourcentage: 0
      };
    }

    try {
      const cleanStatus = statusString.replace(/'/g, '"');
      const statusObj = JSON.parse(cleanStatus);
      
      const parasitized = statusObj.Parasitized || 0;
      const uninfected = statusObj.Uninfected || 0;
      
      if (parasitized > uninfected) {
        return {
          resultat: 'POSITIF',
          pourcentage: Math.round(parasitized * 100)
        };
      } else if (uninfected > parasitized) {
        return {
          resultat: 'NEGATIF',
          pourcentage: Math.round(uninfected * 100)
        };
      } else {
        return {
          resultat: 'INCERTAIN',
          pourcentage: Math.max(parasitized, uninfected) * 100
        };
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse du status:', error);
      return {
        resultat: 'ERREUR',
        pourcentage: 0
      };
    }
  };

  // Fonction pour récupérer les derniers patients analysés
  const fetchDerniersPatients = async () => {
    try {
      const response = await apiMalaria.get('/derniereanalyse/');
      
      const processedData = response.data.map(patient => {
        const analyse = analyserStatus(patient.status);
        return {
          id: patient.code_patient,
          nom_patient: patient.nom_patient,
          code_patient: patient.code_patient,
          resultat_analyse: analyse.resultat,
          pourcentage_confiance: analyse.pourcentage,
          image: patient.image,
          status_original: patient.status
        };
      });

      setDerniersPatients({
        data: processedData,
        loading: false
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des derniers patients:', error);
      setDerniersPatients(prev => ({ ...prev, loading: false }));
    }
  };

  // Fonction pour récupérer les données de répartition par tranche d'âge
  const fetchRepartitionAgeData = async () => {
    try {
      const response = await apiMalaria.get('/trancheageinfectees/');
      const data = response.data;
      
      // Transformer les données pour le graphique en barres
      const chartData = Object.keys(data).map(tranche => ({
        tranche_age: tranche,
        'Cas Infectés': data[tranche] || 0,
        'Cas InfectésColor': colors.greenAccent[600] // Utilise une couleur disponible
      }));
  
      setRepartitionAgeData({
        data: chartData,
        loading: false
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des données de répartition par âge:', error);
      setRepartitionAgeData(prev => ({ ...prev, loading: false }));
    }
  };

  // Effet pour charger les données au montage du composant
  useEffect(() => {
    fetchPatientsData();
    fetchDerniersPatients();
    fetchParasiteData();
    fetchEvolutionData();
    fetchRepartitionSexeData();
    fetchTotalAnalysesData();
    fetchRepartitionAgeData();
  }, []);

  // Calculer le total et les pourcentages
  const totalPatients = parasiteData.parasites + parasiteData.non_parasites;
  const parasiteProgress = totalPatients > 0 ? 
    (parasiteData.parasites / totalPatients).toFixed(2) : "0.00";
  const nonParasiteProgress = totalPatients > 0 ? 
    (parasiteData.non_parasites / totalPatients).toFixed(2) : "0.00";

  // Fonction pour formater la date d'affichage
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',  
      year: 'numeric'
    });
  };

  // Calcul du pourcentage de masculin vs total
  const progressValue = patientsData.total > 0 ? 
    (patientsData.masculin / patientsData.total).toFixed(2) : "0.00";

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />

        <Box display="flex" alignItems="center" gap="15px">
          <Box display="flex" alignItems="center" gap="10px">
            <CalendarTodayIcon sx={{ color: colors.grey[100] }} />
            <TextField
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: colors.grey[100],
                  '& fieldset': {
                    borderColor: colors.grey[400],
                  },
                  '&:hover fieldset': {
                    borderColor: colors.blueAccent[500],
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: colors.blueAccent[500],
                  },
                },
                '& .MuiInputLabel-root': {
                  color: colors.grey[100],
                },
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
          
          {/* <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
          >
            <DownloadOutlinedIcon sx={{ mr: "10px" }} />
            Download Reports
          </Button> */}
        </Box>
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1 */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={patientsData.loading ? "..." : `M: ${patientsData.masculin} | F: ${patientsData.feminin}`}
            subtitle="Patients par sexe"
            progress={progressValue}
            increase={`Total: ${patientsData.total}`}
            icon={
              <WcIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
        >
          {totalAnalysesData.loading && (
            <Box
              position="absolute"
              top="10px"
              right="10px"
              sx={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: colors.blueAccent[500],
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                  '100%': { opacity: 1 }
                },
                animation: "pulse 1.5s infinite"
              }}
            />
          )}
          <StatBox
            title={totalAnalysesData.loading ? "..." : totalAnalysesData.total.toString()}
            subtitle="Total Analyses"
            progress="1.00"
            increase="Toutes analyses"
            icon={
              <AssessmentIcon
                sx={{ color: colors.blueAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
          >
          {parasiteData.loading && (
            <Box
              position="absolute"
              top="10px"
              right="10px"
              sx={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: colors.blueAccent[500],
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                  '100%': { opacity: 1 }
                },
                animation: "pulse 1.5s infinite"
              }}
            />
          )}
          <StatBox
            title={parasiteData.loading ? "..." : parasiteData.parasites.toString()}
            subtitle={`Cas Parasités (${formatDisplayDate(selectedDate)})`}
            progress={parasiteProgress}
            increase={totalPatients > 0 ? `${Math.round(parasiteProgress * 100)}% du total` : "0%"}
            icon={
              <BugReportIcon
                sx={{ color: colors.redAccent[600], fontSize: "26px" }}
              />
            }
          />
          </Box>

          <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
          >
          {parasiteData.loading && (
            <Box
              position="absolute"
              top="10px"
              right="10px"
              sx={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: colors.blueAccent[500],
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                  '100%': { opacity: 1 }
                },
                animation: "pulse 1.5s infinite"
              }}
            />
          )}
          <StatBox
            title={parasiteData.loading ? "..." : parasiteData.non_parasites.toString()}
            subtitle={`Cas Non Parasités (${formatDisplayDate(selectedDate)})`}
            progress={nonParasiteProgress}
            increase={totalPatients > 0 ? `${Math.round(nonParasiteProgress * 100)}% du total` : "0%"}
            icon={
              <HealthAndSafetyIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
          </Box>

        {/* ROW 2 - Evolution mensuelle */}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Évolution Mensuelle des Cas Parasitaires
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.redAccent[500]}
              >
                {evolutionData.loading ? "Chargement..." : `${evolutionData.data[0]?.data.reduce((sum, item) => sum + item.y, 0) || 0} cas total`}
              </Typography>
            </Box>
            <Box>
              <IconButton onClick={fetchEvolutionData}>
                <DownloadOutlinedIcon
                  sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
                />
              </IconButton>
            </Box>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            {evolutionData.loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography color={colors.grey[100]}>Chargement des données...</Typography>
              </Box>
            ) : (
              <LineChart isDashboard={true} data={evolutionData.data} />
            )}
          </Box>
        </Box>
        
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Derniers Patients Analysés
            </Typography>
          </Box>
          {derniersPatients.loading ? (
            <Box p="15px" textAlign="center">
              <Typography color={colors.grey[100]}>
                Chargement...
              </Typography>
            </Box>
          ) : derniersPatients.data.length === 0 ? (
            <Box p="15px" textAlign="center">
              <Typography color={colors.grey[100]}>
                Aucun patient analysé récemment
              </Typography>
            </Box>
          ) : (
            derniersPatients.data.map((patient, i) => (
              <Box
                key={`${patient.code_patient}-${i}`}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                borderBottom={`4px solid ${colors.primary[500]}`}
                p="15px"
              >
                <Box flex="1">
                  <Typography
                    color={colors.greenAccent[500]}
                    variant="h5"  
                    fontWeight="600"
                  >
                    {patient.nom_patient}
                  </Typography>
                  <Typography color={colors.grey[100]} variant="body2">
                    Code: {patient.code_patient}
                  </Typography>
                  {patient.pourcentage_confiance > 0 && (
                    <Typography color={colors.grey[300]} variant="body2">
                      Confiance: {patient.pourcentage_confiance}%
                    </Typography>
                  )}
                </Box>
                <Box
                  backgroundColor={
                    patient.resultat_analyse === 'POSITIF' 
                    ? colors.redAccent[500] 
                    : patient.resultat_analyse === 'NEGATIF'
                    ? colors.greenAccent[500]
                    : patient.resultat_analyse === 'EN COURS'
                    ? colors.blueAccent[500]
                    : colors.grey[500]
                  }
                  p="5px 10px"
                  borderRadius="4px"
                  color={colors.grey[100]}
                  minWidth="80px"
                  textAlign="center"
                >
                  <Typography variant="body2" fontWeight="600">
                    {patient.resultat_analyse}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
        </Box>

        {/* ROW 3 */}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p="15px"
          >
            <Typography
              variant="h5"
              fontWeight="600"
              color={colors.grey[100]}
            >
              Répartition par Tranche d'Âge des Patients Infectés
            </Typography>
            <IconButton onClick={fetchRepartitionAgeData}>
              <DownloadOutlinedIcon
                sx={{ fontSize: "20px", color: colors.greenAccent[500] }}
              />
            </IconButton>
          </Box>
          <Box height="250px" mt="-20px">
            {repartitionAgeData.loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography color={colors.grey[100]}>Chargement...</Typography>
              </Box>
            ) : (
              <BarChart 
                isDashboard={true} 
                data={repartitionAgeData.data}
              />
            )}
          </Box>
        </Box>

        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p="15px"
          >
            <Typography
              variant="h5"
              fontWeight="600"
              color={colors.grey[100]}
            >
              Répartition par Sexe des Cas Parasitaires
            </Typography>
            <IconButton onClick={fetchRepartitionSexeData}>
              <DownloadOutlinedIcon
                sx={{ fontSize: "20px", color: colors.greenAccent[500] }}
              />
            </IconButton>
          </Box>
          <Box height="250px" mt="-20px">
            {repartitionSexeData.loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography color={colors.grey[100]}>Chargement...</Typography>
              </Box>
            ) : (
              <BarChart isDashboard={true} data={repartitionSexeData.data} />
            )}
          </Box>
        </Box>

      </Box>
    </Box>
  );
};

export default Dashboard;