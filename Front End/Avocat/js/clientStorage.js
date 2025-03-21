const CLIENTS_KEY = 'legalconnect_clients'

const loadClients = () => {
  const data = localStorage.getItem(CLIENTS_KEY)
  return data ? JSON.parse(data) : []
}

let clients = loadClients()

export const addClient = (client) => {
  clients.push(client)
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients))
}

export const getClients = () => clients
