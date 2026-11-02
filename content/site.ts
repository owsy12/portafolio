// Datos personales y de contacto. Edita este archivo para actualizar el sitio.
// El teléfono NO se publica en el sitio (está solo en el CV).

export const site = {
  name: 'Andrés Oswaldo Cobos Pérez',
  shortName: 'Oswaldo Cobos',
  role: 'Desarrollador de Software',
  headline: 'Full-Stack · Java · C#/.NET · React',
  location: 'Xalapa, Veracruz, México',
  // Cambia esta URL cuando publiques en Vercel (se usa en metadatos, sitemap y Open Graph)
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://oswaldo-cobos.vercel.app',
  email: 'oswaldocobos5@gmail.com',
  github: 'https://github.com/owsy12',
  linkedin: 'https://linkedin.com/in/oswaldo-cobos-8a693a195',
  availability: {
    short: 'Disponible · medio tiempo · remoto',
    hours: '20–25 horas por semana',
    mode: 'Remoto desde México (UTC−6)',
    looking: ['Junior', 'Trainee', 'Prácticas profesionales remuneradas', 'Proyectos freelance'],
  },
  education: {
    degree: 'Licenciatura en Ingeniería de Software',
    school: 'Universidad Veracruzana',
    graduation: 'Egreso previsto: diciembre de 2027',
  },
} as const;

export type CvFile = { label: string; description: string; pdf: string; docx: string; lang: 'es' | 'en' };

export const cvFiles: CvFile[] = [
  {
    label: 'CV general',
    description: 'Desarrollador Junior / Trainee',
    pdf: '/cv/Andres_Oswaldo_Cobos_CV_Junior_ES.pdf',
    docx: '/cv/Andres_Oswaldo_Cobos_CV_Junior_ES.docx',
    lang: 'es',
  },
  {
    label: 'Resume (English)',
    description: 'Junior Software Developer',
    pdf: '/cv/Andres_Oswaldo_Cobos_CV_Junior_EN.pdf',
    docx: '/cv/Andres_Oswaldo_Cobos_CV_Junior_EN.docx',
    lang: 'en',
  },
  {
    label: 'CV Backend Java/.NET',
    description: 'Java · C#/.NET · SQL',
    pdf: '/cv/Andres_Oswaldo_Cobos_CV_Backend_Java_NET_ES.pdf',
    docx: '/cv/Andres_Oswaldo_Cobos_CV_Backend_Java_NET_ES.docx',
    lang: 'es',
  },
];

export const primaryCv = cvFiles[0];

// Habilidades agrupadas por la evidencia que existe en los proyectos
export const skills: { group: string; items: { name: string; where: string }[] }[] = [
  {
    group: 'Lenguajes',
    items: [
      { name: 'Java', where: 'SGPP' },
      { name: 'C#', where: 'Simuladores, InventarioPlus, Pasadena' },
      { name: 'JavaScript', where: 'Descuke, Propify, API REST' },
      { name: 'SQL', where: 'SGPP' },
      { name: 'HTML y CSS', where: 'Descuke, Propify' },
    ],
  },
  {
    group: 'Interfaces',
    items: [
      { name: 'React', where: 'Propify' },
      { name: 'JavaFX (FXML/CSS)', where: 'SGPP' },
      { name: 'WPF (MVVM) y .NET MAUI (XAML)', where: 'Simuladores, InventarioPlus, Pasadena' },
      { name: 'SVG interactivo', where: 'Descuke' },
    ],
  },
  {
    group: 'Datos y servicios',
    items: [
      { name: 'JDBC + MySQL', where: 'SGPP' },
      { name: 'Firebase (Firestore, Auth, Hosting)', where: 'Descuke' },
      { name: 'Node.js / Express', where: 'API REST' },
      { name: 'APIs REST y JWT', where: 'API REST, Propify' },
    ],
  },
  {
    group: 'Calidad y herramientas',
    items: [
      { name: 'JUnit 5', where: 'SGPP' },
      { name: 'Jest + Supertest', where: 'API REST' },
      { name: 'Git / GitHub en equipo', where: 'Todos' },
      { name: 'UML / ICONIX', where: 'SGPP' },
      { name: 'Desarrollo con IA (Claude)', where: 'Aventura Captura 2D' },
      { name: 'Docker Compose', where: 'Pasadena, Propify' },
    ],
  },
];
