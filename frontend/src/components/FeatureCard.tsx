import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  accentColor: "yellow" | "pink" | "teal" | "purple";
}

const accentColors = {
  yellow: "bg-[hsl(var(--pastel-yellow))]",
  pink: "bg-[hsl(var(--pastel-pink))]",
  teal: "bg-[hsl(var(--pastel-teal))]",
  purple: "bg-purple-200 dark:bg-purple-900/30",
};

export const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  features,
  accentColor 
}: FeatureCardProps) => {
  return (
    <div className="relative border-2 border-border bg-card p-8 shadow-lg hover:shadow-xl transition-shadow group">
      {/* Accent corner */}
      <div className={`absolute top-0 right-0 w-16 h-16 ${accentColors[accentColor]} -z-10 border-l-2 border-b-2 border-border`} />
      
      <div className="mb-4">
        <div className="inline-flex p-3 border-2 border-border bg-background">
          <Icon className="h-8 w-8" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-foreground mt-2 flex-shrink-0" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
