function inscription() {
    document.getElementById("bouton-connexion").addEventListener("click", function () {
        const prenom = document.getElementById("prenom").value.trim();
        const nom = document.getElementById("nom").value.trim();
        const email = document.getElementById("email").value.trim();
        const telephone = document.getElementById("telephone").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirm_password").value.trim();
        let role = getRoleFromNavbar() || ""; // Get role from navbar or default to empty

        console.log("Fields before role selection:", { prenom, nom, email, password, telephone, role });

        // If no role is set from the navbar, use the role selected in the form
        if (!role) {
            if (document.getElementById("avocat").checked) {
                role = "avocat";
            } else if (document.getElementById("user").checked) {
                role = "user";
            } else {
                alert("Veuillez sélectionner un type d'utilisateur.");
                return;
            }
        }

        console.log("Fields after role selection:", { prenom, nom, email, password, telephone, role });

        // Validate that all fields are filled
        if (!prenom || !nom || !email || !password || !telephone || !role) {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        // Validate password confirmation
        if (password !== confirmPassword) {
            alert("Les mots de passe ne correspondent pas.");
            return;
        }

        const inscriptionData = { prenom, nom, email, password, telephone};

        // Determine the route based on the role
        const route = role === "avocat" ? '/api/auth/register/avocat' : '/api/auth/register/client';

        // Send the data to the server
        fetch(route, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inscriptionData),
        })
            .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                throw new Error(err.message || "Erreur lors de l'enregistrement");
                });
            }
            return response.json();
            })
            .then(data => {
            console.log("Inscription réussie:", data);
            setCookie('prenom', prenom); // Save the prenom in a cookie

            // Redirect to connexion.html for both roles
            window.location.href = "connexion.html";
            })
            .catch(error => {
            console.error("Erreur lors de l'enregistrement d'inscription:", error.message);
            alert("Erreur lors de l'enregistrement: " + error.message); // Notify the user
            });
    });
}

// Helper function to get the role from the navbar or cookies
function getRoleFromNavbar() {
    // Example: Check if the role is stored in a cookie or navbar
    const cookies = document.cookie.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.split("=").map(c => c.trim());
        acc[key] = value;
        return acc;
    }, {});

    return cookies.role || null; // Return the role if it exists in cookies
}

// Helper function to set a cookie
function setCookie(name, value, days = 7) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

// Initialize the inscription function
inscription();