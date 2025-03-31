document.getElementById("connexion").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    // Get the selected role from the radio buttons
    const role = document.querySelector('input[name="role"]:checked').value;

    if (!email || !password) {
        alert("Veuillez remplir tous les champs");
        return; // Stop execution if fields are empty
    }

    const user = {
        email: email,
        password: password
    };

    // Determine the correct endpoint based on the role
    const endpoint = role === "avocat" ? "/login/avocat" : "/login/client";

    try {
        await getToken(user, endpoint, role);
    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
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
            // Redirect based on the role
            if (role === "avocat") {
                window.location.href = `Avocat/indexAvocat.html?token=${data.token}`;
            } else {
                window.location.href = `Client/indexClient.html?token=${data.token}`;
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