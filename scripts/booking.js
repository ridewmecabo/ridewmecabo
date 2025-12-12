/* =====================================================
   booking.js — FINAL FIXED VERSION
===================================================== */

emailjs.init("Ed5Qh2Qk81A6fHcRR"); // PUBLIC KEY

const WHATSAPP_NUMBER = "526242426741";

// Elements
const serviceTypeEl = document.getElementById("serviceType");
const passengersEl = document.getElementById("passengers");
const pickupPreset = document.getElementById("pickupPreset");
const destinationPreset = document.getElementById("destinationPreset");

const returnDateWrapper = document.getElementById("returnDateWrapper");
const returnTimeWrapper = document.getElementById("returnTimeWrapper");
const hoursWrapper = document.getElementById("hoursWrapper");

const unavailableListEl = document.getElementById("unavailableList");
const selectedServiceNameEl = document.getElementById("selectedServiceName");
const selectedServicePriceEl = document.getElementById("selectedServicePrice");

/* =====================================================
   DESTINOS – AUTOCOMPLETE
===================================================== */
const DESTINOS = [
  "Nobu Hotel Los Cabos", "Hard Rock Hotel Los Cabos", "Waldorf Astoria Pedregal",
  "Garza Blanca Resort", "Grand Velas Los Cabos", "Esperanza Auberge",
  "One&Only Palmilla", "Montage Los Cabos", "The Cape, a Thompson Hotel",
  "Riu Palace", "Riu Santa Fe", "Breathless Cabo", "Secrets Puerto Los Cabos",
  "Hyatt Ziva", "Le Blanc Los Cabos", "Pueblo Bonito Sunset", "Pueblo Bonito Rose",
  "Solaz Resort", "Hilton Los Cabos", "Marquis Los Cabos", "Dreams Los Cabos",
  "Sheraton Grand Los Cabos", "CostaBaja Resort", "Chileno Bay Resort",

  // Restaurants
  "Edith’s", "The Office on the Beach", "Sunset Monalisa", "Lorenzillo’s",
  "Rosa Negra", "Funky Geisha", "Taboo", "Mamazzita", "Animalón",
  "Acre Restaurant", "Flora Farms", "Jazmin’s Restaurant",

  // Clubs
  "Mango Deck", "SUR Beach House", "OMNIA Los Cabos", "Blue Marlin Ibiza",

  // General
  "Cabo San Lucas Downtown", "San José Downtown", "El Arco",
  "Puerto Paraíso Mall", "Luxury Avenue", "Medano Beach",

  // Airport
  "Los Cabos International Airport (SJD)",
  "FBO Private Terminal (SJD Private Jets)"
];

