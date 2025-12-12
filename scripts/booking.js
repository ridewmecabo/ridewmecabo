/* =====================================================
   booking.js — FULL FINAL VERSION
   Ride W Me Cabo – Reservation System
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
   DESTINOS (AUTOCOMPLETADO)
===================================================== */
const DESTINOS = [
  "Nobu Hotel Los Cabos", "Hard Rock Hotel Los Cabos", "Waldorf Astoria Pedregal",
  "Garza Blanca Resort", "Grand Velas Los Cabos", "Esperanza Auberge", "One&Only Palmilla",
  "Montage Los Cabos", "The Cape, a Thompson Hotel", "Riu Palace", "Riu Santa Fe",
  "Breathless Cabo San Lucas", "Secrets Puerto Los Cabos", "Hyatt Ziva", "Le Blanc Spa Resort",
  "Pueblo Bonito Sunset", "Pueblo Bonito Rose", "Pueblo Bonito Blanco", "Solaz Resort",
  "Hilton Los Cabos", "Marquis Los Cabos", "Grand Fiesta Americana", "Dreams Los Cabos",
  "Barcelo Gran Faro", "Marina Fiesta Resort", "Cabo Azul Resort", "Sheraton Grand Los Cabos",
  "CostaBaja Resort (La Paz)", "Chileno Bay Resort", "Las Ventanas al Paraíso",
  "Vidanta Los Cabos",

  // Restaurants
  "Edith’s", "The Office on the Beach", "Sunset Monalisa", "Lorenzillo’s",
  "Rosa Negra", "Funky Geisha", "Taboo Cabo", "Mamazzita Cabo", "Animalón",
  "El Farallon", "Acre Restaurant", "Flora Farms", "Jazmin’s Restaurant",
  "Tacos Gardenias", "La Lupita Tacos", "Carbón Cabrón",

  // Clubs
  "Mango Deck", "SUR Beach House", "OMNIA Los Cabos", "Blue Marlin Ibiza",
  "Veleros Beach Club",

  // Zones
  "Cabo San Lucas Downtown", "San José del Cabo Downtown", "El Arco",
  "Marina Cabo San Lucas", "Puerto Paraíso Mall", "Luxury Avenue",
  "Medano Beach", "La Marina SJC", "Cabo del Sol Golf", "Palmilla Golf",
  "Diamante Golf", "Costco CSL", "Fresko CSL", "Walmart San Lucas",
  "Home Depot CSL", "Puerto Los Cabos Marina", "Zacatitos", "East Cape",

  // Airport
  "Los Cabos International Airport (SJD)", "FBO Private Terminal (SJD)",
  "FBO Cabo San Lucas",

  // Other
  "Airbnb (Custom)", "Private Villa (Custom)", "H+ Hospital", "Cabo Adventures"
];

