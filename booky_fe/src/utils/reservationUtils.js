export function groupByDay(reservations) {
  if (!reservations) {
    return { today: [], future: [] };
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const today = [];
  const future = [];

  reservations.forEach(res => {
    // Rezervacija je za danas ako bar jedan termin pada na današnji dan
    const isForToday = res.slots.some(slot => slot.date === todayStr);
    if (isForToday) {
      today.push(res);
    } else {
      // Proveravamo da li je termin u budućnosti (ne u prošlosti)
      const earliestDate = res.slots.reduce((earliest, s) => s.date < earliest ? s.date : earliest, '9999-12-31');
      if (earliestDate >= todayStr) {
        future.push(res);
      }
    }
  });

  // Pomoćna funkcija za pronalazak najranijeg termina za sortiranje
  const getSortKey = (slots) => {
    if (!slots || slots.length === 0) return '9999'; // Daleka budućnost za sortiranje
    
    return slots.reduce((earliest, current) => {
      const currentKey = `${current.date} ${current.start_time}`;
      return currentKey < earliest ? currentKey : earliest;
    }, `${slots[0].date} ${slots[0].start_time}`);
  };

  // Sortiraj današnje po najranijem terminu danas
  today.sort((a, b) => {
      const earliestA = getSortKey(a.slots.filter(s => s.date === todayStr));
      const earliestB = getSortKey(b.slots.filter(s => s.date === todayStr));
      return earliestA.localeCompare(earliestB);
  });

  // Sortiraj buduće po njihovom najranijem terminu
  future.sort((a, b) => {
      const earliestA = getSortKey(a.slots);
      const earliestB = getSortKey(b.slots);
      return earliestA.localeCompare(earliestB);
  });

  return { today, future };
}
