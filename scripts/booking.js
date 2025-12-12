/* =====================================================
   RIDE W ME CABO - BOOKING SYSTEM FINAL VERSION
===================================================== */

// EmailJS
emailjs.init("Ed5Qh2Qk81A6fHcRR"); // PUBLIC KEY

// WhatsApp Number
const WHATSAPP_NUMBER = "526242426741";

// DOM ELEMENTS
const serviceTypeEl = document.getElementById("serviceType");
const passengersEl = document.getElementById("passengers");
const pickupEl = document.getElementById("pickupPreset");
const destinationEl = document.getElementById("destinationPreset");
const notesEl = document.getElementById("notes");

const returnDateWrapper = document.getElementById("returnDateWrapper");
const returnTimeWrapper = document.getElementById("returnTimeWrapper");
const hoursWrapper = document.getElementById("hoursWrapper");

const selectedServiceNameEl = document.getElementById("selectedServiceName");
const selectedServicePriceEl = document.getElementById("selectedServicePrice");

// AUTOCOMPLETE
function setupAutocomplete(input, dropdown, list) {
  input.addEventListener("input", () => {
    const val = input.value.toLowerCase().trim();
    dropdown.innerHTML = "";

    if (!val) return;

    list
      .filter((x) => x.toLowerCase().includes(val))
      .slice(0, 8)
      .forEach((match) => {
        const div = document.createElement("div");
        div.className = "autocomplete-item";
        div.textContent = match;

        div.onclick = () => {
          input.value = match;
          dropdown.innerHTML = "";
        };
        dropdown.appendChild(div);
      });
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && !input.contains(e.target)) {
      dropdown.innerHTML = "";
    }
  });
}

// Destinations (hotels, restaurants, clubs)
const DESTINOS = [
  "Nobu Hotel Los Cabos", "Hard Rock Hotel Los Cabos", "Waldorf Astoria",
  "Garza Blanca", "Grand Velas", "Esperanza Auberge", "One&Only Palmilla",
  "Montage Los Cabos", "The Cape", "Riu Palace", "Riu Santa Fe",
  "Breathless", "Secrets Puerto Los Cabos", "Hyatt Ziva", "Le Blanc",
  "Pueblo Bonito Sunset", "Pueblo Bonito Rose", "Pueblo Bonito Blanco",
  "Solaz Resort", "Hilton Los Cabos", "Marquis", "Grand Fiesta Americana",
  "Dreams Los Cabos", "Barceló", "Marina Fiesta", "Cabo Azul",
  "Sheraton Grand", "Vidanta", "Chileno Bay", "Las Ventanas",
  "Sunset Monalisa", "Edith's", "Taboo", "Rosa Negra", "Mamazzita",
  "Acre", "Flora Farms", "Medano Beach", "Cabo Downtown",
  "San José Downtown", "Los Cabos Airport (SJD)"
];

setupAutocomplete(pickupEl, document.getElementById("pickupDropdown"), DESTINOS);
setupAutocomplete(destinationEl, document.getElementById("destinationDropdown"), DESTINOS);

/* =====================================================
   SERVICE DATA
===================================================== */
const SERVICE_INFO = {
  // Airport Zones
  zone1: { label: "Zone 1 – SJC to Palmilla", oneWay: 75, roundTrip: 130 },
  zone2: { label: "Zone 2 – Puerto Los Cabos / El Encanto", oneWay: 85, roundTrip: 150 },
  zone3a: { label: "Zone 3 – Palmilla to Cabo del Sol", oneWay: 95, roundTrip: 170 },
  zone3b: { label: "Zone 3 – Punta Ballena / Solmar", oneWay: 105, roundTrip: 180 },
  zone5: { label: "Zone 5 – Pedregal / Diamante", oneWay: 110, roundTrip: 200 },

  // City Open Services
  city4: { label: "Open Service – 4 Hours", base: 140, extraHour: 20 },
  city6: { label: "Open Service – 6 Hours", base: 160, extraHour: 20 },

  // Activities
  migrino: { label: "Tour – Migriño", base: 350 },
  todosSantos: { label: "Tour – Todos Santos", base: 400 },
  barriles: { label: "Tour – La Ribera / Los Barriles", base: 400 },
  laPaz: { label: "Tour – La Paz", base: 600 }
};

