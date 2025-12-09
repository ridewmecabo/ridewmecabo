/* ========== LOGIN ========== */
const ADMIN_PASSWORD = "rideadmin2025";

function checkLogin() {
  const pass = document.getElementById("adminPass").value;

  if (pass === ADMIN_PASSWORD) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    loadReservations();
    updateDashboard();
  } else {
    document.getElementById("errorMsg").style.display = "block";
  }
}

/* ========== LOAD RESERVATIONS ========== */
function loadReservations() {
  const list = document.getElementById("reservationList");
  let reservations = JSON.parse(localStorage.getItem("reservations")) || [];

  const filterDate = document.getElementById("filterDate").value;
  const search = document.getElementById("searchInput").value.toLowerCase();

  let filtered = reservations.filter(r => {
    let matchesDate = filterDate ? r.date === filterDate : true;
    let matchesSearch =
      r.name.toLowerCase().includes(search) ||
      r.phone.includes(search);

    return matchesDate && matchesSearch;
  });

  list.innerHTML = "";

  if (filtered.length === 0) {
    list.innerHTML = "<p>No reservations found.</p>";
    return;
  }

  filtered.forEach((r, index) => {
    let div = document.createElement("div");
    div.className = "reservation-card";

    div.innerHTML = `
      <p><strong>${r.name}</strong></p>
      <p>📞 ${r.phone}</p>
      <p>📧 ${r.email}</p>
      <p>🚗 ${r.serviceType}</p>
      <p>📅 ${r.date} - ${r.time}</p>
      <p>📍 ${r.pickup}</p>
      <p>➡️ ${r.destination}</p>

      ${r.returnDate ? `<p>🔄 ${r.returnDate} - ${r.returnTime}</p>` : ""}
      ${r.hours ? `<p>⏱ ${r.hours} hrs</p>` : ""}
      ${r.notes ? `<p>📝 ${r.notes}</p>` : ""}

      <button class="edit-btn" onclick="editReservation(${index})">Edit</button>
      <button onclick="deleteReservation(${index})">Delete</button>
    `;

    list.appendChild(div);
  });
}

/* ========== EDIT RESERVATION ========== */
function editReservation(index) {
  let reservations = JSON.parse(localStorage.getItem("reservations")) || [];
  let r = reservations[index];

  let newName = prompt("Edit name:", r.name);
  if (!newName) return;

  r.name = newName;
  localStorage.setItem("reservations", JSON.stringify(reservations));
  loadReservations();
}

/* ========== DELETE ========== */
function deleteReservation(index) {
  let reservations = JSON.parse(localStorage.getItem("reservations")) || [];
  reservations.splice(index, 1);
  localStorage.setItem("reservations", JSON.stringify(reservations));
  loadReservations();
}

function deleteAll() {
  if (!confirm("Delete ALL reservations?")) return;

  localStorage.removeItem("reservations");
  loadReservations();
}

/* ========== CLEAR FILTERS ========== */
function clearFilters() {
  document.getElementById("filterDate").value = "";
  document.getElementById("searchInput").value = "";
  loadReservations();
}

/* ========== EXCEL EXPORT ========== */
function exportToExcel() {
  let reservations = JSON.parse(localStorage.getItem("reservations")) || [];

  if (!reservations.length) return alert("No reservations to export.");

  let sheet = XLSX.utils.json_to_sheet(reservations);
  let book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Reservations");

  XLSX.writeFile(book, "RideWMe_Reservations.xlsx");
}

/* ========== PDF EXPORT (PROFESIONAL) ========== */
async function exportPDF() {
  let reservations = JSON.parse(localStorage.getItem("reservations")) || [];

  if (!reservations.length) return alert("No reservations.");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text("Ride W Me Cabo — Reservations", 10, 20);

  pdf.addImage("Images/ridewmelogo.png", "PNG", 150, 10, 40, 40);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);

  let y = 60;

  reservations.forEach((r, i) => {
    pdf.text(`${i + 1}. ${r.name} — ${r.serviceType}`, 10, y);
    pdf.text(`📅 ${r.date}  ⏰ ${r.time}`, 10, y + 7);
    pdf.text(`📍 ${r.pickup} → ${r.destination}`, 10, y + 14);

    if (r.returnDate)
      pdf.text(`🔄 Return: ${r.returnDate} - ${r.returnTime}`, 10, y + 21);

    y += 32;

    if (y > 270) {
      pdf.addPage();
      y = 20;
    }
  });

  pdf.save("RideWMe_Reservations.pdf");
}

/* ========== DASHBOARD ========== */
function updateDashboard() {
  let reservations = JSON.parse(localStorage.getItem("reservations")) || [];

  document.getElementById("totalReservations").textContent = reservations.length;

  let today = new Date().toISOString().split("T")[0];
  document.getElementById("todayReservations").textContent =
    reservations.filter(r => r.date === today).length;

  document.getElementById("airportCount").textContent =
    reservations.filter(r => r.serviceType === "Airport Transfer").length;

  document.getElementById("roundTripCount").textContent =
    reservations.filter(r => r.serviceType === "Round Trip").length;

  renderChart(reservations);
}

/* ========== CHART ========== */
function renderChart(reservations) {
  let counts = {};

  reservations.forEach(r => {
    counts[r.serviceType] = (counts[r.serviceType] || 0) + 1;
  });

  new Chart(document.getElementById("chartServices"), {
    type: "bar",
    data: {
      labels: Object.keys(counts),
      datasets: [{
        label: "Reservations",
        data: Object.values(counts),
        backgroundColor: "#00c16e"
      }]
    }
  });
}