function setupAutocomplete(input, dropdown) {
  input.addEventListener("input", function () {
    const query = this.value.trim().toLowerCase();
    dropdown.innerHTML = "";
    if (!query) return;

    DESTINOS.filter(loc => loc.toLowerCase().includes(query))
      .slice(0, 8)
      .forEach(loc => {
        const div = document.createElement("div");
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

setupAutocomplete(pickupPreset, document.getElementById("pickupDropdown"));
setupAutocomplete(destinationPreset, document.getElementById("destinationDropdown"));

/* =====================================================
   PRICE TABLE
===================================================== */
const SERVICE_INFO = {
  zone1: { label: "Zone 1 – SJC to Palmilla", oneWay: 75, roundTrip: 130 },
  zone2: { label: "Zone 2 – Puerto Los Cabos / Laguna", oneWay: 85, roundTrip: 150 },
  zone3a: { label: "Zone 3 – Palmilla to Cabo del Sol", oneWay: 95, roundTrip: 170 },
  zone3b: { label: "Zone 3B – Punta Ballena / Solmar", oneWay: 105, roundTrip: 180 },
  zone5: { label: "Zone 5 – Pedregal / Diamante", oneWay: 110, roundTrip: 200 },

  city4: { label: "Open Service – 4 Hours", base: 140, extraHour: 20 },
  city6: { label: "Open Service – 6 Hours", base: 160, extraHour: 20 },

  migrino: { label: "Tour – Migriño", base: 350, duration: "4–8 Hours" },
  todosSantos: { label: "Tour – Todos Santos", base: 400, duration: "4–8 Hours" },
  barriles: { label: "Tour – Los Barriles", base: 400, duration: "4–8 Hours" },
  laPaz: { label: "Tour – La Paz", base: 600, duration: "4–8 Hours" }
};

/* =====================================================
   UI UPDATE (service preview)
===================================================== */
function updateServiceUI() {
  const sv = serviceTypeEl.value;
  const info = SERVICE_INFO[sv];

  if (!info) {
    selectedServiceNameEl.textContent = "Select a service";
    selectedServicePriceEl.textContent = "—";
    return;
  }

  selectedServiceNameEl.textContent = info.label;

  if (info.oneWay) {
    selectedServicePriceEl.innerHTML =
      `One Way: $${info.oneWay} USD<br>Round Trip: $${info.roundTrip} USD`;
    returnDateWrapper.style.display = "block";
    returnTimeWrapper.style.display = "block";
    hoursWrapper.style.display = "none";
  } else if (info.extraHour) {
    selectedServicePriceEl.innerHTML =
      `Base: $${info.base} USD<br>Extra Hour: $${info.extraHour}`;
    hoursWrapper.style.display = "block";
    returnDateWrapper.style.display = "none";
    returnTimeWrapper.style.display = "none";
  } else {
    selectedServicePriceEl.innerHTML =
      `Price: $${info.base} USD<br>Duration: ${info.duration}`;
    returnDateWrapper.style.display = "none";
    returnTimeWrapper.style.display = "none";
    hoursWrapper.style.display = "none";
  }
}

serviceTypeEl.addEventListener("change", updateServiceUI);

/* =====================================================
   EMAILJS — UNIVERSAL FUNCTION
===================================================== */

function sendEmails(reservation, label, priceDisplay, tripType) {
  // Email to admin
  emailjs.send("service_8zcytcr", "template_ridewmecabo", {
    ...reservation,
    service_label: label,
    price_display: priceDisplay,
    trip_type: tripType
  });

  // Auto-reply to client
  emailjs.send("service_8zcytcr", "template_autoreply", {
    ...reservation,
    service_label: label,
    price_display: priceDisplay,
    trip_type: tripType
  });
}

/* =====================================================
   SUBMIT FORM
===================================================== */
document.getElementById("bookingForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const sv = serviceTypeEl.value;
  const info = SERVICE_INFO[sv];

  if (!info) return alert("Please select a valid service.");

  const reservation = {
    name: name.value.trim(),
    phone: phone.value.trim(),
    email: email.value.trim(),
    passengers: passengersEl.value,
    pickup: pickupPreset.value.trim(),
    destination: destinationPreset.value.trim(),
    date: date.value,
    time: time.value,
    returnDate: returnDate.value || "",
    returnTime: returnTime.value || "",
    hours: hours.value || "",
    notes: notes.value.trim()
  };

  if (!reservation.name || !reservation.phone || !reservation.email) {
    alert("Please fill all required fields.");
    return;
  }

  let tripType = "";
  let priceDisplay = "";

  if (info.oneWay) {
    tripType = reservation.returnDate ? "Round Trip" : "One Way";
    priceDisplay = reservation.returnDate ?
      `$${info.roundTrip} USD` :
      `$${info.oneWay} USD`;
  } else if (info.extraHour) {
    tripType = "City Open Service";
    priceDisplay = `$${info.base} USD + Extra Hours`;
  } else {
    tripType = "Activity / Tour";
    priceDisplay = `$${info.base} USD`;
  }

  // Save locally
  const saved = JSON.parse(localStorage.getItem("reservations")) || [];
  saved.push({ ...reservation, service: info.label });
  localStorage.setItem("reservations", JSON.stringify(saved));

  // Send emails
  sendEmails(reservation, info.label, priceDisplay, tripType);

  // WhatsApp
  sendWhatsApp(reservation);

  alert("✔ Reservation successfully submitted!");
  bookingForm.reset();
  updateServiceUI();
});

/* =====================================================
   WhatsApp Message
===================================================== */
function sendWhatsApp(r) {
  let msg =
    `New Reservation%0A%0A` +
    `Name: ${r.name}%0A` +
    `Phone: ${r.phone}%0A` +
    `Email: ${r.email}%0A` +
    `Pickup: ${r.pickup}%0A` +
    `Destination: ${r.destination}%0A` +
    `Date: ${r.date} at ${r.time}%0A`;

  if (r.returnDate) msg += `Return: ${r.returnDate} ${r.returnTime}%0A`;
  if (r.hours) msg += `Hours: ${r.hours}%0A`;
  if (r.notes) msg += `Notes: ${r.notes}%0A`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
}
