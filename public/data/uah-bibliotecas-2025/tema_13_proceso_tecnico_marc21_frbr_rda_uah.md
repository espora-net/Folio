# Tema 13. Proceso técnico de fondos documentales. Formatos de intercambio bibliográfico MARC 21, FRBR y RDA

**Convocatoria:** Escala Técnica Auxiliar de Archivos y Bibliotecas de la Universidad de Alcalá.  
**Programa oficial:** Tema 13: “Proceso técnico de fondos documentales. Formatos de intercambio bibliográfico MARC 21, FRBR y RDA.”  
**Objetivo de estudio:** comprender qué operaciones componen el proceso técnico de los fondos documentales en una biblioteca universitaria y dominar el papel de MARC 21, FRBR y RDA en la descripción, intercambio, normalización y recuperación de la información bibliográfica.

---

## 1. Esquema de estudio

1. Concepto de proceso técnico.
2. Finalidad del proceso técnico en una biblioteca universitaria.
3. Fases principales:
   - recepción y comprobación;
   - registro o inventario;
   - sellado, magnetización o protección;
   - catalogación descriptiva;
   - elección y normalización de puntos de acceso;
   - análisis documental;
   - clasificación;
   - indización y materias;
   - signatura topográfica;
   - tejuelado, códigos de barras, RFID y preparación física;
   - integración en catálogo, descubridor y servicios al usuario.
4. Normalización bibliográfica.
5. MARC 21:
   - definición;
   - estructura del registro;
   - campos, indicadores y subcampos;
   - campos más relevantes;
   - registros bibliográficos, de autoridad y de fondos.
6. FRBR:
   - finalidad;
   - entidades, atributos y relaciones;
   - grupos de entidades;
   - tareas del usuario;
   - modelo WEMI: Obra, Expresión, Manifestación, Ítem.
7. RDA:
   - concepto;
   - relación con FRBR, FRAD y LRM;
   - diferencia entre norma de contenido y formato de codificación;
   - elementos RDA principales;
   - aplicación práctica en MARC 21.
8. Relación entre MARC 21, FRBR y RDA.
9. Aplicación práctica a bibliotecas universitarias.
10. Preguntas tipo test y repaso final.

---

## 2. Concepto de proceso técnico

El **proceso técnico de fondos documentales** es el conjunto de operaciones bibliotecarias mediante las cuales los documentos que ingresan en una biblioteca se identifican, describen, organizan, clasifican, preparan físicamente y ponen a disposición de los usuarios a través del catálogo, los sistemas de descubrimiento y los servicios bibliotecarios.

Su finalidad es transformar un documento adquirido o recibido en un recurso **localizable, recuperable, identificable, accesible y gestionable** dentro del sistema bibliotecario.

En una biblioteca universitaria, el proceso técnico cumple una doble función:

- **Función interna:** permite controlar la colección, conocer qué se tiene, dónde está, en qué estado se encuentra y bajo qué condiciones puede circular.
- **Función externa o de servicio:** permite que estudiantes, docentes, investigadores y personal de administración encuentren, identifiquen, seleccionen y obtengan los documentos que necesitan.

El proceso técnico no se limita a “catalogar”. Catalogar es una parte esencial, pero el proceso completo incluye operaciones administrativas, intelectuales, normativas, tecnológicas y físicas.

---

## 3. Finalidad del proceso técnico

El proceso técnico persigue los siguientes objetivos:

### 3.1. Identificación unívoca de los documentos

Cada recurso debe distinguirse de otros recursos similares. Por ejemplo, dos ediciones distintas de un mismo manual universitario pueden tener el mismo título y autor, pero diferente edición, editorial, fecha, ISBN, extensión, colección o soporte.

### 3.2. Normalización

La descripción debe seguir reglas compartidas para que los registros sean coherentes, interoperables y reutilizables. La normalización permite el intercambio de registros entre bibliotecas, catálogos colectivos y redes cooperativas.

### 3.3. Recuperación de la información

El catálogo debe permitir buscar por autor, título, materia, editorial, fecha, colección, ISBN, tipo de documento, ubicación, disponibilidad y otros criterios.

### 3.4. Organización física y lógica de la colección

El proceso técnico asigna signaturas, localizaciones, códigos de barras o identificadores RFID. Esto permite ordenar la colección en libre acceso o en depósito y facilita el préstamo, la devolución, el inventario y el expurgo.

### 3.5. Cooperación bibliotecaria

La existencia de normas comunes como MARC 21 y RDA facilita que las bibliotecas compartan registros y reduzcan duplicidades. En el ámbito universitario, esto es esencial para catálogos colectivos, préstamo interbibliotecario, consorcios y redes como REBIUN o Madroño.

---

## 4. Fases del proceso técnico de fondos documentales

Aunque cada biblioteca puede adaptar sus flujos de trabajo, las fases habituales son las siguientes.

---

### 4.1. Recepción y comprobación

Es la primera fase tras la adquisición, donación, canje, depósito o cualquier otra vía de ingreso.

Se comprueba:

- que el documento recibido coincide con el pedido;
- que el número de ejemplares es correcto;
- que no existen defectos físicos;
- que los datos bibliográficos coinciden con la factura, albarán o expediente;
- que el documento no está duplicado, salvo que se haya solicitado expresamente un segundo ejemplar;
- que la adquisición se ajusta a la política de gestión de la colección.

En el caso de recursos electrónicos, la comprobación puede incluir:

- activación de licencia;
- URL o enlace de acceso;
- cobertura temporal;
- número de usuarios simultáneos;
- condiciones de uso;
- autenticación mediante IP, proxy, SSO o identidad institucional;
- incorporación a herramientas de descubrimiento.

---

### 4.2. Registro o inventario

