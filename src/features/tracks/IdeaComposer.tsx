import { useState } from 'react';

interface IdeaComposerProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
}

/** Small inline composer for quickly saving an idea/note to a track. */
export function IdeaComposer({ onSubmit, placeholder }: IdeaComposerProps) {
  const [text, setText] = useState('');

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText('');
  }

  return (
    <div>
      <label className="field" style={{ marginBottom: 8 }}>
        <span className="sr-only" style={{ position: 'absolute', left: -9999 }}>
          Ny idé
        </span>
        <textarea
          className="textarea"
          value={text}
          placeholder={placeholder ?? 'Skriv en idé eller note…'}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <button type="button" className="btn primary block" onClick={submit} disabled={!text.trim()}>
        Gem idé
      </button>
    </div>
  );
}
