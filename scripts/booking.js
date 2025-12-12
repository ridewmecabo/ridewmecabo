/* =====================================================
   Ride W Me Cabo — FINAL BOOKING ENGINE (2025)
   ===================================================== */

emailjs.init("Ed5Qh2Qk81A6fHcRR"); // Your PUBLIC KEY

const WHATSAPP_NUMBER = "526242426741";

/* =====================================================
   PRICE TABLE (OFFICIAL)
===================================================== */
const SERVICES = {
  // =======================
  // ZONES (One Way / RT)
  // =======================
  zone1: {
    label: "Zone 1 – SJC ↔ Palmilla",
    oneWay: 75,
    roundTrip: 130,
    type: "zone"
  },
  zone2: {
    label: "Zone 2 – Puerto Los Cabos / El Encanto",
    oneWay: 85,
    roundTrip: 150,
    type: "zone"
  },
  zone3a: {
    label: "Zone 3 – Palmilla → Cabo del Sol",
    oneWay: 95,
    roundTrip: 170,
    type: "zone"
  },
  zone3b: {
    label: "Zone 3B – Punta Ballena / Solmar",
    oneWay: 105,
    roundTrip: 180,
    type: "zone"
  },
  zone5: {
    label: "Zone 5 – Pedregal / Diamante",
    oneWay: 110,
    roundTrip: 200,
    type: "zone"
  },

  // =======================
  // CITY OPEN SERVICES
  // =======================
  city4: {
    label: "City Open Service – 4 Hours",
    base: 140,
    extraHour: 20,
    type: "open"
  },
  city6: {
    label: "City Open Service – 6 Hours",
    base: 160,
    extraHour: 20,
    type: "open"
  },

  // =======================
  // TOURS (1 price only)
  // =======================
  migrino: {
    label: "Activity / Dinner Tour – Migriño",
    base: 350,
    duration: "4–8 hrs",
    type: "tour"
  },
  todosSantos: {
    label: "Activity / Dinner Tour – Todos Santos",
    base: 400,
    duration: "4–8 hrs",
    type: "tour"
  },
  barriles: {
    label: "Activity / Dinner Tour – La Ribera / Los Barriles",
    base: 400,
    duration: "4–8 hrs",
    type: "tour"
  },
  laPaz: {
    label: "Activity / Dinner Tour – La Paz",
    base: 600,
    duration: "4–8 hrs",
    type: "tour"
  }
};

/* =====================================================
   ELEMENTS
===================================================== */
const serviceTypeEl = document.getElementById("serviceType");
const tripTypeEl = document.getElementById("tripType");
const extraHoursEl = document.getElementById("extraHours");

const selectedServiceNameEl = document.getElementById("selectedServiceName");
const selectedServicePriceEl = document.getElementById("selectedServicePrice");

const returnDateWrapper = document.getElementById("returnDateWrapper");
const returnTimeWrapper = document.getElementById("returnTimeWrapper");

/* =====================================================
   UPDATE UI + SHOW PRICES
===================================================== */
function updateServiceUI() {
  const key = serviceTypeEl.value;
  const service = SERVICES[key];
  const trip = tripTypeEl.value;

  if (!service) {
    selectedServiceNameEl.textContent = "Select a service";
    selectedServicePriceEl.innerHTML = "—";
    return;
  }

  selectedServiceNameEl.textContent = service.label;

  // AIRPORT ZONES
  if (service.type === "zone") {
    selectedServicePriceEl.innerHTML = `
      <strong>One Way:</strong> $${service.oneWay} USD<br>
      <strong>Round Trip:</strong> $${service.roundTrip} USD
    `;
    returnDateWrapper.style.display = trip === "round" ? "block" : "none";
    returnTimeWrapper.style.display = trip === "round" ? "block" : "none";
    extraHoursEl.parentElement.style.display = "none";
  }

  // CITY OPEN SERVICES
  if (service.type === "open") {
    selectedServicePriceEl.innerHTML = `
      <strong>Base:</strong> $${service.base} USD<br>
      <strong>Extra Hour:</strong> $${service.extraHour} USD
    `;
    returnDateWrapper.style.display = "none";
    returnTimeWrapper.style.display = "none";
    extraHoursEl.parentElement.style.display = "block";
  }

  // TOURS
  if (service.type === "tour") {
    selectedServicePriceEl.innerHTML = `
      <strong>Price:</strong> $${service.base} USD<br>
      <strong>Duration:</strong> ${service.duration}
    `;
    returnDateWrapper.style.display = "none";
    returnTimeWrapper.style.display = "none";
    extraHoursEl.parentElement.style.display = "none";
  }
}

serviceTypeEl.addEventListener("change", updateServiceUI);
tripTypeEl.addEventListener("change", updateServiceUI);

/* =====================================================
   PRICE CALCULATION
===================================================== */
function calculateTotal(service, trip, extraHours) {
  if (service.type === "zone") {
    return trip === "round" ? service.roundTrip : service.oneWay;
  }

  if (service.type === "open") {
    return service.base + (extraHours * service.extraHour);
  }

  if (service.type === "tour") {
    return service.base;
  }

  return 0;
}

/* =====================================================
   SEND FORM
===================================================== */
document.getElementById("bookingForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const key = serviceTypeEl.value;
  const service = SERVICES[key];
  const trip = tripTypeEl.value;
  const extraHours = Number(extraHoursEl.value || 0);

  if (!service) return alert("Please select a valid service.");

  const total = calculateTotal(service, trip, extraHours);

  const reservation = {
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    email: document.getElementById("email").value.trim(),
    passengers: document.getElementById("passengers").value,
    pickup: document.getElementById("pickupPreset").value.trim(),
    destination: document.getElementById("destinationPreset").value.trim(),
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    returnDate: document.getElementById("returnDate").value,
    returnTime: document.getElementById("returnTime").value,

    // NEW
    service_label: service.label,
    tripType: trip === "one" ? "One Way" : "Round Trip",
    extraHours,
    total
  };

  // SEND TO EMAILJS
  emailjs.send("service_8zcytcr", "template_7tkwggo", reservation)
    .then(() => {
      sendWhatsApp(reservation);
      alert("Reservation sent successfully!");
      document.getElementById("bookingForm").reset();
      updateServiceUI();
    })
    .catch(err => {
      console.error(err);
      alert("Error sending reservation.");
    });
});

/* =====================================================
   WHATSAPP
===================================================== */
function sendWhatsApp(r) {
  let msg =
    `New Reservation - Ride W Me Cabo%0A%0A` +
    `Name: ${r.name}%0A` +
    `Phone: ${r.phone}%0A` +
    `Email: ${r.email}%0A` +
    `Service: ${r.service_label}%0A` +
    `Trip Type: ${r.tripType}%0A` +
    `Passengers: ${r.passengers}%0A` +
    `Pickup: ${r.pickup}%0A` +
    `Destination: ${r.destination}%0A` +
    `Date: ${r.date} at ${r.time}%0A`;

  if (r.returnDate) msg += `Return: ${r.returnDate} at ${r.returnTime}%0A`;
  if (r.extraHours) msg += `Extra Hours: ${r.extraHours}%0A`;

  msg += `%0ATotal: $${r.total} USD`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
}