El registro consiste en asignar al documento un número de control o inventario que acredita su incorporación a la colección.

En fondos físicos suele incluir:

- número de registro;
- fecha de ingreso;
- procedencia;
- precio;
- proveedor;
- tipo de adquisición;
- ubicación;
- ejemplar o volumen;
- código de barras o identificador de ejemplar.

En sistemas bibliotecarios modernos, el registro suele quedar vinculado al **registro de ejemplar** o **ítem** dentro de la plataforma de servicios bibliotecarios.

Conviene distinguir:

| Nivel | Qué representa | Ejemplo |
|---|---|---|
| Registro bibliográfico | Describe la manifestación documental | Una edición concreta de un libro |
| Registro de ejemplar o ítem | Describe la copia concreta que posee la biblioteca | El ejemplar situado en la Biblioteca de Ciencias |
| Registro de fondos | Describe existencias, especialmente en publicaciones seriadas | Volúmenes disponibles de una revista |
| Registro de autoridad | Controla formas normalizadas de nombres, títulos o materias | “Cervantes Saavedra, Miguel de, 1547-1616” |

---

### 4.3. Sellado, marcado y protección

En los documentos físicos pueden realizarse operaciones de identificación institucional y protección:

- sello de propiedad;
- código de barras;
- etiqueta RFID;
- banda antihurto;
- tejuelos provisionales o definitivos;
- protección de cubiertas;
- indicaciones de uso restringido;
- marcas específicas para fondo antiguo, referencia, depósito o préstamo excluido.

Estas operaciones deben equilibrar identificación, seguridad, conservación y respeto al documento. En fondo antiguo o patrimonial, el sellado y marcado deben ser mínimos, reversibles cuando sea posible y compatibles con criterios de conservación.

---

### 4.4. Catalogación descriptiva

La **catalogación descriptiva** consiste en describir formalmente el documento para identificarlo y diferenciarlo. Incluye datos como:

- título;
- mención de responsabilidad;
- edición;
- publicación, producción o distribución;
- descripción física;
- serie;
- identificadores normalizados;
- notas;
- tipo de contenido, medio y soporte;
- relaciones con otras obras o expresiones.

La catalogación descriptiva responde a preguntas como:

- ¿Qué documento es?
- ¿Quién lo ha creado?
- ¿Qué edición o versión es?
- ¿Dónde y cuándo se publicó?
- ¿En qué soporte se presenta?
- ¿Forma parte de una colección?
- ¿Tiene relación con otra obra?

En el entorno actual, la catalogación descriptiva se basa cada vez más en **RDA**, mientras que la codificación y el intercambio se realizan con frecuencia en **MARC 21**.

---

### 4.5. Elección y normalización de puntos de acceso

Los puntos de acceso permiten recuperar registros por autores, entidades, títulos uniformes, materias u otros elementos.

Ejemplos:

- persona: “García Márquez, Gabriel, 1927-2014”;
- entidad: “Universidad de Alcalá”;
- título preferido: “Don Quijote de la Mancha”;
- materia: “Bibliotecas universitarias”;
- congreso: “Congreso Internacional de Bibliotecas Universitarias”.

La normalización evita variantes innecesarias. Por ejemplo:

- “Miguel de Cervantes”
- “Cervantes Saavedra”
- “Cervantes”
- “Cervantes Saavedra, Miguel de, 1547-1616”

El control de autoridades permite agrupar bajo una forma autorizada todas las variantes y relaciones.

---

### 4.6. Análisis documental

El análisis documental representa el contenido intelectual del documento. Incluye:

- resumen o nota de contenido;
- asignación de materias;
- palabras clave;
- clasificación;
- identificación de área temática;
- relación con planes de estudio o investigación.

En una biblioteca universitaria es especialmente importante porque permite conectar la colección con titulaciones, departamentos, líneas de investigación y necesidades docentes.

---

### 4.7. Clasificación

La clasificación asigna a cada documento una posición dentro de un sistema ordenado del conocimiento. Puede utilizarse para:

- agrupar documentos por materias;
- ordenar físicamente la colección;
- construir signaturas topográficas;
- facilitar la navegación en libre acceso.

Sistemas habituales:

- CDU, Clasificación Decimal Universal;
- DDC, Dewey Decimal Classification;
- LCC, Library of Congress Classification;
- clasificaciones locales adaptadas.

La clasificación se estudia con más detalle en el Tema 15, pero forma parte operativa del proceso técnico.

---

### 4.8. Indización y materias

La indización consiste en asignar términos que representen el contenido del documento. Puede realizarse mediante:

- listas de encabezamientos de materia;
- tesauros;
- vocabularios controlados;
- palabras clave libres;
- identificadores de materias enlazadas.

La diferencia básica es:

| Operación | Finalidad |
|---|---|
| Clasificación | Situar el documento en una estructura jerárquica de conocimiento |
| Indización | Representar los temas concretos por los que puede recuperarse |
| Resumen | Describir brevemente el contenido |
| Catalogación descriptiva | Identificar formalmente el recurso |

---

### 4.9. Signatura topográfica

La signatura topográfica es el código que indica la ubicación física del documento en la biblioteca.

Puede incluir:

- número de clasificación;
- letras del autor;
- año;
- volumen;
- ejemplar;
- colección;
- sala o depósito;
- código de biblioteca.

Ejemplo simplificado:

```text
025.3
GAR
2024
```

La signatura permite pasar de la información bibliográfica a la localización física del ejemplar.

---

### 4.10. Preparación física

Incluye las operaciones finales antes de poner el documento en servicio:

- impresión y colocación de tejuelos;
- código de barras;
- RFID;
- etiqueta de localización;
- protección física;
- revisión de estado;
- comprobación de préstamo;
- colocación en estantería o depósito.

---

### 4.11. Integración en catálogo, descubridor y servicios

