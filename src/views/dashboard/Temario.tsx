'use client';

import { useState, useEffect } from 'react';
import { Plus, ChevronRight, Check, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Topic, getTopics, saveTopics } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const Temario = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setTopics(getTopics());
  }, []);

  const handleAddTopic = () => {
    if (!newTitle.trim()) return;

    const topic: Topic = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      description: newDescription.trim(),
      parentId: null,
      order: topics.length,
      completed: false,
    };

    const updated = [...topics, topic];
    setTopics(updated);
    saveTopics(updated);
    setNewTitle('');
    setNewDescription('');
    setDialogOpen(false);
    toast({ title: 'Tema añadido', description: 'El tema se ha creado correctamente.' });
  };

  const handleUpdateTopic = () => {
    if (!editingTopic || !newTitle.trim()) return;

    const updated = topics.map(t =>
      t.id === editingTopic.id
        ? { ...t, title: newTitle.trim(), description: newDescription.trim() }
        : t
    );
    setTopics(updated);
    saveTopics(updated);
    setNewTitle('');
    setNewDescription('');
    setEditingTopic(null);
    setDialogOpen(false);
    toast({ title: 'Tema actualizado' });
  };

  const handleToggleComplete = (id: string) => {
    const updated = topics.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTopics(updated);
    saveTopics(updated);
  };

  const handleDelete = (id: string) => {
    const updated = topics.filter(t => t.id !== id);
    setTopics(updated);
    saveTopics(updated);
    toast({ title: 'Tema eliminado' });
  };

  const openEditDialog = (topic: Topic) => {
    setEditingTopic(topic);
    setNewTitle(topic.title);
    setNewDescription(topic.description);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTopic(null);
    setNewTitle('');
    setNewDescription('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Temario</h1>
          <p className="text-muted-foreground">Organiza los temas de tu oposición</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingTopic(null); setNewTitle(''); setNewDescription(''); }}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir tema
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTopic ? 'Editar tema' : 'Nuevo tema'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Ej: Constitución Española"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el contenido del tema..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button onClick={editingTopic ? handleUpdateTopic : handleAddTopic}>
                  {editingTopic ? 'Guardar cambios' : 'Crear tema'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {topics.length === 0 ? (
        <Card className="border-border border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No tienes temas creados todavía.
            </p>
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear tu primer tema
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {topics.map((topic, index) => (
            <Card
              key={topic.id}
              className={`border-border transition-all ${topic.completed ? 'bg-muted/50' : ''}`}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <Checkbox
                  checked={topic.completed}
                  onCheckedChange={() => handleToggleComplete(topic.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <h3
                      className={`font-medium truncate ${
                        topic.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}
                    >
                      {topic.title}
                    </h3>
                    {topic.completed && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </div>
                  {topic.description && (
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {topic.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(topic)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(topic.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Temario;
