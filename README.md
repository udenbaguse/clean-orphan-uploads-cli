# clean-orphan-uploads-cli

CLI untuk menghapus file upload yatim (orphan files) di folder lokal berdasarkan data referensi path gambar di PostgreSQL.

Tool ini aman dipakai bertahap karena mendukung mode `--dry-run` untuk simulasi sebelum file benar-benar dihapus.

## Cara Kerja Singkat

1. CLI membaca semua nilai path image dari tabel PostgreSQL.
2. CLI membaca semua file di folder upload lokal.
3. File yang tidak direferensikan lagi oleh database dianggap orphan.
4. File orphan akan:
   - hanya dilaporkan jika pakai `--dry-run`
   - benar-benar dihapus jika tanpa `--dry-run`

## Prasyarat

- Node.js `>=20`
- PostgreSQL yang bisa diakses
- Struktur data yang berisi path image (default: tabel `projects`, kolom `image`)

## Instalasi

### Opsi 1: Install sebagai package

```bash
npm install clean-orphan-uploads-cli 
```
(belum diupload ke npm jadi belum bisa, kasih bintang repo ini yang banyak supaya bisa hadir di npm ya!)


### Opsi 2: Jalankan dari source repo ini

```bash
npm install github:udenbaguse/clean-orphan-uploads-cli
```

## Step-by-Step Penggunaan (Direkomendasikan)

### Step 1 - Pastikan folder upload yang mau dibersihkan

Contoh default folder:

```bash
public/uploads
```

Jika folder Anda berbeda, nanti gunakan `--uploads-dir <path>`.

### Step 2 - Siapkan koneksi database

Pilih salah satu cara berikut.

#### Cara A (paling simpel): pakai `--db-url`

```bash
clean-orphan-uploads --db-url "postgres://user:pass@localhost:5432/dbname" --dry-run
```

#### Cara B: pakai environment variable

Jika `--db-url` tidak diberikan, CLI akan membaca env berikut:

- `DB_HOST`
- `DB_PORT` (default `5432`)
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

`dotenv` otomatis di-load, jadi Anda bisa pakai file `.env`.

Contoh `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mydb
DB_USER=postgres
DB_PASSWORD=secret
```

### Step 3 - Jalankan simulasi dulu (`--dry-run`)

Ini langkah wajib sebelum hapus sungguhan:

```bash
clean-orphan-uploads --dry-run
```

Contoh output:

```text
Dry-run complete. 12 file(s) would be removed from 130 file(s).
```

### Step 4 - Review hasil simulasi

Jika jumlah file yang akan dihapus masuk akal, lanjut ke step 5.

Jika tidak sesuai, periksa:

- `--uploads-dir`
- `--table`
- `--column`
- `--path-prefix`
- konfigurasi koneksi DB

### Step 5 - Eksekusi penghapusan file orphan

Jalankan tanpa `--dry-run`:

```bash
clean-orphan-uploads
```

Contoh output:

```text
Removed 12 orphaned file(s) from 130 file(s).
```

### Step 6 - Verifikasi pasca eksekusi

- Cek isi folder upload sudah sesuai.
- Jalankan lagi `--dry-run` untuk memastikan orphan sudah bersih.

## Options

- `--dry-run` lihat file yang akan dihapus tanpa menghapus
- `--uploads-dir <path>` folder upload (default: `public/uploads`)
- `--db-url <url>` PostgreSQL connection string (`DATABASE_URL` jika tidak diisi)
- `--table <name>` nama tabel (default: `projects`)
- `--column <name>` nama kolom path image (default: `image`)
- `--path-prefix <prefix>` prefix path di DB (default: `/uploads/`)
## Contoh Command Umum

### Default (tabel `projects`, kolom `image`, folder `public/uploads`)

```bash
clean-orphan-uploads --dry-run
```

### Folder upload custom

```bash
clean-orphan-uploads --uploads-dir storage/uploads --dry-run
```

### Tabel dan kolom custom

```bash
clean-orphan-uploads --table products --column thumbnail --dry-run
```

### Prefix path custom

```bash
clean-orphan-uploads --path-prefix /media/ --dry-run
```

### Sekaligus dengan DB URL

```bash
clean-orphan-uploads \
  --db-url "postgres://user:pass@localhost:5432/dbname" \
  --uploads-dir public/uploads \
  --table projects \
  --column image \
  --path-prefix /uploads/ \
  --dry-run
```

## Catatan Penting

- CLI hanya memproses file level pertama di dalam folder upload (bukan recursive ke subfolder).
- Nilai `--table` dan `--column` wajib identifier SQL yang valid.
- Jika folder upload tidak ditemukan, proses akan dilewati dengan pesan:

```text
No uploads directory found at: <path>
```

## Development

```bash
npm test
```

## rekomendasi script keyword(package.json)
```bash
"clean:uploads": "node node_modules/clean-orphan-uploads-cli/bin/clean-orphan-uploads.js",
"clean:uploads:dry": "node node_modules/clean-orphan-uploads-cli/bin/clean-orphan-uploads.js --dry-run"
```


