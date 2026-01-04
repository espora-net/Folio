'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, SkipBack, SkipForward, FileText, BookOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type TranscriptData, type TranscriptSegment } from '@/lib/data-types';

interface AudioPlayerWithTranscriptProps {
  audioUrl: string;
  audioName: string;
  transcriptData: TranscriptData | null;
  transcriptMarkdown: string | null;
  onClose?: () => void;
}

// Parsea el markdown de transcripción para extraer referencias a secciones
interface ParsedTranscriptLine {
  timestamp: string;
  text: string;
  refs: string[]; // referencias como "Art. 1", "TÍTULO PRELIMINAR"
  sectionHeader?: string; // encabezado de sección si es un heading
  startSeconds: number;
}

function parseTimestamp(timestamp: string): number {
  // Formato: "00:00–00:05" o "[00:00–00:05]"
  const match = timestamp.match(/(\d{2}):(\d{2})/);
  if (match) {
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  }
  return 0;
}

function parseTranscriptMarkdown(markdown: string): ParsedTranscriptLine[] {
  const lines = markdown.split('\n');
  const parsed: ParsedTranscriptLine[] = [];
  let currentSection = '';

  for (const line of lines) {
    // Detectar encabezados de sección (## [TÍTULO...])
    const sectionMatch = line.match(/^## \[([^\]]+)\]/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      continue;
    }

    // Detectar líneas con timestamp: "- [00:00–00:05] texto — refs: [Art. 1](...)"
    const lineMatch = line.match(/^- \[(\d{2}:\d{2})[–-](\d{2}:\d{2})\] (.+)$/);
    if (lineMatch) {
      const timestamp = `${lineMatch[1]}–${lineMatch[2]}`;
      let text = lineMatch[3];
      const refs: string[] = [];

      // Extraer referencias del formato "— refs: [Art. 1](...)"
      const refMatch = text.match(/\s*— refs?: (.+)$/);
      if (refMatch) {
        text = text.replace(/\s*— refs?: .+$/, '');
        // Parsear referencias: [Art. 1](...)
        const refPattern = /\[([^\]]+)\]\([^)]+\)/g;
        let m;
        while ((m = refPattern.exec(refMatch[1])) !== null) {
          refs.push(m[1]);
        }
      }

      parsed.push({
        timestamp,
        text: text.trim(),
        refs,
        sectionHeader: currentSection || undefined,
        startSeconds: parseTimestamp(timestamp),
      });
    }
  }

  return parsed;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function AudioPlayerWithTranscript({
  audioUrl,
  audioName,
  transcriptData,
  transcriptMarkdown,
}: AudioPlayerWithTranscriptProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(-1);
  const [activeTab, setActiveTab] = useState<'transcript' | 'temario'>('transcript');

  // Parse markdown for temario view
  const parsedMarkdown = transcriptMarkdown ? parseTranscriptMarkdown(transcriptMarkdown) : [];

  // Encontrar el segmento activo basado en el tiempo actual
  const findActiveSegment = useCallback((time: number): number => {
    if (!transcriptData?.segments) return -1;
    for (let i = 0; i < transcriptData.segments.length; i++) {
      const seg = transcriptData.segments[i];
      if (time >= seg.start && time < seg.end) {
        return i;
      }
    }
    return -1;
  }, [transcriptData]);

  // Actualizar tiempo y segmento activo
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      const newIndex = findActiveSegment(audio.currentTime);
      if (newIndex !== activeSegmentIndex) {
        setActiveSegmentIndex(newIndex);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [findActiveSegment, activeSegmentIndex]);

  // Scroll automático al segmento activo
  useEffect(() => {
    if (activeSegmentIndex >= 0 && transcriptContainerRef.current) {
      const activeElement = transcriptContainerRef.current.querySelector(`[data-segment="${activeSegmentIndex}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeSegmentIndex]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seekTo = (time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skipBack = () => {
    seekTo(Math.max(0, currentTime - 10));
  };

  const skipForward = () => {
    seekTo(Math.min(duration, currentTime + 10));
  };

  const handleSliderChange = (value: number[]) => {
    seekTo(value[0]);
  };

  const handleSegmentClick = (segment: TranscriptSegment) => {
    seekTo(segment.start);
    if (!isPlaying) {
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };

  // Agrupar segmentos de parsedMarkdown por sección para la vista de temario
  const sectionGroups: { section: string; lines: ParsedTranscriptLine[] }[] = [];
  let currentGroup: { section: string; lines: ParsedTranscriptLine[] } | null = null;

  for (const line of parsedMarkdown) {
    if (line.sectionHeader && line.sectionHeader !== currentGroup?.section) {
      currentGroup = { section: line.sectionHeader, lines: [] };
      sectionGroups.push(currentGroup);
    }
    if (currentGroup) {
      currentGroup.lines.push(line);
    } else {
      // Líneas sin sección van a "Introducción"
      if (!sectionGroups.length || sectionGroups[0].section !== 'Introducción') {
        sectionGroups.unshift({ section: 'Introducción', lines: [] });
      }
      sectionGroups[0].lines.push(line);
    }
  }

  // Encontrar sección activa basada en tiempo
  const findActiveSection = (): string | null => {
    for (const group of sectionGroups) {
      for (const line of group.lines) {
        if (currentTime >= line.startSeconds && currentTime < line.startSeconds + 10) {
          return group.section;
        }
      }
    }
    return null;
  };

  const activeSection = findActiveSection();

  return (
    <Card className="border-border">
      <CardContent className="p-6">
        {/* Audio oculto */}
        <audio ref={audioRef} src={audioUrl} preload="metadata" />

        {/* Cabecera con nombre e icono */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Volume2 className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{audioName}</h3>
            <p className="text-sm text-muted-foreground">
              {transcriptData ? `${transcriptData.segments.length} segmentos` : 'Audio'} · {formatTime(duration || transcriptData?.duration || 0)}
            </p>
          </div>
        </div>

        {/* Controles de reproducción */}
        <div className="space-y-4 mb-6">
          {/* Barra de progreso */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSliderChange}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Botones de control */}
          <div className="flex items-center justify-center gap-4">
            <Button variant="ghost" size="icon" onClick={skipBack} title="Retroceder 10s">
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              className="rounded-full w-14 h-14"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={skipForward} title="Avanzar 10s">
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tabs para transcripción y temario */}
        {transcriptData && (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'transcript' | 'temario')}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="transcript" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Transcripción
              </TabsTrigger>
              <TabsTrigger value="temario" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Temario
              </TabsTrigger>
            </TabsList>

            {/* Vista de transcripción */}
            <TabsContent value="transcript">
              <div
                ref={transcriptContainerRef}
                className="max-h-[400px] overflow-y-auto space-y-2 pr-2"
              >
                {transcriptData.segments.map((segment, index) => (
                  <div
                    key={index}
                    data-segment={index}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      activeSegmentIndex === index
                        ? 'bg-primary/10 border-l-4 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleSegmentClick(segment)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs text-muted-foreground font-mono whitespace-nowrap mt-0.5">
                        {formatTime(segment.start)}
                      </span>
                      <p className={`text-sm flex-1 ${activeSegmentIndex === index ? 'font-medium' : ''}`}>
                        {segment.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Vista de temario - organizado por secciones */}
            <TabsContent value="temario">
              <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
                {sectionGroups.length > 0 ? (
                  sectionGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="space-y-2">
                      <div
                        className={`flex items-center gap-2 p-2 rounded-lg ${
                          activeSection === group.section
                            ? 'bg-primary/10 border-l-4 border-primary'
                            : 'bg-muted/30'
                        }`}
                      >
                        <ChevronRight className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold text-sm">{group.section}</h4>
                        <Badge variant="secondary" className="text-xs ml-auto">
                          {group.lines.length} segmentos
                        </Badge>
                      </div>

                      <div className="pl-4 space-y-1">
                        {group.lines.slice(0, 3).map((line, lineIndex) => (
                          <div
                            key={lineIndex}
                            className="text-xs text-muted-foreground p-2 rounded hover:bg-muted/50 cursor-pointer flex items-start gap-2"
                            onClick={() => seekTo(line.startSeconds)}
                          >
                            <span className="font-mono text-[10px] whitespace-nowrap mt-0.5">
                              {line.timestamp.split('–')[0]}
                            </span>
                            <span className="flex-1 line-clamp-2">{line.text}</span>
                            {line.refs.length > 0 && (
                              <Badge variant="outline" className="text-[10px] shrink-0">
                                {line.refs[0]}
                              </Badge>
                            )}
                          </div>
                        ))}
                        {group.lines.length > 3 && (
                          <p className="text-xs text-muted-foreground pl-2">
                            +{group.lines.length - 3} segmentos más...
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay referencias al temario disponibles para este audio.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Fallback si no hay transcripción */}
        {!transcriptData && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Escucha el contenido del tema mientras realizas otras actividades
          </p>
        )}
      </CardContent>
    </Card>
  );
}
