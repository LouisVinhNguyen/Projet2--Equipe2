document.getElementById("connexion").addEventListener("click", async () => {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Veuillez remplir tous les champs");
        return; // Stop execution if fields are empty
    }

    let user = {
        email: email,
        password: password
    };

    try {
        await getToken(user);
    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
    }
});

async function getToken(user) {
    try {
        const response = await fetch('/getToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`Le jeton d'authentification: ${data.token}`);
            window.location.href = `index.html?token=${data.token}`;
        } else {
            console.error("Erreur lors de la récupération du jeton");
            alert("Email ou mot de passe incorrect");
        }
    } catch (error) {
        console.error("Erreur réseau :", error);
        alert("Une erreur réseau s'est produite. Veuillez réessayer.");
    }
}