function setupAutocomplete(input, dropdown) {
  input.addEventListener("input", function () {
    const query = this.value.trim().toLowerCase();
    dropdown.innerHTML = "";
    if (!query) return;

    const results = DESTINOS.filter(loc => loc.toLowerCase().includes(query)).slice(0, 8);

    results.forEach(loc => {
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

  // Hide when clicking away
  document.addEventListener("click", e => {
    if (!dropdown.contains(e.target) && !input.contains(e.target)) dropdown.innerHTML = "";
  });
}

setupAutocomplete(pickupPreset, document.getElementById("pickupDropdown"));
setupAutocomplete(destinationPreset, document.getElementById("destinationDropdown"));

/* =====================================================
   SERVICE INFO (PRICES)
===================================================== */
const SERVICE_INFO = {
  zone1: { label: "Arrivals / Departures – Zone 1 (SJC to Palmilla)", oneWay: 75, roundTrip: 130 },
  zone2: { label: "Arrivals / Departures – Zone 2 (Puerto Los Cabos / El Encanto Laguna)", oneWay: 85, roundTrip: 150 },
  zone3a: { label: "Zone 3 – Palmilla to Cabo del Sol", oneWay: 95, roundTrip: 170 },
  zone3b: { label: "Zone 3B – Punta Ballena / Solmar", oneWay: 105, roundTrip: 180 },
  zone5: { label: "Zone 5 – Pedregal / Diamante", oneWay: 110, roundTrip: 200 },

  city4: { label: "Open Service – 4 Hours", base: 140, extraHour: 20, duration: "4 Hours" },
  city6: { label: "Open Service – 6 Hours", base: 160, extraHour: 20, duration: "6 Hours" },

  migrino: { label: "Activity / Dinner Tour – Migriño", base: 350, duration: "4–8 Hours" },
  todosSantos: { label: "Activity / Dinner Tour – Todos Santos", base: 400, duration: "4–8 Hours" },
  barriles: { label: "Activity / Dinner Tour – La Ribera / Los Barriles", base: 400, duration: "4–8 Hours" },
  laPaz: { label: "Activity / Dinner Tour – La Paz", base: 600, duration: "4–8 Hours" }
};

/* =====================================================
   UI update
===================================================== */
function updateServiceUI() {
  const sv = serviceTypeEl.value;
  const info = SERVICE_INFO[sv];

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
  } else if (info.extraHour) {
    selectedServicePriceEl.innerHTML = `
      <strong>Base:</strong> $${info.base} USD<br>
      <strong>Extra Hour:</strong> $${info.extraHour} USD
    `;
  } else {
    selectedServicePriceEl.innerHTML = `
      <strong>Price:</strong> $${info.base} USD<br>
      <strong>Duration:</strong> ${info.duration}
    `;
  }

  returnDateWrapper.style.display = info.oneWay ? "block" : "none";
  returnTimeWrapper.style.display = info.oneWay ? "block" : "none";
  hoursWrapper.style.display = info.extraHour ? "block" : "none";
}

serviceTypeEl.addEventListener("change", updateServiceUI);

/* =====================================================
   Disabled Dates (localStorage)
===================================================== */
function getDisabledDates() {
  const saved = JSON.parse(localStorage.getItem("reservations")) || [];
  return saved.flatMap(r => [r.date, r.returnDate]).filter(Boolean);
}

function renderUnavailableList() {
  const list = getDisabledDates();
  unavailableListEl.innerHTML = list.length ? "" : "All dates available.";
  list.forEach(d => {
    const div = document.createElement("div");
    div.textContent = d;
    unavailableListEl.appendChild(div);
  });
}
renderUnavailableList();

/* =====================================================
   EMAILJS — FINAL VERSION
===================================================== */
function sendEmails(reservation, priceDisplay, label, tripType) {
  // Email to YOU
  emailjs.send("service_8zcytcr", "template_ridewmecabo", {
    ...reservation,
    service_label: label,
    trip_type: tripType,
    price_display: priceDisplay
  });

  // Auto-reply to CLIENT
  emailjs.send("service_8zcytcr", "template_autoreply", {
    ...reservation,
    service_label: label,
    trip_type: tripType,
    price_display: priceDisplay
  });
}

/* =====================================================
   SUBMIT FORM
===================================================== */
document.getElementById("bookingForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const sv = serviceTypeEl.value;
  const info = SERVICE_INFO[sv];

  const reservation = {
    name: name.value.trim(),
    phone: phone.value.trim(),
    email: email.value.trim(),
    serviceType: sv,
    pickup: pickupPreset.value.trim(),
    destination: destinationPreset.value.trim(),
    passengers: passengersEl.value,
    date: date.value,
    time: time.value,
    returnDate: returnDate.value,
    returnTime: returnTime.value,
    hours: hours.value,
    notes: notes.value.trim()
  };

  if (!reservation.name || !reservation.phone || !reservation.email || !sv) {
    alert("Please complete all required fields.");
    return;
  }

  // Determine price display
  let priceDisplay = "";
  let tripType = "";

  if (info.oneWay) {
    priceDisplay = `$${info.oneWay} USD (One Way) / $${info.roundTrip} USD (Round Trip)`;
    tripType = "Airport – One Way / Round Trip";
  } else if (info.extraHour) {
    priceDisplay = `$${info.base} USD (${info.duration}) – Extra Hour $${info.extraHour}`;
    tripType = "City Open Service";
  } else {
    priceDisplay = `$${info.base} USD (${info.duration})`;
    tripType = "Activity / Tour";
  }

  // Save date for admin
  let saved = JSON.parse(localStorage.getItem("reservations")) || [];
  saved.push(reservation);
  localStorage.setItem("reservations", JSON.stringify(saved));
  renderUnavailableList();

  // SEND EMAILS
  sendEmails(reservation, priceDisplay, info.label, tripType);

  // WhatsApp
  sendWhatsApp(reservation);

  alert("Reservation sent successfully!");
  document.getElementById("bookingForm").reset();
  updateServiceUI();
});

/* =====================================================
   WhatsApp
===================================================== */
function sendWhatsApp(r) {
  let msg =
    `New Reservation - Ride W Me Cabo%0A%0A` +
    `Name: ${r.name}%0APhone: ${r.phone}%0AEmail: ${r.email}%0A` +
    `Service: ${r.serviceType}%0APassengers: ${r.passengers}%0A` +
    `Pickup: ${r.pickup}%0ADestination: ${r.destination}%0A` +
    `Date: ${r.date} at ${r.time}%0A`;

  if (r.returnDate) msg += `Return: ${r.returnDate} at ${r.returnTime}%0A`;
  if (r.hours) msg += `Hours: ${r.hours}%0A`;
  if (r.notes) msg += `%0ANotes: ${r.notes}%0A`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
}
