import { addEvent, getEvents } from './eventManager.js'

let calendar = null

export const syncCalendar = (events) => {
  if (!calendar) return
  const mapped = events.map(ev => ({
    title: ev.title,
    start: `${ev.date}T${ev.time}`,
    extendedProps: { description: ev.description }
  }))
  calendar.removeAllEvents()
  mapped.forEach(e => calendar.addEvent(e))
}

export const renderCalendarView = () => {
  const container = document.getElementById('dashboard-sections')
  container.innerHTML = `<div id="calendar"></div>`

  calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
    initialView: 'dayGridMonth',
    locale: 'fr',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    events: getEvents().map(ev => ({
      title: ev.title,
      start: `${ev.date}T${ev.time}`
    })),
    dateClick(info) {
      const title = prompt('Nom de l’événement ?')
      if (!title) return
      const time = prompt('Heure (HH:MM) ?', '09:00') || '09:00'
      const description = prompt('Description') || ''
      const date = info.dateStr
      const event = { title, date, time, description }
      addEvent(event)
    },
    eventClick(info) {
      alert(`📝 ${info.event.title}\n${info.event.start}\n${info.event.extendedProps.description || ''}`)
    }
  })

  calendar.render()
}
