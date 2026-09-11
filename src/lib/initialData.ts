import { LogEntry, UserProfile } from '@/types/logbook';

export const DEFAULT_PROFILES: Record<string, UserProfile> = {
  magang: {
    id: 'user-demo',
    email: 'naufalfaster@gmail.com',
    fullName: 'Naufal Irfansyah Saputra',
    nim: '2313451001',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    programType: 'magang',
    programTitle: 'Magang Klinik & Laboratorium RSGM UMY',
    institution: 'Poltekkes Tanjungkarang - D3 Teknik Gigi',
    partnerName: 'RSGM UMY (Rumah Sakit Gigi dan Mulut Universitas Muhammadiyah Yogyakarta)',
    supervisorName: 'drg. Pembimbing Klinik RSGM UMY',
    supervisorContact: 'lab.rsgm@umy.ac.id',
    startDate: '2026-08-01',
    endDate: '2026-12-31',
    targetHours: 500,
    role: 'admin',
    tier: 'pro'
  },
  kkn: {
    id: 'user-demo',
    email: 'naufal.dev@gmail.com',
    fullName: 'Naufal Rizky Pratama',
    nim: '21051204050',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    programType: 'kkn',
    programTitle: 'KKN Tematik Pemberdayaan Digital Desa',
    institution: 'Universitas Negeri Indonesia',
    partnerName: 'Desa Sukamaju, Kec. Cisarua',
    supervisorName: 'Dr. Ir. Hendra Setiawan, M.T.',
    supervisorContact: 'hendra.dpl@kampus.ac.id',
    startDate: '2026-07-01',
    endDate: '2026-08-31',
    targetHours: 240,
    tier: 'free'
  },
  pkl: {
    id: 'user-demo',
    email: 'naufal.dev@gmail.com',
    fullName: 'Naufal Rizky Pratama',
    nim: '21051204050',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    programType: 'pkl',
    programTitle: 'Praktik Kerja Lapangan - Jaringan & Server',
    institution: 'SMK Negeri 1 Surabaya',
    partnerName: 'Dinas Komunikasi & Informatika',
    supervisorName: 'Agus Wijaya, A.Md',
    supervisorContact: 'agus.diskominfo@daerah.go.id',
    startDate: '2026-06-01',
    endDate: '2026-09-30',
    targetHours: 400,
    tier: 'free'
  },
  skripsi: {
    id: 'user-demo',
    email: 'naufal.dev@gmail.com',
    fullName: 'Naufal Rizky Pratama',
    nim: '21051204050',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    programType: 'skripsi',
    programTitle: 'Tugas Akhir: Implementasi RAG pada Sistem Rekomendasi',
    institution: 'Universitas Negeri Indonesia',
    partnerName: 'Lab Kecerdasan Buatan & Data',
    supervisorName: 'Prof. Dr. Maya Anggraini, S.T., M.Sc.',
    supervisorContact: 'maya.prof@kampus.ac.id',
    startDate: '2026-02-01',
    endDate: '2026-07-31',
    targetHours: 300,
    tier: 'free'
  },
  mandiri: {
    id: 'user-demo',
    email: 'naufal.dev@gmail.com',
    fullName: 'Naufal Rizky Pratama',
    nim: '21051204050',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    programType: 'mandiri',
    programTitle: 'Proyek Portofolio SaaS Next.js & AI Agent',
    institution: 'Independent Learner',
    partnerName: 'Open Source Community',
    supervisorName: 'Tech Lead / Peer Reviewer',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    targetHours: 200,
    tier: 'free'
  }
};

