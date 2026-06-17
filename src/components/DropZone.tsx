import { useRef, useState, type DragEvent } from 'react';
import { ACCEPTED_TYPES } from '../types';

type DropZoneProps = {
  onFiles: (files: FileList | File[]) => void;
  disabled?: boolean;
};

export function DropZone({ onFiles, disabled }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    if (disabled) return;
    if (event.dataTransfer.files.length > 0) {
      onFiles(event.dataTransfer.files);
    }
  };

  return (
    <div
      className={`drop-zone ${dragOver ? 'drop-zone--active' : ''} ${disabled ? 'drop-zone--disabled' : ''}`}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(event) => {
        if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(',')}
        hidden
        onChange={(event) => {
          if (event.target.files) onFiles(event.target.files);
          event.target.value = '';
        }}
      />
      <p className="drop-zone__title">Drop files here</p>
      <p className="drop-zone__hint">PNG, JPG, GIF, MOV, or MP4</p>
    </div>
  );
}
