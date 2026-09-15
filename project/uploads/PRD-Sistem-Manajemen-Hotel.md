# Product Requirements Document (PRD)
## Sistem Manajemen Hotel Terintegrasi — "HotelOne HMS"

| Item | Keterangan |
|---|---|
| Nama Produk | HotelOne — Hotel Management System (HMS) |
| Versi Dokumen | 1.0 |
| Tanggal | 12 September 2026 |
| Status | Draft untuk Review |
| Product Owner | *(diisi)* |
| Stakeholder | Direktur Operasional, GM Hotel, Head of IT, Finance Controller, Head of Sales & Marketing |
| Target Rilis MVP | Q2 setelah kick-off (bulan ke-6) |

---

## 0. Asumsi Dasar Dokumen

Dokumen ini disusun dengan asumsi berikut. Jika berbeda, sesuaikan bagian terkait.

1. Properti: hotel bintang 3–5, kapasitas 80–400 kamar per properti.
2. Arsitektur multi-property (satu sistem melayani beberapa hotel dalam satu grup).
3. Model deployment: cloud (SaaS) dengan mode offline-tolerant di Front Office.
4. Pasar utama: Indonesia (regulasi pajak PB1/PHR, e-Faktur, QRIS, UU PDP No. 27/2022).
5. Sistem menggantikan proses manual/Excel dan/atau PMS legacy yang sudah ada.

---

## 1. Ringkasan Eksekutif

HotelOne adalah sistem manajemen hotel terintegrasi yang menyatukan seluruh operasional properti — reservasi, front office, housekeeping, F&B, keuangan, procurement, SDM, dan pelaporan — dalam satu platform berbasis cloud.

Saat ini banyak operasional hotel berjalan terpisah: reservasi di OTA extranet, housekeeping di WhatsApp dan papan tulis, F&B di mesin kasir yang tidak tersambung, dan akuntansi di Excel. Akibatnya terjadi overbooking, kebocoran pendapatan (revenue leakage), tutup buku yang lambat, dan manajemen tidak punya angka real-time untuk mengambil keputusan harga.

HotelOne menargetkan penurunan waktu check-in menjadi di bawah 2 menit, eliminasi overbooking melalui sinkronisasi channel manager dua arah, dan penyajian dashboard okupansi/ADR/RevPAR secara real-time untuk seluruh properti.

---

## 2. Latar Belakang & Pernyataan Masalah

### 2.1 Kondisi Saat Ini
| Area | Masalah | Dampak |
|---|---|---|
| Reservasi | Update ketersediaan manual di tiap OTA | Overbooking 3–7 kasus/bulan, denda & kompensasi upgrade |
| Front Office | Check-in manual, input KTP berulang | Antrean saat peak arrival, rata-rata 8–12 menit/tamu |
| Housekeeping | Koordinasi via radio/WhatsApp | Status kamar tidak akurat, kamar siap terlambat dijual |
| F&B / POS | Kasir terpisah dari PMS | Posting ke folio manual, kebocoran pendapatan |
| Keuangan | Night audit & rekonsiliasi manual | Tutup buku bulanan 10–15 hari kerja |
| Manajemen | Laporan dikirim H+1 via Excel | Keputusan pricing terlambat, tidak ada view konsolidasi grup |
| Pengadaan | PO manual, stok tidak terpantau | Stok mati, pembelian darurat dengan harga premium |

### 2.2 Peluang
- Dynamic pricing berbasis data okupansi historis dan pace booking dapat menaikkan RevPAR 5–12%.
- Direct booking melalui booking engine sendiri menghemat komisi OTA 15–25% per transaksi.
- Data profil tamu terpusat memungkinkan program loyalty dan repeat guest campaign.

---

## 3. Tujuan Produk & Metrik Keberhasilan

### 3.1 Tujuan Bisnis
| No | Tujuan | Metrik (KPI) | Baseline | Target 12 Bulan |
|---|---|---|---|---|
| B1 | Eliminasi overbooking | Insiden overbooking/bulan | 3–7 | 0 |
| B2 | Tingkatkan direct booking | % revenue dari direct channel | 12% | 30% |
| B3 | Percepat tutup buku | Hari kerja sampai closing | 10–15 | ≤ 3 |
| B4 | Tingkatkan RevPAR | RevPAR (Rp) | — | +8% |
| B5 | Turunkan kebocoran pendapatan | Selisih audit vs sistem | ~2% | < 0,2% |

### 3.2 Tujuan Pengguna
| No | Tujuan | Metrik | Target |
|---|---|---|---|
| U1 | Check-in cepat | Rata-rata durasi check-in | < 2 menit |
| U2 | Status kamar akurat real-time | Selisih status fisik vs sistem | < 1% |
| U3 | Laporan mandiri tanpa IT | % laporan dibuat sendiri oleh user | > 80% |
| U4 | Kepuasan tamu | Skor GSS / review rating | ≥ 4,5 / 5 |

### 3.3 Metrik Produk (Product Health)
- Adoption: ≥ 95% transaksi kamar diproses dalam sistem (bukan manual) dalam 3 bulan pasca go-live.
- System uptime ≥ 99,9% per bulan.
- P95 waktu respon halaman operasional < 1,5 detik.
- Jumlah tiket support kategori "blocking" < 5 per properti per bulan setelah bulan ke-3.

---

## 4. Ruang Lingkup

### 4.1 In Scope (MVP + Fase Lanjutan)
1. Reservasi & Front Office (PMS Core)
2. Channel Manager & Booking Engine
3. Housekeeping & Maintenance
4. Point of Sale (F&B, Spa, Laundry, Minibar)
5. Billing, Folio, Night Audit
6. Guest Profile, CRM & Loyalty
7. MICE / Banquet & Event Management
8. Inventory & Procurement
9. HR, Duty Roster & Payroll dasar
10. Accounting (GL, AP, AR) & interface ke sistem akuntansi eksternal
11. Reporting & Business Intelligence
12. Mobile App Tamu & Self Check-in Kiosk
13. Administrasi Sistem & Multi-Property

### 4.2 Out of Scope (Rilis Awal)
- Modul manajemen aset tetap & depresiasi (pakai sistem akuntansi eksternal).
- Payroll kompleks dengan skema pajak progresif multi-klausul (fase 3).
- Timeshare, condotel ownership, dan revenue sharing unit pemilik.
- Sistem CCTV, akses parkir, dan building management system (hanya sediakan API hook).
- Modul kasino / gaming.

### 4.3 Ketergantungan Eksternal
| Dependensi | Pihak | Risiko jika gagal |
|---|---|---|
| Payment gateway (QRIS, kartu, e-wallet) | Vendor PG | Transaksi cashless tidak jalan |
| Integrasi OTA (Booking.com, Agoda, Traveloka, Tiket, Expedia) | Channel manager | Fitur sinkronisasi tertunda |
| Door lock system (Onity/Salto/Assa Abloy) | Vendor hardware | Key encoding tetap manual |
| e-Faktur / Coretax DJP | Pemerintah | Faktur pajak dibuat manual |
| KTP/Passport reader (OCR + NFC) | Vendor hardware | Input identitas manual |

