import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import { useTheme } from "@mui/material";
import { 
  DataGrid, 
  GridToolbarContainer, 
  GridToolbarExport, 
  GridToolbarFilterButton 
} from '@mui/x-data-grid';
import { 
  RefreshOutlined as RefreshIcon, 
  FilterListOutlined as FilterIcon, 
  CloudDownloadOutlined as ExportIcon,
  VisibilityOutlined as ViewIcon,
  DeleteOutlined as DeleteIcon,
  PersonAddOutlined as AddIcon,
  EditOutlined as EditIcon,
  ScienceOutlined as AnalysisIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Header from "../../components/Header";
import { tokens } from '../../theme';
import { apiMalaria } from '../../api';

const PatientAnalyseList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  // États pour stocker les patients et les analyses
  const [patients, setPatients] = useState([]);
  const [patientAnalyses, setPatientAnalyses] = useState([]);
  const [mergedData, setMergedData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Définition des colonnes adaptées
  const columns = [
    { 
      field: 'code_patient', 
      headerName: 'Code Patient', 
      width: 190 
    },
    { 
      field: 'nom', 
      headerName: 'Nom', 
      width: 190
    },
    { 
      field: 'sexe', 
      headerName: 'Sexe', 
      width: 100
    },
    { 
      field: 'age', 
      headerName: 'Âge', 
      width: 80
    },
    {
      field: 'analyses',
      headerName: 'Analyses',
      width: 150,
      renderCell: (params) => {
        const analysesCount = params.row.analyses?.length || 0;
        return (
          <Chip 
            label={`${analysesCount} analyse${analysesCount > 1 ? 's' : ''}`}
            color={analysesCount > 0 ? "success" : "default"}
            variant="outlined"
            onClick={() => handleViewAnalyses(params.row.id)}
            icon={<AnalysisIcon fontSize="small" />}
            clickable
          />
        );
      }
    }
  ];

  // Charger les patients et leurs analyses
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Récupérer les patients
        const patientsResponse = await apiMalaria.get("showpatient/");
        const patientsData = Array.isArray(patientsResponse.data) ? patientsResponse.data : [];
        setPatients(patientsData);
        
        // Récupérer les analyses associées aux patients
        const analysesResponse = await apiMalaria.get("getresults/");
        const analysesData = Array.isArray(analysesResponse.data) ? analysesResponse.data : [];
        setPatientAnalyses(analysesData);
        
        // Fusionner les données
        mergePatientAndAnalyses(patientsData, analysesData);
      } catch (error) {
        console.error("❌ Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fusionner les données des patients avec leurs analyses
  const mergePatientAndAnalyses = (patients, analyses) => {
    const patientMap = {};
  
    // Grouper les analyses par code_patient
    analyses.forEach(analysis => {
      const code = analysis.code_patient;
      if (code) {
        if (!patientMap[code]) {
          patientMap[code] = [];
        }
        patientMap[code].push(analysis);
      }
    });
  
    // Associer les analyses aux patients via code_patient
    const mergedData = patients.map(patient => {
      const analysesForPatient = patientMap[patient.code_patient] || [];
      return {
        ...patient,
        analyses: analysesForPatient
      };
    });
  
    setMergedData(mergedData);
  };
    
  // Gestionnaires d'actions
  const handleViewPatient = (patient) => {
    navigate(`/patients/details/${patient.id}`);
  };

  const handleEditPatient = (patient) => {
    navigate(`/edit-patient/${patient.id}`);
  };

  const handleDeletePatient = async (patientId) => {
    try {
      await apiMalaria.delete(`patientdelete/${patientId}/delete/`);
      setMergedData(prevData => prevData.filter(patient => patient.id !== patientId));
      console.log("✅ Patient supprimé avec succès");
    } catch (error) {
      console.error("❌ Erreur lors de la suppression du patient:", error);
    }
  };

  const handleViewAnalyses = (patientId) => {
    // Naviguer vers la page des détails d'analyse pour ce patient
    navigate(`/patient-analyses/${patientId}`);
  };

  // Fonction pour rafraîchir les données
  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Récupérer les patients
      const patientsResponse = await apiMalaria.get("showpatient/");
      const patientsData = Array.isArray(patientsResponse.data) ? patientsResponse.data : [];
      setPatients(patientsData);
      
      // Récupérer les analyses associées aux patients
      const analysesResponse = await apiMalaria.get("getresults/");
      const analysesData = Array.isArray(analysesResponse.data) ? analysesResponse.data : [];
      setPatientAnalyses(analysesData);
      
      // Fusionner les données
      mergePatientAndAnalyses(patientsData, analysesData);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction personnalisée pour la barre d'outils
  function CustomToolbar() {
    return (
      <GridToolbarContainer 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          p: 1 
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <GridToolbarFilterButton startIcon={<FilterIcon />} />
          <GridToolbarExport 
            startIcon={<ExportIcon />} 
            printOptions={{ disableToolbarButton: true }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/patients/add')}
            sx={{ backgroundColor: colors.greenAccent[600] }}
          >
            Ajouter Patient
          </Button>
        </Box>
        <Tooltip title="Actualiser les données">
          <IconButton onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </GridToolbarContainer>
    );
  }

  return (
    <Box m="20px">
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="space-between" 
        mb={2}
      >
        <Header 
          title="PATIENTS ET ANALYSES"
          subtitle="Gestion des patients et de leurs analyses de frottis sanguin" 
        />
      </Box>
      <Box
        height="75vh"
        maxWidth="800px" // Limite la largeur totale
        margin="0 auto" // Centre le tableau
        sx={{
          "& .MuiDataGrid-root": { 
            border: "none", 
            borderRadius: 3 
          },
          "& .MuiDataGrid-cell": { 
            borderBottom: "none" 
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          },
          "& .MuiDataGrid-virtualScroller": { 
            backgroundColor: colors.primary[400] 
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          },
          "& .MuiCheckbox-root": { 
            color: `${colors.greenAccent[200]} !important` 
          },
          "& .MuiDataGrid-toolbarContainer": {
            backgroundColor: colors.primary[500],
            borderRadius: 2,
            p: 1,
          }
        }}
      >
        <DataGrid 
          checkboxSelection 
          rows={mergedData} 
          columns={columns} 
          getRowId={(row) => row.id}
          loading={loading}
          slots={{
            toolbar: CustomToolbar,
          }}
          sx={{
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: colors.blueAccent[500],
                transition: 'background-color 0.3s ease',
              }
            }
          }}
          initialState={{
            pagination: { 
              paginationModel: { pageSize: 10 } 
            },
          }}
          pageSizeOptions={[5, 10, 25]}
        />
      </Box>
    </Box>
  );
};

export default PatientAnalyseList;