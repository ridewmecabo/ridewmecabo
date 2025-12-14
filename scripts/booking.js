/* ============================================================
   BOOKING.JS – Ride W Me Cabo (FINAL & STABLE)
============================================================ */

// ================= EMAILJS =================
emailjs.init("Ed5Qh2Qk81A6fHcRR");

// ================= WHATSAPP =================
const WHATSAPP = "526242426741";

// ================= ELEMENTS =================
const tripTypeEl = document.getElementById("tripType");
const serviceTypeEl = document.getElementById("serviceType");
const passengersEl = document.getElementById("passengers");

const pickupEl = document.getElementById("pickupPreset");
const destinationEl = document.getElementById("destinationPreset");

const dateEl = document.getElementById("date");
const timeEl = document.getElementById("time");
const returnDateEl = document.getElementById("returnDate");
const returnTimeEl = document.getElementById("returnTime");
const hoursEl = document.getElementById("hours");
const notesEl = document.getElementById("notes");

// Wrappers
const returnDateWrapper = document.getElementById("returnDateWrapper");
const returnTimeWrapper = document.getElementById("returnTimeWrapper");
const hoursWrapper = document.getElementById("hoursWrapper");

// UI Summary
const uiName = document.getElementById("selectedServiceName");
const uiPrice = document.getElementById("selectedServicePrice");


// ================= SERVICES =================
const SERVICES = {
  zone1: { label: "Arrivals / Departures – Zone 1 (SJD ↔ Palmilla)", oneWay: 75, roundTrip: 130 },
  zone2: { label: "Arrivals / Departures – Zone 2 (Puerto Los Cabos / El Encanto)", oneWay: 85, roundTrip: 150 },
  zone3a:{ label: "Arrivals / Departures – Zone 3 (Palmilla ↔ Cabo del Sol)", oneWay: 95, roundTrip: 170 },
  zone3b:{ label: "Arrivals / Departures – Zone 3 (Punta Ballena / Solmar)", oneWay: 105, roundTrip: 180 },
  zone5: { label: "Arrivals / Departures – Zone 5 (Pedregal / Diamante)", oneWay: 110, roundTrip: 200 },

  city4: { label: "Open Service – 4 Hours", base: 140, extraHour: 20 },
  city6: { label: "Open Service – 6 Hours", base: 160, extraHour: 20 },

  migrino: { label: "Activities / Dinner Tour – Migriño", base: 350 },
  todosSantos: { label: "Activities / Dinner Tour – Todos Santos", base: 400 },
  barriles: { label: "Activities / Dinner Tour – La Ribera / Los Barriles", base: 400 },
  laPaz: { label: "Activities / Dinner Tour – La Paz", base: 600 }
};

// ================= DESTINOS (AUTOCOMPLETE) =================
const DESTINOS = [
  "Nobu Hotel Los Cabos","Hard Rock Hotel Los Cabos","Waldorf Astoria Pedregal",
  "One&Only Palmilla","Grand Velas Los Cabos","Montage Los Cabos","The Cape",
  "Pueblo Bonito Sunset","Pueblo Bonito Rose","Pueblo Bonito Blanco",
  "Solaz Resort","Hilton Los Cabos","Marquis Los Cabos",
  "Rosa Negra","Taboo Cabo","Funky Geisha","Sunset Monalisa",
  "Flora Farms","Acre Restaurant","El Farallon",
  "Mango Deck","SUR Beach House","Blue Marlin Ibiza",
  "Cabo San Lucas Downtown","San José del Cabo Downtown","Marina Cabo San Lucas",
  "Los Cabos International Airport (SJD)",
  "FBO Private Terminal (SJD)",
  "Airbnb (Custom)","Private Villa (Custom)"
];

// ================= AUTOCOMPLETE =================
function setupAutocomplete(input, dropdown) {
  input.addEventListener("input", () => {
    const q = input.value.toLowerCase().trim();
    dropdown.innerHTML = "";
    if (!q) return;

    DESTINOS.filter(d => d.toLowerCase().includes(q))
      .slice(0, 7)
      .forEach(place => {
        const div = document.createElement("div");
        div.className = "autocomplete-item";
        div.textContent = place;
        div.onclick = () => {
          input.value = place;
          dropdown.innerHTML = "";
        };
        dropdown.appendChild(div);
      });
  });

  document.addEventListener("click", e => {
    if (!input.contains(e.target)) dropdown.innerHTML = "";
  });
}

