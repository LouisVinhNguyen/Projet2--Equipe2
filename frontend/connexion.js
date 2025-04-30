// GitHub login function
function loginWithGitHub() {
    const clientId = 'Ov23liH92sJlNeHwKRPA'; // Your GitHub OAuth Client ID
    const redirectUri = 'http://localhost:3000/auth/callback'; // Your redirect URL for /auth/callback
    const role = document.querySelector('input[name="role"]:checked').value; // Get selected role

    // Redirect the user to GitHub's OAuth authorization page with the role
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user&state=${role}`;
}

// Handle GitHub callback and fetch user details
window.onload = async function () {
    // Check if there's an authorization code in the URL (this will be sent by GitHub after user signs in)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code'); // GitHub sends an authorization code as 'code'
    
    if (code) {
        try {
            // Exchange the authorization code for an access token
            const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', null, {
                params: {
                    client_id: 'Ov23liH92sJlNeHwKRPA', // Your GitHub OAuth Client ID
                    client_secret: 'd0ecc8df3171fd4936726b3e9ab6bab42cf71a19', // Your GitHub OAuth Client Secret
                    code: code,
                    redirect_uri: 'http://localhost:3000/auth/callback' // The same redirect URI you registered in GitHub OAuth settings
                },
                headers: { 'Accept': 'application/json' }
            });

            const accessToken = tokenResponse.data.access_token;

            // Use the access token to fetch the user's GitHub details (name, email, etc.)
            const userResponse = await axios.get('https://api.github.com/user', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            const { login, name, email } = userResponse.data;
            const role = document.querySelector('input[name="role"]:checked').value; // Get selected role
            const dateCreated = new Date().toISOString(); // Get the current date
            
            // Prepare the user data to send to the backend
            const userData = {
                prenom: name, // First name (or GitHub login)
                nom: login, // GitHub username (used as surname)
                email,
                role,
                dateCreated
            };

            // Send user data to the backend to be stored in the database
            await fetch('/api/signin-with-github', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            // Redirect based on the selected role
            if (role === "avocat") {
                window.location.href = "Avocat/indexAvocat.html";
            } else if (role === "client") {
                window.location.href = "Client/indexClient.html";
            } else if (role === "admin") {
                window.location.href = "Admin/indexAdmin.html";
            }

        } catch (error) {
            console.error("Erreur lors de l'authentification GitHub:", error);
            alert("Une erreur s'est produite. Veuillez réessayer.");
        }
    }
};


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