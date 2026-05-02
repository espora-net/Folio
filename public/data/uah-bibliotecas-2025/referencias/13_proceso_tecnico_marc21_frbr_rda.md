# Proceso técnico, MARC 21, FRBR/LRM y RDA

> **Tema asociado:** Tema 013.
> **Fuente:** 13_proceso_tecnico_marc21_frbr_rda.pdf.
> **Nota:** conversión Markdown limpia desde PDF de referencia; se han eliminado cabeceras, pies y paginación repetida.

## Objetivo del documento

Este PDF resume las fuentes oficiales y el enfoque habitual de otras convocatorias de bibliotecas. No sustituye a las normas completas: esta pensado para estudiar, memorizar relaciones clave y entrenar preguntas de examen.

## 1. Alcance exacto del tema y estrategia de oposicion

El tema combina tres planos que conviene no mezclar: el proceso tecnico bibliotecario, los modelos conceptuales de descripcion y los formatos de codificacion/intercambio. La pregunta clasica de examen busca que el opositor sepa distinguirlos y relacionarlos.

Idea matriz: FRBR/IFLA LRM aporta el modelo conceptual; RDA da instrucciones de descripcion y acceso; MARC 21 codifica los datos para intercambio entre sistemas bibliotecarios.

- Proceso tecnico: operaciones para incorporar un documento a la coleccion y hacerlo recuperable:
recepcion, comprobacion, registro, sellado o tratamiento fisico, catalogacion, clasificacion, indizacion, control de autoridades, signatura, exemplarizacion, preparacion para prestamo y difusion en catalogo.

- MARC 21: estandar de representacion legible por maquina. En examen suelen preguntar estructura
del registro, campos, indicadores, subcampos y campos frecuentes.

- FRBR/LRM: modelo entidad-relacion orientado a tareas del usuario. Es base conceptual para
entender obra, expresion, manifestacion e item.

- RDA: codigo de catalogacion internacional, sucesor de AACR2, orientado a entidades, atributos y
relaciones, util para entorno digital y datos enlazados.

## 2. Fuentes oficiales y jerarquia de estudio

| Bloque | Fuente principal | Que extraer para estudiar |
| --- | --- | --- |
| Convocatoria UAH | Anexo I de la convocatoria UAH | Enunciado exacto: proceso tecnico; MARC 21; |
| 2025 | FRBR; RDA. |  |
| MARC 21 | Library of Congress - MARC 21 | Estructura, campos, indicadores, subcampos, |
| internacional | Format for Bibliographic Data | ejemplos y actualizaciones. |
| MARC 21 en | Biblioteca Nacional de Espana - | Referencia espanola actualizada, util para |
| espanol | MARC 21 para registros | terminologia y campos. |

bibliograficos

| RDA | BNE - RDA y Recursos de | Definicion, cambio desde AACR2, relacion con |
| --- | --- | --- |
| formacion RDA; RDA Toolkit/RSC | MARC 21 y aplicacion practica. |  |
| FRBR/LRM | IFLA - IFLA Library Reference | Tareas del usuario, entidades y relaciones; |
| Model | transicion de FRBR, FRAD y FRSAD a LRM. |  |
| Preguntas de | Cuestionarios oficiales del | Patrones de pregunta: ventajas de MARC, |
| otras | Ministerio de Cultura, CCAA y | campos 245/246/100/700, RDA sustituye |
| convocatorias | universidades | AACR2, entidad item, etc. |

## 3. Proceso tecnico de fondos documentales

El proceso tecnico es el conjunto de tareas que transforma un documento adquirido o recibido en un recurso identificable, localizado, recuperable y utilizable. En una biblioteca universitaria, ademas, conecta con adquisiciones, catalogo, descubrimiento, prestamo, repositorios, colecciones electronicas y evaluacion de uso.

## Fases habituales

| Fase | Contenido minimo que conviene saber | Preguntable |
| --- | --- | --- |
| Recepcion y | Verificar pedido, factura, estado fisico, coincidencia | Diferenciar adquisicion |
| comprobacion | bibliografica, proveedor y condiciones. | de proceso tecnico. |
| Registro y control | Dar entrada administrativa/bibliografica; asociar | Registro bibliografico |
| interno | ejemplares, codigos de barras, localizacion y | vs registro de ejemplar. |

disponibilidad.

| Fase | Contenido minimo que conviene saber | Preguntable |
| --- | --- | --- |
| Catalogacion | Identificar el recurso y describirlo: titulo, | Campos MARC 245, |
| descriptiva | responsabilidad, edicion, publicacion, descripcion | 250, 264/260, 300, |
| fisica, serie, notas, identificadores. | 490/830, 020, 022. |  |
| Puntos de acceso y | Autores, entidades, congresos, titulos | Campos 1XX, 7XX; |
| autoridades | uniformes/preferidos; control de variantes y relaciones. | autoridad vs |

