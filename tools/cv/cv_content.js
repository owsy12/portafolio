// Contenido del CV. Todo lo que aparece aquí está respaldado por el código revisado
// o por información que Oswaldo proporcionó. Para añadir el portafolio, llena `portfolio`.
const name = 'Andrés Oswaldo Cobos Pérez';

const labels = {
  es: {
    location: 'Xalapa, Veracruz, México',
    profile: 'Perfil profesional',
    skills: 'Habilidades técnicas',
    education: 'Educación y disponibilidad',
    degree: 'Licenciatura en Ingeniería de Software',
    school: 'Universidad Veracruzana, Xalapa',
    grad: 'Egreso previsto: dic. 2027',
    langAvail: 'Idiomas y disponibilidad',
    languagesLabel: 'Idiomas',
    languages: 'Español (nativo) · Inglés (intermedio)',
    availLabel: 'Disponibilidad',
    avail: 'Medio tiempo, 20–25 horas semanales | Remoto desde México',
  },
  en: {
    location: 'Xalapa, Veracruz, Mexico',
    profile: 'Profile',
    skills: 'Technical skills',
    education: 'Education and availability',
    degree: 'B.S. in Software Engineering (in progress)',
    school: 'Universidad Veracruzana, Xalapa, Mexico',
    grad: 'Expected graduation: Dec 2027',
    langAvail: 'Languages and availability',
    languagesLabel: 'Languages',
    languages: 'Spanish (native) · English (intermediate)',
    availLabel: 'Availability',
    avail: 'Part-time, 20–25 hours per week | Remote from Mexico (UTC−6)',
  },
};

// ---------- Entradas reutilizables ----------
const ES = {
  simuladores: {
    left: ['Simuladores de examen EXANI-I y USICAMM', '  |  Desarrollador independiente'],
    right: '2025',
    sub: 'Centro de Formación Juan de Zumárraga, Perote, Ver. · Trabajo por encargo · C#, .NET Framework, WPF, MVVM',
    bullets: [
      'Levanté los requerimientos con el cliente y desarrollé de forma individual dos aplicaciones de escritorio, que el centro sigue usando, para practicar el EXANI-I (113 reactivos en 4 módulos) y la evaluación USICAMM de admisión docente (91 reactivos).',
      'Implementé temporizador global, calificación automática con retroalimentación y tres tipos de reactivo (opción múltiple, verdadero/falso y relacionar columnas), con arquitectura MVVM y banco de preguntas en JSON.',
    ],
  },
  descuke: {
    left: ['Descuke — Sistema de reservaciones y cuentas', '  |  Proyecto individual'],
    right: '2026',
    sub: 'Prototipo funcional para un centro nocturno · JavaScript (ES Modules), Firebase (Firestore, Auth, Hosting)',
    bullets: [
      'Desarrollé una aplicación web con cuatro roles (administrador, relaciones públicas, hostess y mesero) para reservar mesas por fecha sobre un croquis interactivo en SVG, con estados de llegada y bloqueo de mesas.',
      'Implementé la apertura de cuentas mediante código QR por mesa, comandas con catálogo de productos y promociones, y la generación de una imagen de la reserva lista para compartir.',
      'Organicé el código en módulos por capa (servicios, vistas y reglas de acceso) y documenté las incidencias corregidas.',
    ],
  },
  sgpp: {
    left: ['SGPP — Sistema de Gestión de Prácticas Profesionales', '  |  Proyecto académico en equipo'],
    right: '2026',
    sub: 'Java 21, JavaFX (FXML/CSS), JDBC, MySQL, JUnit 5, UML/ICONIX',
    bullets: [
      'Desarrollé parte de la capa de acceso a datos: DAOs, interfaces y DTOs sobre MySQL con JDBC, además de excepciones propias para entradas duplicadas, integridad referencial y validación.',
      'Escribí la suite de pruebas de los DAOs con JUnit 5, apoyada en constructores de datos de prueba y un script de limpieza de la base de datos.',
      'Diseñé el tema visual de la aplicación con CSS de JavaFX, refactoricé las vistas FXML y elaboré documentación UML siguiendo ICONIX.',
    ],
  },
  propify: {
    left: ['Propify — Plataforma inmobiliaria', '  |  Proyecto académico en equipo'],
    right: '2026',
    sub: 'React, Vite, CSS · backend en microservicios con FastAPI y Docker',
    bullets: [
      'Rediseñé el frontend en React con un sistema de diseño basado en tokens CSS: navegación responsiva, catálogo y detalle de propiedades, autenticación y componentes reutilizables (alertas, modales, tarjetas).',
    ],
  },
  pasadena: {
    left: ['Pasadena — Plataforma de streaming musical', '  |  Frontend, proyecto en equipo'],
    right: '2025',
    sub: 'C#, .NET MAUI (XAML) · backend en microservicios con FastAPI, Go, PostgreSQL, MongoDB y Docker',
    bullets: [
      'Construí las vistas del cliente en .NET MAUI: pantalla de inicio, perfil y edición de perfil, red social para seguir usuarios, playlists y panel de administración de usuarios y canciones.',
    ],
  },
  api: {
    left: ['API REST de usuarios', '  |  Proyecto académico'],
    right: '2025',
    sub: 'Node.js, Express, Sequelize, MySQL, Jest, Supertest, Swagger, JWT',
    bullets: [
      'Agregué pruebas unitarias y de integración con Jest y Supertest, documenté los endpoints con Swagger e implementé autenticación con JWT firmados con llaves RSA.',
    ],
  },
};

