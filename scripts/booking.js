/* =====================================================
   booking.js — Ride W Me Cabo (Versión Completa)
===================================================== */

// Inicializar EmailJS
emailjs.init("service_8zcytcr");

// Número WhatsApp
const WHATSAPP_NUMBER = "526242426741";

// Inputs
const serviceTypeEl = document.getElementById("serviceType");
const passengersEl = document.getElementById("passengers");
const tripTypeEl = document.getElementById("tripType");

const pickupPreset = document.getElementById("pickupPreset");
const destinationPreset = document.getElementById("destinationPreset");

const returnDateWrapper = document.getElementById("returnDateWrapper");
const returnTimeWrapper = document.getElementById("returnTimeWrapper");

const returnDate = document.getElementById("returnDate");
const returnTime = document.getElementById("returnTime");

const selectedServiceNameEl = document.getElementById("selectedServiceName");
const selectedServicePriceEl = document.getElementById("selectedServicePrice");

/* =====================================================
   LISTA DE DESTINOS
===================================================== */

const DESTINOS = [
  "Nobu Hotel Los Cabos", "Hard Rock Hotel Los Cabos", "Waldorf Astoria Pedregal",
  "Garza Blanca Resort", "Grand Velas", "Esperanza Auberge",
  "One&Only Palmilla", "Montage Los Cabos", "The Cape",
  "Riu Palace", "Riu Santa Fe", "Breathless",
  "Secrets Puerto Los Cabos", "Hyatt Ziva", "Le Blanc",
  "Pueblo Bonito Sunset", "Cabo Azul", "Sheraton Grand",
  "Chileno Bay", "Las Ventanas",
  // Restaurantes
  "Edith’s", "The Office", "Sunset Monalisa", "Rosa Negra", "Taboo", "Acre", "Flora Farms",
  // Clubs
  "Mango Deck", "OMNIA", "Blue Marlin Ibiza",
  // General
  "Cabo San Lucas Downtown", "San José Downtown", "Medano Beach",
  "SJD Airport", "FBO Private Terminal", "Private Villa", "Airbnb"
];

/* =====================================================
   AUTOCOMPLETE
===================================================== */
function setupAutocomplete(input, dropdown) {
  input.addEventListener("input", function () {
    const q = this.value.toLowerCase();
    dropdown.innerHTML = "";
    if (!q) return;

    DESTINOS.filter(d => d.toLowerCase().includes(q))
      .slice(0, 8)
      .forEach(d => {
        const item = document.createElement("div");
        item.className = "autocomplete-item";
        item.textContent = d;
        item.onclick = () => {
          input.value = d;
          dropdown.innerHTML = "";
        };
        dropdown.appendChild(item);
      });
  });
}

setupAutocomplete(pickupPreset, document.getElementById("pickupDropdown"));
setupAutocomplete(destinationPreset, document.getElementById("destinationDropdown"));

/* =====================================================
   PRECIOS Y SERVICIOS
===================================================== */

const SERVICE_INFO = {
  zone1: { label: "Zone 1 – SJC to Palmilla", oneWay: 75, roundTrip: 130 },
  zone2: { label: "Zone 2 – Puerto Los Cabos / El Encanto", oneWay: 85, roundTrip: 150 },
  zone3a: { label: "Zone 3 – Palmilla to Cabo del Sol", oneWay: 95, roundTrip: 170 },
  zone3b: { label: "Zone 3B – Punta Ballena / Solmar", oneWay: 105, roundTrip: 180 },
  zone5: { label: "Zone 5 – Pedregal / Diamante", oneWay: 110, roundTrip: 200 },

  city4: { label: "Open Service – 4 Hours", base: 140, extraHour: 20 },
  city6: { label: "Open Service – 6 Hours", base: 160, extraHour: 20 },

  migrino: { label: "Activity / Dinner Tour – Migriño", base: 350, duration: "4–8 hrs" },
  todosSantos: { label: "Activity / Dinner Tour – Todos Santos", base: 400, duration: "4–8 hrs" },
  barriles: { label: "Activity / Dinner Tour – La Ribera / Los Barriles", base: 400, duration: "4–8 hrs" },
  laPaz: { label: "Activity / Dinner Tour – La Paz", base: 600, duration: "4–8 hrs" }
};

