import React, { useState, useEffect } from "react";
import { Box, Button, TextField, MenuItem, Typography, useTheme, useMediaQuery, CircularProgress } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { apiMalaria } from "../api";
import { tokens } from "../theme";

const PatientRegistrationForm = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");

//   useEffect(() => {
//     const storedToken = localStorage.getItem("token");

//     if (storedToken) {
//       setToken(storedToken);
//     } else {
//       setError("Erreur d'authentification. Veuillez vous reconnecter.");
//     }
//   }, []);

  // Schéma de validation pour les patients
  const patientSchema = yup.object().shape({
    nom: yup.string().required("Le nom est requis"),
    sexe: yup.string().required("Le sexe est requis"),
    age: yup.number()
      .required("L'âge est requis")
      .positive("L'âge doit être positif")
      .integer("L'âge doit être un nombre entier"),
    email: yup.string().email("Email invalide"),
  });

  // Valeurs initiales pour le patient
  const initialValues = {
    nom: "",
    sexe: "",
    age: "",
    email: "",
  };

  const handleFormSubmit = async (values, { resetForm }) => {
    setMessage("");
    setError("");
    setLoading(true);


    try {
      // Appel à l'API pour enregistrer le patient
    
    const response = await apiMalaria.post("patients/", values);

      setMessage("Patient ajouté avec succès !");
      console.log("Réponse API:", response.data);
      resetForm();
      
      // Rediriger après 2 secondes vers la liste des patients
      setTimeout(() => navigate("/add-patient"), 2000);
    } catch (error) {
      console.error("Erreur lors de l'ajout du patient:", error);
      setError(
        error.response?.data?.message || 
        "Erreur lors de l'ajout du patient. Veuillez vérifier vos informations."
      );
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Box m="20px" display="flex" justifyContent="center" alignItems="center" height="80vh">
        <Typography variant="h5" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box m="20px">
      {/* En-tête */}
      <Box 
        display="flex" 
        flexDirection={isNonMobile ? "row" : "column"}
        alignItems={isNonMobile ? "center" : "flex-start"} 
        justifyContent="space-between" 
        mb={3}
      >
        <Header 
          title="Enregistrement de Patient" 
          subtitle="Formulaire pour ajouter un nouveau patient pour analyse de frottis sanguin" 
        />
      </Box>

      {/* Formulaire */}
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={patientSchema}
      >
        {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Box 
              display="grid" 
              gap="30px" 
              gridTemplateColumns={`repeat(${isNonMobile ? 2 : 1}, minmax(0, 1fr))`}
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 1" },
              }}
            >
              {/* Champ Nom */}
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Nom"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nom}
                name="nom"
                error={!!touched.nom && !!errors.nom}
                helperText={touched.nom && errors.nom}
                sx={{ gridColumn: "span 1" }}
              />
              
              {/* Champ Sexe (Menu déroulant) */}
              <TextField
                fullWidth
                variant="filled"
                select
                label="Sexe"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.sexe}
                name="sexe"
                error={!!touched.sexe && !!errors.sexe}
                helperText={touched.sexe && errors.sexe}
                sx={{ gridColumn: "span 1" }}
              >
                <MenuItem value="Masculin">Masculin</MenuItem>
                <MenuItem value="Feminin">Féminin</MenuItem>
              </TextField>
              
              {/* Champ Âge */}
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Âge"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.age}
                name="age"
                error={!!touched.age && !!errors.age}
                helperText={touched.age && errors.age}
                sx={{ gridColumn: "span 1" }}
              />
              
              {/* Champ Email (facultatif selon votre modèle) */}
              <TextField
                fullWidth
                variant="filled"
                type="email"
                label="Email (facultatif)"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: "span 1" }}
              />
            </Box>

            {/* Boutons */}
            <Box display="flex" justifyContent="space-between" mt="30px">
              <Button 
                type="button" 
                color="error" 
                variant="contained" 
                onClick={() => navigate("/patients")}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                color="secondary" 
                variant="contained" 
                disabled={loading}
                sx={{ 
                  backgroundColor: colors.greenAccent[600],
                  "&:hover": { backgroundColor: colors.greenAccent[700] }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Enregistrer Patient"
                )}
              </Button>
            </Box>

            {/* Message de succès */}
            {message && (
              <Box mt={2}>
                <Typography variant="body1" color="success.main">
                  {message}
                </Typography>
              </Box>
            )}
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default PatientRegistrationForm;