const EN = {
  simuladores: {
    left: ['EXANI-I and USICAMM Exam Simulators', '  |  Freelance Developer'],
    right: '2025',
    sub: 'Centro de Formación Juan de Zumárraga, Perote, Mexico · Client project · C#, .NET Framework, WPF, MVVM',
    bullets: [
      'Gathered requirements with the client and single-handedly built two desktop apps, still in use at the center, to practice the EXANI-I university admission exam (113 questions, 4 modules) and the USICAMM teacher admission exam (91 questions).',
      'Implemented a global timer, automatic grading with feedback and three question types (multiple choice, true/false, matching) using MVVM and a JSON question bank.',
    ],
  },
  descuke: {
    left: ['Descuke — Reservation and Tab Management System', '  |  Solo project'],
    right: '2026',
    sub: 'Working prototype for a nightclub · JavaScript (ES Modules), Firebase (Firestore, Auth, Hosting)',
    bullets: [
      'Built a web app with four roles (admin, promoter, host and waiter) to book tables by date on an interactive SVG floor plan, including arrival tracking and table blocking.',
      'Implemented tab opening through per-table QR codes, orders backed by a product and promotions catalog, and shareable reservation images generated on the client.',
      'Organized the code into layered modules (services, views, access rules) and documented root causes and fixes for reported issues.',
    ],
  },
  sgpp: {
    left: ['SGPP — Internship Management System', '  |  Team academic project'],
    right: '2026',
    sub: 'Java 21, JavaFX (FXML/CSS), JDBC, MySQL, JUnit 5, UML/ICONIX',
    bullets: [
      'Built part of the data access layer: DAOs, interfaces and DTOs over MySQL using JDBC, plus custom exceptions for duplicate entries, referential integrity and validation.',
      'Wrote the DAO test suite with JUnit 5, supported by test data builders and a database cleanup script.',
      'Designed the application theme with JavaFX CSS, refactored the FXML views and produced UML documentation following ICONIX.',
    ],
  },
  propify: {
    left: ['Propify — Real Estate Platform', '  |  Team academic project'],
    right: '2026',
    sub: 'React, Vite, CSS · FastAPI microservices backend with Docker',
    bullets: [
      'Redesigned the React frontend around a token-based CSS design system: responsive navigation, property listing and detail pages, authentication screens and reusable components (alerts, modals, cards).',
    ],
  },
  pasadena: {
    left: ['Pasadena — Music Streaming Platform', '  |  Frontend, team project'],
    right: '2025',
    sub: 'C#, .NET MAUI (XAML) · FastAPI, Go, PostgreSQL, MongoDB and Docker microservices backend',
    bullets: [
      'Built the client views in .NET MAUI: home screen, profile and profile editing, a social page to follow users, playlists, and an admin panel for users and songs.',
    ],
  },
};

