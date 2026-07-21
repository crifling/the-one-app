import { Link } from 'react-router-dom';

interface TopBarProps {
  eyebrow?: string;
  title: string;
  /** When true, show the settings button on the right. */
  showSettings?: boolean;
  /** Optional back link (path). */
  back?: string;
}

export function TopBar({ eyebrow, title, showSettings, back }: TopBarProps) {
  return (
    <header className="top">
      <div className="row" style={{ gap: 10 }}>
        {back && (
          <Link className="topbtn" to={back} aria-label="Tilbage">
            ‹
          </Link>
        )}
        <div>
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h1>{title}</h1>
        </div>
      </div>
      {showSettings && (
        <Link className="topbtn" to="/settings" aria-label="Indstillinger og backup">
          ⚙
        </Link>
      )}
    </header>
  );
}
