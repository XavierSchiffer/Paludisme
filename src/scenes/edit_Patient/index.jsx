import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, IconButton, Tooltip, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { ArrowLeft, Loader } from 'lucide-react';
import { apiMalaria } from "../../api";
import { useTheme } from '@mui/material/styles';
import { tokens } from "../../theme";
import Header from '../../components/Header';

const EditPatient = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { patient_id } = useParams();

  const [formData, setFormData] = useState({
    nom: '',
    sexe: '',
    age: '',
    email: '',
  });


  useEffect(() => {
    fetchPatientInfo();
  }, []);

  const fetchPatientInfo = async () => {
    try {
    
      console.log("Récupération des informations du patient avec ID:", patient_id);
    //   const response = await apiMalaria.get(`patients/detail/${id}/`)
      const response = await apiMalaria.get(`patientdetail/${patient_id }/`);

      
      console.log("Données reçues du patient:", response.data);
      
      if (response.status === 200) {
        setFormData(response.data);
      } else {
        setError("Erreur lors de la récupération des informations du patient");
      }
    } catch (error) {
      setError("Erreur lors de la récupération des informations du patient");
      console.error("❌ Erreur lors de la récupération des informations:", error);
    } finally {
      setInitialLoad(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
    // updatepatient/<int:pk>/update/
      const response = await apiMalaria.put(`/updatepatient/${patient_id}/update/`, formData);
  
      console.log("Réponse API après mise à jour:", response.data);
  
      setSuccess("Patient mis à jour avec succès");
      setTimeout(() => navigate("/list-patient"), 2000); // Redirige après 2 secondes
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour:", error);
  
      if (error.response) {
        console.log("Réponse du serveur:", error.response.data);
        setError(error.response.data.message || "Erreur côté serveur");
      } else if (error.request) {
        setError("Aucune réponse du serveur. Vérifiez votre connexion.");
      } else {
        setError("Erreur lors de la requête.");
      }
    }
  
    setLoading(false);
  };

  if (initialLoad) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Loader className="animate-spin" size={40} />
        <Typography>Chargement des informations du patient...</Typography>
      </Box>
    );
  }

  return (
    <Box m="20px">
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
      <Header 
          title="Modifier le patient" 
          subtitle="Formulaire pour modifier un patient." 
        />

        {/* <Tooltip title="Retour à la liste des patients">
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              borderRadius: 2,
              '&:hover': { backgroundColor: colors.blueAccent[600] }
            }}
          >
            <ArrowLeft />
          </IconButton>
        </Tooltip>

        <Typography variant="h2">Modifier le patient</Typography> */}
      </Box>

      <form onSubmit={handleSubmit}>
        <Box display="grid" gap="15px" gridTemplateColumns="repeat(4, minmax(0, 1fr))">
          {/* Informations personnelles */}
          <TextField
            fullWidth
            variant="filled"
            label="Nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            disabled={loading}
            sx={{ gridColumn: "span 2" }}
          />
          <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Âge"
                // onBlur={formData.age}
                onChange={handleChange}
                value={formData.age}
                name="age"
                sx={{ gridColumn: "span 2" }}
            />

          <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 2" }}>
            <InputLabel>Sexe</InputLabel>
            <Select
              name="sexe"
              value={formData.sexe}
              onChange={handleChange}
              disabled={loading}
            >
              <MenuItem value="Masculin">Masculin</MenuItem>
              <MenuItem value="Feminin">Feminin</MenuItem>
            </Select>
          </FormControl>

          {/* Coordonnées */}
          <TextField
            fullWidth
            variant="filled"
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            sx={{ gridColumn: "span 2" }}
          />
        </Box>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        {success && (
          <Typography color="success.main" sx={{ mt: 2 }}>
            {success}
          </Typography>
        )}

        <Box display="flex" justifyContent="end" mt="20px">
          <Button
            type="submit"
            color="secondary"
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
          >
            {loading ? (
              <Box display="flex" alignItems="center" gap={1}>
                <Loader size={20} className="animate-spin" />
                <span>Mise à jour en cours...</span>
              </Box>
            ) : (
              'Mettre à jour le patient'
            )}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default EditPatient;