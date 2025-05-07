import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  IconButton,
  Tooltip
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
  EditOutlined as EditIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Header from "../../components/Header";
import { tokens } from '../../theme';
import { apiMalaria } from '../../api';

const PatientList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
//   const token = localStorage.getItem("token"); // Récupérer le token stocké

  // États pour stocker les patients et les colonnes
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Définition des colonnes adaptées au modèle Patient
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
      width: 120
    },
    { 
      field: 'age', 
      headerName: 'Âge', 
      width: 100
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      width: 190
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Tooltip title="Voir les détails">
            <IconButton 
              size="small" 
              color="primary"
              onClick={() => handleViewPatient(params.row)}
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Modifier l'intervention">
            <IconButton 
              size="small" 
              color="secondary"
              onClick={() => handleEditPatient(params.row)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer le patient">
            <IconButton 
              size="small" 
              color="error"
              onClick={() => handleDeletePatient(params.row.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  // Charger les patients
  useEffect(() => {
    // Fonction pour récupérer les patients
    const fetchPatients = async () => {
      try {
        const response = await apiMalaria.get("showpatient/")
        // Vérification et extraction des données
        console.log("Réponse API Patients:", response.data);
        
        // Ajout d'une vérification pour s'assurer que response.data est un tableau
        const patientsData = Array.isArray(response.data) ? response.data : [];
        
        setPatients(patientsData);
      } catch (error) {
        console.error("❌ Erreur lors du chargement des patients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Gestionnaires d'actions
  const handleViewPatient = (patient) => {
    navigate(`/patients/details/${patient.id}`);
  };

    // Edit intervention 
    const handleEditPatient = (patient) => {
      navigate(`/edit-patient/${patient.id}`);
    };
  

  const handleDeletePatient = async (patientId) => {
    try {
      // Appel API pour supprimer le patient
      await apiMalaria.delete(`patientdelete/${patientId}/delete/`);
  
      // Mise à jour de la liste des patients après suppression
      setPatients(prevPatients => prevPatients.filter(patient => patient.id !== patientId));
      
      console.log("✅ Patient supprimé avec succès");
    } catch (error) {
      console.error("❌ Erreur lors de la suppression du patient:", error);
    }
  };
  

  // Fonction pour rafraîchir les données
  const handleRefresh = () => {
    setLoading(true);
    // Recharger les patients
    const fetchPatients = async () => {
      try {
        const response = await apiMalaria.get("showpatient/")

        const patientsData = Array.isArray(response.data) ? response.data : [];
        setPatients(patientsData);
      } catch (error) {
        console.error("❌ Erreur lors du chargement des patients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
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
          title="PATIENTS"
          subtitle="Gestion des patients pour analyse de frottis sanguin" 
        />
      </Box>
      <Box
        height="75vh"
        maxWidth="1000px"
        margin="0 auto"
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
          rows={patients} 
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

export default PatientList;