'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, FileText, FileAudio, Database, BookOpen, Filter, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MarkdownViewer from '@/components/dashboard/MarkdownViewer';
import { 
  getCachedDatabase,
  getConvocatoriaDescriptors, 
  getActiveConvocatoria, 
  getCachedConvocatoria, 
  fetchConvocatoria,
  getStudyTypeRegistry,
} from '@/lib/data-api';
import { getStudyType } from '@/lib/storage';
import { 
  type ConvocatoriaDescriptor, 
  type ConvocatoriaData, 
  type TemaConvocatoria,
  type TemaRecurso,
  type StudyTypeRegistryEntry,
  type TranscriptData
} from '@/lib/data-types';
import AudioPlayerWithTranscript from '@/components/dashboard/AudioPlayerWithTranscript';

type ViewerState = {
  type: 'md' | 'pdf' | 'mp3' | null;
  url: string;
  nombre: string;
  content?: string;
  /** Section ID to scroll to (from URL param) */
  scrollToSection?: string;
};

type TranscriptState = {
  data: TranscriptData | null;
  markdown: string | null;
};

const Temario = () => {
  const [studyTypeEntry, setStudyTypeEntry] = useState<StudyTypeRegistryEntry | null>(null);
  const [convocatorias, setConvocatorias] = useState<ConvocatoriaDescriptor[]>([]);
  const [selectedConvocatoria, setSelectedConvocatoria] = useState<ConvocatoriaDescriptor | null>(null);
  const [convocatoriaData, setConvocatoriaData] = useState<ConvocatoriaData | null>(null);
  const [selectedTema, setSelectedTema] = useState<TemaConvocatoria | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedBloque, setExpandedBloque] = useState<string | null>(null);
  const [viewer, setViewer] = useState<ViewerState>({ type: null, url: '', nombre: '' });
  const [mdContent, setMdContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptState>({ data: null, markdown: null });
  // Pending deep-link params to process after convocatoria data loads
  const [pendingDeepLink, setPendingDeepLink] = useState<{ file: string; section?: string } | null>(null);

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const DUPLICATE_SLASHES = /\/{2,}/g;

  // Mapa de datasets para enlazar por ID (información desde db.json)
  const datasetMap = new Map((getCachedDatabase().datasets ?? []).map(d => [d.id, d] as const));
  const linkedQuestionDatasetIds = selectedConvocatoria?.questionDatasetIds ?? [];
  const linkedQuestionDatasets = linkedQuestionDatasetIds
    .map(id => datasetMap.get(id))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  const trimmedBase = String(basePath).replace(/\/+$/, '');

  useEffect(() => {
    const loadConvocatorias = async () => {
      // Determinar plantilla de Temario según preferencias + registro de db.json
      const currentStudyType = getStudyType();
      const registry = getStudyTypeRegistry();
      const entry = registry.find(r => r.id === currentStudyType) ?? null;
      setStudyTypeEntry(entry);

      // Si no es oposiciones, mostramos placeholder y no cargamos convocatorias.
      if (entry && entry.temarioTemplate !== 'oposiciones') {
        setLoading(false);
        return;
      }

      const descriptors = getConvocatoriaDescriptors();
      setConvocatorias(descriptors);
      
      const active = getActiveConvocatoria();
      if (active) {
        setSelectedConvocatoria(active);
        const data = getCachedConvocatoria(active.id) || await fetchConvocatoria(active.id);
        setConvocatoriaData(data);
      }
      
      setLoading(false);
      
      // Read URL parameters for deep-linking: ?file=<filename>&section=<sectionId>
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const file = params.get('file');
        const section = params.get('section') || undefined;
        if (file) {
          setPendingDeepLink({ file, section });
        }
      }
    };
    
    loadConvocatorias();
  }, []);

  // Process pending deep-link when convocatoria data is loaded
  useEffect(() => {
    if (!pendingDeepLink || !convocatoriaData) return;
    
    const { file, section } = pendingDeepLink;
    setPendingDeepLink(null); // Clear pending to avoid re-processing
    
    // Find the tema and recurso that matches the file
    for (const tema of convocatoriaData.temas) {
      for (const recurso of tema.recursos) {
        // Match by filename (last segment of archivo path)
        const recursoFilename = recurso.archivo.split('/').pop()?.split('#')[0] || recurso.archivo;
        if (recursoFilename === file || recurso.archivo.includes(file)) {
          // Found matching recurso - select tema and open the recurso
          setSelectedTema(tema);
          handleOpenRecurso(recurso, section);
          return;
        }
      }
    }
    
    // If no matching recurso found in temas, try to open directly as a file path
    // This handles cases where the file might not be registered in any tema
    const tipo = file.endsWith('.md') ? 'md' : file.endsWith('.pdf') ? 'pdf' : file.endsWith('.mp3') ? 'mp3' : null;
    if (tipo === 'md') {
      const syntheticRecurso: TemaRecurso = {
        tipo: 'md',
        nombre: file,
        archivo: `data/general/${file}`
      };
      handleOpenRecurso(syntheticRecurso, section);
    }
  }, [pendingDeepLink, convocatoriaData]);

  const handleSelectConvocatoria = async (conv: ConvocatoriaDescriptor) => {
    setSelectedConvocatoria(conv);
    setSelectedTema(null);
    setViewer({ type: null, url: '', nombre: '' });
    setLoading(true);
    const data = getCachedConvocatoria(conv.id) || await fetchConvocatoria(conv.id);
    setConvocatoriaData(data);
    setLoading(false);
  };

  const handleSelectTema = (tema: TemaConvocatoria) => {
    setSelectedTema(tema);
    setViewer({ type: null, url: '', nombre: '' });
  };

  const handleBackToList = () => {
    setSelectedTema(null);
    setViewer({ type: null, url: '', nombre: '' });
  };

  const getRecursoUrl = (archivo: string) => {
    // Convención actual de rutas:
    // - Documentos de temario (md/pdf/mp3) se sirven desde public/ (ruta /data/...).
    // - JSON de datasets/convocatorias se sirven desde public/api (ruta /api/...).
    const trimmedBase = String(basePath).replace(/\/+$/, '');
    const cleanArchivo = String(archivo).replace(/^\/+/, '');

    if (cleanArchivo.startsWith('data/')) {
      return `${trimmedBase}/${cleanArchivo}`.replace(DUPLICATE_SLASHES, '/');
    }

    return `${trimmedBase}/api/${cleanArchivo}`.replace(DUPLICATE_SLASHES, '/');
  };

  const handleOpenRecurso = async (recurso: TemaRecurso, scrollToSection?: string) => {
    const url = getRecursoUrl(recurso.archivo);
    
    if (recurso.tipo === 'db') {
      // Para db, redirigir a tests (las preguntas se consumen desde datasets)
      const trimmedBase = String(basePath).replace(/\/+$/, '');
      window.location.href = `${trimmedBase}/dashboard/tests`.replace(DUPLICATE_SLASHES, '/');
      return;
    }

    if (recurso.tipo === 'md') {
      setLoadingContent(true);
      setViewer({ type: 'md', url, nombre: recurso.nombre, scrollToSection });
      try {
        // Añadir cache busting para evitar caché del navegador
        const cacheBuster = Math.floor(Date.now() / 60000);
        const noCacheUrl = `${url}${url.includes('?') ? '&' : '?'}_v=${cacheBuster}`;
        const response = await fetch(noCacheUrl, { cache: 'no-store' });
        if (response.ok) {
          const text = await response.text();
          setMdContent(text);
        } else {
          setMdContent('Error al cargar el contenido');
        }
      } catch {
        setMdContent('Error al cargar el contenido');
      }
      setLoadingContent(false);
    } else if (recurso.tipo === 'mp3') {
      // Para mp3, intentar cargar transcripciones si existen
      setViewer({ type: 'mp3', url, nombre: recurso.nombre });
      setLoadingContent(true);
      
      // Derivar las URLs de transcripción del archivo de audio
      // Ejemplo: data/general/01_constitucion_espanola_1978.mp3 -> .transcript.json y .transcript.md
      const transcriptBaseUrl = url.replace(/\.mp3$/, '.transcript');
      const jsonUrl = `${transcriptBaseUrl}.json`;
      const mdUrl = `${transcriptBaseUrl}.md`;
      
      try {
        const cacheBuster = Math.floor(Date.now() / 60000);
        
        // Cargar ambos archivos en paralelo
        const [jsonResponse, mdResponse] = await Promise.allSettled([
          fetch(`${jsonUrl}?_v=${cacheBuster}`, { cache: 'no-store' }),
          fetch(`${mdUrl}?_v=${cacheBuster}`, { cache: 'no-store' })
        ]);
        
        let transcriptData: TranscriptData | null = null;
        let transcriptMarkdown: string | null = null;
        
        if (jsonResponse.status === 'fulfilled' && jsonResponse.value.ok) {
          try {
            transcriptData = await jsonResponse.value.json();
          } catch {
            // Ignorar error de parsing
          }
        }
        
        if (mdResponse.status === 'fulfilled' && mdResponse.value.ok) {
          transcriptMarkdown = await mdResponse.value.text();
        }
        
        setTranscript({ data: transcriptData, markdown: transcriptMarkdown });
      } catch {
        setTranscript({ data: null, markdown: null });
      }
      
      setLoadingContent(false);
    } else {
      setViewer({ type: recurso.tipo as 'pdf', url, nombre: recurso.nombre });
    }
  };

  const closeViewer = () => {
    setViewer({ type: null, url: '', nombre: '' });
    setMdContent('');
    setTranscript({ data: null, markdown: null });
  };

  // Agrupar temas por bloque
  const temasPorBloque = convocatoriaData?.temas.reduce((acc, tema) => {
    const bloque = tema.bloque || 'Sin bloque';
    if (!acc[bloque]) acc[bloque] = [];
    acc[bloque].push(tema);
    return acc;
  }, {} as Record<string, TemaConvocatoria[]>) || {};

  const getRecursoIcon = (tipo: string) => {
    switch (tipo) {
      case 'md': return <FileText className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4 text-red-500" />;
      case 'mp3': return <FileAudio className="h-4 w-4 text-purple-500" />;
      case 'db': return <Database className="h-4 w-4 text-blue-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getRecursoLabel = (tipo: string) => {
    switch (tipo) {
      case 'md': return 'Texto';
      case 'pdf': return 'PDF';
      case 'mp3': return 'Audio';
      case 'db': return 'Flashcards/Tests';
      default: return tipo.toUpperCase();
    }
  };

  const getRelevanciaColor = (relevancia: string) => {
    switch (relevancia) {
      case 'alta': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'media': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'baja': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Placeholder para tipos de estudio sin temario implementado
  if (studyTypeEntry && studyTypeEntry.temarioTemplate !== 'oposiciones') {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Temario ({studyTypeEntry.label})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Esta plantilla de temario aún no está disponible para este tipo de estudio.
          </p>
          <p className="text-sm text-muted-foreground">
            Por ahora, Folio muestra el temario completo para oposiciones. Próximamente podrás cargar y organizar temarios específicos para “{studyTypeEntry.label}”.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Vista del visor
  if (viewer.type) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex items-center justify-between flex-shrink-0 mb-4">
          <Button variant="ghost" size="sm" onClick={closeViewer}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a recursos
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{viewer.nombre}</span>
            <a
              href={viewer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Visor de Markdown - full height */}
        {viewer.type === 'md' && (
          <div className="flex-1 min-h-0 overflow-hidden">
            {loadingContent ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <MarkdownViewer content={mdContent} className="h-full" scrollToSection={viewer.scrollToSection} />
            )}
          </div>
        )}

        {/* Visor de PDF */}
        {viewer.type === 'pdf' && (
          <Card className="flex-1 min-h-0 border-border overflow-hidden">
            <CardContent className="p-0 h-full">
              <iframe
                src={viewer.url}
                className="w-full h-full border-0"
                title={viewer.nombre}
              />
            </CardContent>
          </Card>
        )}

        {/* Reproductor de Audio con Transcripción */}
        {viewer.type === 'mp3' && (
          loadingContent ? (
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <AudioPlayerWithTranscript
              audioUrl={viewer.url}
              audioName={viewer.nombre}
              transcriptData={transcript.data}
              transcriptMarkdown={transcript.markdown}
            />
          )
        )}
      </div>
    );
  }

  // Vista de detalle del tema
  if (selectedTema) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBackToList}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al temario
          </Button>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="text-xs">
              Tema {selectedTema.numero}
            </Badge>
            <Badge className={getRelevanciaColor(selectedTema.relevancia)}>
              {selectedTema.relevancia === 'alta' ? 'Esencial' : 
               selectedTema.relevancia === 'media' ? 'Importante' : 'Complementario'}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-foreground">{selectedTema.titulo}</h1>
          <p className="text-muted-foreground mt-2">{selectedTema.descripcion}</p>
        </div>

        {selectedTema.contenido_especifico && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-sm">{selectedTema.contenido_especifico}</p>
            </CardContent>
          </Card>
        )}

        {/* Recursos */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recursos disponibles
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {selectedTema.recursos.map((recurso, index) => (
              <Card 
                key={index}
                className="border-border hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer"
                onClick={() => handleOpenRecurso(recurso)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-muted">
                    {getRecursoIcon(recurso.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{recurso.nombre}</p>
                    <p className="text-sm text-muted-foreground">{getRecursoLabel(recurso.tipo)}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Materiales complementarios */}
        {selectedTema.materiales_complementarios && selectedTema.materiales_complementarios.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Materiales complementarios</h2>
            <div className="grid gap-3">
              {selectedTema.materiales_complementarios.map((material) => (
                <Card 
                  key={material.id}
                  className="border-border hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer"
                  onClick={() => handleOpenRecurso({ tipo: 'pdf', nombre: material.titulo, archivo: material.archivo })}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <FileText className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{material.titulo}</p>
                      <p className="text-sm text-muted-foreground">PDF</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Temas relacionados */}
        {selectedTema.temas_relacionados.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Temas relacionados</h2>
            <div className="flex flex-wrap gap-2">
              {selectedTema.temas_relacionados.map((tag, index) => (
                <Badge key={index} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vista de lista de temas
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Temario</h1>
          <p className="text-muted-foreground">Accede a los temas y recursos de tu oposición</p>
        </div>
      </div>

      {/* Selector de convocatoria */}
      {convocatorias.length > 1 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Convocatoria:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {convocatorias.map((conv) => (
              <Button
                key={conv.id}
                variant={selectedConvocatoria?.id === conv.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSelectConvocatoria(conv)}
                style={selectedConvocatoria?.id === conv.id ? { backgroundColor: conv.color } : undefined}
              >
                {conv.shortTitle}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Info de la convocatoria */}
      {selectedConvocatoria && convocatoriaData && (
        <Card className="border-l-4" style={{ borderLeftColor: selectedConvocatoria.color }}>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold">{selectedConvocatoria.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {convocatoriaData.convocatoria.institucion} · {convocatoriaData.total_temas} temas
                  </p>
                </div>
                {convocatoriaData.convocatoria.enlace_publicacion && (
                  <a
                    href={convocatoriaData.convocatoria.enlace_publicacion}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex-shrink-0 flex items-center gap-1"
                    title="Ver convocatoria"
                  >
                    <span className="text-sm hidden sm:inline">Ver convocatoria</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Datasets de preguntas:</span>
                {linkedQuestionDatasets.length > 0 ? (
                  linkedQuestionDatasets.map(ds => (
                    <Badge key={ds.id} variant="outline" className="gap-1">
                      {ds.tag ?? ds.title}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">(sin datasets asociados)</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    window.location.href = `${trimmedBase}/dashboard/tests`.replace(DUPLICATE_SLASHES, '/');
                  }}
                >
                  Ir a Tests
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    window.location.href = `${trimmedBase}/dashboard/flashcards`.replace(DUPLICATE_SLASHES, '/');
                  }}
                >
                  Ir a Flashcards
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de temas agrupados por bloque */}
      {convocatoriaData && Object.entries(temasPorBloque).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(temasPorBloque).map(([bloque, temas]) => (
            <Card key={bloque} className="border-border">
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedBloque(expandedBloque === bloque ? null : bloque)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {expandedBloque === bloque ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    {bloque}
                  </CardTitle>
                  <Badge variant="secondary">{temas.length}</Badge>
                </div>
              </CardHeader>
              
              {expandedBloque === bloque && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {temas.map((tema) => (
                      <div
                        key={tema.id}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border"
                        onClick={() => handleSelectTema(tema)}
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                          {tema.numero}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{tema.titulo}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {tema.recursos.length} recursos
                            </span>
                            <Badge className={`text-[10px] ${getRelevanciaColor(tema.relevancia)}`}>
                              {tema.relevancia}
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No hay temas disponibles para esta convocatoria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Temario;
