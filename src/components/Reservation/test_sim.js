function addMinutes(timeStr, mins) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const date = new Date(2000, 0, 1, h, m);
  date.setMinutes(date.getMinutes() + mins);
  return date.toTimeString().substring(0, 5);
}

const occupiedSlots = ["11:00", "12:00", "12:30"];
const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "13:00", "13:30", "14:00", "14:30", "15:00",
  "15:30", "16:00", "16:30"
];

const blocks = [
  { duration: 30, type: 'work' },
  { duration: 30, type: 'pause' },
  { duration: 45, type: 'work' }
];

const isTimeValidForService = (startTime) => {
  if (occupiedSlots.includes(startTime)) return false;

  let currentStartTime = startTime;
  
  for (const block of blocks) {
    const numIntervals = Math.ceil(block.duration / 30);
    for (let i = 0; i < numIntervals; i++) {
      if (block.type === 'work') {
        if (occupiedSlots.includes(currentStartTime)) {
          return false;
        }
      }
      currentStartTime = addMinutes(currentStartTime, 30);
    }
  }
  return true;
}

for (const time of timeSlots) {
  console.log(`${time}: ${isTimeValidForService(time) ? 'Available' : 'Booked'}`);
}