---

## 5. Persona Pengguna

| Persona | Peran | Kebutuhan Utama | Pain Point |
|---|---|---|---|
| **Rina — Front Office Agent** | Check-in/out, walk-in, handle keluhan | Layar tunggal, shortcut keyboard, cepat | Sistem lambat saat antrean panjang |
| **Budi — Reservation Officer** | Kelola booking, group, allotment | Lihat availability lintas tanggal & tipe | Data OTA harus di-input ulang |
| **Sari — Housekeeping Supervisor** | Assign & inspeksi kamar | Aplikasi mobile, update status instan | Koordinasi manual, kamar VC terlambat diketahui |
| **Andi — F&B Cashier** | Transaksi restoran & room service | POS cepat, charge to room | Posting ke folio harus manual |
| **Dewi — Finance Controller** | Night audit, AR, laporan | Data akurat, jejak audit, rekonsiliasi | Tutup buku lama, banyak koreksi |
| **Pak Hendra — General Manager** | Pantau performa properti | Dashboard okupansi, ADR, RevPAR, GOP | Laporan terlambat dan tidak konsisten |
| **Ibu Maya — Corporate Revenue Manager** | Pricing lintas properti | Forecast, pace report, kompetitor | Tidak ada view konsolidasi grup |
| **Tomi — Tamu** | Booking, check-in, bayar, request | Mudah, cepat, transparan | Antre di lobby, tagihan tidak jelas |
| **Yusuf — IT Admin** | Kelola user, hak akses, konfigurasi | Kontrol granular, audit log | Sistem lama tidak punya role management |

---

## 6. User Journey Utama

### 6.1 Journey Tamu (Guest Lifecycle)
```
Inspirasi → Cari & Bandingkan → Booking (OTA/Direct) → Konfirmasi & Pre-payment
   → Pre-arrival (online check-in, upsell kamar) → Kedatangan (check-in / kiosk / mobile key)
   → Menginap (room service, spa, laundry, request) → Pre-departure (review folio)
   → Check-out & Pembayaran → Pasca-menginap (invoice, survei, loyalty point, campaign)
```

### 6.2 Journey Operasional Harian Hotel
```
06:00 Night Audit selesai → Laporan harian terbit
08:00 Morning briefing: arrival list, departure list, VIP, group
09:00 Housekeeping assignment otomatis berdasarkan status & prioritas
12:00 Check-out cut-off → status kamar jadi "Vacant Dirty"
14:00 Check-in cut-off → kamar siap (Vacant Clean/Inspected)
18:00 Shift handover kasir → drop cash & rekonsiliasi
23:00 Cut-off transaksi POS → posting ke folio
00:30 Night Audit: roll date, room charge posting, no-show handling
```

---

## 7. Arsitektur Sistem & Peta Modul

### 7.1 Peta Modul
```
┌──────────────────────────────────────────────────────────────────────┐
│                      KANAL (Channels)                                 │
│  Web Booking Engine │ Mobile App Tamu │ Kiosk │ OTA │ GDS │ Corporate │
└───────────────────────────────┬──────────────────────────────────────┘
                                │  API Gateway (REST/GraphQL) + Auth
┌───────────────────────────────┴──────────────────────────────────────┐
│                        CORE PMS                                       │
│  Reservasi │ Front Office │ Room Inventory │ Rate & Pricing │ Folio   │
└───┬──────────────┬─────────────┬────────────┬──────────────┬─────────┘
    │              │             │            │              │
┌───┴────┐  ┌──────┴─────┐  ┌────┴─────┐ ┌────┴──────┐ ┌────┴────────┐
│Housekeep│  │   POS      │  │  CRM &   │ │   MICE /  │ │ Maintenance │
│& Laundry│  │ F&B/Spa    │  │ Loyalty  │ │  Banquet  │ │ Engineering │
└────────┘  └────────────┘  └──────────┘ └───────────┘ └─────────────┘
    │              │             │            │              │
┌───┴──────────────┴─────────────┴────────────┴──────────────┴─────────┐
│           BACK OFFICE: Inventory │ Procurement │ HR │ Accounting      │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
┌───────────────────────────────┴──────────────────────────────────────┐
│        DATA & REPORTING: Data Warehouse │ BI Dashboard │ Forecasting  │
└──────────────────────────────────────────────────────────────────────┘

INTEGRASI: Payment Gateway │ Channel Manager │ Door Lock │ PABX │ WiFi
           Captive Portal │ e-Faktur/Coretax │ ID Scanner │ Accounting Ext.
```

### 7.2 Prinsip Arsitektur
1. **Multi-tenant, multi-property** — isolasi data per grup, hak akses lintas properti untuk corporate user.
2. **API-first** — setiap fungsi tersedia via API, UI adalah konsumen API.
3. **Offline-tolerant di Front Office & POS** — transaksi tetap berjalan saat internet putus, sinkronisasi otomatis saat pulih.
4. **Event-driven** — perubahan status (check-in, room status, payment) dipublikasikan sebagai event untuk modul lain.
5. **Audit trail menyeluruh** — semua perubahan data finansial dan tamu tercatat (siapa, kapan, nilai lama, nilai baru).
6. **Konfigurasi, bukan kustomisasi** — perbedaan antar properti diselesaikan lewat konfigurasi.

---

## 8. Kebutuhan Fungsional per Modul

Notasi prioritas: **P0** = wajib MVP, **P1** = rilis berikutnya, **P2** = nice to have.

---

### MODUL 1 — Reservasi (Reservation)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| RSV-01 | Buat reservasi individu dengan pilihan tipe kamar, rate plan, tanggal, jumlah tamu | P0 |
| RSV-02 | Cek ketersediaan real-time per tipe kamar dan tanggal (availability grid 30 hari) | P0 |
| RSV-03 | Reservasi grup (block) dengan alokasi jumlah kamar, cut-off date, rooming list | P0 |
| RSV-04 | Multi-room dan multi-rate dalam satu booking (stay dengan rate berbeda per malam) | P0 |
| RSV-05 | Modifikasi reservasi: ubah tanggal, tipe kamar, jumlah tamu, dengan pencatatan histori | P0 |
| RSV-06 | Pembatalan dengan perhitungan penalti sesuai kebijakan rate plan | P0 |
| RSV-07 | Waitlist dan tentative booking dengan tanggal kedaluwarsa otomatis | P1 |
| RSV-08 | Deposit & pre-payment: pencatatan, pengingat jatuh tempo, auto-release jika tidak dibayar | P0 |
| RSV-09 | Overbooking terkendali: batas maksimum per tipe kamar yang dapat dikonfigurasi | P1 |
| RSV-10 | Konfirmasi otomatis via email/WhatsApp dengan template yang dapat diatur | P0 |
| RSV-11 | Reservasi korporat dengan kontrak rate, credit limit, dan billing instruction | P0 |
| RSV-12 | Travel agent booking dengan perhitungan komisi otomatis | P1 |
| RSV-13 | Deteksi duplikasi reservasi (nama + tanggal + kontak sama) | P1 |
| RSV-14 | Manajemen no-show: penandaan otomatis pasca cut-off, charge sesuai kebijakan | P0 |

