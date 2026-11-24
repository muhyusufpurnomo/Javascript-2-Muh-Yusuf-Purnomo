
// =============================================================
// LAB 2 - app.js
// DOM + EVENT + ASYNC/AWAIT
// =============================================================

// ---------- Memilih elemen ----------
const tbody = document.querySelector('#tabel-body');
const form = document.querySelector('#form-mahasiswa');
const inputCari = document.querySelector('#cari');
const pesan = document.querySelector('#pesan');

let semuaData = [];

// =============================================================
// LANGKAH 3a: Mengambil data dari API
// =============================================================

async function muatData() {
  try {
    const daftar = await ambilMahasiswa();

    semuaData = buatRekap(daftar);

    tampilkan();
  } catch (err) {
    tampilkanPesan(`Gagal memuat data: ${err.message}`, 'error');
  }
}

// =============================================================
// Menampilkan data dan statistik
// =============================================================

function tampilkan() {
  const hasilCari = cariMahasiswa(semuaData, inputCari.value);

  renderTabel(hasilCari);
  renderStatistik(semuaData);
}

// =============================================================
// LANGKAH 3b: Menampilkan data ke tabel
// =============================================================

function renderTabel(data) {
  tbody.replaceChildren();

  if (data.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');

    td.textContent = 'Tidak ada data';
    td.colSpan = 8;

    tr.append(td);
    tbody.append(tr);

    return;
  }

  for (const m of data) {
    const tr = document.createElement('tr');

    tr.classList.add(m.lulus ? 'lulus' : 'tidak-lulus');

    const nilaiMahasiswa = [
      m.nim,
      m.nama,
      m.tugas,
      m.uts,
      m.uas,
      m.nilaiAkhir,
      m.grade
    ];

    for (const nilai of nilaiMahasiswa) {
      const td = document.createElement('td');

      td.textContent = nilai;
      tr.append(td);
    }

    // Tombol hapus
    const tdHapus = document.createElement('td');
    const tombol = document.createElement('button');

    tombol.textContent = 'Hapus';
    tombol.classList.add('btn-hapus');
    tombol.dataset.nim = m.nim;

    tdHapus.append(tombol);
    tr.append(tdHapus);

    tbody.append(tr);
  }
}

// =============================================================
// LANGKAH 4: Statistik mahasiswa
// =============================================================

function renderStatistik(data) {
  // Jumlah mahasiswa
  document.querySelector('#stat-jumlah').textContent = data.length;

  // Jumlah mahasiswa lulus
  const jumlahLulus = data.filter(m => m.lulus).length;

  document.querySelector('#stat-lulus').textContent =
    `${jumlahLulus}/${data.length}`;

  // Rata-rata nilai
  document.querySelector('#stat-rata').textContent =
    hitungRataRata(data);

  // Nilai tertinggi
  const tertinggi = cariTertinggi(data);

  document.querySelector('#stat-tertinggi').textContent =
    tertinggi
      ? `${tertinggi.nama} (${tertinggi.nilaiAkhir})`
      : '-';

  // Distribusi grade
  const distribusi = hitungDistribusiGrade(data);

  document.querySelector('#stat-distribusi').textContent =
    Object.entries(distribusi)
      .map(([grade, jumlah]) => `${grade}: ${jumlah}`)
      .join(' · ');
}

// =============================================================
// Menampilkan pesan
// =============================================================

function tampilkanPesan(teks, jenis) {
  pesan.textContent = teks;
  pesan.className = jenis;
}

// =============================================================
// LANGKAH 5: Pencarian mahasiswa
// =============================================================

inputCari.addEventListener('input', () => {
  tampilkan();
});

// =============================================================
// LANGKAH 6: Tambah mahasiswa
// =============================================================

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const f = new FormData(form);

  const baru = {
    nim: f.get('nim').trim(),
    nama: f.get('nama').trim(),
    tugas: f.get('tugas') === '' ? NaN : Number(f.get('tugas')),
    uts: f.get('uts') === '' ? NaN : Number(f.get('uts')),
    uas: f.get('uas') === '' ? NaN : Number(f.get('uas'))
  };

  // Validasi mahasiswa
  const errors = validasiMahasiswa(baru);

  if (errors.length > 0) {
    tampilkanPesan(errors.join(', '), 'error');
    return;
  }

  try {
    // Menyimpan mahasiswa melalui API
    const hasil = await tambahMahasiswa(baru);

    // Membuat rekap nilai mahasiswa baru
    const [r] = buatRekap([hasil]);

    tampilkanPesan(
      `${r.nama} tersimpan: nilai ${r.nilaiAkhir} (${r.grade})`,
      'sukses'
    );

    // Mengosongkan form
    form.reset();

    // Memuat ulang data
    await muatData();

  } catch (err) {
    tampilkanPesan(`Gagal menyimpan: ${err.message}`, 'error');
  }
});

// =============================================================
// LANGKAH 7: Hapus mahasiswa (BONUS)
// Event Delegation
// =============================================================

tbody.addEventListener('click', async (event) => {
  const tombol = event.target.closest('.btn-hapus');

  if (!tombol) return;

  const nim = tombol.dataset.nim;

  if (!confirm(`Yakin ingin menghapus mahasiswa dengan NIM ${nim}?`)) {
    return;
  }

  try {
    const teks = await hapusMahasiswa(nim);

    tampilkanPesan(teks, 'sukses');

    await muatData();

  } catch (err) {
    tampilkanPesan(`Gagal menghapus: ${err.message}`, 'error');
  }
});

// =============================================================
// MULAI PROGRAM
// =============================================================

muatData();
