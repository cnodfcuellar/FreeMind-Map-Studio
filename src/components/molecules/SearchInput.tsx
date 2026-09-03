import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../atoms/Input';
import { Badge } from '../atoms/Badge';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  matchCount?: number;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Buscar nodos (texto, notas, etiquetas)...',
  matchCount,
  className = '',
}) => {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClear={() => onChange('')}
        placeholder={placeholder}
        size="sm"
        iconLeft={<Search className="w-3.5 h-3.5" />}
        iconRight={
          matchCount !== undefined && value.trim().length > 0 ? (
            <Badge variant="blue" size="xs">
              {matchCount} {matchCount === 1 ? 'coincidencia' : 'coincidencias'}
            </Badge>
          ) : undefined
        }
      />
    </div>
  );
};