**User Story contoh (RSV-03)**
> Sebagai Reservation Officer, saya ingin membuat blok 30 kamar untuk rombongan konferensi dengan cut-off 14 hari sebelum arrival, agar kamar yang tidak terpakai otomatis kembali ke inventory untuk dijual.

*Acceptance Criteria:*
- Given blok 30 kamar dengan cut-off H-14, when tanggal cut-off tercapai dan hanya 18 kamar terisi rooming list, then 12 kamar sisanya otomatis dilepas ke inventory dan sistem mengirim notifikasi ke Reservation & Sales.
- Blok yang dilepas tercatat di log dengan timestamp dan tidak dapat dikembalikan tanpa persetujuan supervisor.

---

### MODUL 2 — Front Office

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FO-01 | Dashboard harian: arrival, in-house, departure, VIP, complimentary, out-of-order | P0 |
| FO-02 | Check-in dengan penugasan kamar (auto-assign berdasarkan preferensi + manual override) | P0 |
| FO-03 | Pemindaian KTP/paspor dengan OCR, auto-isi data tamu, penyimpanan sesuai UU PDP | P0 |
| FO-04 | Registration card digital dengan tanda tangan elektronik di tablet | P0 |
| FO-05 | Walk-in check-in tanpa reservasi sebelumnya | P0 |
| FO-06 | Room move (pindah kamar) dengan pemindahan folio dan pencatatan alasan | P0 |
| FO-07 | Extend stay / early departure dengan penyesuaian rate otomatis | P0 |
| FO-08 | Check-out: review folio, split bill, multi-payment, cetak/email invoice | P0 |
| FO-09 | Express check-out (tanpa ke meja resepsionis, tagihan dikirim email) | P1 |
| FO-10 | Manajemen kunci: encoding door lock langsung dari layar check-in | P1 |
| FO-11 | Wake-up call, message, dan guest request tracking dengan SLA | P1 |
| FO-12 | Shift handover: cash drop, rekonsiliasi kasir, catatan serah terima | P0 |
| FO-13 | Guest complaint log dengan kategori, eskalasi, dan resolusi | P1 |
| FO-14 | Lost & found register | P2 |
| FO-15 | Mode offline: check-in/out tetap jalan saat internet putus, sinkron otomatis | P1 |

---

### MODUL 3 — Room Inventory, Rate & Revenue Management

| ID | Kebutuhan | Prioritas |
|---|---|---|
| RM-01 | Master kamar: nomor, tipe, lantai, view, fasilitas, status, connecting room | P0 |
| RM-02 | Rate plan: BAR, corporate, government, promo, package (termasuk breakfast/dinner) | P0 |
| RM-03 | Rate berjenjang berdasarkan musim, hari dalam minggu, length of stay, lead time | P0 |
| RM-04 | Restriction: minimum stay, maximum stay, closed to arrival, closed to departure, stop sell | P0 |
| RM-05 | Package: gabungan kamar + F&B + layanan lain dengan alokasi pendapatan per komponen | P1 |
| RM-06 | Out of Order (OOO) dan Out of Service (OOS) dengan periode & alasan | P0 |
| RM-07 | Yield/dynamic pricing: rekomendasi tarif berbasis okupansi, pace, dan histori | P2 |
| RM-08 | Forecast okupansi 30/60/90 hari dengan pace report vs periode sama tahun lalu | P1 |
| RM-09 | Analisis kompetitor (rate shopping) — manual input atau integrasi pihak ketiga | P2 |
| RM-10 | Allotment per channel dengan alokasi kuota dan pembatasan | P1 |

---

### MODUL 4 — Channel Manager & Booking Engine

| ID | Kebutuhan | Prioritas |
|---|---|---|
| CM-01 | Sinkronisasi dua arah rate & availability ke OTA (Booking.com, Agoda, Traveloka, Tiket.com, Expedia) | P0 |
| CM-02 | Pull reservasi OTA otomatis ke PMS < 60 detik setelah booking dibuat | P0 |
| CM-03 | Push perubahan inventory ke seluruh channel < 30 detik setelah perubahan di PMS | P0 |
| CM-04 | Penanganan konflik & retry otomatis saat API OTA gagal, dengan alert ke admin | P0 |
| CM-05 | Booking engine web responsif dengan pemilihan kamar, add-on, dan pembayaran online | P0 |
| CM-06 | Kode promo, voucher, dan diskon member di booking engine | P1 |
| CM-07 | Multi-bahasa (ID/EN) dan multi-mata uang dengan kurs harian | P1 |
| CM-08 | Metasearch & Google Hotel Ads integration | P2 |
| CM-09 | Laporan produktivitas channel: revenue, jumlah booking, komisi, cancellation rate | P0 |

**Acceptance Criteria (CM-01)**
- Given satu kamar terakhir tipe Deluxe terjual di PMS, when transaksi tersimpan, then dalam ≤ 30 detik seluruh OTA menampilkan Deluxe sebagai sold out.
- Given dua booking masuk bersamaan untuk kamar terakhir, then hanya satu yang berhasil dan satu lagi ditolak dengan pesan jelas; tidak boleh terjadi overbooking.

---

### MODUL 5 — Housekeeping & Laundry

| ID | Kebutuhan | Prioritas |
|---|---|---|
| HK-01 | Status kamar real-time: VC, VD, OC, OD, OOO, OOS, Inspected | P0 |
| HK-02 | Penugasan kamar otomatis ke room attendant berdasarkan beban kerja & zona lantai | P0 |
| HK-03 | Aplikasi mobile room attendant: daftar tugas, update status, foto kondisi kamar | P0 |
| HK-04 | Checklist inspeksi supervisor dengan skor dan temuan | P1 |
| HK-05 | Prioritas kamar: due-out, VIP arrival, early check-in request | P0 |
| HK-06 | Pencatatan minibar consumption langsung ke folio tamu dari mobile app | P1 |
| HK-07 | Manajemen linen & amenities: stok par level, permintaan restock | P1 |
| HK-08 | Laundry tamu: order, tracking, charge ke folio | P1 |
| HK-09 | Discrepancy report (selisih status sistem vs fisik) | P0 |
| HK-10 | Deep cleaning schedule dan rotasi kamar | P2 |

---

