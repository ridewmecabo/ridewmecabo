emailjs.init("Ed5Qh2Qk81A6fHcRR");

const WHATSAPP_NUMBER = "526242426741";

const serviceTypeEl = document.getElementById("serviceType");
const passengersEl = document.getElementById("passengers");
const pickupInput = document.getElementById("pickupPreset");
const destinationInput = document.getElementById("destinationPreset");

const returnDateWrapper = document.getElementById("returnDateWrapper");
const returnTimeWrapper = document.getElementById("returnTimeWrapper");
const hoursWrapper = document.getElementById("hoursWrapper");

const selectedServiceNameEl = document.getElementById("selectedServiceName");
const selectedServicePriceEl = document.getElementById("selectedServicePrice");
const totalPriceEl = document.getElementById("totalPrice");

/* ==========================
   DESTINATIONS (Autocomplete)
========================== */
const DESTINOS = [
  "Nobu Hotel Los Cabos", "Hard Rock Hotel Los Cabos",
  "Waldorf Astoria Pedregal", "Garza Blanca Resort",
  "Grand Velas Los Cabos", "Esperanza Auberge",
  "One&Only Palmilla", "Montage Los Cabos",
  "The Cape", "Riu Palace", "Riu Santa Fe",
  "Breathless Cabo", "Secrets Puerto Los Cabos",
  "Hyatt Ziva", "Le Blanc Spa Resort",
  "Pueblo Bonito Sunset", "Pueblo Bonito Rose",
  "Pueblo Bonito Blanco", "Solaz Resort",
  "Hilton Los Cabos", "Marquis Los Cabos",
  "Grand Fiesta Americana", "Dreams Los Cabos",
  "Barcelo Gran Faro", "Marina Fiesta Resort",
  "Cabo Azul Resort", "Sheraton Grand Los Cabos",
  "Chileno Bay Resort", "Las Ventanas al Paraíso",
  "Vidanta Los Cabos", "Edith’s", "The Office",
  "Sunset Monalisa", "Lorenzillo’s", "Rosa Negra",
  "Flora Farms", "Acre", "Carbón Cabrón",
  "Mango Deck", "SUR Beach House",
  "OMNIA", "Veleros Beach Club",
  "Cabo San Lucas Downtown", "San José Downtown",
  "El Arco", "Medano Beach",
  "Puerto Paraíso Mall", "Luxury Avenue",
  "Costco CSL", "Fresko", "Walmart",
  "Los Cabos Airport (SJD)", "FBO Terminal"
];

function setupAutocomplete(input, dropdown) {
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    dropdown.innerHTML = "";
    if (!q) return;

    DESTINOS.filter(x => x.toLowerCase().includes(q))
      .slice(0, 8)
      .forEach(match => {
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

  document.addEventListener("click", e => {
    if (!dropdown.contains(e.target) && !input.contains(e.target)) dropdown.innerHTML = "";
  });
}

setupAutocomplete(pickupInput, document.getElementById("pickupDropdown"));
setupAutocomplete(destinationInput, document.getElementById("destinationDropdown"));

/* ==========================
   PRICES
========================== */
const SERVICE_INFO = {
  zone1: { label: "Zone 1 – Palmilla", oneWay: 75, roundTrip: 130 },
  zone2: { label: "Zone 2 – Puerto Los Cabos", oneWay: 85, roundTrip: 150 },
  zone3a: { label: "Zone 3 – Palmilla → Cabo del Sol", oneWay: 95, roundTrip: 170 },
  zone3b: { label: "Zone 3B – Punta Ballena / Solmar", oneWay: 105, roundTrip: 180 },
  zone5: { label: "Zone 5 – Pedregal / Diamante", oneWay: 110, roundTrip: 200 },
  city4: { label: "City Service – 4 Hours", base: 140, extra: 20 },
  city6: { label: "City Service – 6 Hours", base: 160, extra: 20 },
  migrino: { label: "Migriño Tour", base: 350 },
  todosSantos: { label: "Todos Santos Tour", base: 400 },
  barriles: { label: "Los Barriles Tour", base: 400 },
  laPaz: { label: "La Paz Tour", base: 600 }
};

function updateServiceUI() {
  const sv = serviceTypeEl.value;
  const info = SERVICE_INFO[sv];

  if (!info) return;

  selectedServiceNameEl.textContent = info.label;

  // Airport transfers => allow round trip
  if (info.oneWay) {
    selectedServicePriceEl.innerHTML =
      `One Way: $${info.oneWay} USD<br>Round Trip: $${info.roundTrip} USD`;

    returnDateWrapper.style.display = "block";
    returnTimeWrapper.style.display = "block";
    hoursWrapper.style.display = "none";
    return;
  }

  // City services
  if (info.extra) {
    selectedServicePriceEl.innerHTML =
      `Base Price: $${info.base} USD<br>Extra Hour: $${info.extra} USD`;

    returnDateWrapper.style.display = "none";
    returnTimeWrapper.style.display = "none";
    hoursWrapper.style.display = "block";
    return;
  }

  // Tours
  selectedServicePriceEl.innerHTML = `Price: $${info.base} USD`;
  returnDateWrapper.style.display = "none";
  returnTimeWrapper.style.display = "none";
  hoursWrapper.style.display = "none";
}

serviceTypeEl.addEventListener("change", updateServiceUI);
updateServiceUI();

/* ==========================
   SUBMIT FORM
========================== */
document.getElementById("bookingForm").addEventListener("submit", e => {
  e.preventDefault();

  const sv = serviceTypeEl.value;
  const info = SERVICE_INFO[sv];

  if (!info) return alert("Select a valid service.");

  const reservation = {
    name: name.value,
    phone: phone.value,
    email: email.value,
    service_label: info.label,
    pickup: pickupInput.value,
    destination: destinationInput.value,
    date: date.value,
    time: time.value,
    returnDate: returnDate.value,
    returnTime: returnTime.value,
    hours: hours.value,
    notes: notes.value,
    price:
      info.oneWay
        ? (returnDate.value ? info.roundTrip : info.oneWay)
        : info.base
  };

  /* EMAILJS — Business email */
  emailjs.send("service_8zcytcr", "template_7tkwggo", reservation);

  /* EMAILJS — Auto Reply */
  emailjs.send("service_8zcytcr", "template_autoreply", reservation);

  /* WhatsApp */
  sendWhatsApp(reservation);

  alert("Reservation sent successfully!");
  document.getElementById("bookingForm").reset();
  updateServiceUI();
});

/* ==========================
   WhatsApp
========================== */
function sendWhatsApp(r) {
  let msg =
    `New Reservation%0A%0A` +
    `Name: ${r.name}%0A` +
    `Phone: ${r.phone}%0A` +
    `Service: ${r.service_label}%0A` +
    `Price: $${r.price} USD%0A` +
    `Pickup: ${r.pickup}%0A` +
    `Destination: ${r.destination}%0A` +
    `Date: ${r.date} at ${r.time}%0A`;

  if (r.returnDate) msg += `Return: ${r.returnDate} at ${r.returnTime}%0A`;
  if (r.notes) msg += `Notes: ${r.notes}%0A`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
}
