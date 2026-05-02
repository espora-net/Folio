# Tema 19. Las Plataformas de Servicios Bibliotecarios —LSP— y las herramientas de descubrimiento

## 0. Epígrafe oficial de la convocatoria

> **19. Las Plataformas de Servicios Bibliotecarios —LSP— y las herramientas de descubrimiento. La plataforma de Servicios Bibliotecarios y el Buscador de la Biblioteca de la UAH.**

Este tema pertenece al programa específico de la convocatoria de la Universidad de Alcalá para la Escala Técnica Auxiliar de Archivos y Bibliotecas.

---

## 1. Esquema ejecutivo para memorizar

El tema 19 trata la evolución tecnológica de las bibliotecas universitarias desde los sistemas integrados de gestión bibliotecaria clásicos hacia plataformas más amplias, capaces de gestionar de forma unificada recursos impresos, electrónicos y digitales.

La idea clave es:

> Una **LSP** es la plataforma interna de gestión bibliotecaria; una **herramienta de descubrimiento** es la interfaz de búsqueda para el usuario.

En la Biblioteca de la Universidad de Alcalá, el binomio que hay que estudiar es:

| Elemento | Función |
|---|---|
| **ALMA** | Plataforma de Servicios Bibliotecarios. Gestión interna de recursos, usuarios, circulación, adquisiciones, metadatos y recursos electrónicos. |
| **PRIMO / Buscador UAH** | Herramienta de descubrimiento. Interfaz pública para buscar, localizar, reservar, acceder al texto completo y gestionar la cuenta de usuario. |

La Biblioteca UAH documentó la entrada en producción de **ALMA** y **PRIMO** el 25 de febrero de 2019. En el Plan Estratégico 2018-2022 se recogía como resultado deseado “implantar, consolidar y optimizar la plataforma de servicios bibliotecarios (ALMA) y la herramienta de descubrimiento (PRIMO)”.

---

## 2. Conceptos básicos

### 2.1. Sistema Integrado de Gestión Bibliotecaria —SIGB—

Un **Sistema Integrado de Gestión Bibliotecaria** es una aplicación que permite gestionar las operaciones tradicionales de una biblioteca:

- Catalogación.
- Circulación o préstamo.
- Usuarios.
- Adquisiciones.
- Publicaciones periódicas.
- Control de ejemplares.
- Estadísticas.
- Administración del catálogo público.

Los SIGB clásicos surgieron en un contexto dominado por colecciones impresas. Su eje era el catálogo local y la gestión de ejemplares físicos.

### 2.2. Limitaciones del SIGB clásico

Las bibliotecas universitarias actuales gestionan documentos impresos, libros electrónicos, revistas electrónicas, bases de datos, repositorios, recursos digitales, licencias, enlaces a texto completo y servicios consorciados. El SIGB clásico resultaba insuficiente para integrar todo esto.

Limitaciones habituales:

| Limitación | Explicación |
|---|---|
| Predominio del impreso | Diseñado para libros y revistas físicas. |
| Gestión fragmentada | Recursos electrónicos y digitales se gestionaban en sistemas separados. |
| Menor integración | Catálogo, link resolver, ERM y repositorios podían estar desconectados. |
| Interfaz pública limitada | El OPAC tradicional era menos flexible que las herramientas de descubrimiento. |
| Escasa orientación cloud | Muchos sistemas se desplegaban localmente. |

---

## 3. Plataformas de Servicios Bibliotecarios —LSP—

### 3.1. Definición

Una **Library Services Platform** o **Plataforma de Servicios Bibliotecarios** es un sistema de nueva generación que integra la gestión de recursos físicos, electrónicos y digitales en un entorno único, normalmente basado en servicios cloud, APIs, automatización de procesos y flujos de trabajo más transversales.

Su objetivo es sustituir o ampliar el SIGB tradicional.

### 3.2. Características principales de una LSP

| Característica | Explicación |
|---|---|
| Gestión unificada | Integra recursos impresos, electrónicos y digitales. |
| Entorno cloud | Suele funcionar como servicio en la nube. |
| Arquitectura modular | Permite trabajar con módulos funcionales conectados. |
| Integración consorciada | Facilita redes, catálogos compartidos y cooperación. |
| APIs e interoperabilidad | Se conecta con otros sistemas universitarios. |
| Gestión de licencias | Permite administrar recursos electrónicos y condiciones de acceso. |
| Analítica | Proporciona datos para gestión, evaluación e informes. |
| Automatización | Reduce tareas repetitivas y mejora flujos internos. |
| Orientación al usuario | Se complementa con capas de descubrimiento. |

