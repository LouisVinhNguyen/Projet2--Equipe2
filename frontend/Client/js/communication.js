export const renderCommunicationForm = () => {
  const container = document.getElementById('dashboard-sections');
  container.innerHTML = `
    <div class="box">
      <h2 class="title is-4">Envoyer un Message</h2>
      <form id="messageForm">
        <div class="field">
          <label class="label">Destinataire</label>
          <div class="select is-fullwidth">
            <select id="receiver-select" required>
              <option value="">Sélectionnez un destinataire</option>
            </select>
          </div>
        </div>
        <div class="field">
          <label class="label">Contenu du message</label>
          <textarea class="textarea" id="message-content" name="contenu" required placeholder="Votre message..."></textarea>
        </div>
        <button class="button is-success" id="btn-envoyer-message" type="button">Envoyer</button>
      </form>
      <hr />
      <h3 class="title is-5">Messages Envoyés/Reçus</h3>
      <div id="messagesContainer" style="margin-top: 10px;"></div>
    </div>
  `;

  const fetchUsersList = async () => {
    try {
      const response = await fetch('/user/all-public', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const users = await response.json();
        const select = document.getElementById('receiver-select');

        const storedToken = sessionStorage.getItem('token');
        const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
        const myUserID = tokenPayload.userID;

        select.innerHTML = '<option value="">Sélectionnez un destinataire</option>';

        users
          .filter(user => user.userID !== myUserID)
          .forEach(user => {
            const option = document.createElement('option');
            option.value = user.userID;
            option.textContent = `${user.prenom} ${user.nom} (${user.role})`;
            select.appendChild(option);
          });

      } else {
        console.error('Erreur lors de la récupération des utilisateurs:', response.statusText);
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
    }
  };

  document.getElementById('btn-envoyer-message').addEventListener('click', async () => {
    const storedToken = sessionStorage.getItem('token');
    if (!storedToken) {
      alert('Vous devez être connecté pour envoyer un message.');
      return;
    }

    const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
    const senderID = tokenPayload.userID;

    const receiverID = document.getElementById('receiver-select').value;
    const contenu = document.getElementById('message-content').value.trim();

    if (!receiverID || !contenu) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    try {
      const response = await fetch('/message/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`
        },
        body: JSON.stringify({ senderID, receiverID, contenu })
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du message.");
      }

      alert('Message envoyé avec succès.');
      document.getElementById('messageForm').reset();
      window.fetchMessagesList();

    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  });

  window.fetchMessagesList = async () => {
    const storedToken = sessionStorage.getItem('token');
    if (!storedToken) {
      return;
    }

    const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
    const userID = tokenPayload.userID;

    try {
      const response = await fetch(`/message/user/${userID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`
        }
      });

      if (response.ok) {
        const messages = await response.json();
        const container = document.getElementById('messagesContainer');
        container.innerHTML = '';

        const groupedMessages = {};

        messages.forEach(msg => {
          const msgDate = new Date(msg.dateSent);
          const today = new Date();

          let label;
          const diffTime = today.setHours(0, 0, 0, 0) - msgDate.setHours(0, 0, 0, 0);
          const diffDays = diffTime / (1000 * 60 * 60 * 24);

          if (diffDays === 0) {
            label = "Aujourd'hui";
          } else if (diffDays === 1) {
            label = "Hier";
          } else if (diffDays === 2) {
            label = "Avant-hier";
          } else {
            label = msgDate.toLocaleDateString();
          }

          if (!groupedMessages[label]) {
            groupedMessages[label] = [];
          }
          groupedMessages[label].push(msg);
        });

        for (const dateLabel in groupedMessages) {
          container.innerHTML += `
            <div style="text-align: center; margin: 20px 0; font-weight: bold; color: #666;">${dateLabel}</div>
          `;

          groupedMessages[dateLabel].forEach(msg => {
            const isSender = msg.senderID === userID;

            container.innerHTML += `
              <div style="
                position: relative;
                max-width: 60%;
                margin: ${isSender ? '10px 0 10px auto' : '10px auto 10px 0'};
                background-color: ${isSender ? '#DCF8C6' : '#E6E6E6'};
                border-radius: 10px;
                padding: 10px;
                text-align: ${isSender ? 'right' : 'left'};
              ">
                <div style="font-size: 0.85em; font-weight: bold; margin-bottom: 5px;">
                  ${isSender 
                    ? `Moi → ${msg.receiverPrenom} ${msg.receiverNom} (${msg.receiverRole})`
                    : `${msg.senderPrenom} ${msg.senderNom} (${msg.senderRole}) → Moi`
                  }
                </div>
                <div style="margin-top: 5px;">
                  ${msg.contenu}
                </div>
                <div style="font-size: 0.75em; color: #888; margin-top: 5px;">
                  ${new Date(msg.dateSent).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>

                ${
                  isSender 
                    ? `<button style="
                          position: absolute;
                          top: 5px;
                          ${isSender ? 'left: 5px;' : 'right: 5px;'}
                          background: none;
                          border: none;
                          color: red;
                          font-size: 1em;
                          cursor: pointer;
                        " 
                        onclick="deleteMessage('${msg.messageID}')">❌</button>`
                    : ''
                }
              </div>
            `;
          });
        }
      } else {
        console.error('Erreur lors de la récupération des messages:', response.statusText);
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    }
  };

  window.deleteMessage = async (messageID) => {
    if (!confirm("Voulez-vous vraiment supprimer ce message ?")) {
      return;
    }

    const storedToken = sessionStorage.getItem('token');
    if (!storedToken) {
      alert('Vous devez être connecté.');
      return;
    }

    try {
      const response = await fetch(`/message/${messageID}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`
        }
      });

      if (response.ok) {
        alert('Message supprimé avec succès.');

        setTimeout(() => {
          window.fetchMessagesList();
        }, 200);

      } else {
        console.error('Erreur lors de la suppression du message:', response.statusText);
        alert("Erreur lors de la suppression.");
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
      alert("Erreur lors de la suppression.");
    }
  };


  fetchUsersList();
  fetchMessagesList();
};