bibliografico.

| Clasificacion e | Asignar materia y notacion; en Espana es frecuente | Diferencia |
| --- | --- | --- |
| indizacion | CDU para ordenacion sistematica. | clasificacion/indizacion. |
| Signatura y | Etiqueta, tejuelo, magnetizado/RFID, sellado, forrado, | Relacion signatura-loca |
| preparacion fisica | ubicacion. | lizacion-libre acceso. |
| Carga y difusion en | Publicacion en SIGB/LSP y herramienta de | Catalogo vs |
| catalogo | descubrimiento; ejemplares, disponibilidad y enlaces. | herramienta de |

descubrimiento.

## 4. MARC 21: lo que hay que dominar

MARC significa Machine-Readable Cataloging. La Library of Congress mantiene la documentacion oficial; la BNE proporciona la referencia en espanol. MARC 21 permite representar y comunicar informacion bibliografica y relacionada de forma normalizada y procesable por ordenador.

## Estructura del registro MARC

| Elemento | Funcion |
| --- | --- |
| Cabecera/Leader | Datos codificados sobre el registro: tipo de registro, nivel bibliografico, |

estado, longitud, etc.

| Directorio | Indice interno de campos variables con longitud y posicion. |
| --- | --- |
| Campos de control 00X | No tienen indicadores ni subcampos; contienen identificadores o codigos. |

Ej.: 001, 005, 008.

| Campos variables de | Tienen etiqueta de tres cifras, indicadores y subcampos. Ej.: 245 $a titulo $c |
| --- | --- |
| datos | mencion de responsabilidad. |
| Indicadores | Dos posiciones que modifican el tratamiento del campo. Ej.: 245 segundo |

indicador para caracteres no alfabetizados.

| Subcampos | Unidades de informacion dentro del campo, precedidas por codigo. Ej.: $a, |
| --- | --- |

$b, $c.

Bloques de campos mas frecuentes

| Bloque | Contenido | Campos que conviene memorizar |
| --- | --- | --- |
| 0XX | Numeros, codigos e informacion | 020 ISBN, 022 ISSN, 040 fuente catalogadora, 041 |
| de control | lengua, 080 CDU, 084 otra clasificacion. |  |
| 1XX | Entrada principal | 100 persona, 110 entidad, 111 congreso, 130 titulo |

uniforme/preferido.

| 2XX | Titulo, edicion, publicacion | 240 titulo uniforme, 245 titulo y responsabilidad, 246 |
| --- | --- | --- |

variante de titulo, 250 edicion, 264 produccion/publicacion/distribucion/copyright.

| 3XX | Descripcion fisica y | 300 descripcion fisica; 336 contenido, 337 medio, 338 |
| --- | --- | --- |
| caracteristicas RDA | soporte. |  |
| 4XX/8XX | Series | 490 mencion de serie; 830 punto de acceso adicional |

de serie.

| Bloque | Contenido | Campos que conviene memorizar |
| --- | --- | --- |
| 5XX | Notas | 500 general, 504 bibliografia, 505 contenido, 520 |

resumen.

| 6XX | Materias | 600 persona materia, 610 entidad materia, 650 |
| --- | --- | --- |

materia, 651 lugar.

| 7XX | Accesos adicionales | 700 persona, 710 entidad, 711 congreso, 730 titulo |
| --- | --- | --- |

relacionado.

| 9XX | Campos locales | Usos propios de cada institucion o sistema. |
| --- | --- | --- |

Campos que aparecen mucho en test

- 245: titulo propiamente dicho y mencion de responsabilidad; segundo indicador: numero de
caracteres que no alfabetizan.

- 246: variante de titulo; muy preguntado para titulo de cubierta, lomo o forma alternativa distinta del
245.

- 100/110/111: punto de acceso principal de persona, entidad o congreso.
- 700/710/711: puntos de acceso adicionales.
- 020/022: ISBN/ISSN.
- 080: numero de CDU en MARC 21 bibliografico.
- 336/337/338: campos RDA de tipo de contenido, medio y soporte.
- 264: produccion, publicacion, distribucion, fabricacion y copyright; desplazamiento habitual desde
260 en catalogacion reciente.

## 5. FRBR e IFLA LRM

FRBR fue un modelo conceptual para registros bibliograficos centrado en lo que el usuario hace con el catalogo: encontrar, identificar, seleccionar y obtener. La IFLA consolido despues FRBR, FRAD y FRSAD en IFLA LRM, que mantiene el enfoque entidad-relacion y amplia la consistencia del modelo.