El proceso técnico culmina cuando el recurso queda visible y operativo para los usuarios:

- aparece en el catálogo;
- aparece en el buscador o herramienta de descubrimiento;
- se muestra su disponibilidad;
- se ofrece su ubicación;
- se permite la reserva o el préstamo;
- se enlaza el texto completo si es electrónico;
- se integra con servicios de préstamo interbibliotecario, acceso al documento o bibliografía recomendada.

---

## 5. Normalización bibliográfica

La normalización bibliográfica es el conjunto de reglas, formatos, identificadores y prácticas que permiten describir documentos de forma coherente.

Incluye:

- normas de contenido: indican qué datos registrar y cómo formularlos;
- formatos de codificación: indican cómo estructurar esos datos para que puedan ser procesados por máquinas;
- identificadores: ISBN, ISSN, DOI, ISNI, ORCID, etc.;
- vocabularios controlados;
- modelos conceptuales;
- reglas de puntuación, transcripción y abreviaturas;
- políticas locales de aplicación.

En este tema son centrales tres elementos:

| Elemento | Naturaleza | Función principal |
|---|---|---|
| FRBR | Modelo conceptual | Explica entidades, relaciones y tareas del usuario |
| RDA | Norma de contenido | Indica cómo describir recursos y establecer accesos |
| MARC 21 | Formato de codificación e intercambio | Estructura los datos bibliográficos para sistemas automatizados |

Una fórmula útil para memorizar:

> **FRBR piensa el universo bibliográfico; RDA dice qué datos registrar; MARC 21 codifica esos datos para que los sistemas los intercambien.**

---

## 6. MARC 21

### 6.1. Concepto

**MARC** significa *Machine-Readable Cataloging*, es decir, catalogación legible por máquina. **MARC 21** es un conjunto de formatos para representar e intercambiar información bibliográfica y de autoridad en sistemas automatizados.

La Biblioteca Nacional de España señala que MARC busca la normalización, compatibilidad y transferencia de información bibliográfica legible por ordenador, y que permite la cooperación y la compartición de recursos y servicios entre bibliotecas.

MARC 21 no es una regla de catalogación, sino un **formato de codificación**. Esto significa que no decide por sí mismo cómo debe describirse un recurso, sino en qué campos y subcampos se almacenan los datos resultantes de la catalogación.

---

### 6.2. Función de MARC 21

MARC 21 sirve para:

- almacenar registros bibliográficos;
- intercambiar registros entre sistemas;
- importar y exportar datos;
- reutilizar registros de otras bibliotecas;
- alimentar catálogos colectivos;
- facilitar la migración entre plataformas;
- permitir búsquedas estructuradas;
- codificar datos descriptivos, puntos de acceso, materias, clasificación, notas y localizaciones electrónicas.

---

### 6.3. Tipos de formatos MARC 21

MARC 21 comprende varios formatos:

| Formato MARC 21 | Uso |
|---|---|
| Bibliográfico | Describe recursos documentales |
| Autoridad | Controla nombres, títulos uniformes, materias y series |
| Fondos | Describe existencias de una biblioteca, especialmente publicaciones seriadas |
| Clasificación | Codifica datos de esquemas de clasificación |
| Información comunitaria | Describe servicios, organizaciones o eventos de interés comunitario |

Para el Tema 13, el más relevante es el **Formato MARC 21 para registros bibliográficos**, aunque conviene conocer la relación con registros de autoridad y fondos.

---

### 6.4. Estructura general de un registro MARC

Un registro MARC contiene:

1. **Cabecera o líder**
2. **Directorio**
3. **Campos de control**
4. **Campos de datos variables**
5. **Indicadores**
6. **Subcampos**

#### Cabecera o líder

Es una cadena fija de caracteres al comienzo del registro. Contiene información técnica sobre el registro:

- longitud del registro;
- tipo de registro;
- nivel bibliográfico;
- estado del registro;
- esquema de codificación.

#### Directorio

Indica dónde empieza cada campo y cuánto ocupa. Es una estructura técnica que permite que el sistema lea el registro.

#### Campos de control

Son campos numéricos de la serie 00X. No tienen indicadores ni subcampos.

Ejemplos:

| Campo | Función |
|---|---|
| 001 | Número de control |
| 003 | Identificador del número de control |
| 005 | Fecha y hora de última transacción |
| 008 | Códigos de longitud fija |

#### Campos de datos variables

Son campos con etiquetas numéricas de tres cifras, indicadores y subcampos.

Ejemplo:

```text
245 10 $a Introducción a la biblioteconomía / $c José Martínez.
```

En este ejemplo:

- **245** es la etiqueta del campo de título;
- **1** y **0** son indicadores;
- **$a** contiene el título;
- **$c** contiene la mención de responsabilidad.

---

### 6.5. Etiquetas, indicadores y subcampos

#### Etiqueta

Código de tres cifras que identifica el tipo de dato.

Ejemplos:

| Etiqueta | Significado |
|---|---|
| 020 | ISBN |
| 041 | Código de lengua |
| 080 | CDU |
| 100 | Punto de acceso principal de persona |
| 110 | Punto de acceso principal de entidad |
| 245 | Título y mención de responsabilidad |
| 250 | Edición |
| 264 | Producción, publicación, distribución, fabricación o copyright |
| 300 | Descripción física |
| 336 | Tipo de contenido |
| 337 | Tipo de medio |
| 338 | Tipo de soporte |
| 490 | Mención de serie |
| 500 | Nota general |
| 504 | Nota de bibliografía |
| 505 | Nota de contenido |
| 520 | Resumen |
| 650 | Materia |
| 700 | Punto de acceso secundario de persona |
| 710 | Punto de acceso secundario de entidad |
| 830 | Punto de acceso secundario de serie |
| 856 | Localización y acceso electrónico |

