const formData = {
  staff: { name: 'OZ' },
  date: '2026-05-20'
};

const appointments = [
  {
    "service": "Herensnit",
    "staff": "OZ",
    "date": "2026-05-20",
    "time": "11:00",
    "status": "confirmed",
    "bookedSlots": [
      "11:00",
      "12:00",
      "12:30"
    ]
  }
];

const getOccupiedSlots = () => {
  if (!formData.staff || !formData.date) return []
  return appointments
    .filter(a =>
      a.staff === formData.staff.name &&
      a.date === formData.date &&
      a.status !== 'cancelled' &&
      a.status !== 'rejected'
    )
    .flatMap(a => (a.bookedSlots && a.bookedSlots.length > 0) ? a.bookedSlots : [a.time])
}

console.log(getOccupiedSlots());
