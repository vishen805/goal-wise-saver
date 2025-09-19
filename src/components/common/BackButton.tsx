import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  variant?: 'ghost' | 'outline';
  className?: string;
}

export default function BackButton({ 
  onClick, 
  label = 'Back', 
  variant = 'ghost',
  className 
}: BackButtonProps) {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      className={`flex items-center gap-2 touch-manipulation ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="text-sm">{label}</span>
    </Button>
  );
}