#### Indicadores

Son dos posiciones tras la etiqueta que modifican el significado del campo. Pueden ser números, letras o blancos.

Ejemplo:

```text
245 14 $a Las bibliotecas universitarias en España
```

El segundo indicador del campo 245 puede indicar cuántos caracteres iniciales no alfabetizan, por ejemplo artículos como “El”, “La”, “Los”, “Las”.

#### Subcampos

Dividen el contenido de un campo en partes más específicas.

Ejemplo:

```text
260 ## $a Madrid : $b Editorial Académica, $c 2024.
```

- `$a` lugar de publicación;
- `$b` editor;
- `$c` fecha.

En la práctica RDA se utiliza con frecuencia el campo **264** en lugar del 260 para publicación, producción, distribución, fabricación y copyright.

---

### 6.6. Bloques principales de campos MARC 21 bibliográfico

| Rango | Contenido |
|---|---|
| 00X | Información de control |
| 01X-09X | Números, códigos e identificadores |
| 1XX | Punto de acceso principal |
| 20X-24X | Títulos y campos relacionados |
| 25X-28X | Edición, publicación, distribución |
| 3XX | Descripción física y características RDA |
| 4XX | Series |
| 5XX | Notas |
| 6XX | Materias |
| 7XX | Puntos de acceso secundarios |
| 8XX | Series secundarias y fondos relacionados |
| 856 | Localización y acceso electrónico |

---

### 6.7. Ejemplo simplificado de registro MARC 21

```text
=LDR  00000nam a2200000 i 4500
=001  000123456
=005  20260201093000.0
=008  260201s2024    sp a     b    001 0 spa d
=020  ## $a 9788410000000
=040  ## $a UAH $b spa $e rda $c UAH
=080  ## $a 025.3
=100  1# $a Martínez, Ana, $e autora.
=245  10 $a Catalogación y metadatos en bibliotecas universitarias / $c Ana Martínez.
=250  ## $a 2.ª edición.
=264  #1 $a Madrid : $b Editorial Universitaria, $c 2024.
=300  ## $a 245 páginas : $b ilustraciones ; $c 24 cm
=336  ## $a texto $b txt $2 rdacontent
=337  ## $a sin mediación $b n $2 rdamedia
=338  ## $a volumen $b nc $2 rdacarrier
=504  ## $a Incluye referencias bibliográficas e índice.
=650  #4 $a Catalogación bibliográfica.
=650  #4 $a Bibliotecas universitarias.
=700  1# $a López, Carlos, $e prologuista.
=852  ## $a UAH-BIB $b Ciencias $h 025.3 MAR
```

Este ejemplo muestra la relación entre:

- **RDA**, que orienta la descripción y los elementos registrados;
- **MARC 21**, que codifica esos elementos;
- **proceso técnico**, que convierte el libro en un recurso recuperable y localizable.

---

### 6.8. MARC 21 y recursos electrónicos

En recursos electrónicos, el campo **856** es especialmente importante porque codifica la localización y el acceso electrónico.

Ejemplo:

```text
856 40 $u https://ejemplo.editorial.com/libro/123 $y Acceso al texto completo
```

El 856 puede contener:

- URL;
- texto de enlace;
- condiciones de acceso;
- información de acceso remoto;
- relación con el recurso descrito.

En bibliotecas universitarias, este campo es clave para libros electrónicos, revistas electrónicas, bases de datos, repositorios y objetos digitales.

---

### 6.9. MARC 21 y control de autoridades

El control de autoridades se apoya en registros específicos que normalizan formas autorizadas.

Ejemplo de registro bibliográfico:

```text
100 1# $a Cervantes Saavedra, Miguel de, $d 1547-1616, $e autor.
```

El registro de autoridad asociado puede incluir:

- forma autorizada;
- formas variantes;
- fechas;
- relaciones;
- notas;
- identificadores;
- fuentes consultadas.

El control de autoridades mejora la recuperación porque agrupa variantes bajo una forma normalizada.

---

## 7. FRBR

### 7.1. Concepto

**FRBR** significa *Functional Requirements for Bibliographic Records*, en español **Requisitos Funcionales de los Registros Bibliográficos**. Es un modelo conceptual desarrollado por IFLA para explicar qué información debe proporcionar un registro bibliográfico en relación con las necesidades de los usuarios.

FRBR no es un formato de codificación ni una regla de catalogación. Es un **modelo conceptual entidad-relación** que analiza el universo bibliográfico a través de entidades, atributos y relaciones.

---

### 7.2. Finalidad de FRBR

FRBR busca:

- clarificar qué funciones debe cumplir un registro bibliográfico;
- relacionar los datos bibliográficos con las tareas del usuario;
- mejorar la estructura lógica de los catálogos;
- distinguir niveles bibliográficos que antes podían mezclarse;
- reforzar la importancia de las relaciones;
- facilitar la evolución hacia catálogos más navegables y conectados.

El informe FRBR pretendía delimitar las funciones del registro bibliográfico respecto a distintos soportes, aplicaciones y necesidades de usuarios. Su enfoque abarca no solo elementos descriptivos, sino también puntos de acceso, clasificación, notas y otros elementos organizativos.

---

### 7.3. Entidades FRBR

FRBR organiza las entidades en tres grupos.

#### Grupo 1: productos de creación intelectual o artística

Son las entidades más conocidas:

| Entidad | Definición práctica | Ejemplo |
|---|---|---|
| Obra | Creación intelectual o artística abstracta | *Don Quijote de la Mancha* |
| Expresión | Realización intelectual de una obra | Texto original en español, traducción al inglés, audiolibro |
| Manifestación | Materialización física o digital de una expresión | Edición de Cátedra de 2015 |
| Ítem | Ejemplar concreto de una manifestación | El ejemplar con código de barras X de la Biblioteca UAH |