### 3.3. Diferencia entre SIGB y LSP

| Aspecto | SIGB clásico | LSP |
|---|---|---|
| Colección principal | Impresa | Impresa, electrónica y digital |
| Arquitectura | Local o cliente-servidor | Cloud / SaaS |
| Catálogo | OPAC tradicional | Integración con discovery |
| Recursos electrónicos | Gestión externa o parcial | Gestión integrada |
| Licencias | Limitada | Funcionalidad específica |
| Consorcios | Más complejo | Mejor preparado |
| Analítica | Básica | Más avanzada |
| Integración | Menor | APIs, interoperabilidad y flujos conectados |

---

## 4. Herramientas de descubrimiento

### 4.1. Concepto

Una **herramienta de descubrimiento** es una interfaz de búsqueda que permite al usuario localizar recursos de la biblioteca desde un único punto de acceso.

No se limita al catálogo tradicional. Puede buscar simultáneamente en:

- Libros impresos.
- Revistas impresas.
- Libros electrónicos.
- Revistas electrónicas.
- Artículos.
- Bases de datos.
- Repositorios.
- Recursos audiovisuales.
- Documentos digitales.
- Bibliografías recomendadas.
- Recursos consorciados.

### 4.2. Funciones principales

| Función | Ejemplo |
|---|---|
| Búsqueda simple | Una caja única de búsqueda. |
| Búsqueda avanzada | Campos combinados: autor, título, materia, fecha, tipo de documento. |
| Facetas | Filtrar por fecha, autor, materia, tipo de recurso, idioma, disponibilidad. |
| Ranking | Ordenación por relevancia. |
| Disponibilidad | Saber si un ejemplar está disponible, prestado o en línea. |
| Acceso a texto completo | Enlace directo al recurso electrónico si está suscrito o abierto. |
| Reserva | Solicitar libros o salas según funcionalidades activas. |
| Cuenta de usuario | Consultar préstamos, renovaciones, solicitudes y sanciones. |
| Exportación | Enviar registros a gestores bibliográficos como RefWorks. |
| Localización física | Indicar biblioteca, planta, signatura o mapa. |

### 4.3. Diferencia entre catálogo y herramienta de descubrimiento

| Catálogo tradicional | Herramienta de descubrimiento |
|---|---|
| Busca principalmente en los registros del catálogo local. | Busca en múltiples fuentes y colecciones. |
| Centrado en libros y revistas de la biblioteca. | Incluye artículos, recursos electrónicos y repositorios. |
| Interfaz más bibliotecaria. | Interfaz más cercana a buscadores web. |
| Menos integración con texto completo. | Mayor integración con enlaces electrónicos. |
| Menos uso de facetas. | Uso intensivo de filtros y ranking. |

---

## 5. ALMA como Plataforma de Servicios Bibliotecarios

### 5.1. Qué es Alma

**Alma** es una plataforma de servicios bibliotecarios de Ex Libris utilizada por numerosas bibliotecas académicas. En el contexto de la UAH, Alma es la plataforma interna que permite gestionar los procesos bibliotecarios.

Puede intervenir en:

- Gestión bibliográfica.
- Gestión de ejemplares.
- Préstamo y circulación.
- Usuarios.
- Adquisiciones.
- Recursos electrónicos.
- Licencias.
- Proveedores.
- Publicaciones seriadas.
- Estadísticas.
- Integración con Primo.
- Procesos internos de trabajo.

### 5.2. Alma en la Biblioteca UAH

La documentación de la Biblioteca UAH recoge que la Biblioteca implantó **ALMA** como Plataforma de Servicios Bibliotecarios y **PRIMO** como herramienta de descubrimiento. En el Acta de la Comisión de Biblioteca de 27 de marzo de 2019 se indica que el **25 de febrero de 2019** entraron en producción la nueva Plataforma de Servicios Bibliotecarios ALMA y la herramienta de descubrimiento PRIMO.