export const DEFAULT_ENTRIES: Record<string, LogEntry[]> = {
  magang: [
    {
      id: 'entry-m1',
      date: '2026-09-10',
      startTime: '08:00',
      endTime: '16:00',
      durationHours: 8.0,
      category: 'Gigi Tiruan Lepasan Akrilik',
      title: 'Penyusunan Anasir Gigi & Wax Contour Basis GTSL Rahang Atas',
      description: 'Melakukan survei model studi, penentuan clasp (cangkolan kawat half-round), dilanjutkan penyusunan anasir gigi anterior dan posterior kelas Kennedy I RA, serta waxing kontur gingiva anatomis.',
      achievements: 'Oklusi sentrik dan artikulasi stabil pada artikulator Free-Plane, siap untuk tahap try-in klinis.',
      status: 'approved',
      imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80',
      supervisorFeedback: 'Kontur servikal rapi, oklusi gigi molar seimbang. Lanjutkan ke tahap try-in pasien.',
      createdAt: '2026-09-10T16:15:00Z'
    },
    {
      id: 'entry-m2',
      date: '2026-09-11',
      startTime: '08:30',
      endTime: '15:30',
      durationHours: 7.0,
      category: 'Crown & Bridge (Gigi Tiruan Cekat)',
      title: 'Waxing Anatomis Full Metal Crown Gigi 36 & Spruing',
      description: 'Pembuatan die model kerja dengan spacer, pembentukan pola malam mahkota logam gigi molar pertama RB (36) memperhatikan fissure dan cusp, dilanjutkan pemasangan sprue reservoir 10 gauge.',
      achievements: 'Pola lilin bebas undercut dengan adaptasi tepi servikal (marginal fit) yang presisi.',
      status: 'submitted',
      createdAt: '2026-09-11T15:35:00Z'
    },
    {
      id: 'entry-m3',
      date: '2026-09-12',
      startTime: '08:00',
      endTime: '14:30',
      durationHours: 6.5,
      category: 'Finishing & Pemolesan Plat Akrilik',
      title: 'Deflasking, Trimming, dan High-Shine Polishing GTL Rahang Bawah',
      description: 'Membuka kuvet pasca-curing akrilik panas (heat-cured), pembersihan sisa plaster dengan ultrasonic bath, trimming flash akrilik menggunakan tungsten carbide bur, dan pemolesan bertahap dengan pumice serta chalk putih (high-shine).',
      achievements: 'Permukaan plat mengkilap sempurna, tepi plat membulat halus tanpa mengurangi retensi border seal.',
      status: 'draft',
      createdAt: '2026-09-12T14:35:00Z'
    }
  ],
  kkn: [
    {
      id: 'entry-k1',
      date: '2026-08-15',
      startTime: '08:00',
      endTime: '16:00',
      durationHours: 8.0,
      category: 'Sosialisasi & Edukasi Warga',
      title: 'Pelatihan Literasi Digital & Pembuatan Akun UMKM Warga Desa',
      description: 'Mengadakan workshop di balai desa bersama 25 pelaku UMKM lokal untuk mengenalkan Google Maps Bisnis dan pencatatan kas digital.',
      achievements: '18 toko kelontong & kerajinan desa berhasil terdaftar di Google Maps.',
      status: 'approved',
      imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
      supervisorFeedback: 'Kegiatan sangat berdampak positif untuk warga desa, dokumentasikan laporannya.',
      createdAt: '2026-08-15T16:30:00Z'
    },
    {
      id: 'entry-k2',
      date: '2026-08-16',
      startTime: '08:30',
      endTime: '15:30',
      durationHours: 7.0,
      category: 'Pelaksanaan Program Kerja',
      title: 'Pemasangan Plang Penunjuk Arah dan Pembersihan Sungai Desa',
      description: 'Gotong royong bersama karang taruna memasang 6 titik plang penunjuk arah dusun dan membersihkan aliran irigasi persawahan.',
      achievements: 'Plang terpasang kokoh dan area irigasi bersih dari sampah plastik.',
      status: 'approved',
      createdAt: '2026-08-16T16:00:00Z'
    }
  ],
  pkl: [
    {
      id: 'entry-p1',
      date: '2026-07-10',
      startTime: '07:30',
      endTime: '16:00',
      durationHours: 8.5,
      category: 'Praktik Lapangan',
      title: 'Instalasi & Crimping Kabel UTP Cat6 di Gedung Pelayanan Publik',
      description: 'Pemasangan jaringan LAN baru untuk 12 workstation staf dinas, pengetesan menggunakan LAN tester dan penataan kabel di patch panel.',
      achievements: 'Semua kabel tersambung dengan kecepatan gigabit 1000 Mbps tanpa packet loss.',
      status: 'approved',
      imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
      createdAt: '2026-07-10T16:15:00Z'
    }
  ],
  skripsi: [
    {
      id: 'entry-s1',
      date: '2026-04-12',
      startTime: '10:00',
      endTime: '15:00',
      durationHours: 5.0,
      category: 'Bimbingan Dosen',
      title: 'Konsultasi Bab 3 (Metodologi Penelitian & Arsitektur Sistem)',
      description: 'Mendiskusikan diagram alur chunking data embedding, formula cosine similarity, dan validasi ground truth dengan dosen pembimbing.',
      achievements: 'Bab 3 disetujui dengan catatan revisi kecil pada penjelasan parameter hypertuning.',
      status: 'approved',
      supervisorFeedback: 'Lanjutkan ke eksperimen Bab 4, perhatikan variasi metrik evaluasi Recall@K.',
      createdAt: '2026-04-12T15:30:00Z'
    }
  ],
  mandiri: [
    {
      id: 'entry-mn1',
      date: '2026-09-05',
      startTime: '19:00',
      endTime: '23:30',
      durationHours: 4.5,
      category: 'Coding & Desain',
      title: 'Building Interactive Multi-Program Logbook UI',
      description: 'Membangun arsitektur frontend dengan Next.js App Router, Tailwind CSS, dark mode support, dan sistem fallback demo storage.',
      achievements: 'Komponen dashboard dan ekspor PDF selesai dibuat.',
      status: 'submitted',
      createdAt: '2026-09-05T23:35:00Z'
    }
  ]
};
