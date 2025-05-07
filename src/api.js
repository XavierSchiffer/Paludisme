// import axios from "axios";

// const API_URL = "http://127.0.0.1:8000/api/account";

// const api = axios.create({
//     baseURL: API_URL,
//     headers: {
//         "Content-Type": "application/json",
//     },
// });

// export default api;

import axios from "axios";

// Base URL pour l'authentification (comptes)
// const API_ACCOUNT_URL = "http://127.0.0.1:8000/api/account";

// Base URL pour la gestion des fruits (upload d'images, secteurs, etc.)
// const API_FRUIT_URL = "http://127.0.0.1:8000/api/Fruit";
const API_FRUIT_URL = "http://127.0.0.1:8000/api/";

// Création des instances Axios
// export const apiAccount = axios.create({
//     baseURL: API_ACCOUNT_URL,
//     headers: {
//         "Content-Type": "application/json",
//     },
// });

export const apiMalaria = axios.create({
    baseURL: API_FRUIT_URL,
    headers: {
        "Content-Type": "application/json",
    },
});