Este modelo se conoce como **WEMI**, por sus siglas en inglés: *Work, Expression, Manifestation, Item*.

#### Grupo 2: responsables

Incluye las entidades responsables de la creación, producción, distribución o custodia.

En FRBR original:

- persona;
- entidad corporativa.

En desarrollos posteriores se incorporan o reformulan otras entidades, como familia en FRAD/LRM.

#### Grupo 3: materias

Incluye entidades que pueden ser materia de una obra:

- concepto;
- objeto;
- acontecimiento;
- lugar.

Además, entidades de los grupos 1 y 2 también pueden ser materias.

---

### 7.4. Modelo WEMI con ejemplo

Tomemos como ejemplo *Don Quijote de la Mancha*.

| Nivel | Ejemplo |
|---|---|
| Obra | *Don Quijote de la Mancha* como creación de Cervantes |
| Expresión | Texto original en español; traducción al inglés; adaptación teatral; audiolibro |
| Manifestación | Edición impresa de una editorial concreta, con ISBN concreto |
| Ítem | Ejemplar físico conservado en una biblioteca concreta |

Otro ejemplo universitario:

| Nivel | Ejemplo |
|---|---|
| Obra | Manual de introducción a la química orgánica |
| Expresión | Texto en español de la 5.ª edición |
| Manifestación | Libro impreso publicado en Madrid en 2023 |
| Ítem | Ejemplar prestable ubicado en la Biblioteca de Ciencias |

La utilidad del modelo es que permite agrupar resultados: todas las traducciones, ediciones, soportes y ejemplares pueden relacionarse con una misma obra.

---

### 7.5. Tareas del usuario en FRBR

FRBR identifica cuatro tareas genéricas del usuario:

| Tarea | Significado |
|---|---|
| Encontrar | Localizar recursos que respondan a una búsqueda |
| Identificar | Confirmar que el recurso encontrado es el buscado |
| Seleccionar | Elegir el recurso más adecuado |
| Obtener | Acceder al recurso o conseguirlo |

Ejemplo:

1. **Encontrar:** busco “manual de derecho administrativo”.
2. **Identificar:** verifico autor, edición y año.
3. **Seleccionar:** elijo la edición más reciente o la disponible en línea.
4. **Obtener:** accedo al PDF, lo reservo o localizo el ejemplar en sala.

Estas tareas son esenciales en bibliotecas universitarias, porque el usuario necesita no solo saber que un documento existe, sino acceder a la versión adecuada para su necesidad académica.

---

### 7.6. Atributos y relaciones

FRBR se basa en tres componentes:

- **Entidades:** objetos de interés bibliográfico.
- **Atributos:** características de esas entidades.
- **Relaciones:** vínculos entre entidades.

Ejemplos de atributos:

| Entidad | Atributos |
|---|---|
| Obra | título de la obra, forma de la obra, fecha, materia |
| Expresión | lengua, forma de expresión, fecha, resumen |
| Manifestación | título propiamente dicho, editor, fecha, soporte, ISBN |
| Ítem | identificador, procedencia, estado físico, restricciones de acceso |

Ejemplos de relaciones:

- obra creada por persona;
- obra realizada mediante expresión;
- expresión materializada en manifestación;
- manifestación ejemplificada por ítem;
- obra adaptada de otra obra;
- obra traducida a otra expresión;
- manifestación reproducida por otra manifestación.

---

### 7.7. Importancia de FRBR

FRBR es importante porque cambió el enfoque tradicional del catálogo:

- de registros planos a estructuras relacionales;
- de descripción aislada a redes de relaciones;
- de documentos sueltos a familias bibliográficas;
- de catálogo como inventario a catálogo como herramienta de navegación intelectual.

FRBR influyó directamente en RDA y en modelos posteriores como IFLA LRM. También está en la base de enfoques de datos enlazados bibliográficos y de iniciativas como BIBFRAME.

---

## 8. RDA

### 8.1. Concepto

**RDA** significa *Resource Description and Access*, en español **Recursos: Descripción y Acceso**. Es un estándar internacional de catalogación diseñado para describir y dar acceso a recursos en el entorno digital.

RDA proporciona instrucciones y pautas para registrar datos bibliográficos y de autoridad. Está pensado para todo tipo de recursos:

- libros impresos;
- libros electrónicos;
- revistas;
- mapas;
- música;
- audiovisuales;
- recursos digitales;
- objetos;
- materiales mixtos;
- recursos continuados.

La BNE describe RDA como un estándar para describir y dar acceso a recursos, diseñado para el mundo digital, que cubre todos los tipos de contenido y medios.

---

### 8.2. RDA como norma de contenido

RDA es una **norma de contenido**, no un formato de codificación.

Esto significa que RDA indica:

- qué elementos registrar;
- cómo transcribir determinados datos;
- cómo formular relaciones;
- cómo identificar obras, expresiones, manifestaciones e ítems;
- cómo registrar agentes y puntos de acceso;
- cómo relacionar recursos entre sí.

Pero RDA no obliga a usar un formato concreto. Puede codificarse en:

- MARC 21;
- RDF;
- BIBFRAME;
- esquemas propios;
- sistemas de datos enlazados.

En la práctica bibliotecaria actual, RDA se aplica con frecuencia dentro de registros MARC 21.

---

### 8.3. RDA y modelos conceptuales

RDA se apoya en modelos conceptuales internacionales. Históricamente se basó en:

- FRBR, para registros bibliográficos;
- FRAD, para datos de autoridad;
- FRSAD, para autoridades de materia.

La evolución posterior se orienta hacia IFLA LRM, que consolida modelos anteriores.