### MODUL 6 — Point of Sale (F&B, Spa, Outlet)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| POS-01 | Multi-outlet: restoran, bar, room service, spa, gym, gift shop | P0 |
| POS-02 | Table management, split bill, merge bill, transfer table | P0 |
| POS-03 | Charge to room dengan validasi nomor kamar + nama tamu + credit limit | P0 |
| POS-04 | Kitchen Display System / cetak order ke dapur & bar | P1 |
| POS-05 | Menu engineering: kategori, modifier, set menu, happy hour pricing | P0 |
| POS-06 | Recipe & bill of material terhubung ke inventory (auto stock deduction) | P1 |
| POS-07 | Void, discount, dan complimentary dengan otorisasi berjenjang | P0 |
| POS-08 | Pembayaran: tunai, kartu, QRIS, e-wallet, voucher, city ledger | P0 |
| POS-09 | Service charge & pajak otomatis sesuai konfigurasi outlet | P0 |
| POS-10 | Mode offline dengan sinkronisasi otomatis | P1 |
| POS-11 | QR menu & self-order dari meja atau kamar | P2 |
| POS-12 | Laporan penjualan per outlet, per jam, per item, per waiter | P0 |

---

### MODUL 7 — Billing, Folio & Night Audit

| ID | Kebutuhan | Prioritas |
|---|---|---|
| BIL-01 | Guest folio multi-window (folio A tamu, folio B perusahaan, folio C grup) | P0 |
| BIL-02 | Routing instruction: otomatis arahkan jenis charge tertentu ke folio pembayar | P0 |
| BIL-03 | Posting manual charge, adjustment, rebate dengan alasan wajib & otorisasi | P0 |
| BIL-04 | Perhitungan pajak & service charge sesuai aturan daerah (PB1/PHR, PPN jika berlaku) | P0 |
| BIL-05 | Multi-currency dengan pencatatan kurs pada saat transaksi | P1 |
| BIL-06 | Night audit otomatis: room charge posting, date roll, no-show, trial balance | P0 |
| BIL-07 | Laporan night audit: daily revenue, manager flash report, in-house guest list | P0 |
| BIL-08 | City ledger / AR: transfer folio ke piutang perusahaan, aging report | P0 |
| BIL-09 | Invoice & faktur pajak sesuai format e-Faktur/Coretax | P1 |
| BIL-10 | Cashier closing: rekonsiliasi tunai, kartu, dan selisih (over/short) | P0 |
| BIL-11 | Kebijakan credit limit dengan alert saat tamu melampaui batas | P1 |

---

### MODUL 8 — Guest Profile, CRM & Loyalty

| ID | Kebutuhan | Prioritas |
|---|---|---|
| CRM-01 | Profil tamu terpusat: identitas, kontak, preferensi, alergi, riwayat menginap | P0 |
| CRM-02 | Deduplikasi profil otomatis (fuzzy match nama + kontak + identitas) | P1 |
| CRM-03 | Segmentasi tamu: leisure, corporate, repeat, VIP, blacklist | P0 |
| CRM-04 | Program loyalty: tier, poin, redemption, benefit otomatis saat check-in | P1 |
| CRM-05 | Kampanye email/WhatsApp berdasarkan segmen & trigger (pre-arrival, post-stay) | P1 |
| CRM-06 | Survei kepuasan pasca-menginap dan agregasi skor GSS | P1 |
| CRM-07 | Integrasi review platform untuk pemantauan reputasi | P2 |
| CRM-08 | Manajemen persetujuan (consent) pemasaran & hak subjek data sesuai UU PDP | P0 |
| CRM-09 | Blacklist dengan alasan, masa berlaku, dan peringatan saat reservasi dibuat | P0 |

---

### MODUL 9 — MICE, Banquet & Event

| ID | Kebutuhan | Prioritas |
|---|---|---|
| MICE-01 | Kalender ruang meeting/ballroom dengan status tentative, definite, cancelled | P1 |
| MICE-02 | Function sheet / BEO (Banquet Event Order) dengan detail setup, menu, AV, timeline | P1 |
| MICE-03 | Paket meeting: fullday, halfday, residential dengan harga per pax | P1 |
| MICE-04 | Manajemen peralatan & inventaris event (kursi, proyektor, sound system) | P2 |
| MICE-05 | Quotation & kontrak event dengan termin pembayaran | P1 |
| MICE-06 | Integrasi ke folio grup dan billing korporat | P1 |
| MICE-07 | Laporan pendapatan banquet per ruang, per jenis event, per sales person | P1 |

---

### MODUL 10 — Inventory & Procurement

| ID | Kebutuhan | Prioritas |
|---|---|---|
| INV-01 | Master item dengan kategori, satuan, konversi satuan (dus→pcs), par level | P1 |
| INV-02 | Purchase Request → Purchase Order → Receiving → Invoice matching (3-way match) | P1 |
| INV-03 | Multi-gudang: main store, kitchen store, bar store, housekeeping store | P1 |
| INV-04 | Stock transfer antar gudang dengan approval | P1 |
| INV-05 | Stock opname dengan pencatatan selisih dan penyesuaian berotorisasi | P1 |
| INV-06 | Valuasi persediaan (FIFO / average cost) | P1 |
| INV-07 | Vendor management: data vendor, daftar harga, evaluasi kinerja | P1 |
| INV-08 | Alert stok minimum dan item mendekati kedaluwarsa | P1 |
| INV-09 | Food cost & beverage cost report per outlet per periode | P1 |

---

### MODUL 11 — HR, Duty Roster & Payroll Dasar

| ID | Kebutuhan | Prioritas |
|---|---|---|
| HR-01 | Data karyawan: identitas, jabatan, departemen, kontrak, dokumen | P1 |
| HR-02 | Duty roster per departemen dengan pola shift (morning, afternoon, night, split) | P1 |
| HR-03 | Absensi terintegrasi (fingerprint/face recognition/mobile geofence) | P1 |
| HR-04 | Pengajuan cuti & lembur dengan alur persetujuan | P1 |
| HR-05 | Perhitungan komponen gaji dasar, tunjangan, dan distribusi service charge | P2 |
| HR-06 | Laporan produktivitas: man-hour per occupied room, labor cost ratio | P2 |

---

### MODUL 12 — Maintenance & Engineering

| ID | Kebutuhan | Prioritas |
|---|---|---|
| MTC-01 | Work order: pengajuan dari semua departemen, kategori, prioritas, SLA | P1 |
| MTC-02 | Preventive maintenance schedule per aset (AC, lift, genset, pompa) | P1 |
| MTC-03 | Aplikasi mobile teknisi: terima tugas, update progres, foto sebelum/sesudah | P1 |
| MTC-04 | Integrasi ke status kamar (kamar otomatis OOO saat work order kritikal aktif) | P1 |
| MTC-05 | Pencatatan konsumsi energi & air per periode | P2 |
| MTC-06 | Laporan downtime aset dan biaya perbaikan | P2 |

---

### MODUL 13 — Accounting & Finance

