import React, { useEffect, useRef } from 'react';
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react';

const TOOLBAR_BUTTON_CLASS =
  'inline-flex items-center justify-center p-1.5 rounded-md text-gray-600 hover:bg-gray-200 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed';

function ToolbarButton({ onClick, disabled, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={TOOLBAR_BUTTON_CLASS}
      aria-label={label}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value = '', onChange, disabled = false, className = '' }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;
    const html = value || '';
    if (editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
  }, [value]);

  const syncValue = () => {
    onChange?.(editorRef.current?.innerHTML || '');
  };

  const exec = (command) => {
    if (disabled) return;
    document.execCommand(command, false);
    editorRef.current?.focus();
    syncValue();
  };

  return (
    <div className={`rounded-lg border border-gray-300 overflow-hidden bg-white ${className}`}>
      {!disabled ? (
        <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
          <ToolbarButton onClick={() => exec('bold')} disabled={disabled} label="Bold">
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => exec('italic')} disabled={disabled} label="Italic">
            <Italic size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => exec('underline')} disabled={disabled} label="Underline">
            <Underline size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => exec('insertUnorderedList')} disabled={disabled} label="Bullet list">
            <List size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => exec('insertOrderedList')} disabled={disabled} label="Numbered list">
            <ListOrdered size={16} />
          </ToolbarButton>
        </div>
      ) : null}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={syncValue}
        onBlur={syncValue}
        className={`min-h-[140px] px-4 py-2.5 text-sm text-gray-900 focus:outline-none ${
          disabled ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : 'bg-white'
        }`}
        suppressContentEditableWarning
      />
    </div>
  );
}