La idea central es que la descripción bibliográfica debe estar estructurada en torno a entidades, atributos y relaciones, no solo en torno a una ficha textual.

---

### 8.4. Principales rasgos de RDA

RDA se caracteriza por:

- estar orientada al entorno digital;
- servir para todo tipo de recursos;
- separar contenido, medio y soporte;
- favorecer la identificación de entidades;
- dar importancia a las relaciones;
- facilitar el uso de datos en entornos web y de datos enlazados;
- reducir abreviaturas innecesarias;
- permitir mayor transcripción tal como aparece en la fuente;
- ser independiente de un formato concreto de codificación.

---

### 8.5. Diferencias entre AACR2, ISBD y RDA

Aunque no siempre entra en detalle en pruebas de auxiliar, conviene comprender la evolución:

| Aspecto | AACR2 / tradición anterior | RDA |
|---|---|---|
| Entorno | Catálogo impreso y automatización inicial | Entorno digital y datos reutilizables |
| Enfoque | Reglas para descripción bibliográfica | Elementos, entidades y relaciones |
| Soportes | Categorías más ligadas al material | Contenido, medio y soporte separados |
| Abreviaturas | Uso frecuente de abreviaturas latinas | Menor uso de abreviaturas |
| Relaciones | Menos explícitas | Relaciones más importantes |
| Modelo conceptual | No plenamente FRBRizado | Basado en modelos IFLA |

ISBD sigue siendo importante porque proporciona una estructura normalizada de descripción bibliográfica y puntuación, pero RDA introduce un enfoque más orientado a datos.

---

### 8.6. Elementos RDA frecuentes

Algunos elementos habituales en descripción RDA son:

| Elemento | Ejemplo |
|---|---|
| Título propiamente dicho | *Historia de las bibliotecas universitarias* |
| Mención de responsabilidad | María López |
| Mención de edición | 3.ª edición |
| Lugar de publicación | Madrid |
| Nombre del editor | Editorial Universitaria |
| Fecha de publicación | 2024 |
| Extensión | 350 páginas |
| Dimensiones | 24 cm |
| Tipo de contenido | texto |
| Tipo de medio | sin mediación |
| Tipo de soporte | volumen |
| Identificador de la manifestación | ISBN |
| Nota de contenido | Incluye bibliografía e índice |
| Relación de creador | autor |
| Relación de colaborador | editor, traductor, prologuista |

---

### 8.7. Campos MARC asociados a RDA

RDA se codifica a menudo en MARC 21 mediante campos específicos.

| Dato RDA | Campo MARC frecuente |
|---|---|
| Norma usada | 040 $e rda |
| Tipo de contenido | 336 |
| Tipo de medio | 337 |
| Tipo de soporte | 338 |
| Publicación | 264 #1 |
| Copyright | 264 #4 |
| Relaciones de agente | 100/700 con $e o $4 |
| Identificador | 020, 022, 024 |
| Nota de contenido | 505 |
| Resumen | 520 |
| Acceso electrónico | 856 |

Ejemplo:

```text
040 ## $a UAH $b spa $e rda $c UAH
336 ## $a texto $b txt $2 rdacontent
337 ## $a sin mediación $b n $2 rdamedia
338 ## $a volumen $b nc $2 rdacarrier
```

Estos campos hacen explícitos los tipos de contenido, medio y soporte, que son claves en RDA.

---

### 8.8. Contenido, medio y soporte

Uno de los cambios más reconocibles de RDA es la separación entre:

| Concepto | Pregunta | Ejemplo |
|---|---|---|
| Tipo de contenido | ¿Qué forma de comunicación contiene? | texto, imagen fija, música interpretada |
| Tipo de medio | ¿Qué dispositivo se necesita para acceder? | sin mediación, ordenador, audio |
| Tipo de soporte | ¿En qué soporte se presenta? | volumen, recurso en línea, disco de audio |

Ejemplos:

| Recurso | Contenido | Medio | Soporte |
|---|---|---|---|
| Libro impreso | texto | sin mediación | volumen |
| Libro electrónico | texto | ordenador | recurso en línea |
| CD musical | música interpretada | audio | disco de audio |
| DVD | imagen en movimiento bidimensional | vídeo | videodisco |
| Mapa impreso | imagen cartográfica | sin mediación | hoja |

---

## 9. Relación entre MARC 21, FRBR y RDA

La relación puede memorizarse así:

| Elemento | Pregunta que responde | Ejemplo |
|---|---|---|
| FRBR | ¿Cómo se organiza conceptualmente el universo bibliográfico? | Obra, expresión, manifestación, ítem |
| RDA | ¿Qué datos debo registrar y cómo los formulo? | título, creador, edición, soporte, relaciones |
| MARC 21 | ¿Dónde codifico esos datos en el registro? | 245, 100, 264, 336, 337, 338 |

Ejemplo aplicado:

Un libro impreso publicado en 2024:

- FRBR lo entiende como una **manifestación** de una **expresión** de una **obra**.
- RDA indica qué elementos registrar: título, responsabilidad, edición, publicación, extensión, tipo de contenido, medio y soporte.
- MARC 21 codifica esos datos: 245, 250, 264, 300, 336, 337, 338.

---

## 10. Aplicación en bibliotecas universitarias

En una biblioteca universitaria, el proceso técnico debe responder a necesidades específicas:

### 10.1. Apoyo a docencia

Los registros deben permitir localizar bibliografía básica y recomendada de asignaturas. Es importante diferenciar ediciones, formatos disponibles y número de ejemplares.

### 10.2. Apoyo a investigación

La descripción debe facilitar el acceso a monografías especializadas, revistas, bases de datos, tesis, actas de congresos, datos de investigación y recursos electrónicos.

### 10.3. Gestión de recursos electrónicos

El proceso técnico no se limita al libro impreso. Debe incluir:

