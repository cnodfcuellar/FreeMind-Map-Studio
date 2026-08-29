import React, { useState } from 'react';
import { MindNode } from '../../../types/mindmap';
import { MarkdownView } from '../../../utils/markdownRenderer';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Quote,
  Heading1,
  Heading2,
  Columns,
  Eye,
  Edit3,
} from 'lucide-react';

interface NotesTabProps {
  selectedNode: MindNode;
  onUpdateNode: (nodeId: string, updates: Partial<MindNode>) => void;
}

export const NotesTab: React.FC<NotesTabProps> = ({ selectedNode, onUpdateNode }) => {
  const [viewMode, setViewMode] = useState<'preview' | 'edit' | 'split'>('preview');

  const handleInsertMarkdown = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const currentNote = selectedNode.note || '';
    const textarea = document.getElementById('node-note-textarea') as HTMLTextAreaElement | null;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = currentNote.substring(start, end) || defaultPlaceholder;
      const replacement = prefix + selectedText + suffix;
      const newText = currentNote.substring(0, start) + replacement + currentNote.substring(end);
      onUpdateNode(selectedNode.id, { note: newText });
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
      }, 0);
    } else {
      onUpdateNode(selectedNode.id, {
        note: (currentNote ? currentNote + '\n' : '') + prefix + defaultPlaceholder + suffix,
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Selector de modo de vista */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
          Nota Markdown
        </span>
        <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('edit')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              viewMode === 'edit' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Solo editor"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              viewMode === 'split' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Vista dividida"
          >
            <Columns className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              viewMode === 'preview' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Solo vista previa"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Toolbar de formato Markdown */}
      {(viewMode === 'edit' || viewMode === 'split') && (
        <div className="flex items-center gap-1 flex-wrap bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => handleInsertMarkdown('**', '**', 'negrita')}
            className="p-1 hover:bg-slate-200/80 rounded text-slate-600 cursor-pointer"
            title="Negrita"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleInsertMarkdown('*', '*', 'cursiva')}
            className="p-1 hover:bg-slate-200/80 rounded text-slate-600 cursor-pointer"
            title="Cursiva"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => handleInsertMarkdown('# ', '', 'Encabezado 1')}
            className="p-1 hover:bg-slate-200/80 rounded text-slate-600 cursor-pointer"
            title="H1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleInsertMarkdown('## ', '', 'Encabezado 2')}
            className="p-1 hover:bg-slate-200/80 rounded text-slate-600 cursor-pointer"
            title="H2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => handleInsertMarkdown('- ', '', 'Elemento')}
            className="p-1 hover:bg-slate-200/80 rounded text-slate-600 cursor-pointer"
            title="Lista con viñetas"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleInsertMarkdown('1. ', '', 'Elemento')}
            className="p-1 hover:bg-slate-200/80 rounded text-slate-600 cursor-pointer"
            title="Lista numerada"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleInsertMarkdown('- [ ] ', '', 'Tarea')}
            className="p-1 hover:bg-slate-200/80 rounded text-slate-600 cursor-pointer"
            title="Casilla de verificación"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => handleInsertMarkdown('`', '`', 'código')}
            className="p-1 hover:bg-slate-200/80 rounded text-slate-600 cursor-pointer"
            title="Código en línea"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleInsertMarkdown('> ', '', 'Cita')}
            className="p-1 hover:bg-slate-200/80 rounded text-slate-600 cursor-pointer"
            title="Cita"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Editor & Preview */}
      <div className="space-y-3">
        {(viewMode === 'edit' || viewMode === 'split') && (
          <textarea
            id="node-note-textarea"
            value={selectedNode.note || ''}
            onChange={(e) => onUpdateNode(selectedNode.id, { note: e.target.value })}
            rows={viewMode === 'split' ? 6 : 12}
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-blue-500 font-mono resize-y shadow-2xs leading-relaxed"
            placeholder="Escribe notas en formato Markdown aquí..."
          />
        )}

        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs min-h-[120px] max-h-[350px] overflow-y-auto">
            {selectedNode.note ? (
              <MarkdownView content={selectedNode.note} />
            ) : (
              <p className="text-slate-400 italic text-center py-6 text-xs">
                Sin notas aún. Cambia al modo editor para escribir.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
