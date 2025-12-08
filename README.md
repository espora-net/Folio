# Folio

Folio es la aplicación de estudio diseñada para opositores que quieren aprobar de forma inteligente, organizada y sin perder tiempo.

Una aplicación web moderna construida con Next.js para ayudar a estudiantes a preparar la oposición de **Técnico Auxiliar de Bibliotecas (C1)**.

## 🌟 Características

- **📚 Gestión de Temario**: Organiza y estudia el contenido de la oposición con estructura jerárquica
- **🎴 Tarjetas de Estudio (Flashcards)**: Sistema de repaso espaciado para memorización efectiva
- **📝 Tests de Práctica**: Preguntas tipo test con explicaciones detalladas
- **📊 Seguimiento de Progreso**: Estadísticas de estudio y rachas de aprendizaje
- **🌙 Modo Oscuro**: Interfaz moderna y cómoda para estudiar
- **💾 Almacenamiento Local**: Datos guardados en JSON para fácil gestión

## 🚀 Comenzar

### Requisitos Previos

- Node.js 20.x o superior
- npm o yarn

### Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/espora-net/Folio.git
cd Folio
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🏗️ Estructura del Proyecto

```
Folio/
├── app/                    # Páginas y rutas de Next.js
│   ├── api/               # API Routes (Backend)
│   │   ├── topics/        # Gestión de temas
│   │   ├── flashcards/    # Gestión de tarjetas
│   │   ├── tests/         # Gestión de preguntas
│   │   ├── comments/      # Gestión de comentarios
│   │   └── statistics/    # Estadísticas
│   ├── estudiar-hoy/      # Página de estudio diario
│   ├── temario/           # Navegador de temas
│   ├── tarjetas/          # Sistema de flashcards
│   ├── test/              # Sistema de tests
│   └── estadisticas/      # Dashboard de estadísticas
├── components/            # Componentes React reutilizables
├── data/                  # Base de datos JSON
│   └── db.json           # Almacenamiento de datos
├── lib/                   # Utilidades y funciones auxiliares
├── types/                 # Definiciones TypeScript
└── public/               # Archivos estáticos
```

## 📖 Navegación

La aplicación incluye 5 secciones principales:

1. **Estudiar hoy** - Vista de repaso diario con tarjetas programadas
2. **Temario** - Explorador de contenido organizado por temas
3. **Tarjetas** - Sistema interactivo de flashcards con repaso espaciado
4. **Test** - Práctica con preguntas de opción múltiple
5. **Estadísticas** - Seguimiento de progreso y rendimiento

## 🛠️ Tecnologías

- **Framework**: Next.js 16
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS 4
- **Iconos**: Lucide React
- **Base de datos**: JSON local (sistema de archivos)

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Compilación para producción
npm run build

# Iniciar servidor de producción
npm run start
```

## 🎨 Características de la UI

- **Diseño Minimalista**: Interfaz limpia y fácil de usar
- **Modo Oscuro por Defecto**: Reduce la fatiga visual
- **Navegación Lateral**: Acceso rápido a todas las secciones
- **Transiciones Suaves**: Experiencia de usuario fluida
- **Responsive**: Adaptado a diferentes tamaños de pantalla

## 🔄 Sistema de Repaso Espaciado

Las flashcards implementan un algoritmo simple de repaso espaciado:
- **Primera vez correcta**: Repaso en 2 días
- **Segunda vez correcta**: Repaso en 4 días
- **Tercera vez correcta**: Repaso en 6 días
- **Respuesta incorrecta**: Repaso al día siguiente

## 📊 Base de Datos

Los datos se almacenan en `data/db.json` con la siguiente estructura:

- **topics**: Temas y subtemas del temario
- **flashcards**: Tarjetas de estudio con metadatos de repaso
- **questions**: Preguntas tipo test con opciones y respuestas
- **comments**: Notas del usuario
- **statistics**: Métricas de progreso
- **studySessions**: Historial de sesiones de estudio

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🎯 Futuras Mejoras

- [ ] Autenticación de usuarios
- [ ] Sincronización en la nube
- [ ] Importación/exportación de datos
- [ ] Modo de estudio colaborativo
- [ ] Aplicación móvil
- [ ] Más algoritmos de repaso espaciado (SM-2, etc.)
- [ ] Gamificación con logros y badges
- [ ] Análisis avanzado de rendimiento

## 💡 Inspiración

Diseñado específicamente para opositores a Técnico Auxiliar de Bibliotecas, pero adaptable a cualquier tipo de estudio que requiera memorización y práctica con tests.

---

Hecho con ❤️ para estudiantes que buscan aprobar sus oposiciones de forma eficiente.