| ID | Kebutuhan | Prioritas |
|---|---|---|
| ACC-01 | Chart of Account sesuai USALI (Uniform System of Accounts for the Lodging Industry) | P1 |
| ACC-02 | Jurnal otomatis dari transaksi operasional (revenue, payment, AR, inventory) | P1 |
| ACC-03 | Account Payable: tagihan vendor, jadwal pembayaran, aging | P1 |
| ACC-04 | Account Receivable: piutang korporat & travel agent, penagihan, aging | P0 |
| ACC-05 | Budget vs actual per departemen | P2 |
| ACC-06 | Laporan keuangan: neraca, laba rugi, arus kas (atau ekspor ke sistem akuntansi eksternal) | P1 |
| ACC-07 | Ekspor jurnal ke sistem akuntansi eksternal (Accurate, SAP, Oracle) | P1 |
| ACC-08 | Rekonsiliasi pembayaran gateway vs settlement bank | P1 |

---

### MODUL 14 — Reporting & Business Intelligence

| ID | Kebutuhan | Prioritas |
|---|---|---|
| BI-01 | Dashboard GM: okupansi, ADR, RevPAR, TRevPAR, GOPPAR, revenue per departemen | P0 |
| BI-02 | Dashboard korporat: perbandingan antar properti, ranking, konsolidasi grup | P1 |
| BI-03 | Laporan standar: daily flash, monthly P&L, market segment, source of business | P0 |
| BI-04 | Report builder mandiri (drag & drop dimensi dan metrik) tanpa bantuan IT | P1 |
| BI-05 | Penjadwalan laporan otomatis via email (harian, mingguan, bulanan) | P1 |
| BI-06 | Ekspor ke Excel, CSV, PDF | P0 |
| BI-07 | Drill-down dari angka agregat ke transaksi detail | P1 |
| BI-08 | Forecast okupansi & revenue berbasis histori + booking pace | P2 |

**Definisi Metrik Kunci**
| Metrik | Rumus |
|---|---|
| Occupancy | Kamar terjual ÷ Kamar tersedia × 100% |
| ADR | Room revenue ÷ Kamar terjual |
| RevPAR | Room revenue ÷ Kamar tersedia (= ADR × Occupancy) |
| TRevPAR | Total revenue ÷ Kamar tersedia |
| GOPPAR | Gross Operating Profit ÷ Kamar tersedia |
| ALOS | Total room nights ÷ Jumlah reservasi |

---

### MODUL 15 — Aplikasi Tamu & Self-Service

| ID | Kebutuhan | Prioritas |
|---|---|---|
| APP-01 | Online check-in H-1 dengan unggah identitas & pilih waktu kedatangan | P1 |
| APP-02 | Digital key (BLE/NFC) untuk membuka kamar via ponsel | P2 |
| APP-03 | In-app room service order & spa booking | P2 |
| APP-04 | Lihat folio berjalan dan bayar dari aplikasi | P1 |
| APP-05 | Guest request & chat dengan front office | P1 |
| APP-06 | Kiosk self check-in/check-out di lobby dengan pembaca identitas & pencetak kunci | P2 |
| APP-07 | Upsell otomatis: upgrade kamar, late check-out, paket sarapan | P1 |

---

### MODUL 16 — Administrasi Sistem & Multi-Property

| ID | Kebutuhan | Prioritas |
|---|---|---|
| ADM-01 | Manajemen user, role, dan permission granular per modul & per aksi | P0 |
| ADM-02 | Single Sign-On (SSO) dan Multi-Factor Authentication untuk role sensitif | P1 |
| ADM-03 | Konfigurasi properti: identitas, mata uang, pajak, zona waktu, kebijakan | P0 |
| ADM-04 | Audit log seluruh aksi kritikal (siapa, kapan, nilai lama → nilai baru, IP) | P0 |
| ADM-05 | Template dokumen & notifikasi yang dapat diubah per properti | P1 |
| ADM-06 | Konfigurasi approval workflow berjenjang per jenis transaksi | P1 |
| ADM-07 | Data migration tool dari PMS lama (reservasi, profil tamu, master data) | P0 |
| ADM-08 | Backup otomatis harian dan uji restore berkala | P0 |

---

## 9. Kebutuhan Non-Fungsional

### 9.1 Kinerja
| Aspek | Target |
|---|---|
| Waktu muat halaman operasional (P95) | < 1,5 detik |
| Waktu respon API (P95) | < 500 ms |
| Proses check-in end-to-end | < 2 menit |
| Sinkronisasi channel manager | < 30 detik |
| Night audit untuk 400 kamar | < 10 menit |
| Generate laporan bulanan | < 30 detik |
| Concurrent user per properti | Minimal 50 tanpa degradasi |

### 9.2 Ketersediaan & Keandalan
- Uptime ≥ 99,9% per bulan (maksimum downtime ~43 menit/bulan).
- RPO (Recovery Point Objective) ≤ 15 menit; RTO (Recovery Time Objective) ≤ 2 jam.
- Backup otomatis harian, retensi 30 hari harian + 12 bulan bulanan.
- Mode degradasi: Front Office & POS tetap dapat melayani check-in/out dan transaksi saat koneksi pusat terputus.
- Maintenance window terjadwal pada jam operasional terendah (02:00–05:00 waktu setempat) dengan pemberitahuan H-3.

### 9.3 Keamanan
- Enkripsi data in-transit (TLS 1.3) dan at-rest (AES-256).
- Tidak menyimpan nomor kartu kredit penuh; gunakan tokenisasi dari payment gateway bersertifikat PCI-DSS.
- Role-Based Access Control dengan prinsip least privilege.
- MFA wajib untuk role Finance, IT Admin, dan Corporate.
- Password policy: minimal 12 karakter, rotasi 90 hari untuk role sensitif, deteksi credential stuffing.
- Rate limiting dan proteksi brute force pada endpoint autentikasi.
- Penetration test tahunan dan vulnerability scanning bulanan.
- Audit log immutable dengan retensi minimal 5 tahun untuk transaksi finansial.

### 9.4 Privasi & Kepatuhan
| Regulasi | Kebutuhan |
|---|---|
| UU No. 27/2022 (PDP) | Consent management, hak akses/koreksi/hapus data tamu, pencatatan aktivitas pemrosesan, notifikasi kebocoran ≤ 72 jam |
| Perda Pajak Hotel (PB1/PHR) | Perhitungan & pelaporan pajak daerah sesuai tarif kabupaten/kota |
| Ketentuan Perpajakan (e-Faktur/Coretax) | Format faktur pajak elektronik, NPWP/NIK pelanggan |
| Pelaporan tamu asing | Ekspor data tamu WNA sesuai format instansi terkait |
| PCI-DSS | Tidak menyimpan data kartu; pemrosesan lewat gateway tersertifikasi |

Retensi data: data tamu disimpan maksimal 5 tahun sejak menginap terakhir kecuali diwajibkan lebih lama oleh regulasi, lalu dianonimkan.

### 9.5 Skalabilitas
- Mendukung minimal 50 properti dan 10.000 kamar dalam satu tenant grup.
- Arsitektur horizontal scaling untuk komponen stateless.
- Database partitioning berbasis properti dan periode untuk tabel transaksi besar.