- licencias;
- enlaces;
- paquetes editoriales;
- metadatos de proveedores;
- activación en descubridores;
- cobertura de revistas;
- acceso remoto;
- resolución de enlaces;
- estadísticas de uso.

### 10.4. Interoperabilidad

Las bibliotecas universitarias forman parte de redes y consorcios. Por ello, los registros deben ser interoperables con:

- catálogos colectivos;
- repositorios;
- plataformas de servicios bibliotecarios;
- herramientas de descubrimiento;
- sistemas de préstamo interbibliotecario;
- identificadores persistentes;
- datos enlazados.

### 10.5. Calidad del catálogo

La calidad del proceso técnico afecta directamente a:

- precisión de las búsquedas;
- reducción de duplicados;
- navegación por autores y materias;
- disponibilidad de ejemplares;
- uso de la colección;
- confianza de los usuarios;
- eficiencia del personal bibliotecario.

---

## 11. Errores frecuentes que conviene evitar

1. Confundir **RDA** con **MARC 21**.  
   RDA es una norma de contenido; MARC 21 es un formato de codificación.

2. Confundir **FRBR** con una regla de catalogación.  
   FRBR es un modelo conceptual.

3. Pensar que catalogar es solo copiar datos del libro.  
   La catalogación implica interpretación, normalización, relaciones y control de puntos de acceso.

4. Confundir manifestación e ítem.  
   La manifestación es una edición o publicación concreta; el ítem es el ejemplar que posee la biblioteca.

5. Creer que el proceso técnico termina con el registro bibliográfico.  
   También incluye ejemplares, signaturas, tejuelos, control de fondos, acceso electrónico y visibilidad en sistemas.

6. Olvidar los registros de autoridad.  
   Son esenciales para mantener la coherencia de autores, entidades, títulos y materias.

---

## 12. Cuadro comparativo final

| Concepto | Definición | Ejemplo | Función |
|---|---|---|---|
| Proceso técnico | Conjunto de operaciones para incorporar y describir documentos | Registro, catalogación, clasificación, tejuelado | Poner recursos en servicio |
| Catalogación | Descripción normalizada de un recurso | Título, autor, edición, publicación | Identificar y recuperar |
| Clasificación | Asignación de código temático | CDU 025.3 | Ordenar por materia |
| Indización | Asignación de materias | Bibliotecas universitarias | Recuperar por contenido |
| MARC 21 | Formato legible por máquina | 245 $a, 100 $a | Codificar e intercambiar |
| FRBR | Modelo conceptual | Obra, expresión, manifestación, ítem | Estructurar relaciones |
| RDA | Norma de contenido | Tipo de contenido, medio y soporte | Describir y dar acceso |

---

## 13. Preguntas tipo test

### 1. ¿Qué es MARC 21?

A. Una clasificación bibliográfica universal.  
B. Un formato para codificar e intercambiar información bibliográfica legible por máquina.  
C. Una norma de préstamo universitario.  
D. Una lista de encabezamientos de materia.

**Respuesta correcta:** B.

---

### 2. ¿Qué significa RDA?

A. Registro Digital de Autoridades.  
B. Reglas Documentales Automatizadas.  
C. Resource Description and Access.  
D. Repertorio de Datos Académicos.

**Respuesta correcta:** C.

---

### 3. ¿Qué entidad FRBR representa una copia concreta conservada por una biblioteca?

A. Obra.  
B. Expresión.  
C. Manifestación.  
D. Ítem.

**Respuesta correcta:** D.

---

### 4. ¿Cuál de los siguientes campos MARC 21 se utiliza habitualmente para el título?

A. 100.  
B. 245.  
C. 650.  
D. 856.

**Respuesta correcta:** B.

---

### 5. ¿Qué campo MARC 21 se usa para localización y acceso electrónico?

A. 020.  
B. 300.  
C. 650.  
D. 856.

**Respuesta correcta:** D.

---

### 6. ¿Cuál es la función principal de FRBR?

A. Codificar campos MARC.  
B. Establecer un modelo conceptual de entidades, atributos y relaciones bibliográficas.  
C. Regular el préstamo de documentos.  
D. Sustituir los códigos de barras.

**Respuesta correcta:** B.

---

### 7. En RDA, “texto”, “imagen fija” o “música interpretada” son ejemplos de:

A. Tipo de contenido.  
B. Tipo de medio.  
C. Tipo de soporte.  
D. Número de control.

**Respuesta correcta:** A.

---

### 8. En RDA, “volumen”, “recurso en línea” o “disco de audio” son ejemplos de:

A. Tipo de contenido.  
B. Tipo de medio.  
C. Tipo de soporte.  
D. Punto de acceso.

**Respuesta correcta:** C.

---

### 9. ¿Qué campo MARC 21 indica habitualmente que el registro está catalogado con RDA?

A. 040 $e rda.  
B. 245 $a rda.  
C. 650 $x rda.  
D. 856 $u rda.

**Respuesta correcta:** A.

---

### 10. ¿Cuál de estas secuencias representa correctamente el modelo WEMI?

A. Autor, título, editorial, año.  
B. Obra, expresión, manifestación, ítem.  
C. Registro, préstamo, devolución, expurgo.  
D. ISBN, ISSN, DOI, NIPO.

**Respuesta correcta:** B.

---

## 14. Resumen para memorizar

