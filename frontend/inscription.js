// Import validation functions from the frontend utils
import { validateEmail, validateTelephone } from './utils/validators.js';

function inscription() {
    document.getElementById("bouton-connexion").addEventListener("click", function () {
        const prenom = document.getElementById("prenom").value.trim();
        const nom = document.getElementById("nom").value.trim();
        const email = document.getElementById("email").value.trim();
        const telephone = document.getElementById("telephone").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirm_password").value.trim();
        // Removed role from cookies/navbar. Instead, get role directly from radio button.
        const roleRadio = document.querySelector('input[name="role"]:checked');
        if (!roleRadio) {
            alert("Veuillez sélectionner un type d'utilisateur.");
            return;
        }
        const role = roleRadio.value;

        console.log("Fields after role selection:", { prenom, nom, email, password, telephone, role });

        // Validate that all fields are filled
        if (!prenom || !nom || !email || !password || !telephone || !role) {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        // Validate email format
        if (!validateEmail(email)) {
            alert("Format d'email invalide. Veuillez entrer un email valide.");
            return;
        }

        // Validate telephone format
        if (!validateTelephone(telephone)) {
            alert("Format de téléphone invalide. Veuillez entrer un numéro valide.");
            return;
        }

        // Validate password confirmation
        if (password !== confirmPassword) {
            alert("Les mots de passe ne correspondent pas.");
            return;
        }

        const inscriptionData = { prenom, nom, email, password, telephone };

        // First, check if email already exists for any user
        fetch(`/user/check-email?email=${encodeURIComponent(email)}`, {
            method: 'GET',
        })
        .then(response => response.json())
        .then(data => {
            if (data.exists) {
                alert("Un utilisateur avec cet email existe déjà.");
                return;
            }
            
            // Determine the route based on the role
            let route;
            if (role === "avocat") {
                route = '/auth/register/avocat';
            } else if (role === "client") {
                route = '/auth/register/client';
            } else if (role === "admin") {
                route = '/auth/register/admin';
            }

            // Email doesn't exist, proceed with registration
            return fetch(route, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inscriptionData),
            });
        })
        .then(response => {
            // If we stopped at the email check (response will be undefined)
            if (!response) return;
            
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || "Erreur lors de l'enregistrement");
                });
            }
            return response.json();
        })
        .then(data => {
            // If we stopped at the email check (data will be undefined)
            if (!data) return;
            
            console.log("Inscription réussie:", data);
            setCookie('prenom', prenom); // Save the prenom in a cookie
            setCookie('role', role); // Save the role in a cookie

            // Redirect to connexion.html for all roles
            window.location.href = "connexion.html";
        })
        .catch(error => {
            console.error("Erreur lors de l'enregistrement d'inscription:", error.message);
            alert("Erreur lors de l'enregistrement: " + error.message); // Notify the user
        });
    });
}

// Helper function to set a cookie
function setCookie(name, value, days = 7) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

// Initialize the inscription function
inscription();