### 9.6 Usability & Aksesibilitas
- Front Office dapat dioperasikan penuh dengan keyboard (shortcut untuk aksi tersering).
- Pelatihan staf baru sampai mandiri check-in ≤ 2 jam.
- Dukungan Bahasa Indonesia dan Inggris pada seluruh antarmuka.
- Aplikasi mobile mendukung Android 10+ dan iOS 15+.
- Kepatuhan WCAG 2.1 level AA untuk booking engine (kanal tamu).
- Antarmuka operasional dapat dibaca pada layar 1366×768 (laptop front office lama).

### 9.7 Maintainability & Observability
- Logging terstruktur dengan correlation ID lintas modul.
- Monitoring: APM, uptime check, alert ke on-call saat error rate > 1% selama 5 menit.
- Dokumentasi API otomatis (OpenAPI) dan lingkungan sandbox untuk integrator.
- Feature flag untuk rilis bertahap per properti.

---

## 10. Model Data Utama (Ringkas)

### 10.1 Entitas Inti
| Entitas | Atribut Kunci | Relasi |
|---|---|---|
| `Property` | id, nama, alamat, timezone, currency, tax_config | 1:N Room, RatePlan, User |
| `RoomType` | id, property_id, kode, nama, kapasitas, fasilitas | 1:N Room |
| `Room` | id, room_type_id, nomor, lantai, status, housekeeping_status | 1:N RoomAssignment |
| `RatePlan` | id, property_id, kode, kebijakan_batal, inklusi | 1:N RateDetail |
| `RateDetail` | rate_plan_id, room_type_id, tanggal, harga, restriction | — |
| `Guest` | id, nama, identitas, kontak, preferensi, consent_flag | 1:N Reservation |
| `Company` | id, nama, npwp, credit_limit, kontrak_rate | 1:N Reservation |
| `Reservation` | id, kode, guest_id, property_id, arrival, departure, status, source | 1:N ReservationRoom |
| `ReservationRoom` | reservation_id, room_type_id, rate_plan_id, room_id, pax | 1:N RateNightly |
| `Folio` | id, reservation_id, tipe (A/B/C), status, saldo | 1:N FolioTransaction |
| `FolioTransaction` | folio_id, tanggal, kode_charge, deskripsi, debit, kredit, pajak, user_id | — |
| `Payment` | id, folio_id, metode, jumlah, referensi_gateway, status | — |
| `HousekeepingTask` | id, room_id, tanggal, assignee_id, status, waktu_mulai, waktu_selesai | — |
| `POSOrder` | id, outlet_id, meja, waiter_id, status, total | 1:N POSOrderItem |
| `WorkOrder` | id, lokasi, kategori, prioritas, status, assignee_id, SLA | — |
| `AuditLog` | id, user_id, entitas, entity_id, aksi, nilai_lama, nilai_baru, timestamp, ip | — |

### 10.2 Status Kamar (Room Status Codes)
| Kode | Arti | Transisi Berikutnya |
|---|---|---|
| VC | Vacant Clean | OC (check-in), VI (inspeksi) |
| VI | Vacant Inspected | OC |
| VD | Vacant Dirty | VC (setelah dibersihkan) |
| OC | Occupied Clean | OD, VD (check-out) |
| OD | Occupied Dirty | OC (setelah dibersihkan) |
| OOO | Out of Order | VD (setelah perbaikan selesai) |
| OOS | Out of Service | VD |

### 10.3 Status Reservasi
`Tentative → Confirmed → Guaranteed → In-House → Checked-Out`
Cabang: `Cancelled`, `No-Show`, `Waitlist`, `Expired`

---

## 11. Spesifikasi API (Contoh)

### 11.1 Cek Ketersediaan
```
GET /api/v1/properties/{propertyId}/availability
    ?arrival=2026-10-01&departure=2026-10-04&adults=2&children=0

200 OK
{
  "propertyId": "PRP-001",
  "currency": "IDR",
  "availability": [
    {
      "roomTypeCode": "DLX",
      "roomTypeName": "Deluxe King",
      "availableRooms": 7,
      "ratePlans": [
        { "code": "BAR", "name": "Best Available Rate",
          "totalAmount": 3300000, "averageNightly": 1100000,
          "inclusions": ["Breakfast 2 pax"],
          "cancellationPolicy": "Gratis batal sampai H-2 pukul 18:00" }
      ]
    }
  ]
}
```

### 11.2 Buat Reservasi
```
POST /api/v1/reservations
{
  "propertyId": "PRP-001",
  "source": "DIRECT_WEB",
  "guest": { "firstName": "Tomi", "lastName": "Wijaya",
             "email": "tomi@example.com", "phone": "+628123456789",
             "marketingConsent": true },
  "rooms": [
    { "roomTypeCode": "DLX", "ratePlanCode": "BAR",
      "arrival": "2026-10-01", "departure": "2026-10-04",
      "adults": 2, "children": 0, "specialRequest": "High floor, non-smoking" }
  ],
  "payment": { "type": "PREPAID", "gatewayToken": "tok_xxx" }
}

201 Created
{ "reservationId": "RSV-2026-0009142", "confirmationCode": "HO7K3M",
  "status": "CONFIRMED", "totalAmount": 3300000,
  "balanceDue": 0, "folioId": "FOL-0009142" }
```

### 11.3 Webhook Perubahan Status Kamar
```
POST {subscriber_url}
{
  "event": "room.status.changed",
  "propertyId": "PRP-001",
  "roomNumber": "0712",
  "previousStatus": "VD",
  "newStatus": "VC",
  "changedBy": "USR-HK-014",
  "timestamp": "2026-10-01T11:42:07+07:00"
}
```

### 11.4 Standar API
- Autentikasi: OAuth 2.0 client credentials untuk mesin, JWT untuk sesi pengguna.
- Idempotency key wajib pada semua operasi POST yang melibatkan uang.
- Versioning via path (`/api/v1/`), deprecation notice minimal 6 bulan.
- Rate limit default 600 request/menit per klien.
- Format error konsisten: `{ "error": { "code": "...", "message": "...", "details": [...] } }`

---

## 12. Kebutuhan Antarmuka (UI/UX)

### 12.1 Prinsip Desain
1. **Kecepatan di atas estetika** untuk layar operasional — front office bekerja di bawah tekanan antrean.
2. **Satu layar, satu tugas** — check-in tidak boleh butuh pindah lebih dari 2 layar.
3. **Informasi kritikal selalu terlihat** — saldo folio, status kamar, dan catatan VIP.
4. **Aksi destruktif butuh konfirmasi** — void, cancel, dan adjustment selalu meminta alasan.
5. **Warna status konsisten** lintas modul (hijau = siap, kuning = proses, merah = perlu tindakan).