/* =====================================================
   UI LOGIC
===================================================== */
function updateServiceUI() {
  const sv = serviceTypeEl.value;
  const info = SERVICE_INFO[sv];

  if (!info) return;

  selectedServiceNameEl.textContent = info.label;

  // Show pricing preview
  if (info.oneWay) {
    selectedServicePriceEl.innerHTML = `
      One Way: $${info.oneWay} USD<br>
      Round Trip: $${info.roundTrip} USD
    `;
    returnDateWrapper.style.display = "block";
    returnTimeWrapper.style.display = "block";
    hoursWrapper.style.display = "none";
  } else if (info.extraHour) {
    selectedServicePriceEl.innerHTML = `
      Base Price: $${info.base} USD<br>
      Extra Hour: $${info.extraHour} USD
    `;
    returnDateWrapper.style.display = "none";
    returnTimeWrapper.style.display = "none";
    hoursWrapper.style.display = "block";
  } else {
    selectedServicePriceEl.innerHTML = `
      Price: $${info.base} USD<br>Duration: 4–8 hours
    `;
    returnDateWrapper.style.display = "none";
    returnTimeWrapper.style.display = "none";
    hoursWrapper.style.display = "none";
  }
}

serviceTypeEl.addEventListener("change", updateServiceUI);

/* =====================================================
   CALCULATE PRICE
===================================================== */
function calculateTotal(serviceKey, returnDate, hours) {
  const s = SERVICE_INFO[serviceKey];

  if (!s) return 0;

  if (s.oneWay) {
    return returnDate ? s.roundTrip : s.oneWay;
  }
  if (s.extraHour) {
    let extra = hours ? Number(hours) * s.extraHour : 0;
    return s.base + extra;
  }
  return s.base;
}

/* =====================================================
   FORM SUBMISSION
===================================================== */
document.getElementById("bookingForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const serviceKey = serviceTypeEl.value;
  const info = SERVICE_INFO[serviceKey];

  const reservation = {
    name: document.getElementById("name").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value,
    passengers: passengersEl.value,
    pickup: pickupEl.value,
    destination: destinationEl.value,
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    return_date: document.getElementById("returnDate").value || "",
    return_time: document.getElementById("returnTime").value || "",
    extra_hours: document.getElementById("hours").value || "",
    notes: notesEl.value || "",
    service_label: info.label,
    trip_type: info.oneWay ? (reservation.return_date ? "Round Trip" : "One Way") : "Fixed Price",
    base_price: info.oneWay ? info.oneWay : info.base,
    round_trip_price: info.roundTrip || "",
    extra_hours_total: info.extraHour && reservation.extra_hours ? info.extraHour * reservation.extra_hours : "",
  };

  reservation.total_price = calculateTotal(serviceKey, reservation.return_date, reservation.extra_hours);

  // SEND EMAIL
  emailjs.send("service_8zcytcr", "template_7tkwggo", reservation)
    .then(() => {
      alert("Your reservation was sent successfully!");
      sendWhatsApp(reservation);
    })
    .catch(() => alert("Error sending reservation. Try again."));
});

/* =====================================================
   WHATSAPP MESSAGE
===================================================== */
function sendWhatsApp(r) {
  const msg =
    `🚗 *New Reservation – Ride W Me Cabo*\n\n` +
    `Hi ${r.name}, your reservation has been received.\n\n` +
    `• Service: ${r.service_label}\n` +
    `• Trip Type: ${r.trip_type}\n` +
    `• Passengers: ${r.passengers}\n\n` +
    `• Pickup: ${r.pickup}\n` +
    `• Destination: ${r.destination}\n\n` +
    `• Departure: ${r.date} at ${r.time}\n` +
    (r.return_date ? `• Return: ${r.return_date} at ${r.return_time}\n` : "") +
    (r.extra_hours ? `• Extra Hours: ${r.extra_hours}\n` : "") +
    `\n💵 Total: $${r.total_price} USD\n\n` +
    `Notes: ${r.notes || "None"}`;

  window.open(`https://wa.me/526242426741?text=${encodeURIComponent(msg)}`);
}

