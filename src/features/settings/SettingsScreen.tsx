import { useRef, useState } from 'react';

import { TopBar } from '../../components/TopBar';
import { useToast } from '../../components/ToastProvider';
import { useStore } from '../../store/store';
import { CURRENT_VERSION } from '../../store/defaults';
import {
  backupFilename,
  exportData,
  validateBackup,
  type BackupValidationOk,
} from '../../persistence/backup';
import { todayIso } from '../../lib/dates';

export function SettingsScreen() {
  const store = useStore();
  const { showToast } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<BackupValidationOk | null>(null);
  const [name, setName] = useState(store.settings.userName);

  function handleExport() {
    const json = exportData(store.getData());
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backupFilename(todayIso());
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup eksporteret.');
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    e.target.value = ''; // allow re-selecting the same file
    const result = validateBackup(text);
    if (!result.ok) {
      showToast(result.error, 'error');
      return;
    }
    setPending(result);
  }

  function confirmImport() {
    if (!pending) return;
    store.replaceAll(pending.data);
    setName(pending.data.settings.userName);
    setPending(null);
    showToast(
      pending.migrated
        ? `Data importeret og opdateret fra version ${pending.sourceVersion}.`
        : 'Data importeret.',
    );
  }

  return (
    <>
      <TopBar eyebrow="Indstillinger" title="Backup & data" back="/today" />
      <main>
        <div className="label">Profil</div>
        <div className="card">
          <label className="field" style={{ marginBottom: 8 }}>
            <span>Dit navn</span>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => store.setUserName(name.trim() || 'Ven')}
            />
          </label>
          <div className="meta">Bruges i hilsenen på forsiden.</div>
        </div>

        <div className="label">Backup</div>
        <div className="card">
          <div className="meta" style={{ marginTop: 0, marginBottom: 12, fontSize: 14 }}>
            Al din data ligger kun på denne enhed. Eksportér jævnligt en backup,
            så du ikke mister noget.
          </div>
          <button type="button" className="btn primary block" onClick={handleExport}>
            Eksportér alle data (JSON)
          </button>
          <div style={{ height: 8 }} />
          <button
            type="button"
            className="btn block"
            onClick={() => fileInput.current?.click()}
          >
            Importér fra backup…
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            onChange={handleFile}
            style={{ display: 'none' }}
          />
        </div>

        {pending && (
          <div className="callout warn" role="alertdialog" aria-label="Bekræft import">
            <strong>Erstat alle data?</strong>
            <div style={{ marginTop: 6 }}>
              Import erstatter <b>alt</b> nuværende indhold på denne enhed med
              backuppen
              {pending.migrated
                ? ` (opdateres fra version ${pending.sourceVersion} til ${CURRENT_VERSION})`
                : ''}
              . Dette kan ikke fortrydes.
            </div>
            <div className="actions" style={{ marginTop: 12 }}>
              <button type="button" className="btn" onClick={() => setPending(null)}>
                Annullér
              </button>
              <button type="button" className="btn danger" onClick={confirmImport}>
                Erstat data
              </button>
            </div>
          </div>
        )}

        <div className="label">Nulstil</div>
        <button
          type="button"
          className="btn danger block"
          onClick={() => {
            if (
              confirm(
                'Slet alle data på denne enhed? Eksportér en backup først, hvis du vil gemme noget.',
              )
            ) {
              store.resetAll();
              showToast('Alle data er nulstillet.');
            }
          }}
        >
          Slet alle data
        </button>

        <div className="meta" style={{ textAlign: 'center', marginTop: 24 }}>
          Min Hverdag · dataformat v{CURRENT_VERSION}
        </div>
      </main>
    </>
  );
}
