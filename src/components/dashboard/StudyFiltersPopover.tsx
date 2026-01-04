'use client';

import { useMemo } from 'react';
import { Filter, ChevronDown, ChevronRight, Sparkles, FileCheck, ExternalLink, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type Topic, type Flashcard, type TestQuestion } from '@/lib/storage';
import { type ConvocatoriaDescriptor, getTopicIdsInConvocatoria } from '@/lib/data-api';

type FilterMode = 'none' | 'convocatoria' | 'tema';

interface TopicGroup {
  parent: Topic;
  subtopics: Topic[];
  totalItems: number;
}

interface StudyFiltersPopoverProps {
  topics: Topic[];
  items: Flashcard[] | TestQuestion[];
  activeConvocatoria: ConvocatoriaDescriptor | null;
  // Filter state
  filterMode: FilterMode;
  selectedTopicIds: string[];
  originFilter: string;
  expandedGroups: string[];
  // Callbacks
  onFilterModeChange: (mode: FilterMode) => void;
  onSelectedTopicsChange: (topicIds: string[]) => void;
  onOriginFilterChange: (origin: string) => void;
  onExpandedGroupsChange: (groups: string[]) => void;
  // Derived count
  filteredCount: number;
}

const getOriginTag = (origin?: string) => {
  const o = (origin ?? 'generated').trim() || 'generated';

  if (o === 'oficial') {
    return {
      label: 'Oficial',
      icon: FileCheck,
      className: 'border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400',
    };
  }

  if (o === 'ia' || o === 'generated') {
    return {
      label: o === 'ia' ? 'IA' : 'Generadas',
      icon: Sparkles,
      className: 'border-violet-300 text-violet-600 dark:border-violet-700 dark:text-violet-400',
    };
  }

  return {
    label: o,
    icon: ExternalLink,
    className: 'border-sky-300 text-sky-700 dark:border-sky-700 dark:text-sky-400',
  };
};

