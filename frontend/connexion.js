document.getElementById("connexion").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    // Get the selected role from the radio buttons
    const role = document.querySelector('input[name="role"]:checked').value;

    if (!email || !password) {
        alert("Veuillez remplir tous les champs");
        return; // Stop execution if fields are empty
    }

    // First check if email exists
    try {
        const emailCheckResponse = await fetch(`/user/check-email?email=${encodeURIComponent(email)}`, {
            method: 'GET'
        });
        
        if (!emailCheckResponse.ok) {
            throw new Error("Erreur lors de la vérification de l'email");
        }
        
        const emailData = await emailCheckResponse.json();
        
        if (!emailData.exists) {
            alert("Aucun utilisateur trouvé avec cet email.");
            return;
        }
        
        // Email exists, proceed with authentication
        const user = {
            email: email,
            password: password
        };

        // Determine the correct endpoint based on the role
        let endpoint;
        if (role === "avocat") {
            endpoint = "/auth/login/avocat";
        } else if (role === "client") {
            endpoint = "/auth/login/client";
        } else if (role === "admin") {
            endpoint = "/auth/login/admin";
        }

        await getToken(user, endpoint, role);
    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        alert("Une erreur s'est produite. Veuillez réessayer.");
    }
});

async function getToken(user, endpoint, role) {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`Le jeton d'authentification: ${data.token}`);
            // Store token before redirecting
            sessionStorage.setItem("token", data.token);
            // Redirect based on the role
            if (role === "avocat") {
                window.location.href = `Avocat/indexAvocat.html`;
            } else if (role === "client") {
                window.location.href = `Client/indexClient.html`;
            } else if (role === "admin") {
                window.location.href = `Admin/indexAdmin.html`;
            }
        } else {
            console.error("Erreur lors de la récupération du jeton");
            alert("Email ou mot de passe incorrect");
        }
    } catch (error) {
        console.error("Erreur réseau :", error);
        alert("Une erreur réseau s'est produite. Veuillez réessayer.");
    }
}