### 12.2 Layar Prioritas
| Layar | Pengguna | Elemen Wajib |
|---|---|---|
| Front Desk Dashboard | FO Agent | Arrival/departure/in-house counter, pencarian cepat, aksi cepat |
| Availability Grid | Reservation | Kalender 30 hari × tipe kamar, warna kepadatan, edit inline |
| Check-in Wizard | FO Agent | Verifikasi identitas → pilih kamar → registrasi → kunci → selesai |
| Folio View | FO/Kasir | Daftar transaksi, saldo, tombol posting, split, pembayaran |
| Room Rack | FO/HK | Denah/grid kamar dengan status warna, filter lantai & tipe |
| HK Mobile Task List | Room Attendant | Daftar kamar, tombol status besar, kamera, offline-capable |
| POS Terminal | Kasir F&B | Grid menu, keranjang, modifier, tombol charge-to-room |
| GM Dashboard | GM/Corporate | KPI card, tren, perbandingan periode, drill-down |

---

## 13. Integrasi Sistem Eksternal

| Sistem | Arah | Data | Prioritas |
|---|---|---|---|
| Channel Manager / OTA | Dua arah | Rate, availability, reservasi | P0 |
| Payment Gateway | Dua arah | Otorisasi, capture, refund, settlement | P0 |
| QRIS | Masuk | Notifikasi pembayaran | P0 |
| Door Lock System | Keluar | Perintah encoding kunci, masa berlaku | P1 |
| ID Scanner (KTP/Paspor) | Masuk | Data identitas hasil OCR/NFC | P0 |
| WiFi Captive Portal | Keluar | Kredensial akses per kamar & masa berlaku | P1 |
| PABX / Telepon | Masuk | Call charge posting ke folio | P2 |
| Sistem Akuntansi Eksternal | Keluar | Jurnal harian, AP, AR | P1 |
| e-Faktur / Coretax | Keluar | Data faktur pajak | P1 |
| WhatsApp Business API | Keluar | Konfirmasi, pengingat, notifikasi | P1 |
| Mesin Absensi | Masuk | Data kehadiran karyawan | P1 |
| IPTV / Smart Room | Keluar | Nama tamu, tagihan, konten personal | P2 |

**Persyaratan umum integrasi:** setiap integrasi harus punya mekanisme retry dengan exponential backoff, dead letter queue, dashboard status koneksi, dan fallback manual agar operasional tidak berhenti saat pihak ketiga bermasalah.

---

## 14. Prioritisasi & Roadmap Rilis

### 14.1 Fase Rilis
| Fase | Periode | Cakupan | Kriteria Keluar |
|---|---|---|---|
| **Fase 0 — Discovery** | Bulan 1 | Riset proses, audit sistem lama, finalisasi spesifikasi, desain UX | Spesifikasi & prototipe disetujui stakeholder |
| **Fase 1 — MVP Core PMS** | Bulan 2–6 | Reservasi, Front Office, Room Inventory, Folio, Night Audit, Housekeeping dasar, Channel Manager, Booking Engine, Admin & Role | Pilot 1 properti berjalan 30 hari tanpa insiden P1 |
| **Fase 2 — Operasional Penuh** | Bulan 7–10 | POS, CRM & Loyalty, Maintenance, AR/City Ledger, Reporting lanjutan, Mobile HK | 3 properti live, tutup buku ≤ 3 hari kerja |
| **Fase 3 — Back Office & Growth** | Bulan 11–15 | Inventory & Procurement, HR & Roster, Accounting, MICE/Banquet, Aplikasi Tamu | Seluruh properti live, adoption ≥ 95% |
| **Fase 4 — Optimasi** | Bulan 16+ | Dynamic pricing, forecasting, kiosk, digital key, BI lanjutan | RevPAR +8%, direct booking 30% |

### 14.2 Prioritisasi Fitur (RICE) — Contoh Top 8
| Fitur | Reach | Impact | Confidence | Effort (pw) | RICE Score |
|---|---|---|---|---|---|
| Sinkronisasi channel manager dua arah | 1000 | 3 | 0,9 | 12 | 225 |
| Check-in wizard + OCR identitas | 900 | 3 | 0,9 | 10 | 243 |
| Folio & night audit otomatis | 800 | 3 | 0,95 | 14 | 163 |
| Booking engine direct | 1200 | 2 | 0,8 | 12 | 160 |
| HK mobile app | 600 | 2 | 0,9 | 8 | 135 |
| POS charge to room | 700 | 2 | 0,9 | 10 | 126 |
| GM dashboard real-time | 300 | 3 | 0,9 | 8 | 101 |
| Dynamic pricing engine | 400 | 3 | 0,5 | 20 | 30 |

*Reach = pengguna/transaksi terdampak per bulan; Impact skala 1–3; Effort dalam person-week.*

---

## 15. Rencana Implementasi & Rollout

### 15.1 Strategi Rollout
1. **Pilot** — 1 properti representatif (ukuran menengah, tim kooperatif), paralel run 2 minggu dengan sistem lama.
2. **Wave 1** — 3 properti dengan karakteristik berbeda (city hotel, resort, budget).
3. **Wave 2+** — sisa properti, 2–3 properti per bulan.
4. **Kriteria go/no-go per properti**: data migrasi terverifikasi, staf terlatih, integrasi payment & OTA aktif, UAT lulus.

### 15.2 Migrasi Data
| Data | Sumber | Volume Perkiraan | Validasi |
|---|---|---|---|
| Master kamar & tipe | PMS lama | ~400/properti | Rekonsiliasi jumlah kamar fisik |
| Rate plan & kontrak | Excel + PMS | ~50–200 | Uji kalkulasi sampel 20 booking |
| Profil tamu | PMS lama | 10.000–100.000 | Deduplikasi, cek consent |
| Reservasi future | PMS lama | 500–3.000 | Rekonsiliasi total nilai booking |
| Saldo AR | Akuntansi | ~200 akun | Cocokkan dengan neraca saldo |

**Aturan:** migrasi transaksi historis maksimal 3 tahun; data lebih lama diarsipkan read-only.

### 15.3 Pelatihan & Change Management
- Pelatihan berbasis peran (FO, HK, F&B, Finance, Manajemen), maksimal 3 jam per sesi.
- Super user per departemen per properti sebagai lini pertama bantuan.
- Materi: video pendek per tugas, quick reference card di meja kerja, sandbox untuk latihan.
- Hypercare 2 minggu pasca go-live: tim pendamping on-site + kanal support khusus.

---

## 16. Kebutuhan Tim & Estimasi

| Peran | Jumlah | Fase Keterlibatan |
|---|---|---|
| Product Manager | 1 | Seluruh fase |
| Business Analyst (domain hotel) | 2 | Fase 0–3 |
| UX Designer | 2 | Fase 0–2 |
| Backend Engineer | 5 | Seluruh fase |
| Frontend Engineer | 4 | Seluruh fase |
| Mobile Engineer | 2 | Fase 2–4 |
| QA Engineer | 3 | Fase 1–4 |
| DevOps / SRE | 2 | Seluruh fase |
| Data Engineer / BI | 2 | Fase 2–4 |
| Integration Engineer | 2 | Fase 1–3 |
| Implementation & Training | 3 | Fase 1–4 |
| **Total** | **28** | |