| Concepto | Definicion para examen | Ejemplo rapido |
| --- | --- | --- |
| Obra | Creacion intelectual o artistica abstracta. | El Quijote como creacion. |
| Expresion | Realizacion intelectual o artistica de una obra. | Texto original, traduccion |

inglesa, version anotada.

| Manifestacion | Materializacion editorial o publicacion concreta. | Edicion de una editorial, ano |
| --- | --- | --- |

y formato determinados.

| Item | Ejemplar individual de una manifestacion. | El ejemplar fisico con codigo |
| --- | --- | --- |

de barras de una biblioteca.

Regla mnemotecnica: Obra = idea; Expresion = forma intelectual; Manifestacion = edicion/publicacion; Item = ejemplar.

Tareas del usuario

- Encontrar: localizar recursos que respondan a una busqueda.
- Identificar: confirmar que el recurso es el buscado y distinguirlo de otros.
- Seleccionar: elegir el recurso adecuado segun idioma, soporte, edicion, nivel, etc.
- Obtener: acceder al recurso o a un ejemplar disponible. En LRM se incorpora tambien la idea de
explorar/navegar relaciones.

## 6. RDA: Resource Description and Access

RDA es el codigo de catalogacion que sustituye a AACR2. La BNE lo adopta de forma incremental desde 2019 y publica perfiles de aplicacion, como el de monografias modernas. RDA esta pensado para describir recursos en entornos digitales y para explicitar relaciones entre entidades.

| Aspecto | AACR2 / reglas tradicionales | RDA |
| --- | --- | --- |
| Enfoque | Descripcion bibliografica mas ligada a | Entidades, atributos y relaciones; entorno |
| registros y presentacion textual. | digital. |  |
| Modelo | Basado en tradicion catalografica e | Alineado con FRBR/IFLA LRM. |
| conceptual | ISBD. |  |
| Abreviaturas | Mayor uso de abreviaturas | Tendencia a transcripcion y terminos |
| convencionales. | completos cuando procede. |  |
| Soporte y | Designacion general de material en 245 | Campos 336, 337, 338 para contenido, |
| contenido | $h en practicas antiguas. | medio y soporte. |
| Relaciones | Menos explicitacion sistematica. | Relaciones entre obras, expresiones, |

manifestaciones, items y agentes.

RDA y MARC 21 no son lo mismo RDA dice que elementos registrar y como describirlos; MARC 21 ofrece una codificacion posible para esos datos. Por eso pueden existir registros RDA codificados en MARC 21, pero RDA no depende conceptualmente de MARC y puede expresarse en otros modelos de datos.

## 7. Correspondencia practica RDA - MARC 21

| Dato bibliografico | RDA / sentido | MARC 21 habitual |
| --- | --- | --- |
| Titulo propiamente dicho | Elemento identificador principal de la | 245 $a |

manifestacion.

| Otra informacion sobre | Subtitulo u otra informacion complementaria. | 245 $b |
| --- | --- | --- |

el titulo

| Mencion de | Personas/entidades responsables tal como | 245 $c |
| --- | --- | --- |
| responsabilidad | figuran en la fuente. |  |
| Mencion de edicion | Identifica version editorial. | 250 |
| Publicacion | Lugar, editor, fecha. | 264 segundo indicador 1 |
| Descripcion fisica | Extension, dimensiones, ilustraciones. | 300 |
| Tipo de contenido | Forma fundamental de comunicacion del | 336 |

contenido.

| Tipo de medio | Dispositivo requerido para intermediar. | 337 |
| --- | --- | --- |
| Tipo de soporte | Formato del soporte del recurso. | 338 |
| Relacion con agente | Autor, editor, traductor, prologuista, etc. | 100/110/111 y 700/710/711 |

con designador de relacion cuando proceda

## 8. Preguntas recurrentes en otras convocatorias

Los cuestionarios oficiales revisados tienden a preguntar menos teoria larga y mas identificacion precisa: ventajas de MARC 21, campo correcto para un dato, sustitucion de AACR2 por RDA, entidades FRBR y diferencias entre catalogacion, clasificacion e indizacion.

| Patron de pregunta | Respuesta que debes tener preparada |
| --- | --- |
| Ventaja de MARC 21 | Intercambio de registros, normalizacion, cooperacion |

y compatibilidad entre sistemas.

| Titulo tomado del lomo o cubierta distinto del | Campo 246, variante de titulo. |
| --- | --- |

### titulo propiamente dicho

