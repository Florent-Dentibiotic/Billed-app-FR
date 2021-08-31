export const formatDate = (dateStr) => {
    const dateString = Date.parse(dateStr)
    
    if(Number.isNaN(dateString) || dateStr === ''){
      console.log(dateStr)
      return `Date non valide`
    } else {
      const date = new Date(dateStr)
      const ye = new Intl.DateTimeFormat('fr', { year: '2-digit' }).format(date)
      const mo = new Intl.DateTimeFormat('fr', { month: 'long' }).format(date)
      const da = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date)
      const month = mo.charAt(0).toUpperCase() + mo.slice(1)
      return `${parseInt(da)} ${month.substr(0,3)}. ${ye.toString()}`
    }
}

function checkRange(dateStr){
  if(dateStr){
    return
  }
}
 
export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente"
    case "accepted":
      return "Accepté"
    case "refused":
      return "Refused"
  }
}