En el Plan Estratégico 2018-2022 se incluía como resultado deseado:

> Implantar, consolidar y optimizar la plataforma de servicios bibliotecarios (ALMA) y la herramienta de descubrimiento (PRIMO).

### 5.3. Procesos internos en los que aparece Alma

El documento de procesos del Servicio de Biblioteca UAH menciona ALMA y PRIMO en procesos como selección y adquisición. Por ejemplo, antes de tramitar determinadas solicitudes de compra se comprueba si el recurso ya está disponible en ALMA o PRIMO.

Esto muestra que Alma no es solo un catálogo, sino una herramienta de gestión interna que interviene en procesos de colección, adquisición, disponibilidad y control bibliográfico.

---

## 6. PRIMO y el Buscador de la Biblioteca UAH

### 6.1. Qué es Primo

**Primo** es una herramienta de descubrimiento de Ex Libris. Su función es proporcionar al usuario una interfaz única para buscar y acceder a los recursos bibliográficos y electrónicos de la biblioteca.

En la UAH, Primo se presenta al usuario como el **Buscador de la Biblioteca**.

### 6.2. Qué permite hacer el Buscador UAH

La Guía del Buscador de la UAH indica que permite:

- Consultar recursos de la biblioteca.
- Ver préstamos y solicitudes vigentes.
- Renovar préstamos.
- Realizar reservas de libros.
- Realizar reservas de salas de lectura.
- Consultar información de la cuenta de usuario.
- Guardar registros.
- Exportar información a gestores bibliográficos.
- Usar búsqueda simple y búsqueda avanzada.

La página principal de la Biblioteca UAH presenta el Buscador como punto de entrada para buscar en:

- Todo.
- Colección impresa y audiovisual.
- Colección electrónica.
- Repositorio e_Buah.
- Consorcio Madroño.

### 6.3. Búsqueda simple y búsqueda avanzada

La búsqueda simple permite introducir términos en una caja única. Es útil para búsquedas generales.

La búsqueda avanzada permite precisar:

- Autor.
- Título.
- Materia.
- Palabras clave.
- Tipo de documento.
- Fecha.
- Idioma.
- Biblioteca.
- Disponibilidad.

### 6.4. Página de resultados

La página de resultados de una herramienta de descubrimiento permite refinar una búsqueda mediante facetas.

Facetas habituales:

| Faceta | Utilidad |
|---|---|
| Tipo de recurso | Libro, artículo, revista, tesis, recurso electrónico. |
| Fecha | Limitar por años de publicación. |
| Autor | Filtrar por responsable. |
| Materia | Acotar por tema. |
| Idioma | Elegir lengua del documento. |
| Biblioteca | Localizar recursos en una biblioteca concreta. |
| Disponibilidad | Ver recursos disponibles, en línea o prestados. |
| Colección | Limitar por colección impresa, electrónica, repositorio, etc. |

### 6.5. Registro detallado

En el registro detallado se muestra la información bibliográfica y de disponibilidad. La guía UAH indica que los libros y revistas en papel se reconocen porque muestran el literal “Disponible en”.

En un registro detallado pueden aparecer:

- Título.
- Autor.
- Edición.
- Publicación.
- Descripción física.
- Materias.
- ISBN o ISSN.
- Biblioteca.
- Signatura.
- Estado del ejemplar.
- Acceso electrónico.
- Enlaces a texto completo.
- Acciones de reserva.
- Exportación o cita.
- Información de disponibilidad.

### 6.6. Mi cuenta

Para acceder a todas las funcionalidades del Buscador es necesario identificarse con la cuenta institucional. La guía de la UAH explica que se inicia sesión con una cuenta del tipo `nombre.apellido`.

Desde “Mi cuenta” se pueden gestionar:

- Préstamos.
- Renovaciones.
- Solicitudes.
- Reservas.
- Sanciones.
- Datos de usuario.
- Registros guardados.

---

## 7. Buscador UAH y localización física

Una funcionalidad especialmente relevante para el tema 19, conectada con el tema 11, es la localización de libros en mapas de biblioteca.

La Biblioteca UAH informa de que el Buscador permite localizar libros situados en salas de lectura mediante el mapa de cada biblioteca. Esta función ayuda a encontrar el libro en relación con la ordenación de las estanterías según la CDU.