export default function StudyFiltersPopover({
  topics,
  items,
  activeConvocatoria,
  filterMode,
  selectedTopicIds,
  originFilter,
  expandedGroups,
  onFilterModeChange,
  onSelectedTopicsChange,
  onOriginFilterChange,
  onExpandedGroupsChange,
  filteredCount,
}: StudyFiltersPopoverProps) {
  // Calcular topic IDs de la convocatoria activa
  const convocatoriaTopicIds = useMemo(() => {
    if (!activeConvocatoria) return [];
    return getTopicIdsInConvocatoria(topics, activeConvocatoria.id);
  }, [topics, activeConvocatoria]);

  // Agrupar topics por padre
  const topicGroups = useMemo((): TopicGroup[] => {
    const parentTopics = topics.filter(t => !t.parentId);
    return parentTopics.map(parent => {
      const subtopics = topics.filter(t => t.parentId === parent.id);
      const allIds = [parent.id, ...subtopics.map(s => s.id)];
      const getTopicId = (item: Flashcard | TestQuestion) => item.topicId;
      const totalItems = items.filter(item => allIds.includes(getTopicId(item))).length;
      return { parent, subtopics, totalItems };
    });
  }, [topics, items]);

  // Orígenes únicos disponibles
  const availableOrigins = useMemo(() => {
    const origins = new Set<string>();
    items.forEach(item => {
      origins.add((item.origin || 'generated').trim() || 'generated');
    });
    return Array.from(origins);
  }, [items]);

  const toggleGroup = (groupId: string) => {
    onExpandedGroupsChange(
      expandedGroups.includes(groupId)
        ? expandedGroups.filter(id => id !== groupId)
        : [...expandedGroups, groupId]
    );
  };

  const toggleTopic = (topicId: string) => {
    onSelectedTopicsChange(
      selectedTopicIds.includes(topicId)
        ? selectedTopicIds.filter(id => id !== topicId)
        : [...selectedTopicIds, topicId]
    );
  };

  const toggleGroupSelection = (group: TopicGroup) => {
    const allIds = [group.parent.id, ...group.subtopics.map(s => s.id)];
    const allSelected = allIds.every(id => selectedTopicIds.includes(id));
    
    if (allSelected) {
      onSelectedTopicsChange(selectedTopicIds.filter(id => !allIds.includes(id)));
    } else {
      onSelectedTopicsChange([...new Set([...selectedTopicIds, ...allIds])]);
    }
  };

  const selectConvocatoriaTopics = () => {
    onFilterModeChange('convocatoria');
    onSelectedTopicsChange(convocatoriaTopicIds);
  };

  const selectAllTopics = () => {
    onSelectedTopicsChange(topics.map(t => t.id));
  };

  const clearAllTopics = () => {
    onSelectedTopicsChange([]);
  };

  // Determinar si hay filtros activos
  const hasActiveFilters = filterMode !== 'none' || selectedTopicIds.length > 0 || originFilter !== 'all';

  return (
    <TooltipProvider>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">
                {filteredCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 max-w-[calc(100vw-2rem)] p-0" align="end">
          <div className="p-4 pb-2">
            <h4 className="font-medium text-sm">Filtrar contenido</h4>
            <p className="text-xs text-muted-foreground">Selecciona convocatoria, temas u origen</p>
          </div>
          
          <Separator />

        <ScrollArea className="max-h-[400px]">
          <div className="p-4 space-y-4">
            {/* Filtro por convocatoria */}
            {activeConvocatoria && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Convocatoria</span>
                </div>
                <Button
                  variant={filterMode === 'convocatoria' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={selectConvocatoriaTopics}
                >
                  <span 
                    className="w-2 h-2 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: activeConvocatoria.color || '#6b7280' }}
                  />
                  {activeConvocatoria.shortTitle}
                  <Badge variant="secondary" className="ml-auto text-[10px]">
                    {convocatoriaTopicIds.length} temas
                  </Badge>
                </Button>
              </div>
            )}

            {activeConvocatoria && <Separator />}

            {/* Filtro por tema */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Temas</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={() => {
                      onFilterModeChange('tema');
                      selectAllTopics();
                    }}
                  >
                    Todos
                  </Button>
                  <span className="text-muted-foreground">·</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={() => {
                      onFilterModeChange('none');
                      clearAllTopics();
                    }}
                  >
                    Limpiar
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                {topicGroups.map((group) => {
                  const isExpanded = expandedGroups.includes(group.parent.id);
                  const allIds = [group.parent.id, ...group.subtopics.map(s => s.id)];
                  const selectedCount = allIds.filter(id => selectedTopicIds.includes(id)).length;
                  const allSelected = selectedCount === allIds.length;
                  const someSelected = selectedCount > 0 && !allSelected;
                  const inConvocatoria = filterMode === 'convocatoria' && convocatoriaTopicIds.includes(group.parent.id);
                  
                  return (
                    <div key={group.parent.id} className="border border-border rounded-lg overflow-hidden">
                      <div 
                        className={`flex items-center gap-2 p-2 bg-card hover:bg-muted/50 transition-colors ${
                          allSelected ? 'bg-primary/5' : someSelected ? 'bg-primary/3' : ''
                        }`}
                      >
                        {group.subtopics.length > 0 && (
                          <button
                            onClick={() => toggleGroup(group.parent.id)}
                            className="p-0.5 hover:bg-muted rounded"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3 w-3 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            )}
                          </button>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => {
                                if (filterMode === 'convocatoria') {
                                  onFilterModeChange('tema');
                                }
                                toggleGroupSelection(group);
                              }}
                              className={`flex-1 flex items-center gap-2 text-left min-w-0 ${
                                allSelected ? 'text-primary font-medium' : 'text-foreground'
                              }`}
                            >
                              <div 
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: group.parent.color || '#6b7280' }}
                              />
                              <span className="text-xs truncate">{group.parent.title}</span>
                              {inConvocatoria && (
                                <Badge 
                                  variant="outline" 
                                  className="text-[8px] px-1 py-0 h-3 border-green-400 text-green-600 flex-shrink-0"
                                >
                                  ✓
                                </Badge>
                              )}
                              <Badge variant="secondary" className="ml-auto text-[9px] px-1 flex-shrink-0">
                                {group.totalItems}
                              </Badge>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>{group.parent.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      
                      {isExpanded && group.subtopics.length > 0 && (
                        <div className="border-t border-border bg-muted/30">
                          {group.subtopics.map((subtopic) => {
                            const isSelected = selectedTopicIds.includes(subtopic.id);
                            const getTopicId = (item: Flashcard | TestQuestion) => item.topicId;
                            const itemCount = items.filter(item => getTopicId(item) === subtopic.id).length;
                            const subtopicInConvocatoria = filterMode === 'convocatoria' && convocatoriaTopicIds.includes(subtopic.id);
                            
                            return (
                              <Tooltip key={subtopic.id}>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => {
                                      if (filterMode === 'convocatoria') {
                                        onFilterModeChange('tema');
                                      }
                                      toggleTopic(subtopic.id);
                                    }}
                                    className={`w-full flex items-center gap-2 px-2 py-1.5 pl-8 text-left hover:bg-muted/50 transition-colors min-w-0 ${
                                      isSelected ? 'bg-primary/5 text-primary' : 'text-muted-foreground'
                                    }`}
                                  >
                                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                      isSelected ? 'bg-primary' : 'bg-muted-foreground/30'
                                    }`} />
                                    <span className="text-[11px] flex-1 truncate">{subtopic.title}</span>
                                    {subtopicInConvocatoria && (
                                      <Badge 
                                        variant="outline" 
                                        className="text-[8px] px-1 py-0 h-3 border-green-400 text-green-600 flex-shrink-0"
                                      >
                                        ✓
                                      </Badge>
                                    )}
                                    <span className="text-[9px] text-muted-foreground flex-shrink-0">{itemCount}</span>
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p>{subtopic.title}</p>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Filtro por origen */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Origen</span>
              </div>
              <div className="flex gap-1 flex-wrap">
                <Button
                  variant={originFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => onOriginFilterChange('all')}
                >
                  Todos
                </Button>
                
                {availableOrigins.includes('generated') && (
                  <Button
                    variant={originFilter === 'generated' ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 px-2 text-xs gap-1"
                    onClick={() => onOriginFilterChange('generated')}
                  >
                    <Sparkles className="h-3 w-3" />
                    Generadas
                  </Button>
                )}

                {availableOrigins.filter(o => o !== 'generated' && o !== 'ia').map(origin => {
                  const tag = getOriginTag(origin);
                  const Icon = tag.icon;
                  return (
                    <Button
                      key={origin}
                      variant={originFilter === origin ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 px-2 text-xs gap-1"
                      onClick={() => onOriginFilterChange(origin)}
                    >
                      <Icon className="h-3 w-3" />
                      {tag.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>

        <Separator />

        <div className="p-3 bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {hasActiveFilters 
                ? `${filteredCount} elementos seleccionados`
                : 'Sin filtros activos'
              }
            </span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs px-2"
                onClick={() => {
                  onFilterModeChange('none');
                  onSelectedTopicsChange([]);
                  onOriginFilterChange('all');
                }}
              >
                Resetear filtros
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
    </TooltipProvider>
  );
}