setupAutocomplete(pickupEl, document.getElementById("pickupDropdown"));
setupAutocomplete(destinationEl, document.getElementById("destinationDropdown"));

// ================= UI UPDATE =================
function updateServiceUI() {
  const service = SERVICES[serviceTypeEl.value];
  if (!service) {
    uiName.textContent = "Select a service";
    uiPrice.textContent = "—";
    return;
  }

  uiName.textContent = service.label;

  returnDateWrapper.style.display = "none";
  returnTimeWrapper.style.display = "none";
  hoursWrapper.style.display = "none";

  if (service.oneWay) {
    uiPrice.innerHTML = `
      <strong>One Way:</strong> $${service.oneWay} USD<br>
      <strong>Round Trip:</strong> $${service.roundTrip} USD
    `;
    if (tripTypeEl.value === "round") {
      returnDateWrapper.style.display = "block";
      returnTimeWrapper.style.display = "block";
    }
  }
  else if (service.extraHour) {
    uiPrice.innerHTML = `
      <strong>Base:</strong> $${service.base} USD<br>
      <strong>Extra Hour:</strong> $${service.extraHour} USD
    `;
    hoursWrapper.style.display = "block";
  }
  else {
    uiPrice.innerHTML = `<strong>Price:</strong> $${service.base} USD`;
  }
}

serviceTypeEl.addEventListener("change", updateServiceUI);
tripTypeEl.addEventListener("change", updateServiceUI);

// Default
tripTypeEl.value = "oneway";
updateServiceUI();

// ================= PRICE CALC =================
function calculatePrice() {
  const s = SERVICES[serviceTypeEl.value];
  let basePrice = 0;
  let total = 0;

  if (s.oneWay) {
    if (tripTypeEl.value === "round") {
      basePrice = s.roundTrip;
      total = s.roundTrip;
    } else {
      basePrice = s.oneWay;
      total = s.oneWay;
    }
  }

  else if (s.extraHour) {
    const hrs = Number(hoursEl.value || 0);
    basePrice = s.base;
    total = s.base + (hrs * s.extraHour);
  }

  else {
    basePrice = s.base;
    total = s.base;
  }

  return { basePrice, total };
}


// ================= SEND EMAIL =================
function sendEmail(data) {
  return emailjs.send("service_8zcytcr", "template_7tkwggo", data);
}

// ================= WHATSAPP =================
function sendWhatsApp(data) {
  const msg =
`🚗 Ride W Me Cabo – Reservation Confirmed

Name: ${data.name}
Service: ${data.service_label}
Trip: ${data.trip_type}

Pickup: ${data.pickup}
Destination: ${data.destination}

Date: ${data.date} ${data.time}
${data.return_date ? `Return: ${data.return_date} ${data.return_time}\n` : ""}
Total: $${data.total_price} USD`;

  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`);
}

// ================= SUBMIT =================
document.getElementById("bookingForm").addEventListener("submit", e => {
  e.preventDefault();

  const service = SERVICES[serviceTypeEl.value];
  const pricing = calculatePrice();


  const data = {
  name: document.getElementById("name").value,
  phone: document.getElementById("phone").value,
  email: document.getElementById("email").value,

  passengers: passengersEl.value,
  pickup: pickupEl.value,
  destination: destinationEl.value,
  date: dateEl.value,
  time: timeEl.value,
  return_date: returnDateEl.value,
  return_time: returnTimeEl.value,
  extra_hours: hoursEl.value,
  notes: notesEl.value,

  service_label: service.label,
  trip_type: tripTypeEl.value === "round" ? "Round Trip" : "One Way",

  // 👇 ESTO ES LO QUE FALTABA
  base_price: pricing.basePrice,
  total_price: pricing.total
};


  sendEmail(data).then(() => {
    sendWhatsApp(data);
    alert("Reservation sent successfully!");
    document.getElementById("bookingForm").reset();
    tripTypeEl.value = "oneway";
    updateServiceUI();
  }).catch(() => {
    alert("Error sending reservation.");
  });
});
