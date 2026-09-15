import { PrismaClient, Department, RoomStatus, HkTaskStatus, ReservationStatus, FolioType, RevenueDepartment } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── deterministic PRNG so re-seeds look the same run to run ──────────────
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260915);
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

function startOfDay(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
function addDays(d: Date, n: number) {
  const out = new Date(d);
  out.setUTCDate(out.getUTCDate() + n);
  return out;
}
const TODAY = startOfDay(new Date());
const isWeekendJkt = (d: Date) => {
  // Fri/Sat treated as the "weekend" uplift, matching the original mockup.
  const dow = d.getUTCDay(); // 0=Sun..6=Sat
  return dow === 5 || dow === 6;
};

// ─── static reference data ─────────────────────────────────────────────────

const CORPORATIONS: [string, [string, string, string][]][] = [
  ["CIPTA HARMONI LESTARI", [["PST", "Pusat", "Jakarta"], ["GNJ", "Grand Nusantara Jakarta", "Jakarta Pusat"], ["NRB", "Nusantara Resort Bali", "Badung"], ["NCB", "Nusantara City Bandung", "Bandung"]]],
  ["CIPTA SELARAS CEMERLANG", [["PST", "Pusat", "Jakarta"], ["NES", "Nusantara Express Surabaya", "Surabaya"], ["NEM", "Nusantara Express Malang", "Malang"]]],
  ["HARMONI ADIL SELARAS", [["PST", "Pusat", "Jakarta"], ["HAS", "Harmoni Suites Yogyakarta", "Yogyakarta"]]],
  ["SERPONG BANGUN CIPTA", [["PST", "Pusat", "Jakarta"], ["SBC", "Unit Serpong", "Tangerang Selatan"]]],
  ["SERPONG BANGUN LESTARI", [["PST", "Pusat", "Jakarta"], ["SRP", "Marchand Hype Station", "Tangerang Selatan"], ["BDG", "Unit Bandung", "Bandung"], ["SBY", "Unit Surabaya", "Surabaya"], ["MDN", "Unit Medan", "Medan"]]],
  ["PERTIWI AGUNG LESTARI", [["PST", "Pusat", "Jakarta"], ["PAL", "Pertiwi Beach Club", "Gianyar"], ["PLB", "Unit Lombok", "Mataram"]]],
  ["BANGUN INDAH HARMONI", [["PST", "Pusat", "Jakarta"]]],
];

const ROOM_TYPES = [
  { code: "SUP-K", name: "Superior King", bar: 980000 },
  { code: "SUP-T", name: "Superior Twin", bar: 980000 },
  { code: "DLX-K", name: "Deluxe King", bar: 1180000 },
  { code: "DLX-T", name: "Deluxe Twin", bar: 1180000 },
  { code: "EXE-S", name: "Executive Suite", bar: 2350000 },
  { code: "FAM-S", name: "Family Suite", bar: 2750000 },
];

// Floor plan for the flagship property (Grand Nusantara Jakarta) — 248 rooms.
const FLOOR_PLAN: { floor: number; from: number; count: number; type: string }[] = [
  { floor: 2, from: 1, count: 25, type: "SUP-K" },
  { floor: 3, from: 1, count: 25, type: "SUP-K" },
  { floor: 4, from: 1, count: 10, type: "SUP-K" },
  { floor: 4, from: 11, count: 15, type: "SUP-T" },
  { floor: 5, from: 1, count: 25, type: "SUP-T" },
  { floor: 6, from: 1, count: 24, type: "SUP-T" },
  { floor: 7, from: 1, count: 25, type: "DLX-K" },
  { floor: 8, from: 1, count: 23, type: "DLX-K" },
  { floor: 9, from: 1, count: 25, type: "DLX-T" },
  { floor: 10, from: 1, count: 15, type: "DLX-T" },
  { floor: 10, from: 16, count: 10, type: "EXE-S" },
  { floor: 11, from: 1, count: 14, type: "EXE-S" },
  { floor: 11, from: 15, count: 12, type: "FAM-S" },
];

const MENU: Record<string, [string, number][]> = {
  Makanan: [["Nasi Goreng Kampung", 95000], ["Sate Ayam Madura", 110000], ["Gado-Gado Jakarta", 78000], ["Soto Betawi", 98000], ["Ikan Gurame Bakar", 185000], ["Club Sandwich", 92000], ["Mie Goreng Seafood", 105000], ["Rendang Daging", 145000]],
  Minuman: [["Es Teh Manis", 32000], ["Kopi Tubruk", 38000], ["Jus Alpukat", 55000], ["Es Kelapa Muda", 48000], ["Teh Tarik", 42000], ["Air Mineral 600ml", 25000]],
  Bar: [["Bintang Draft", 78000], ["Mojito", 145000], ["Wine by Glass", 165000], ["Mocktail Nusantara", 95000]],
  Dessert: [["Es Campur", 58000], ["Pisang Goreng Keju", 52000], ["Klappertaart", 65000], ["Sorbet Markisa", 48000]],
};

const FILLER_GUEST_NAMES = [
  "Agus Setiadi", "Rini Handayani", "Bambang Wijaya", "Siti Aminah", "Dedi Kurniawan", "Yuli Astuti",
  "Taufik Hidayat", "Wulan Sari", "Rudi Hartono", "Nur Fadilah", "Eko Prasetyo", "Dewi Lestari",
  "Iwan Setiawan", "Ratna Sari", "Joko Susilo", "Anita Putri", "Hendro Wibowo", "Maya Kusuma",
  "Fajar Ramadhan", "Indah Permata", "Arief Rahman", "Lina Marlina", "Doni Saputra", "Fitriani",
  "Gunawan Santoso", "Puspa Dewi", "Herman Yusuf", "Kartika Sari", "Wawan Gunawan", "Melati Putri",
  "Yayan Suryana", "Rahayu Ningsih", "Adi Nugroho", "Sinta Dewi", "Firman Syah", "Mira Kartika",
  "Bayu Aji", "Ika Wahyuni", "Andri Kurniawan", "Desy Ratnasari", "Teguh Prakoso", "Nita Ariyanti",
  "Rian Saputra", "Vina Anggraini", "Wahyu Nugraha", "Citra Ayu", "Dimas Prasetya", "Sri Rejeki",
  "Galih Pratama", "Retno Wulandari",
];

const ROOM_TYPE_TREND_SEED: Record<string, number> = { "SUP-K": 1, "SUP-T": 2, "DLX-K": 3, "DLX-T": 4, "EXE-S": 5, "FAM-S": 6 };

async function main() {
  console.log("Seeding HotelOne HMS…");

  // ── Corporations / Properties (Cabang & Lokasi) ─────────────────────────
  const propertyByCode = new Map<string, { id: string }>();
  let flagshipPropertyId = "";

  for (const [corpName, units] of CORPORATIONS) {
    const corp = await prisma.corporation.create({ data: { name: corpName } });
    for (const [code, name, city] of units) {
      if (code === "PST") continue; // head-office unit, not an operating hotel
      const property = await prisma.property.upsert({
        where: { code },
        update: {},
        create: { corporationId: corp.id, code, name, city, roomCount: code === "GNJ" ? 248 : 0 },
      });
      propertyByCode.set(code, property);
      if (code === "GNJ") flagshipPropertyId = property.id;
    }
  }
  const gnj = flagshipPropertyId;

  // ── Room types & rooms (flagship property only) ─────────────────────────
  const roomTypeByCode = new Map<string, { id: string; bar: number }>();
  for (const rt of ROOM_TYPES) {
    const created = await prisma.roomType.create({
      data: { propertyId: gnj, code: rt.code, name: rt.name, barRate: rt.bar, capacity: rt.code === "FAM-S" ? 4 : 2 },
    });
    roomTypeByCode.set(rt.code, { id: created.id, bar: rt.bar });
  }

  type SeedRoom = { number: string; roomTypeId: string; floor: number; status: RoomStatus };
  const rooms: SeedRoom[] = [];
  for (const block of FLOOR_PLAN) {
    const rt = roomTypeByCode.get(block.type)!;
    for (let i = 0; i < block.count; i++) {
      const seq = block.from + i;
      const number = String(block.floor).padStart(2, "0") + String(seq).padStart(2, "0");
      rooms.push({ number, roomTypeId: rt.id, floor: block.floor, status: "VC" });
    }
  }
  // A realistic initial mix of statuses across the house.
  for (const r of rooms) {
    const roll = rand();
    r.status = roll < 0.45 ? "OC" : roll < 0.62 ? "VC" : roll < 0.78 ? "VI" : roll < 0.92 ? "VD" : roll < 0.97 ? "OD" : "OOO";
  }
  await prisma.room.createMany({
    data: rooms.map((r) => ({ propertyId: gnj, roomTypeId: r.roomTypeId, number: r.number, floor: r.floor, status: r.status })),
  });
  const dbRooms = await prisma.room.findMany({ where: { propertyId: gnj }, include: { roomType: true } });
  const roomByNumber = new Map(dbRooms.map((r) => [r.number, r]));
  const roomsByType = (code: string) => dbRooms.filter((r) => r.roomType.code === code);

  // ── Rate plan & 45-day rate details ─────────────────────────────────────
  const ratePlan = await prisma.ratePlan.create({
    data: {
      propertyId: gnj,
      code: "BAR",
      name: "Best Available Rate",
      cancellationPolicy: "Gratis batal sampai H-2 pukul 18:00",
    },
  });
  const rateDetailRows: { ratePlanId: string; roomTypeId: string; date: Date; price: number }[] = [];
  for (const rt of ROOM_TYPES) {
    const meta = roomTypeByCode.get(rt.code)!;
    for (let i = 0; i < 45; i++) {
      const date = addDays(TODAY, i);
      const price = isWeekendJkt(date) ? Math.round(meta.bar * 1.15) : meta.bar;
      rateDetailRows.push({ ratePlanId: ratePlan.id, roomTypeId: meta.id, date, price });
    }
  }
  await prisma.rateDetail.createMany({ data: rateDetailRows });

  await prisma.channelConnection.createMany({
    data: ["Booking.com", "Agoda", "Traveloka", "Tiket.com"].map((name) => ({ propertyId: gnj, name, status: "connected" })),
  });

  // ── Staff / users ────────────────────────────────────────────────────────
  const rina = await prisma.employee.create({ data: { propertyId: gnj, name: "Rina Pratiwi", department: Department.FRONT_OFFICE, position: "Front Office Agent" } });
  const sari = await prisma.employee.create({ data: { propertyId: gnj, name: "Sari Handayani", department: Department.HOUSEKEEPING, position: "Room Attendant" } });
  const andi = await prisma.employee.create({ data: { propertyId: gnj, name: "Andi", department: Department.FNB, position: "Waiter" } });
  const dewi = await prisma.employee.create({ data: { propertyId: gnj, name: "Dewi", department: Department.FINANCE, position: "Finance Controller" } });
  const hendra = await prisma.employee.create({ data: { propertyId: gnj, name: "Pak Hendra", department: Department.GM, position: "General Manager" } });

  const passwordHash = await bcrypt.hash("rahasia123", 10);
  await prisma.user.create({
    data: {
      email: "rina.pratiwi@kantor.id",
      passwordHash,
      role: "FRONT_OFFICE",
      name: "Rina Pratiwi",
      employeeId: rina.id,
      homePropertyId: gnj,
      lastLogoutAt: addDays(TODAY, -1),
    },
  });
  await prisma.user.create({
    data: {
      email: "hendra.wijaya@kantor.id",
      passwordHash,
      role: "BACK_OFFICE",
      name: "Pak Hendra",
      employeeId: hendra.id,
      homePropertyId: gnj,
      lastLogoutAt: addDays(TODAY, -1),
    },
  });

  // ── Guests ───────────────────────────────────────────────────────────────
  const fillerGuests = await Promise.all(
    FILLER_GUEST_NAMES.map((name) => prisma.guest.create({ data: { name, marketingConsent: rand() > 0.4 } }))
  );

  // ── Background occupancy filler (advance reservations, no room locked) ──
  type Filler = { roomTypeId: string; ratePlanId: string; guestId: string; arrival: Date; departure: Date; source: string };
  const fillerReservations: Filler[] = [];
  const SOURCES = ["Direct web", "Booking.com", "Agoda", "Traveloka", "Tiket.com", "Corporate"];
  for (const rt of ROOM_TYPES) {
    const meta = roomTypeByCode.get(rt.code)!;
    const totalRooms = roomsByType(rt.code).length;
    const coverage = new Array(60).fill(0);
    const seed = ROOM_TYPE_TREND_SEED[rt.code];
    for (let day = 0; day < 45; day++) {
      const date = addDays(TODAY, day);
      const noise = Math.abs(Math.sin((seed * 37 + day) * 12.9898)) % 1;
      const occ = Math.min(1, 0.62 + (isWeekendJkt(date) ? 0.2 : 0) + noise * 0.26);
      const target = Math.min(totalRooms, Math.round(totalRooms * occ));
      let guard = 0;
      while (coverage[day] < target && guard < 200) {
        guard++;
        const length = 1 + Math.floor(rand() * 3);
        let ok = true;
        for (let k = 0; k < length; k++) if ((coverage[day + k] ?? 0) >= totalRooms) ok = false;
        if (!ok) break;
        for (let k = 0; k < length; k++) coverage[day + k] = (coverage[day + k] ?? 0) + 1;
        fillerReservations.push({
          roomTypeId: meta.id,
          ratePlanId: ratePlan.id,
          guestId: pick(fillerGuests).id,
          arrival: date,
          departure: addDays(date, length),
          source: pick(SOURCES),
        });
      }
    }
  }
  // Bulk-create: one Reservation + one ReservationRoom per filler booking.
  let code = 100000;
  for (const f of fillerReservations) {
    code++;
    const res = await prisma.reservation.create({
      data: {
        code: "HO" + code.toString(36).toUpperCase(),
        propertyId: gnj,
        guestId: f.guestId,
        source: f.source,
        arrival: f.arrival,
        departure: f.departure,
        status: f.arrival <= TODAY ? ReservationStatus.IN_HOUSE : ReservationStatus.CONFIRMED,
      },
    });
    await prisma.reservationRoom.create({
      data: { reservationId: res.id, roomTypeId: f.roomTypeId, ratePlanId: ratePlan.id },
    });
  }
  console.log(`Seeded ${fillerReservations.length} background reservations for availability.`);

  // ── Named "already in-house" guest — populates Folio View out of the box ─
  const ratih = await prisma.guest.create({
    data: { name: "Ratih Wulandari", idNumber: "3174 0xxx xxxx 0451", phone: "+62 813 1122 3344", preferences: "High floor, non-smoking, extra pillow", vipTier: "Gold", marketingConsent: true },
  });
  const ratihRoom = roomsByType("DLX-K")[0];
  await prisma.room.update({ where: { id: ratihRoom.id }, data: { status: "OC" } });
  const sinarMas = await prisma.corporateAccount.create({
    data: { name: "PT Sinar Mas Land", npwp: "01.234.567.8-901.000", creditLimit: 250_000_000, contractRef: "COR-0388" },
  });
  const ratihRes = await prisma.reservation.create({
    data: {
      code: "HO7K3M", propertyId: gnj, guestId: ratih.id, corporateAccountId: sinarMas.id,
      source: "Direct web", arrival: addDays(TODAY, -2), departure: addDays(TODAY, 1),
      status: ReservationStatus.IN_HOUSE, adults: 2, vipTag: "VIP tier Gold",
      specialRequest: "High floor, non-smoking, extra pillow",
    },
  });
  await prisma.reservationRoom.create({
    data: { reservationId: ratihRes.id, roomTypeId: ratihRoom.roomTypeId, ratePlanId: ratePlan.id, roomId: ratihRoom.id, checkInAt: addDays(TODAY, -2) },
  });
  const folioA = await prisma.folio.create({
    data: { reservationId: ratihRes.id, type: FolioType.A, ownerLabel: `${ratih.name} · Kamar ${ratihRoom.number} · ${fmtDate(addDays(TODAY, -2))}–${fmtDate(addDays(TODAY, 1))} 2026`, routingNote: "Room charge & pajak → Folio B (PT Sinar Mas Land). Incidental tetap di folio ini." },
  });
  const folioB = await prisma.folio.create({
    data: { reservationId: ratihRes.id, type: FolioType.B, ownerLabel: `${sinarMas.name} · Kontrak ${sinarMas.contractRef} · Credit limit ${rp(sinarMas.creditLimit)}`, routingNote: "Menerima room charge + pajak dari folio A. Ditagih via city ledger, termin 30 hari." },
  });
  await prisma.folioTransaction.createMany({
    data: [
      { folioId: folioA.id, date: addDays(TODAY, -2), code: "MINIBAR", description: "Minibar — 2 air mineral, 1 kacang", debit: 78000, credit: 0 },
      { folioId: folioA.id, date: addDays(TODAY, -2), code: "FB-RSV", description: "Room service — nasi goreng kampung, es teh", debit: 165000, credit: 0 },
      { folioId: folioA.id, date: addDays(TODAY, -1), code: "SPA", description: "Spa — Balinese massage 60 menit", debit: 385000, credit: 0 },
      { folioId: folioA.id, date: addDays(TODAY, -1), code: "LAUNDRY", description: "Laundry express — 4 pcs", debit: 132000, credit: 0 },
      { folioId: folioA.id, date: TODAY, code: "FB-RST", description: "Nusantara Restaurant — makan malam 2 pax", debit: 420000, credit: 0 },
      { folioId: folioA.id, date: TODAY, code: "PAY-QRIS", description: "Pembayaran QRIS", debit: 0, credit: 500000 },
    ],
  });
  const nightlyRate = roomTypeByCode.get("DLX-K")!.bar;
  const taxRow = Math.round(nightlyRate * 0.21);
  await prisma.folioTransaction.createMany({
    data: [-2, -1, 0].flatMap((offset) => [
      { folioId: folioB.id, date: addDays(TODAY, offset), code: "ROOM", description: `Room charge Deluxe King ${ratihRoom.number}`, debit: nightlyRate, credit: 0 },
      { folioId: folioB.id, date: addDays(TODAY, offset), code: "TAX", description: "PB1 10% + service 11%", debit: taxRow, credit: 0 },
    ]),
  });

  // ── Today's arrival list (pending check-in) ──────────────────────────────
  const dlxKRooms = roomsByType("DLX-K");
  const suggestRoom = dlxKRooms[1]; // left VD on purpose — becomes ready once HK is run
  const prepRoom = dlxKRooms[2];
  const discrepancyRoom = dlxKRooms[3];
  const hendraRoom = dlxKRooms[4];
  await prisma.room.updateMany({ where: { id: { in: [suggestRoom.id, prepRoom.id, discrepancyRoom.id] } }, data: { status: "VD" } });

  const dlxTRooms = roomsByType("DLX-T");
  const bayuRoom = dlxTRooms[0];
  const minibarRoom = dlxTRooms[1];

  const exeRooms = roomsByType("EXE-S");
  const michaelRoom = exeRooms[0];

  const supKRooms = roomsByType("SUP-K");
  const linenRoom = supKRooms[0];
  const earlyCiRoom = supKRooms[1];
  await prisma.room.update({ where: { id: earlyCiRoom.id }, data: { status: "OD" } });

  const supTRooms = roomsByType("SUP-T");
  const dueOutRoom = supTRooms[62];
  await prisma.room.update({ where: { id: dueOutRoom.id }, data: { status: "OD" } });
  const astraBlock = supTRooms.slice(0, 30);
  await prisma.room.updateMany({ where: { id: { in: astraBlock.map((r) => r.id) } }, data: { status: "OC" } });

  const dian = await prisma.guest.create({ data: { name: "Dian Anggraini", idNumber: "3174 0xxx xxxx 0004", phone: "+62 812 3456 7890", preferences: "High floor, non-smoking, extra pillow", vipTier: "Gold", marketingConsent: true } });
  const bayu = await prisma.guest.create({ data: { name: "Bayu Setiawan", phone: "+62 813 8899 1122" } });
  const michael = await prisma.guest.create({ data: { name: "Michael Tan", phone: "+62 811 2233 4455", vipTier: "Gold" } });
  const sriW = await prisma.guest.create({ data: { name: "Sri Wahyuni", phone: "+62 815 6677 8899" } });
  const hendraG = await prisma.guest.create({ data: { name: "Hendra Kusuma", phone: "+62 817 2233 5566" } });
  const astraCorp = await prisma.corporateAccount.create({ data: { name: "PT Astra Daihatsu", creditLimit: 400_000_000, contractRef: "GRP-2291" } });

  async function createArrival(opts: { code: string; guestId: string; source: string; roomTypeId: string; nights: number; room?: { id: string } | null; adults?: number; corporateAccountId?: string; groupCode?: string; groupName?: string }) {
    const res = await prisma.reservation.create({
      data: {
        code: opts.code, propertyId: gnj, guestId: opts.guestId, source: opts.source,
        arrival: TODAY, departure: addDays(TODAY, opts.nights), status: ReservationStatus.CONFIRMED,
        adults: opts.adults ?? 2, corporateAccountId: opts.corporateAccountId, groupCode: opts.groupCode, groupName: opts.groupName,
      },
    });
    await prisma.reservationRoom.create({
      data: { reservationId: res.id, roomTypeId: opts.roomTypeId, ratePlanId: ratePlan.id, roomId: opts.room?.id },
    });
    return res;
  }

  await createArrival({ code: "HO9F2P", guestId: dian.id, source: "Direct web", roomTypeId: roomTypeByCode.get("DLX-K")!.id, nights: 3 });
  await createArrival({ code: "TVL-88104", guestId: bayu.id, source: "Traveloka", roomTypeId: roomTypeByCode.get("DLX-T")!.id, nights: 1, room: bayuRoom, adults: 1 });
  await createArrival({ code: "BDC-46127", guestId: michael.id, source: "Booking.com", roomTypeId: roomTypeByCode.get("EXE-S")!.id, nights: 4, room: michaelRoom });
  await createArrival({ code: "AGD-71230", guestId: sriW.id, source: "Agoda", roomTypeId: roomTypeByCode.get("SUP-K")!.id, nights: 2 });
  await createArrival({ code: "COR-0451", guestId: hendraG.id, source: "Kontrak Pertamina", roomTypeId: roomTypeByCode.get("DLX-K")!.id, nights: 5, room: hendraRoom });

  const astraGuestPlaceholder = await prisma.guest.create({ data: { name: "PT Astra Daihatsu — rooming list" } });
  const astraRes = await prisma.reservation.create({
    data: {
      code: "GRP-2291", propertyId: gnj, guestId: astraGuestPlaceholder.id, corporateAccountId: astraCorp.id,
      source: "Corporate", arrival: TODAY, departure: addDays(TODAY, 2), status: ReservationStatus.CONFIRMED,
      adults: 60, groupCode: "GRP-2291", groupName: "PT Astra Daihatsu",
    },
  });
  await prisma.reservationRoom.createMany({
    data: astraBlock.map((r) => ({ reservationId: astraRes.id, roomTypeId: r.roomTypeId, ratePlanId: ratePlan.id, roomId: r.id })),
  });
  const folioC = await prisma.folio.create({
    data: { reservationId: astraRes.id, type: FolioType.C, ownerLabel: "Master folio grup — PT Astra Daihatsu · 30 kamar · GRP-2291", routingNote: "Room + breakfast + coffee break ke master folio. Minibar & laundry ke folio tamu masing-masing." },
  });
  await prisma.folioTransaction.createMany({
    data: [
      { folioId: folioC.id, date: TODAY, code: "ROOM", description: "Room charge 30 × Superior Twin", debit: 26_400_000, credit: 0 },
      { folioId: folioC.id, date: TODAY, code: "FB-BQT", description: "Coffee break 2× 60 pax", debit: 5_400_000, credit: 0 },
      { folioId: folioC.id, date: TODAY, code: "FB-BQT", description: "Meeting package fullday 60 pax", debit: 18_000_000, credit: 0 },
      { folioId: folioC.id, date: TODAY, code: "TAX", description: "PB1 10% + service 11%", debit: 10_458_000, credit: 0 },
      { folioId: folioC.id, date: TODAY, code: "PAY-TRF", description: "Deposit transfer bank 50%", debit: 0, credit: 30_129_000 },
    ],
  });

  // ── Housekeeping tasks ────────────────────────────────────────────────────
  await prisma.housekeepingTask.createMany({
    data: [
      { roomId: prepRoom.id, date: TODAY, assigneeId: sari.id, status: HkTaskStatus.VD, priority: "VIP arrival", note: "Extra pillow, non-smoking" },
      { roomId: discrepancyRoom.id, date: TODAY, assigneeId: sari.id, status: HkTaskStatus.VD, priority: "Discrepancy", note: "Sistem VD, laporan fisik OC — foto wajib" },
      { roomId: earlyCiRoom.id, date: TODAY, assigneeId: sari.id, status: HkTaskStatus.CLEANING, priority: "Early check-in", note: "Tamu tiba 11:30" },
      { roomId: dueOutRoom.id, date: TODAY, assigneeId: sari.id, status: HkTaskStatus.VD, priority: "Due-out", note: "Check-out 12:00" },
      { roomId: minibarRoom.id, date: TODAY, assigneeId: sari.id, status: HkTaskStatus.VC, priority: "Normal", note: "Minibar restock" },
      { roomId: michaelRoom.id, date: TODAY, assigneeId: sari.id, status: HkTaskStatus.VC, priority: "VIP arrival", note: "Fruit basket + welcome card" },
      { roomId: linenRoom.id, date: TODAY, assigneeId: sari.id, status: HkTaskStatus.VI, priority: "Normal", note: "Linen ganti penuh" },
    ],
  });

  // ── POS outlet & menu ─────────────────────────────────────────────────────
  const outlet = await prisma.pOSOutlet.create({ data: { propertyId: gnj, name: "Nusantara Restaurant" } });
  for (const [category, items] of Object.entries(MENU)) {
    await prisma.pOSMenuItem.createMany({ data: items.map(([name, price]) => ({ outletId: outlet.id, category, name, price })) });
  }

  // ── GM Dashboard fact tables (flagship + 3 sibling properties) ──────────
  const flagshipCodes = ["GNJ", "NRB", "NCB", "NES"];
  const jan1 = new Date(Date.UTC(TODAY.getUTCFullYear(), 0, 1));
  const daysThisYear = Math.round((TODAY.getTime() - jan1.getTime()) / 86400000) + 1;
  const PROPERTY_BASE: Record<string, { occ: number; adr: number }> = {
    GNJ: { occ: 0.78, adr: 1_180_000 },
    NRB: { occ: 0.86, adr: 2_050_000 },
    NCB: { occ: 0.7, adr: 690_000 },
    NES: { occ: 0.65, adr: 450_000 },
  };
  const metricRows: { propertyId: string; date: Date; roomsAvailable: number; roomsSold: number; roomRevenue: number; totalRevenue: number; directBookingPct: number }[] = [];
  const deptRows: { propertyId: string; date: Date; department: RevenueDepartment; revenue: number; revenueLastYear: number }[] = [];
  for (const propCode of flagshipCodes) {
    const property = propertyByCode.get(propCode)!;
    const base = PROPERTY_BASE[propCode];
    const roomsAvailable = propCode === "GNJ" ? 248 : 180;
    for (let day = 0; day < daysThisYear; day++) {
      const date = addDays(jan1, day);
      const seasonal = Math.sin((day / 365) * Math.PI * 2 - 1.2) * 0.08;
      const noise = (Math.abs(Math.sin((day + PROPERTY_BASE[propCode].adr) * 12.9898)) % 1 - 0.5) * 0.1;
      const weekend = isWeekendJkt(date) ? 0.08 : 0;
      const occ = Math.min(0.98, Math.max(0.35, base.occ + seasonal + noise + weekend));
      const roomsSold = Math.round(roomsAvailable * occ);
      const adr = Math.round(base.adr * (1 + (isWeekendJkt(date) ? 0.15 : 0)));
      const roomRevenue = roomsSold * adr;
      const fnb = Math.round(roomRevenue * 0.3);
      const banquet = Math.round(roomRevenue * (propCode === "GNJ" ? 0.23 : 0.12));
      const spa = Math.round(roomRevenue * 0.065);
      const laundry = Math.round(roomRevenue * 0.033);
      const totalRevenue = roomRevenue + fnb + banquet + spa + laundry;
      metricRows.push({ propertyId: property.id, date, roomsAvailable, roomsSold, roomRevenue, totalRevenue, directBookingPct: Number((22 + noise * 40).toFixed(2)) });
      const lyFactor = 0.88;
      deptRows.push(
        { propertyId: property.id, date, department: RevenueDepartment.ROOM, revenue: roomRevenue, revenueLastYear: Math.round(roomRevenue * lyFactor) },
        { propertyId: property.id, date, department: RevenueDepartment.FNB_RESTAURANT, revenue: fnb, revenueLastYear: Math.round(fnb * lyFactor) },
        { propertyId: property.id, date, department: RevenueDepartment.BANQUET_MICE, revenue: banquet, revenueLastYear: Math.round(banquet * 0.8) },
        { propertyId: property.id, date, department: RevenueDepartment.SPA_WELLNESS, revenue: spa, revenueLastYear: Math.round(spa * 1.03) },
        { propertyId: property.id, date, department: RevenueDepartment.LAUNDRY_OTHER, revenue: laundry, revenueLastYear: Math.round(laundry * 0.98) },
      );
    }
  }
  // createMany in chunks to stay comfortably under statement size limits.
  for (let i = 0; i < metricRows.length; i += 500) {
    await prisma.dailyPropertyMetric.createMany({ data: metricRows.slice(i, i + 500) });
  }
  for (let i = 0; i < deptRows.length; i += 500) {
    await prisma.departmentRevenueDay.createMany({ data: deptRows.slice(i, i + 500) });
  }

  // ── Minimal seed data for stub modules (schema + API only, no screen) ───
  await prisma.loyaltyProfile.create({ data: { guestId: ratih.id, tier: "Gold", points: 12400 } });
  await prisma.marketingCampaign.create({ data: { name: "Weekend Getaway — Jakarta", segment: "Leisure", channel: "Email", status: "scheduled", scheduledAt: addDays(TODAY, 3) } });

  const ballroom = await prisma.eventSpace.create({ data: { propertyId: gnj, name: "Nusantara Ballroom", capacity: 300 } });
  await prisma.eventBooking.create({
    data: { spaceId: ballroom.id, name: "PT Astra Daihatsu — Sales Kickoff", status: "definite", startsAt: TODAY, endsAt: addDays(TODAY, 1), pax: 60, corporateAccountId: astraCorp.id },
  });

  const linenItem = await prisma.inventoryItem.create({ data: { propertyId: gnj, name: "Bed sheet king", unit: "pcs", parLevel: 200, stockQty: 168 } });
  const po = await prisma.purchaseOrder.create({ data: { propertyId: gnj, vendorName: "CV Linen Nusantara", status: "approved", total: 4_800_000 } });
  await prisma.purchaseOrderItem.create({ data: { purchaseOrderId: po.id, itemId: linenItem.id, qty: 40, unitCost: 120000 } });

  await prisma.dutyShift.createMany({
    data: [
      { employeeId: rina.id, date: TODAY, shiftType: "MORNING" },
      { employeeId: sari.id, date: TODAY, shiftType: "MORNING" },
      { employeeId: andi.id, date: TODAY, shiftType: "AFTERNOON" },
    ],
  });

  const roomGl = await prisma.gLAccount.create({ data: { code: "4001", name: "Room Revenue", usaliCategory: "Rooms" } });
  const fnbGl = await prisma.gLAccount.create({ data: { code: "4002", name: "F&B Revenue", usaliCategory: "Food & Beverage" } });
  const journal = await prisma.journalEntry.create({ data: { propertyId: gnj, date: TODAY, description: "Night audit — room & F&B revenue" } });
  await prisma.journalLine.createMany({
    data: [
      { journalEntryId: journal.id, accountId: roomGl.id, debit: 0, credit: nightlyRate },
      { journalEntryId: journal.id, accountId: fnbGl.id, debit: 0, credit: 420000 },
    ],
  });

  console.log("Seed complete.");
  console.log("Login: rina.pratiwi@kantor.id / rahasia123 (Front Office)");
  console.log("Login: hendra.wijaya@kantor.id / rahasia123 (Back Office)");
}

function rp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}
function fmtDate(d: Date) {
  return `${d.getUTCDate()} Sep`;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
