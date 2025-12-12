/* =====================================================
   booking.js — FINAL VERSION (Ride W Me Cabo)
===================================================== */

emailjs.init("Ed5Qh2Qk81A6fHcRR"); // PUBLIC KEY

const WHATSAPP_NUMBER = "526242426741";

// Elements
const serviceTypeEl = document.getElementById("serviceType");
const passengersEl = document.getElementById("passengers");
const pickupInput = document.getElementById("pickupPreset");
const destinationInput = document.getElementById("destinationPreset");

const returnDateWrapper = document.getElementById("returnDateWrapper");
const returnTimeWrapper = document.getElementById("returnTimeWrapper");
const hoursWrapper = document.getElementById("hoursWrapper");

const unavailableListEl = document.getElementById("unavailableList");
const selectedServiceNameEl = document.getElementById("selectedServiceName");
const selectedServicePriceEl = document.getElementById("selectedServicePrice");


/* =====================================================
   LOCATIONS LIST
===================================================== */
const DESTINOS = [
  "Nobu Hotel Los Cabos","Hard Rock Hotel","Waldorf Astoria Pedregal","Garza Blanca Resort",
  "Grand Velas Los Cabos","Esperanza Auberge","One&Only Palmilla","Montage Los Cabos",
  "The Cape","Riu Palace","Riu Santa Fe","Breathless Cabo","Secrets Puerto Los Cabos",
  "Hyatt Ziva","Le Blanc Spa Resort","Pueblo Bonito Sunset","Pueblo Bonito Rose",
  "Solaz Resort","Hilton Los Cabos","Marquis Los Cabos","Dreams Los Cabos",
  "Barcelo Gran Faro","Cabo Azul Resort","Chileno Bay","Las Ventanas",
  "Sunset Monalisa","Rosa Negra","Mamazzita","Taboo","Animalón",
  "Flora Farms","Acre Restaurant",
  "Mango Deck","OMNIA","Blue Marlin","SUR Beach House",
  "Cabo Downtown","SJC Downtown","El Arco","Medano Beach",
  "Walmart CSL","Costco CSL","Puerto Paraíso Mall","Luxury Avenue",
  "Los Cabos Airport (SJD)","FBO Private Terminal"
];

/* =====================================================
   EASY AUTOCOMPLETE
===================================================== */
function setupAutocomplete(input, dropdown) {
  input.addEventListener("input", function () {
    const q = this.value.toLowerCase();
    dropdown.innerHTML = "";

    if (!q) return;

    DESTINOS.filter(loc => loc.toLowerCase().includes(q))
      .slice(0, 8)
      .forEach(loc => {
        let div = document.createElement("div");
        div.className = "autocomplete-item";
        div.textContent = loc;
        div.onclick = () => {
          input.value = loc;
          dropdown.innerHTML = "";
        };
        dropdown.appendChild(div);
      });
  });

  document.addEventListener("click", e => {
    if (!dropdown.contains(e.target) && !input.contains(e.target)) dropdown.innerHTML = "";
  });
}

setupAutocomplete(pickupInput, document.getElementById("pickupDropdown"));
setupAutocomplete(destinationInput, document.getElementById("destinationDropdown"));

/* =====================================================
   SERVICE PRICES & INFO
===================================================== */
const SERVICE_INFO = {
  zone1: { label: "Arrival / Departure – Zone 1 (SJC to Palmilla)", oneWay: 75, roundTrip: 130 },
  zone2: { label: "Arrival / Departure – Zone 2 (Puerto Los Cabos)", oneWay: 85, roundTrip: 150 },
  zone3a:{ label: "Zone 3 – Palmilla to Cabo del Sol", oneWay: 95, roundTrip: 170 },
  zone3b:{ label: "Zone 3B – Punta Ballena / Solmar", oneWay:105, roundTrip:180 },
  zone5: { label: "Zone 5 – Pedregal / Diamante", oneWay:110, roundTrip:200 },

  city4:{ label:"Open Service – 4 Hours", base:140, extra:20 },
  city6:{ label:"Open Service – 6 Hours", base:160, extra:20 },

  migrino:{ label:"Tour – Migriño", base:350 },
  todosSantos:{ label:"Tour – Todos Santos", base:400 },
  barriles:{ label:"Tour – La Ribera / Barriles", base:400 },
  laPaz:{ label:"Tour – La Paz", base:600 }
};

/* =====================================================
   UPDATE UI WITH PRICE & DETAILS
===================================================== */
function updateServiceUI() {
  const type = serviceTypeEl.value;
  const info = SERVICE_INFO[type];

  if (!info) {
    selectedServiceNameEl.textContent = "Select a service";
    selectedServicePriceEl.innerHTML = "—";
    return;
  }

  selectedServiceNameEl.textContent = info.label;

  if (info.oneWay) {
    selectedServicePriceEl.innerHTML = `
      <strong>One Way:</strong> $${info.oneWay} USD<br>
      <strong>Round Trip:</strong> $${info.roundTrip} USD
    `;
  } else if (info.base && info.extra) {
    selectedServicePriceEl.innerHTML = `
      <strong>Base Price:</strong> $${info.base} USD<br>
      <strong>Extra Hour:</strong> $${info.extra} USD
    `;
  } else {
    selectedServicePriceEl.innerHTML = `
      <strong>Price:</strong> $${info.base} USD
    `;
  }
}
serviceTypeEl.addEventListener("change", updateServiceUI);


/* =====================================================
   DISABLED DATES
===================================================== */
function getDisabledDates() {
  const saved = JSON.parse(localStorage.getItem("reservations")) || [];
  return saved.flatMap(r => [r.date, r.returnDate]).filter(Boolean);
}


/* =====================================================
   SUBMIT RESERVATION
===================================================== */
document.getElementById("bookingForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const tripType = document.querySelector('input[name="tripType"]:checked').value;
  const serviceCode = serviceTypeEl.value;
  const info = SERVICE_INFO[serviceCode];

  if (!info) return alert("Invalid service selected.");

  // PRICE CALCULATION
  let total = 0;

  if (info.oneWay) {
    total = tripType === "oneWay" ? info.oneWay : info.roundTrip;
  } else {
    total = info.base;
  }

  const reservation = {
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    email: document.getElementById("email").value.trim(),
    pickup: pickupInput.value.trim(),
    destination: destinationInput.value.trim(),
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    service_label: info.label,
    serviceType: tripType === "oneWay" ? "One Way" : "Round Trip",
    passengers: passengersEl.value,
    totalUSD: total,
  };

  // SAVE IN LOCAL STORAGE
  let list = JSON.parse(localStorage.getItem("reservations")) || [];
  list.push(reservation);
  localStorage.setItem("reservations", JSON.stringify(list));

  // EMAIL TO YOU
  emailjs.send("service_8zcytcr", "template_7tkwggo", reservation);
  
  // AUTO REPLY
  emailjs.send("service_8zcytcr", "template_autoreply", reservation);

  // WhatsApp
  sendWhatsApp(reservation);

  alert("Reservation sent successfully!");
  document.getElementById("bookingForm").reset();
  updateServiceUI();
});

/* =====================================================
   WHATSAPP MESSAGE
===================================================== */
function sendWhatsApp(r) {
  let msg =
    `New Reservation%0A%0A` +
    `Name: ${r.name}%0A` +
    `Phone: ${r.phone}%0A` +
    `Service: ${r.service_label} (${r.serviceType})%0A` +
    `Total: $${r.totalUSD} USD%0A` +
    `Pickup: ${r.pickup}%0A` +
    `Destination: ${r.destination}%0A` +
    `Date: ${r.date} at ${r.time}%0A`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
}