Esto integra:

1. Registro bibliográfico.
2. Disponibilidad del ejemplar.
3. Signatura topográfica.
4. Mapa físico de la biblioteca.
5. Colección de libre acceso.
6. Autoservicio del usuario.

---

## 8. Buscador UAH y bibliografías recomendadas

El Buscador también se utiliza para acceder a **bibliografías recomendadas** por titulaciones y asignaturas.

La guía de bibliografías recomendadas indica que existe una página específica donde puede buscarse introduciendo el nombre de las titulaciones. Esto conecta la herramienta de descubrimiento con el apoyo directo a la docencia.

Importancia para examen:

- La herramienta de descubrimiento no sirve solo para buscar documentos sueltos.
- También puede integrarse con asignaturas, titulaciones y bibliografía recomendada.
- Facilita el acceso de estudiantes a los materiales docentes.

---

## 9. Interoperabilidad e integración

### 9.1. Qué es interoperabilidad

La interoperabilidad es la capacidad de distintos sistemas para intercambiar información y trabajar juntos.

En el entorno bibliotecario puede implicar integración entre:

- LSP.
- Buscador.
- Repositorio institucional.
- Recursos electrónicos.
- Proveedores.
- Catálogos colectivos.
- Sistemas de autenticación universitaria.
- Gestores bibliográficos.
- Plataformas docentes.
- Sistemas de préstamo interbibliotecario.
- Estadísticas e informes.

### 9.2. Ejemplos de integración en la UAH

| Integración | Ejemplo |
|---|---|
| Alma-Primo | Gestión interna y visualización pública. |
| Buscador-cuenta de usuario | Préstamos, renovaciones, reservas y solicitudes. |
| Buscador-mapas | Localización física de libros en salas. |
| Buscador-repositorio | Acceso a e_Buah desde el punto de búsqueda. |
| Buscador-colección electrónica | Acceso a recursos suscritos. |
| Buscador-RefWorks | Exportación de referencias. |
| Cuenta UAH | Autenticación para funcionalidades completas. |

---

## 10. Impacto de las LSP y herramientas de descubrimiento en la biblioteca universitaria

### 10.1. Para los usuarios

| Mejora | Explicación |
|---|---|
| Punto único de búsqueda | Reduce la dispersión de recursos. |
| Acceso al texto completo | Facilita el uso de recursos electrónicos. |
| Autonomía | Permite reservas, renovaciones y gestión de cuenta. |
| Filtros y facetas | Ayuda a refinar búsquedas. |
| Disponibilidad visible | Informa si el recurso está disponible, prestado o en línea. |
| Localización física | Ayuda a encontrar ejemplares en estantería. |
| Integración docente | Bibliografías recomendadas y recursos por titulaciones. |

### 10.2. Para el personal bibliotecario

| Mejora | Explicación |
|---|---|
| Gestión integrada | Unifica procesos antes dispersos. |
| Eficiencia | Automatiza tareas y reduce duplicidades. |
| Mejor control | Permite seguimiento de recursos, licencias y ejemplares. |
| Datos para decisiones | Facilita estadísticas e indicadores. |
| Cooperación | Favorece entornos consorciados. |
| Mejora continua | Permite optimizar flujos de trabajo. |

---

## 11. Riesgos, retos y buenas prácticas

### 11.1. Retos

| Reto | Explicación |
|---|---|
| Complejidad tecnológica | Requiere formación del personal y usuarios. |
| Calidad de metadatos | El descubrimiento depende de datos correctos. |
| Enlaces rotos | Los recursos electrónicos pueden cambiar de URL o proveedor. |
| Exceso de resultados | Las búsquedas amplias pueden generar ruido. |
| Autenticación | El acceso remoto puede generar incidencias. |
| Brecha digital | Algunos usuarios necesitan apoyo presencial. |
| Dependencia de proveedor | Las LSP suelen ser soluciones comerciales cloud. |

### 11.2. Buenas prácticas

- Mantener registros bibliográficos correctos y normalizados.
- Revisar enlaces electrónicos.
- Formar a usuarios en búsqueda simple, avanzada y uso de facetas.
- Elaborar biblioguías y videotutoriales.
- Ofrecer soporte a través de “Pregunte al bibliotecario”.
- Mantener documentación actualizada.
- Medir satisfacción y uso.
- Integrar la herramienta con servicios de préstamo, reservas y recursos electrónicos.
- Comunicar incidencias y cambios.