*Estimasi durasi MVP: 5 bulan pengembangan setelah discovery. Angka ini indikatif dan perlu divalidasi ulang saat perencanaan sprint.*

---

## 17. Risiko & Mitigasi

| No | Risiko | Kemungkinan | Dampak | Mitigasi |
|---|---|---|---|---|
| R1 | Integrasi OTA tertunda karena proses sertifikasi channel | Tinggi | Tinggi | Mulai proses sertifikasi di Fase 0; siapkan fallback manual update |
| R2 | Resistensi staf terhadap sistem baru | Tinggi | Sedang | Libatkan super user sejak desain, pelatihan bertahap, hypercare |
| R3 | Kualitas data lama buruk (duplikat, kosong) | Tinggi | Sedang | Audit data di Fase 0, tools pembersihan, cut-off data historis |
| R4 | Downtime saat peak season | Sedang | Sangat Tinggi | Freeze deployment saat high season; mode offline front office |
| R5 | Kebocoran data tamu | Rendah | Sangat Tinggi | Enkripsi, RBAC, pentest, incident response plan, asuransi siber |
| R6 | Scope creep permintaan kustomisasi per properti | Tinggi | Tinggi | Kebijakan "konfigurasi bukan kustomisasi", change control board |
| R7 | Ketergantungan vendor door lock/hardware lama | Sedang | Sedang | Verifikasi kompatibilitas di Fase 0; anggaran penggantian hardware |
| R8 | Payment gateway gagal saat check-out massal | Rendah | Tinggi | Multi-gateway failover, mode pembayaran offline dengan rekonsiliasi |
| R9 | Perubahan regulasi pajak daerah | Sedang | Sedang | Konfigurasi pajak fleksibel tanpa deployment ulang |

---

## 18. Acceptance Criteria & Rencana Pengujian

### 18.1 Definition of Done (per fitur)
- Kode direview minimal 1 reviewer dan lolos automated test.
- Unit test coverage ≥ 80% untuk logika bisnis finansial.
- Terdokumentasi di API docs dan user guide.
- Lolos UAT oleh perwakilan pengguna terkait.
- Tidak ada bug severity 1–2 yang terbuka.

### 18.2 Skenario UAT Kritikal
| ID | Skenario | Kriteria Lulus |
|---|---|---|
| UAT-01 | Booking OTA masuk → check-in → charge POS → check-out → invoice | Seluruh transaksi terekam, saldo folio nol, invoice benar |
| UAT-02 | Kamar terakhir terjual di PMS | Seluruh OTA sold out ≤ 30 detik |
| UAT-03 | Night audit 400 kamar | Selesai < 10 menit, trial balance seimbang |
| UAT-04 | Internet putus 30 menit saat check-in | Check-in tetap berjalan, sinkron penuh saat pulih, tanpa duplikasi |
| UAT-05 | Group booking 30 kamar + rooming list + master folio | Routing charge benar, invoice grup satu lembar |
| UAT-06 | Pembatalan H-1 pada rate non-refundable | Penalti terhitung benar sesuai kebijakan |
| UAT-07 | Permintaan penghapusan data oleh tamu (UU PDP) | Data personal teranonimkan, data transaksi finansial tetap utuh |
| UAT-08 | 50 pengguna bersamaan pada jam sibuk | Respon P95 < 1,5 detik |
| UAT-09 | Kasir shift closing dengan selisih tunai | Selisih tercatat, laporan over/short terbit, butuh otorisasi supervisor |
| UAT-10 | Room move tamu in-house | Folio ikut pindah, status kamar lama jadi VD, kunci lama nonaktif |

### 18.3 Jenis Pengujian
Unit test · Integration test · End-to-end test · Load & stress test (target 2× beban puncak) · Security test (OWASP Top 10) · Disaster recovery drill (2× per tahun) · Usability test dengan staf sebenarnya sebelum go-live.

---

## 19. Pertanyaan Terbuka

| No | Pertanyaan | Pemilik Keputusan | Batas Waktu |
|---|---|---|---|
| Q1 | Berapa jumlah dan tipe properti yang akan onboard dalam 12 bulan pertama? | Direktur Operasional | Sebelum Fase 0 selesai |
| Q2 | Apakah sistem akuntansi eksternal dipertahankan atau digantikan? | Finance Controller | Sebelum Fase 2 |
| Q3 | Vendor channel manager: bangun sendiri atau pakai pihak ketiga? | Head of IT + PM | Minggu 3 Fase 0 |
| Q4 | Apakah program loyalty baru atau melanjutkan program eksisting? | Head of Sales & Marketing | Sebelum Fase 2 |
| Q5 | Kompatibilitas door lock eksisting — perlu penggantian hardware? | Head of Engineering | Minggu 4 Fase 0 |
| Q6 | Kebijakan penyimpanan data: cloud region Indonesia atau regional? | Legal + IT | Sebelum Fase 1 |
| Q7 | Apakah service charge didistribusikan lewat sistem ini? | HR + Finance | Sebelum Fase 3 |

---

## 20. Glosarium

| Istilah | Arti |
|---|---|
| **ADR** | Average Daily Rate — tarif rata-rata kamar terjual |
| **ALOS** | Average Length of Stay |
| **BAR** | Best Available Rate |
| **BEO** | Banquet Event Order — lembar instruksi pelaksanaan event |
| **City Ledger** | Piutang yang ditagihkan ke perusahaan/agen, bukan ke tamu langsung |
| **Folio** | Rekening tagihan tamu selama menginap |
| **GOPPAR** | Gross Operating Profit per Available Room |
| **House Use** | Kamar dipakai untuk keperluan internal hotel |
| **MICE** | Meetings, Incentives, Conferences, Exhibitions |
| **Night Audit** | Proses penutupan hari operasional & posting room charge |
| **No-Show** | Tamu dengan reservasi terjamin yang tidak datang |
| **OOO / OOS** | Out of Order / Out of Service |
| **OTA** | Online Travel Agent |
| **PB1 / PHR** | Pajak Hotel & Restoran (pajak daerah) |
| **PMS** | Property Management System |
| **RevPAR** | Revenue per Available Room |
| **Rooming List** | Daftar nama tamu dalam reservasi grup |
| **Routing** | Aturan pengalihan jenis charge ke folio tertentu |
| **USALI** | Uniform System of Accounts for the Lodging Industry |
| **Walk-in** | Tamu datang tanpa reservasi sebelumnya |
| **Yield Management** | Pengelolaan tarif untuk memaksimalkan pendapatan |

---

## 21. Riwayat Revisi

| Versi | Tanggal | Perubahan | Penulis |
|---|---|---|---|
| 1.0 | 12 Sep 2026 | Draft awal lengkap | *(diisi)* |

---

## 22. Persetujuan

| Peran | Nama | Tanda Tangan | Tanggal |
|---|---|---|---|
| Product Owner | | | |
| Direktur Operasional | | | |
| Head of IT | | | |
| Finance Controller | | | |
| General Manager (perwakilan properti) | | | |
