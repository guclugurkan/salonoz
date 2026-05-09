async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/appointments/public');
    const json = await res.json();
    const targetAppts = json.data.filter(a => a.date === "2026-05-20" && a.staff === "OZ");
    console.log("Appointments for OZ on 2026-05-20:");
    console.log(JSON.stringify(targetAppts, null, 2));
  } catch(e) {
    console.error(e);
  }
}
test();