---

## 12. Papel del Técnico Auxiliar de Archivos y Bibliotecas

El personal técnico auxiliar debe conocer la plataforma desde el punto de vista operativo y de atención al usuario.

Funciones prácticas:

- Orientar a usuarios en el uso del Buscador.
- Explicar la diferencia entre recurso físico y recurso electrónico.
- Ayudar a interpretar disponibilidad y localización.
- Enseñar cómo iniciar sesión en Mi cuenta.
- Apoyar renovaciones, reservas y solicitudes.
- Detectar incidencias en enlaces o registros.
- Derivar problemas complejos al personal responsable.
- Comprobar signaturas y ubicaciones.
- Ayudar a localizar fondos en libre acceso.
- Informar sobre bibliografías recomendadas.
- Aplicar los procedimientos de préstamo y acceso al documento.

---

## 13. Casos prácticos de examen

### Caso 1. Un estudiante no encuentra un libro en la estantería

Actuación recomendada:

1. Comprobar en el Buscador si el libro está disponible.
2. Revisar biblioteca, sala, planta y signatura.
3. Consultar si existe localización en mapa.
4. Acompañar o explicar la ordenación por CDU.
5. Si no aparece, comprobar si está prestado, mal colocado o en proceso.
6. Derivar al mostrador o registrar incidencia si procede.

### Caso 2. Un usuario encuentra un artículo pero no puede acceder al texto completo

Actuación recomendada:

1. Verificar si el usuario está autenticado.
2. Comprobar si el recurso está suscrito por la UAH.
3. Revisar si el enlace funciona.
4. Usar el icono o canal de reporte de incidencias si existe.
5. Indicar alternativas: acceso al documento, préstamo interbibliotecario o consulta de otras versiones.
6. Derivar a información bibliográfica si el caso es complejo.

### Caso 3. Un profesor pregunta si la biblioteca ya tiene un libro antes de solicitar su compra

Actuación recomendada:

1. Buscar en el Buscador.
2. Comprobar disponibilidad, edición y formato.
3. Si se trabaja internamente, verificar también en Alma.
4. Informar si el recurso ya está disponible.
5. Si no está disponible, orientar hacia el formulario o procedimiento de adquisiciones.

### Caso 4. Un alumno quiere renovar sus préstamos

Actuación recomendada:

1. Indicar que debe entrar en el Buscador e identificarse en Mi cuenta.
2. Revisar préstamos vigentes.
3. Renovar si el sistema lo permite.
4. Explicar posibles causas de no renovación: reserva de otro usuario, sanción, plazo vencido o límite de renovaciones.

---

## 14. Preguntas tipo test

**1. Una Plataforma de Servicios Bibliotecarios se caracteriza por:**

a) Gestionar únicamente los libros impresos de una biblioteca.  
b) Sustituir completamente la necesidad de metadatos.  
c) Integrar la gestión de recursos físicos, electrónicos y digitales.  
d) Ser exclusivamente una página web pública de búsqueda.

Respuesta correcta: **c**.

---

**2. En la Biblioteca UAH, la Plataforma de Servicios Bibliotecarios implantada es:**

a) Koha.  
b) Alma.  
c) DSpace.  
d) RefWorks.

Respuesta correcta: **b**.

---

**3. La herramienta de descubrimiento asociada en la Biblioteca UAH es:**

a) Primo.  
b) MARC 21.  
c) DOI.  
d) GtBib-Sod.

Respuesta correcta: **a**.

---

**4. Una herramienta de descubrimiento permite principalmente:**

a) Firmar electrónicamente documentos administrativos.  
b) Buscar de forma integrada recursos impresos, electrónicos y digitales.  
c) Asignar ISBN a monografías.  
d) Elaborar automáticamente cartas de servicios.

Respuesta correcta: **b**.

---

**5. “Mi cuenta” en el Buscador UAH permite:**

a) Gestionar préstamos, solicitudes y renovaciones.  
b) Editar registros MARC.  
c) Modificar licencias de recursos electrónicos.  
d) Crear números DOI.