| Titulo propiamente dicho | Campo 245. |
| --- | --- |
| ISBN / ISSN | 020 / 022. |
| CDU en MARC | 080. |
| Campos RDA de contenido/medio/soporte | 336 / 337 / 338. |
| RDA sustituye a... | AACR2. |
| Entidad que es el ejemplar concreto | Item. |
| Obra vs expresion vs manifestacion | Idea/creacion; realizacion intelectual; |

edicion/publicacion.

| Punto de acceso adicional de persona | 700. |
| --- | --- |
| Entrada principal de persona | 100. |
| Materias de persona/tema/lugar | 600 / 650 / 651. |

## 9. Mini-esquema de registro MARC orientativo

Ejemplo simplificado para reconocer campos, no para copiar como registro completo:

## 020. ## $a 9788491050000

080 ## $a 821.134.2-31 100 1# $a Cervantes Saavedra, Miguel de, $d 1547-1616, $e autor 245 13 $a El ingenioso hidalgo Don Quijote de la Mancha / $c Miguel de Cervantes 250 ## $a Edicion anotada 264 #1 $a Madrid : $b Editorial X, $c 2024 300 ## $a 650 paginas ; $c 24 cm 336 ## $a texto $b txt $2 rdacontent 337 ## $a sin mediacion $b n $2 rdamedia 338 ## $a volumen $b nc $2 rdacarrier 650 #4 $a Novela espanola $y Siglo XVII

## 10. Test de entrenamiento

| Pregunta | Respuesta |
| --- | --- |
| 1. MARC 21 es principalmente: | Un formato de codificacion e intercambio de |

registros bibliograficos y relacionados.

| 2. RDA es: | Un codigo de catalogacion/descripicion y acceso, |
| --- | --- |

sucesor de AACR2.

| 3. FRBR/LRM es: | Un modelo conceptual de entidades, atributos, |
| --- | --- |

relaciones y tareas del usuario.

| 4. El campo MARC 245 se utiliza para: | Titulo y mencion de responsabilidad. |
| --- | --- |
| 5. El campo 246 se utiliza para: | Variantes de titulo. |
| 6. Los campos 336, 337 y 338 expresan: | Tipo de contenido, tipo de medio y tipo de |

soporte.

| 7. Un ejemplar concreto conservado en una | Item. |
| --- | --- |

biblioteca es:

| Pregunta | Respuesta |
| --- | --- |
| 8. Una traduccion concreta de una obra es: | Expresion. |
| 9. Una edicion publicada por una editorial en una | Manifestacion. |

fecha determinada es:

| 10. El intercambio de registros y la cooperacion | MARC 21 y la normalizacion bibliografica. |
| --- | --- |

bibliotecaria son ventajas de:

## 11. Checklist final para el examen

- Explicar en dos lineas la diferencia entre FRBR/LRM, RDA y MARC 21.
- Memorizar WEMI: obra, expresion, manifestacion, item, con ejemplo propio.
- Memorizar campos MARC: 020, 022, 080, 100, 245, 246, 250, 264, 300, 336, 337, 338, 490, 500,
504, 505, 520, 600, 650, 651, 700, 710, 830.

- Distinguir catalogacion descriptiva, control de autoridades, clasificacion, indizacion y signatura.
- Saber que la BNE adopto RDA de forma incremental y publica perfiles de aplicacion.
- No confundir registro bibliografico con ejemplar/item ni catalogo con herramienta de descubrimiento.
## 12. Referencias principales

- Universidad de Alcala. Convocatoria Escala Tecnica Auxiliar de Archivos y Bibliotecas 2025, Anexo I:
temario.

- Biblioteca Nacional de Espana. MARC 21 para registros bibliograficos. Actualizacion n. 41, diciembre
de 2025.

- Biblioteca Nacional de Espana. MARC 21: normas, estandares y politicas de procesos tecnicos.
- Library of Congress. MARC 21 Format for Bibliographic Data; MARC Standards.
- Biblioteca Nacional de Espana. RDA; Recursos de formacion de RDA; Normas, estandares y politicas
de proceso tecnico.

- RDA Steering Committee / RDA Toolkit. RDA Frequently Asked Questions.
- IFLA. IFLA Library Reference Model. Modelo conceptual para la informacion bibliografica, 2017.
- Biblioteca Nacional de Espana. Perfil de aplicacion de RDA para monografias modernas en la BNE,
version 2025.

- Ministerio de Cultura. Cuestionario de preguntas de bibliotecas, turno libre; cuestionarios oficiales de
procesos selectivos con preguntas sobre MARC 21 y RDA. Nota: este documento sintetiza fuentes oficiales y patrones de examen; para respuestas juridico-tecnicas exactas debe comprobarse siempre la version vigente de cada norma o estandar.
