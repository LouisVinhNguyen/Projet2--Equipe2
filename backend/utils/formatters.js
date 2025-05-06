// Helper to format decimal hours to HH:MM:SS
function formatTempsTotal(tempsTotal) {
    if (tempsTotal == 0 || isNaN(tempsTotal)) return "-";
    const totalSeconds = Math.round(tempsTotal * 3600);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

module.exports = {
    formatTempsTotal,
};