Respuesta correcta: **a**.

---

## 15. Preguntas cortas

1. Define Plataforma de Servicios Bibliotecarios.
2. Diferencia entre SIGB clásico y LSP.
3. Qué es una herramienta de descubrimiento.
4. Qué relación existe entre Alma y Primo.
5. Qué funcionalidades ofrece el Buscador UAH al usuario.
6. Por qué son importantes las facetas en una búsqueda bibliográfica.
7. Qué información debe revisar un auxiliar cuando un usuario no localiza un libro.
8. Qué ventajas tiene la integración entre buscador, cuenta de usuario y préstamo.
9. Qué problemas pueden aparecer en el acceso a recursos electrónicos.
10. Qué relación hay entre el Buscador UAH y las bibliografías recomendadas.

---

## 16. Preguntas de desarrollo

### Pregunta 1

**Explique qué son las Plataformas de Servicios Bibliotecarios y cuál es su diferencia con los sistemas integrados de gestión bibliotecaria tradicionales.**

Esquema de respuesta:

- Definición de SIGB.
- Limitaciones del SIGB clásico.
- Definición de LSP.
- Gestión integrada de recursos físicos, electrónicos y digitales.
- Cloud, APIs, interoperabilidad.
- Datos, analítica y cooperación.
- Ejemplo UAH: Alma.

### Pregunta 2

**Desarrolle el papel de las herramientas de descubrimiento en la biblioteca universitaria actual.**

Esquema de respuesta:

- Definición.
- Diferencia con OPAC tradicional.
- Búsqueda única.
- Facetas.
- Acceso a texto completo.
- Disponibilidad y reservas.
- Cuenta de usuario.
- Ejemplo UAH: Primo / Buscador.

### Pregunta 3

**Explique la plataforma de servicios bibliotecarios y el Buscador de la Biblioteca de la UAH.**

Esquema de respuesta:

- Alma como plataforma de gestión.
- Primo como herramienta de descubrimiento.
- Entrada en producción en 2019.
- Funciones del Buscador.
- Mi cuenta.
- Reservas, renovaciones y solicitudes.
- Localización física y mapas.
- Bibliografías recomendadas.
- Impacto en usuarios y personal.

---

## 17. Tabla final de repaso

| Concepto | Definición breve | Ejemplo UAH |
|---|---|---|
| SIGB | Sistema tradicional de gestión bibliotecaria | Sistemas anteriores a Alma |
| LSP | Plataforma moderna de servicios bibliotecarios | Alma |
| Herramienta de descubrimiento | Interfaz de búsqueda integrada | Primo / Buscador UAH |
| Buscador | Punto de acceso a recursos de la Biblioteca | Todo, colección impresa, colección electrónica, e_Buah, Madroño |
| Mi cuenta | Área personal del usuario | Préstamos, solicitudes, renovaciones |
| Facetas | Filtros para refinar resultados | Fecha, autor, tipo de recurso, disponibilidad |
| Registro detallado | Vista completa de un resultado | Disponibilidad, signatura, acceso electrónico |
| Localización en mapa | Ubicación del libro en biblioteca | Mapas por CDU |
| Alma | Gestión interna | Adquisiciones, préstamo, metadatos, recursos electrónicos |
| Primo | Descubrimiento público | Búsqueda y acceso del usuario |

---

## 18. Glosario

| Término | Definición |
|---|---|
| **LSP** | Library Services Platform; plataforma de servicios bibliotecarios de nueva generación. |
| **SIGB** | Sistema Integrado de Gestión Bibliotecaria. |
| **OPAC** | Catálogo público de acceso en línea. |
| **Discovery tool** | Herramienta de descubrimiento que permite búsqueda integrada. |
| **Alma** | Plataforma de Servicios Bibliotecarios usada por la Biblioteca UAH. |
| **Primo** | Herramienta de descubrimiento usada como base del Buscador UAH. |
| **Buscador UAH** | Interfaz pública de búsqueda de recursos de la Biblioteca UAH. |
| **Faceta** | Filtro que permite refinar una búsqueda. |
| **Metadato** | Dato que describe un recurso documental. |
| **Texto completo** | Acceso al contenido íntegro de un recurso digital. |
| **Interoperabilidad** | Capacidad de sistemas distintos para intercambiar datos y funcionar conjuntamente. |
| **SaaS** | Software as a Service; software prestado como servicio en la nube. |
| **API** | Interfaz que permite que distintos sistemas se comuniquen. |
| **Link resolver** | Sistema que conecta registros bibliográficos con acceso al texto completo. |