/* =====================================================
   MOSTRAR INFORMACIÓN EN RESUMEN
===================================================== */
function updateServiceUI() {
  const sv = serviceTypeEl.value;
  const type = tripTypeEl.value;
  const info = SERVICE_INFO[sv];

  if (!sv || !info) return;

  selectedServiceNameEl.textContent = info.label;

  let priceText = "";

  if (info.oneWay) {
    if (type === "oneway") {
      priceText = `$${info.oneWay} USD`;
    } else {
      priceText = `One Way: $${info.oneWay} USD<br>Round Trip: $${info.roundTrip} USD`;
    }
  } else {
    priceText = `$${info.base} USD`;
  }

  selectedServicePriceEl.innerHTML = priceText;
}
serviceTypeEl.addEventListener("change", updateServiceUI);
tripTypeEl.addEventListener("change", handleTripType);

/* =====================================================
   TRIP TYPE UI
===================================================== */
function handleTripType() {
  const type = tripTypeEl.value;

  if (type === "roundtrip") {
    returnDateWrapper.style.display = "block";
    returnTimeWrapper.style.display = "block";
  } else {
    returnDateWrapper.style.display = "none";
    returnTimeWrapper.style.display = "none";
    returnDate.value = "";
    returnTime.value = "";
  }

  updateServiceUI();
}

/* =====================================================
   CALCULAR TOTAL PARA EMAIL Y WHATSAPP
===================================================== */
function calculatePrice(sv, type) {
  const i = SERVICE_INFO[sv];

  if (!i) return 0;

  if (i.oneWay) {
    return type === "roundtrip" ? i.roundTrip : i.oneWay;
  }

  return i.base;
}

/* =====================================================
   FORM SUBMIT
===================================================== */
document.getElementById("bookingForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const serviceKey = serviceTypeEl.value;
  const tripType = tripTypeEl.value;
  const info = SERVICE_INFO[serviceKey];

  const price = calculatePrice(serviceKey, tripType);

  const reservation = {
    name: name.value,
    phone: phone.value,
    email: email.value,
    pickup: pickupPreset.value,
    destination: destinationPreset.value,
    date: date.value,
    time: time.value,
    returnDate: returnDate.value,
    returnTime: returnTime.value,
    passengers: passengersEl.value,
    service_label: info.label,
    tripType: tripType === "oneway" ? "One Way" : "Round Trip",
    price: price
  };

  /* EMAILJS — ENVÍO PRINCIPAL */
  emailjs.send("service_8zcytcr", "template_7tkwggo", reservation)
    .then(() => {
      showAlert("Your reservation was successfully sent!");
    })
    .catch(() => {
      showAlert("Error sending reservation. Try again.", true);
    });

  /* WHATSAPP */
  sendWhatsApp(reservation);
});

/* =====================================================
   WHATSAPP
===================================================== */
function sendWhatsApp(r) {
  let msg =
    `NEW RESERVATION%0A%0A` +
    `Name: ${r.name}%0A` +
    `Phone: ${r.phone}%0A` +
    `Email: ${r.email}%0A` +
    `Service: ${r.service_label}%0A` +
    `Trip Type: ${r.tripType}%0A` +
    `Price: $${r.price} USD%0A%0A` +
    `Pickup: ${r.pickup}%0A` +
    `Destination: ${r.destination}%0A` +
    `Departure: ${r.date} at ${r.time}%0A`;

  if (r.returnDate)
    msg += `Return: ${r.returnDate} at ${r.returnTime}%0A`;

  msg += `%0APassengers: ${r.passengers}%0A`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
}

/* =====================================================
   ALERTA CUSTOM
===================================================== */
function showAlert(msg, error = false) {
  let box = document.createElement("div");
  box.className = "custom-alert";
  if (error) box.classList.add("error");
  box.textContent = msg;

  document.body.appendChild(box);

  setTimeout(() => box.classList.add("show"), 10);
  setTimeout(() => {
    box.classList.remove("show");
    setTimeout(() => box.remove(), 400);
  }, 3000);
}
