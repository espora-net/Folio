'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, FileText, FileAudio, Database, BookOpen, Filter, ArrowLeft, X, ExternalLink, Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import { 
  getConvocatoriaDescriptors, 
  getActiveConvocatoria, 
  getCachedConvocatoria, 
  fetchConvocatoria 
} from '@/lib/data-api';
import { 
  type ConvocatoriaDescriptor, 
  type ConvocatoriaData, 
  type TemaConvocatoria,
  type TemaRecurso
} from '@/lib/data-types';

type ViewerState = {
  type: 'md' | 'pdf' | 'mp3' | null;
  url: string;
  nombre: string;
  content?: string;
};

const Temario = () => {
  const [convocatorias, setConvocatorias] = useState<ConvocatoriaDescriptor[]>([]);
  const [selectedConvocatoria, setSelectedConvocatoria] = useState<ConvocatoriaDescriptor | null>(null);
  const [convocatoriaData, setConvocatoriaData] = useState<ConvocatoriaData | null>(null);
  const [selectedTema, setSelectedTema] = useState<TemaConvocatoria | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedBloque, setExpandedBloque] = useState<string | null>(null);
  const [viewer, setViewer] = useState<ViewerState>({ type: null, url: '', nombre: '' });
  const [mdContent, setMdContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  useEffect(() => {
    const loadConvocatorias = async () => {
      const descriptors = getConvocatoriaDescriptors();
      setConvocatorias(descriptors);
      
      const active = getActiveConvocatoria();
      if (active) {
        setSelectedConvocatoria(active);
        const data = getCachedConvocatoria(active.id) || await fetchConvocatoria(active.id);
        setConvocatoriaData(data);
      }
      
      setLoading(false);
    };
    
    loadConvocatorias();
  }, []);

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
    return `${basePath}/data/${archivo}`;
  };

  const handleOpenRecurso = async (recurso: TemaRecurso) => {
    const url = getRecursoUrl(recurso.archivo);
    
    if (recurso.tipo === 'db') {
      // Para db, redirigir a flashcards o tests
      window.location.href = `${basePath}/dashboard/flashcards`;
      return;
    }

    if (recurso.tipo === 'md') {
      setLoadingContent(true);
      setViewer({ type: 'md', url, nombre: recurso.nombre });
      try {
        const response = await fetch(url);
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
    } else {
      setViewer({ type: recurso.tipo as 'pdf' | 'mp3', url, nombre: recurso.nombre });
    }
  };

  const closeViewer = () => {
    setViewer({ type: null, url: '', nombre: '' });
    setMdContent('');
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

  // Vista del visor
  if (viewer.type) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
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

        {/* Visor de Markdown */}
        {viewer.type === 'md' && (
          <Card className="border-border">
            <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none overflow-auto max-h-[calc(100vh-200px)]">
              {loadingContent ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ReactMarkdown>{mdContent}</ReactMarkdown>
              )}
            </CardContent>
          </Card>
        )}

        {/* Visor de PDF */}
        {viewer.type === 'pdf' && (
          <Card className="border-border overflow-hidden">
            <CardContent className="p-0">
              <iframe
                src={viewer.url}
                className="w-full h-[calc(100vh-200px)] border-0"
                title={viewer.nombre}
              />
            </CardContent>
          </Card>
        )}

        {/* Reproductor de Audio */}
        {viewer.type === 'mp3' && (
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <Volume2 className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-center">{viewer.nombre}</h3>
                <audio
                  controls
                  className="w-full max-w-md"
                  src={viewer.url}
                >
                  Tu navegador no soporta el elemento de audio.
                </audio>
                <p className="text-sm text-muted-foreground text-center">
                  Escucha el contenido del tema mientras realizas otras actividades
                </p>
              </div>
            </CardContent>
          </Card>
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
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Convocatoria:</span>
          <div className="flex gap-2">
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
            <div className="flex items-start justify-between">
              <div>
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
                  className="text-primary hover:underline text-sm flex items-center gap-1"
                >
                  Ver convocatoria
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
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
                  <Badge variant="secondary">{temas.length} temas</Badge>
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
