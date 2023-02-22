function AlertShow(alertId) {
  document.getElementById(alertId).style.display = 'block'
}

function AlertHide(alertId) {
  document.getElementById(alertId).style.display = 'none'
}

function AlertSetText(alertId, text) {
  document.getElementById(alertId).textContent = text
}

function AlertSetState(alertId, state) {
  let states = {
    'success': 'message-display-success',
    'info': 'message-display-info',
    'error': 'message-display-error'
  }
  let selectedClass = states[state]
  delete states[state]
  toRemoveClassList = Object.values(states)
  for (c of toRemoveClassList) {
    document.getElementById(alertId).classList.remove(c)
  }
  document.getElementById(alertId).classList.add(selectedClass)
}

function goToPath(path) {
  window.location = path
}
