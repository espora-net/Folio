import { BookOpen, Brain, ClipboardCheck, BarChart3, Moon, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: BookOpen,
    title: 'Gestión de Temario',
    description: 'Organiza y estudia el contenido de tu oposición con una estructura jerárquica clara e intuitiva.',
  },
  {
    icon: Brain,
    title: 'Tarjetas de Estudio',
    description: 'Sistema de repaso espaciado basado en la ciencia para una memorización más efectiva y duradera.',
  },
  {
    icon: ClipboardCheck,
    title: 'Tests de Práctica',
    description: 'Preguntas tipo test con explicaciones detalladas para prepararte de forma realista.',
  },
  {
    icon: BarChart3,
    title: 'Seguimiento de Progreso',
    description: 'Estadísticas de estudio y rachas de aprendizaje para mantener tu motivación.',
  },
  {
    icon: Moon,
    title: 'Modo Oscuro',
    description: 'Interfaz moderna y cómoda para estudiar a cualquier hora del día.',
  },
  {
    icon: Database,
    title: 'Almacenamiento Local',
    description: 'Tus datos siempre seguros y disponibles, guardados directamente en tu dispositivo.',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Todo lo que necesitas para aprobar
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Herramientas diseñadas específicamente para opositores que quieren estudiar de forma eficiente.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-border bg-card hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