const versions = [
  {
    file: 'Andres_Oswaldo_Cobos_CV_Junior_ES',
    lang: 'es',
    headline: 'Desarrollador de Software | Full-Stack · Java · C#/.NET · React',
    summary: 'Estudiante de Ingeniería de Software en la Universidad Veracruzana. He desarrollado aplicaciones de escritorio y web: simuladores de examen en C#/.NET entregados a un cliente externo, un sistema de reservaciones en JavaScript y Firebase hecho de forma individual, y proyectos en equipo con Java/JavaFX, React y microservicios. Trabajo principalmente en interfaces, capas de acceso a datos y pruebas. Busco integrarme a un equipo de desarrollo profesional.',
    blocks: [
      { title: 'Experiencia con clientes', entries: [ES.simuladores] },
      { title: 'Proyectos', entries: [ES.descuke, ES.sgpp, ES.propify, ES.pasadena] },
    ],
    skills: [
      ['Lenguajes', 'Java, C#, JavaScript, SQL, HTML y CSS'],
      ['Frontend y escritorio', 'React, JavaFX (FXML/CSS), WPF y .NET MAUI (XAML)'],
      ['Backend y datos', 'JDBC, MySQL, Firebase (Firestore, Auth, Hosting), Node.js/Express, APIs REST'],
      ['Herramientas y prácticas', 'Git/GitHub, JUnit 5, Jest, Docker, patrón DAO, MVVM, UML/ICONIX, desarrollo con IA (Claude)'],
    ],
  },
  {
    file: 'Andres_Oswaldo_Cobos_CV_Junior_EN',
    lang: 'en',
    headline: 'Software Developer | Full-Stack · Java · C#/.NET · React',
    summary: 'Software Engineering student at Universidad Veracruzana. I have built desktop and web applications: exam simulators in C#/.NET delivered to an external client, a solo-built reservation system in JavaScript and Firebase, and team projects using Java/JavaFX, React and microservices. My work focuses on user interfaces, data access layers and testing. I am looking to join a professional development team.',
    blocks: [
      { title: 'Client work', entries: [EN.simuladores] },
      { title: 'Projects', entries: [EN.descuke, EN.sgpp, EN.propify, EN.pasadena] },
    ],
    skills: [
      ['Languages', 'Java, C#, JavaScript, SQL, HTML and CSS'],
      ['Frontend and desktop', 'React, JavaFX (FXML/CSS), WPF and .NET MAUI (XAML)'],
      ['Backend and data', 'JDBC, MySQL, Firebase (Firestore, Auth, Hosting), Node.js/Express, REST APIs'],
      ['Tools and practices', 'Git/GitHub, JUnit 5, Jest, Docker Compose, DAO pattern, MVVM, UML/ICONIX, AI-assisted coding (Claude)'],
    ],
  },
  {
    file: 'Andres_Oswaldo_Cobos_CV_Backend_Java_NET_ES',
    lang: 'es',
    headline: 'Desarrollador Backend Junior | Java · C#/.NET · SQL',
    summary: 'Estudiante de Ingeniería de Software en la Universidad Veracruzana. He trabajado en capas de acceso a datos con Java y JDBC, pruebas automatizadas con JUnit 5 y Jest, y APIs REST con Node.js. Entregué simuladores de examen en C#/.NET (WPF, MVVM) a un cliente externo y desarrollé solo un sistema de reservaciones con Firebase. Busco un puesto Junior o Trainee en un equipo backend.',
    blocks: [
      { title: 'Experiencia con clientes', entries: [ES.simuladores] },
      { title: 'Proyectos', entries: [
        { ...ES.sgpp, bullets: [
          'Desarrollé DAOs, interfaces y DTOs con JDBC sobre MySQL para proyectos, solicitudes, asignaciones, evaluaciones, profesores y roles de usuario.',
          'Creé excepciones propias para entradas duplicadas (error 1062 de MySQL), integridad referencial y validación, para separar los errores de datos de la interfaz.',
          'Escribí la suite de pruebas de los DAOs con JUnit 5, con constructores de datos de prueba y un script de limpieza de la base de datos.',
        ] },
        ES.api,
        { ...ES.descuke, bullets: [
          'Diseñé el modelo de datos en Firestore (reservaciones, cuentas, comandas, productos y usuarios) y centralicé las reglas de acceso por rol en un solo módulo.',
          'Implementé consultas filtradas para abrir cuentas solo en reservas activas, comandas con cálculo de subtotales y promociones, y la apertura de cuentas mediante código QR por mesa.',
        ] },
      ] },
    ],
    skills: [
      ['Lenguajes', 'Java, C#, SQL, JavaScript (Node.js)'],
      ['Backend y datos', 'JDBC, MySQL, Express, Sequelize, Firebase Firestore, APIs REST, JWT'],
      ['Pruebas y documentación', 'JUnit 5, Jest, Supertest, Swagger/OpenAPI, UML/ICONIX'],
      ['Arquitectura y herramientas', 'DAO, MVVM, arquitectura por capas, Git/GitHub, Docker, desarrollo con IA (Claude)'],
    ],
  },
];

// El teléfono no se guarda en el repositorio: pásalo con CV_PHONE="+52 ..." al generar la versión privada.
module.exports = { name, phone: process.env.CV_PHONE || '', email: 'oswaldocobos5@gmail.com', portfolio: '', labels, versions };
