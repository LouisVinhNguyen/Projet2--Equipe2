let events = []

exports.getAllEvents = (req, res) => {
  res.json(events)
}

exports.createEvent = (req, res) => {
  const newEvent = req.body
  if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.description) {
    return res.status(400).json({ error: 'Titre, date et heure sont requis.' })
  }
  events.push(newEvent)
  res.status(201).json(newEvent)
}