---

## 19. Referencias

### Convocatoria y Biblioteca UAH

- Universidad de Alcalá. Convocatoria Escala Técnica Auxiliar de Archivos y Bibliotecas. Anexo I, Tema 19.  
  https://www.uah.es/export/sites/uah/es/empleo-publico/PAS/.galleries/Funcionario/2025/E.-Tec.-Aux.-Archivos-y-B.-Publicacion-BOE-14.10.25.pdf

- Biblioteca de la Universidad de Alcalá. Página principal y Buscador.  
  https://biblioteca.uah.es/

- Biblioteca de la Universidad de Alcalá. Guía de Buscador.  
  https://uah-es.libguides.com/guia-buscador

- Biblioteca de la Universidad de Alcalá. Guía de Buscador: búsquedas.  
  https://uah-es.libguides.com/guia-buscador/tipos-busqueda

- Biblioteca de la Universidad de Alcalá. Guía de Buscador: Mi cuenta.  
  https://uah-es.libguides.com/guia-buscador/mi-cuenta

- Biblioteca de la Universidad de Alcalá. Guía de Buscador: página de resultados.  
  https://uah-es.libguides.com/guia-buscador/pagina-resultados

- Biblioteca de la Universidad de Alcalá. Guía de Buscador: registro detallado.  
  https://uah-es.libguides.com/c.php?g=668135&p=4823690

- Biblioteca de la Universidad de Alcalá. Guía de Buscador: herramientas de búsqueda.  
  https://uah-es.libguides.com/guia-buscador/herramientas

- Biblioteca de la Universidad de Alcalá. Bibliografías recomendadas en Buscador.  
  https://uah-es.libguides.com/guia-buscador/bibliografiarecomendada

- Biblioteca de la Universidad de Alcalá. Buscador: localización de libros en mapa.  
  https://biblioteca.uah.es/ayuda/autoayuda/noticias/Buscador-encontrar-un-libro-con-la-nueva-opcion-localizar-en-el-mapa-de-cada-biblioteca/

### Alma, Primo y planificación UAH

- Biblioteca UAH. Acta de la Comisión de Biblioteca, 27 de marzo de 2019. Entrada en producción de ALMA y PRIMO.  
  https://biblioteca.uah.es/export/sites/biblioteca/.galleries/Galeria-Documentos-Biblioteca/ActaComisionBCA-20190327.pdf

- Biblioteca UAH. Plan Estratégico 2018-2022. Implantación y optimización de ALMA y PRIMO.  
  https://biblioteca.uah.es/export/sites/biblioteca/.galleries/Galeria-Documentos-Calidad/plan_2018-2022.pdf

- Biblioteca UAH. Memoria EFQM 2019. Referencias a la Plataforma de Servicios Bibliotecarios ALMA y la herramienta de descubrimiento PRIMO.  
  https://biblioteca.uah.es/export/sites/biblioteca/.galleries/Galeria-Documentos-Calidad/MEMORIA_EFQM_BUAH_2019.pdf

- Biblioteca UAH. Memoria EFQM 2019, anexo. Actividades de implementación ALMA y PRIMO.  
  https://biblioteca.uah.es/export/sites/biblioteca/.galleries/Galeria-Documentos-Calidad/MEMORIA_EFQM_BUAH_2019_anexo.pdf

- Biblioteca UAH. Procesos del Servicio de Biblioteca. Referencias a ALMA y PRIMO en procesos internos.  
  https://biblioteca.uah.es/conoce-la-biblioteca/estrategia-y-calidad/procesos-del-servicio

### Referencias técnicas de apoyo

- Ex Libris. Alma Library Services Platform.  
  https://exlibrisgroup.com/products/alma-library-services-platform/

- Ex Libris. Primo discovery service.  
  https://exlibrisgroup.com/products/primo-discovery-service/

- Breeding, Marshall. Library Services Platforms: A maturing genre of products. Library Technology Reports.  
  https://librarytechnology.org/