- El **proceso técnico** convierte documentos adquiridos en recursos identificados, descritos, organizados, localizables y disponibles.
- Incluye recepción, registro, catalogación, análisis documental, clasificación, indización, signatura, preparación física e integración en catálogo.
- **MARC 21** es un formato de codificación e intercambio bibliográfico legible por máquina.
- **FRBR** es un modelo conceptual que organiza el universo bibliográfico mediante entidades, atributos y relaciones.
- Las entidades principales de FRBR son **Obra, Expresión, Manifestación e Ítem**.
- Las tareas del usuario en FRBR son **encontrar, identificar, seleccionar y obtener**.
- **RDA** es una norma de contenido para describir y dar acceso a recursos.
- RDA se basa en modelos conceptuales y está diseñada para el entorno digital.
- RDA puede codificarse en MARC 21, pero no es MARC 21.
- En MARC 21, los campos 336, 337 y 338 reflejan la separación RDA entre contenido, medio y soporte.
- En bibliotecas universitarias, la calidad del proceso técnico repercute directamente en la docencia, la investigación, el acceso electrónico y la cooperación.

---

## 15. Referencias y fuentes de estudio

### Convocatoria oficial

- Universidad de Alcalá / BOE. **Resolución de 6 de octubre de 2025, de la Universidad de Alcalá, por la que se convocan pruebas selectivas para ingreso, por el sistema general de acceso libre, en la Escala Técnica Auxiliar de Archivos y Bibliotecas.** BOE núm. 247, 14 de octubre de 2025.  
  https://www.uah.es/export/sites/uah/es/empleo-publico/PAS/.galleries/Funcionario/2025/E.-Tec.-Aux.-Archivos-y-B.-Publicacion-BOE-14.10.25.pdf

### MARC 21

- Biblioteca Nacional de España. **MARC 21. Normas, estándares y políticas de proceso técnico.**  
  https://www.bne.es/es/perfiles/bibliotecarios/normas-estandares-politicas-bne-procesos-tecnicos/marc21

- Biblioteca Nacional de España. **MARC 21 para registros bibliográficos.**  
  https://www.bne.es/es/publicaciones/marc21-registros-bibliograficos

- Library of Congress. **MARC 21 Format for Bibliographic Data.**  
  https://www.loc.gov/marc/bibliographic/

- Library of Congress. **MARC 21 Format for Bibliographic Data: Introduction.**  
  https://www.loc.gov/marc/bibliographic/bdintro.html

- Library of Congress. **MARC 21 Concise Format for Bibliographic Data.**  
  https://www.loc.gov/marc/bibliographic/ecbdspa.html

### FRBR

- IFLA. **Functional Requirements for Bibliographic Records: Final Report.**  
  https://repository.ifla.org/items/54925d49-b08d-4aeb-807c-1b509ec40b55

- IFLA / Ministerio de Cultura. **Requisitos Funcionales de los Registros Bibliográficos: Informe final. Traducción española.**  
  https://www.ifla.org/files/assets/cataloguing/frbr/frbr-es.pdf

- IFLA / Ministerio de Cultura. **Requisitos Funcionales de los Registros Bibliográficos: Informe final con adenda 2016.**  
  https://www.ifla.org/files/assets/cataloguing/frbr/frbr-es-with-addenda_2016.pdf

### RDA

- Biblioteca Nacional de España. **RDA.**  
  https://www.bne.es/es/perfiles/bibliotecarios/rda

- Biblioteca Nacional de España. **Normas, estándares y políticas de proceso técnico.**  
  https://www.bne.es/es/perfiles/bibliotecarios/normas-estandares-politicas-proceso-tecnico

- Biblioteca Nacional de España. **RDA, o el largo viaje del catálogo hacia la era digital.**  
  https://www.bne.es/es/blog/biblioteconomia/2020/07/07/rda-o-el-largo-viaje-del-catalogo-hacia-la-era-digital

- Biblioteca Nacional de España. **RDA: un estándar de contenidos para asegurar la calidad de los datos.**  
  https://www.bne.es/es/blog/biblioteconomia/2020/07/08/rda-un-estandar-de-contenidos-para-asegurar-la-calidad-de-los-datos

- Biblioteca Nacional de España. **Recursos de formación de RDA.**  
  https://www.bne.es/es/servicios/servicios-para-bibliotecarios/rda/recursos-de-formacion-de-rda

- RDA Toolkit. **RDA Toolkit.**  
  https://www.rdatoolkit.org/

- Library of Congress. **Resource Description and Access (RDA): Information and Resources.**  
  https://www.loc.gov/aba/rda/

### Complementarias

- Biblioteca Nacional de España. **MARC 21 para registros de autoridad.**  
  https://www.bne.es/es/publicaciones/marc21-registros-autoridad

- Biblioteca Nacional de España. **Perfil de aplicación de RDA para monografías modernas en la Biblioteca Nacional de España.**  
  https://www.bne.es/sites/default/files/repositorio-archivos/perfil_monomoder_04_NIPO.pdf

---

## 16. Guía rápida de repaso antes del examen

Dedica especial atención a estas equivalencias:

| Pregunta probable | Respuesta clave |
|---|---|
| ¿Qué es MARC 21? | Formato de codificación e intercambio bibliográfico |
| ¿Qué es RDA? | Norma de contenido para descripción y acceso |
| ¿Qué es FRBR? | Modelo conceptual entidad-relación |
| ¿Cuáles son las entidades WEMI? | Obra, Expresión, Manifestación, Ítem |
| ¿Cuáles son las tareas FRBR? | Encontrar, identificar, seleccionar, obtener |
| ¿Qué campo es el título en MARC? | 245 |
| ¿Qué campo es el ISBN? | 020 |
| ¿Qué campo es el acceso electrónico? | 856 |
| ¿Qué campos son tipo de contenido, medio y soporte? | 336, 337, 338 |
| ¿Dónde se indica RDA en MARC? | 040 $e rda |
| ¿Qué diferencia hay entre manifestación e ítem? | Manifestación = edición/publicación; ítem = ejemplar concreto |
| ¿Para qué sirve el control de autoridades? | Normalizar puntos de acceso y agrupar variantes |

