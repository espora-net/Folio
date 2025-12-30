'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import { STUDY_TYPES, type StudyType, completeOnboarding } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface StudyTypeSelectorProps {
  onComplete: () => void;
}

const StudyTypeSelector = ({ onComplete }: StudyTypeSelectorProps) => {
  const [selected, setSelected] = useState<StudyType | null>(null);
  const [customLabel, setCustomLabel] = useState('');

  const handleContinue = () => {
    if (!selected) return;
    completeOnboarding(selected, customLabel.trim() || undefined);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">¡Bienvenido a Folio! 📚</h1>
          <p className="text-muted-foreground">
            ¿Qué estás estudiando? Esto nos ayudará a personalizar tu experiencia.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {STUDY_TYPES.map((type) => (
            <Card
              key={type.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                selected === type.id
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
              )}
              onClick={() => setSelected(type.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>
                    {type.icon} {type.label}
                  </span>
                  {selected === type.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <CardDescription>{type.description}</CardDescription>
                <p className="text-xs text-muted-foreground mt-2">
                  Ej: {type.examples.join(', ')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {selected && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="customLabel">
                ¿Quieres especificar qué estudias? (opcional)
              </Label>
              <Input
                id="customLabel"
                placeholder={
                  selected === 'oposiciones'
                    ? 'Ej: Auxiliar Administrativo del Estado'
                    : selected === 'conducir'
                    ? 'Ej: Permiso B'
                    : selected === 'secundaria'
                    ? 'Ej: 2º Bachillerato Ciencias'
                    : selected === 'universidad'
                    ? 'Ej: Grado en Derecho'
                    : selected === 'idiomas'
                    ? 'Ej: Cambridge B2 First'
                    : 'Ej: Certificación AWS'
                }
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
              />
            </div>
            <Button className="w-full" size="lg" onClick={handleContinue}>
              Continuar
            </Button>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Podrás cambiar esto más adelante en la configuración.
        </p>
      </div>
    </div>
  );
};

export default StudyTypeSelector;
