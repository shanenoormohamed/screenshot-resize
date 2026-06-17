import { formatBytes } from '../lib/download';
import type { InputFile } from '../types';

type FileListProps = {
  files: InputFile[];
  onRemove: (id: string) => void;
};

const KIND_LABELS = {
  still: 'Image',
  gif: 'GIF',
  video: 'Video',
};

export function FileList({ files, onRemove }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <section className="file-list">
      <h2>Files ({files.length})</h2>
      <ul>
        {files.map((item) => (
          <li key={item.id} className="file-list__item">
            <div className="file-list__info">
              <span className="file-list__name">{item.file.name}</span>
              <span className="file-list__meta">
                {KIND_LABELS[item.kind]}
                {item.width && item.height
                  ? ` · ${item.width}×${item.height}`
                  : ''}
                {' · '}
                {formatBytes(item.file.size)}
              </span>
            </div>
            <button
              type="button"
              className="file-list__remove"
              onClick={() => onRemove(item.id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
