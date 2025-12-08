'use client';

import { useEffect, useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight } from 'lucide-react';

interface Subtopic {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  order: number;
  subtopics?: Subtopic[];
}

export default function TemarioPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/topics');
      const data = await response.json();
      setTopics(data.sort((a: Topic, b: Topic) => a.order - b.order));
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8 text-green-400" />
          <h1 className="text-3xl font-bold">Temario</h1>
        </div>
        <p className="text-zinc-400">
          Explora el contenido de la oposición de Técnico Auxiliar de Bibliotecas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topics list */}
        <div className="lg:col-span-1 space-y-3">
          {topics.map((topic) => (
            <div key={topic.id} className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
              <button
                onClick={() => toggleTopic(topic.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-all"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  <span className="text-xs font-mono text-zinc-500">
                    {String(topic.order).padStart(2, '0')}
                  </span>
                  <span className="font-medium">{topic.title}</span>
                </div>
                {expandedTopics.has(topic.id) ? (
                  <ChevronDown className="w-5 h-5 text-zinc-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-zinc-400" />
                )}
              </button>
              
              {expandedTopics.has(topic.id) && topic.subtopics && topic.subtopics.length > 0 && (
                <div className="border-t border-zinc-800 bg-zinc-950/50">
                  {topic.subtopics.map((subtopic) => (
                    <button
                      key={subtopic.id}
                      onClick={() => setSelectedSubtopic(subtopic)}
                      className={`w-full p-3 pl-12 text-left text-sm hover:bg-zinc-800/50 transition-all ${
                        selectedSubtopic?.id === subtopic.id ? 'bg-zinc-800 text-white' : 'text-zinc-400'
                      }`}
                    >
                      {subtopic.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Content display */}
        <div className="lg:col-span-2">
          {selectedSubtopic ? (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h2 className="text-2xl font-bold mb-4">{selectedSubtopic.title}</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-zinc-300 leading-relaxed whitespace-pre-line">
                  {selectedSubtopic.content}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
              <BookOpen className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">
                Selecciona un subtema para ver su contenido
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
