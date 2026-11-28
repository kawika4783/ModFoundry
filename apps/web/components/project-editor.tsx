'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, DraftDocument, Project } from './api-client';

type SourcePreview = { documentVersion: number; modId: string; status: 'UNTESTED_SOURCE'; diagnostics: string[]; files: Record<string, string> };

export function ProjectEditor({ id }: { id: string }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [document, setDocument] = useState<DraftDocument | null>(null);
  const [status, setStatus] = useState('Loading…');
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);
  const [source, setSource] = useState<SourcePreview | null>(null);
  const [selectedFile, setSelectedFile] = useState('');
  const saving = useRef(false);
  const lastSaved = useRef('');
  const version = useRef(1);
  useEffect(() => {
    api<Project>('/projects/' + id).then(value => {
      setProject(value); setDocument(value.targets[0].document);
      lastSaved.current = JSON.stringify(value.targets[0].document);
      version.current = value.targets[0].documentVersion;
      setStatus('Saved');
    }).catch(problem => {
      if (problem.message === 'Unauthorized') router.replace('/account');
      else setError(problem.message);
    });
  }, [id, router]);
  const serialized = JSON.stringify(document);
  const save = useCallback(async () => {
    if (!project || !document || saving.current || serialized === lastSaved.current) return;
    saving.current = true; setStatus('Saving…');
    try {
      const target = await api<{ documentVersion: number }>(`/projects/${id}/targets/${project.targets[0].id}`, {
        method: 'PATCH', body: { documentVersion: version.current, document },
      });
      version.current = target.documentVersion;
      lastSaved.current = serialized;
      setError(''); setStatus('Saved');
    } catch (problem) {
      setStatus('Save failed');
      setError(problem instanceof Error ? problem.message : 'Unable to save');
    } finally { saving.current = false; setTick(value => value + 1); }
  }, [id, project, document, serialized]);
  useEffect(() => {
    if (!project || !document || serialized === lastSaved.current || error) return;
    setStatus('Unsaved changes');
    const timer = setTimeout(() => { void save(); }, 700);
    return () => clearTimeout(timer);
  }, [project, document, serialized, save, tick, error]);
  if (error && !project) return <main className="portal"><div className="portalBody"><p className="error" role="alert">{error}</p><Link href="/dashboard">Back to projects</Link></div></main>;
  if (!project || !document) return <main className="portal"><div className="portalBody">Loading editor…</div></main>;
  const target = project.targets[0];
  const update = (changes: Partial<DraftDocument>) => { setError(''); setSource(null); setDocument({ ...document, ...changes } as DraftDocument); };
  const inspectSource = async () => {
    setError('');
    try {
      const result = await api<SourcePreview>(`/projects/${id}/targets/${target.id}/source`);
      if (result.documentVersion !== version.current || serialized !== lastSaved.current) throw new Error('Save changes before inspecting source');
      setSource(result);
      setSelectedFile(Object.keys(result.files)[0]);
    } catch (problem) { setError(problem instanceof Error ? problem.message : 'Unable to generate source'); }
  };
  return <main className="portal">
    <header className="portalHeader"><Link href="/" className="portalBrand">▧ ModFoundry</Link><Link href="/dashboard">← Projects</Link><span>{status}</span></header>
    <div className="portalBody editorPage">
      <div className="portalIntro"><span className="eyebrow">PROJECT / {project.name.toUpperCase()}</span><h1>{document.displayName}</h1><p>{target.profile.edition} Edition · Minecraft {target.profile.gameVersion} · {target.profile.loader ?? 'Native pack'} · {target.profile.status.toLowerCase()} configuration</p></div>
      {error && <p role="alert" className="error">{error} {error.includes('changed') && 'Reload the page to review the latest saved version.'}</p>}
      <div className="editorGrid"><section className="creationCard">
        <h2>{document.kind === 'block' ? 'Block' : 'Item'} settings</h2>
        <label>Display name<input value={document.displayName} maxLength={80} onChange={event => update({ displayName: event.target.value })}/></label>
        <label>Identifier<input value={document.identifier} maxLength={64} pattern="[a-z][a-z0-9_]*" onChange={event => update({ identifier: event.target.value })}/></label>
        {document.kind === 'block' ? <>
          <label>Light level: {document.lightLevel}<input type="range" min="0" max="15" value={document.lightLevel} onChange={event => update({ lightLevel: Number(event.target.value) })}/></label>
          <label>Hardness: {document.hardness}<input type="range" min="0" max="50" step="0.5" value={document.hardness} onChange={event => update({ hardness: Number(event.target.value) })}/></label>
        </> : <label>Stack size: {document.stackSize}<input type="range" min="1" max="64" value={document.stackSize} onChange={event => update({ stackSize: Number(event.target.value) })}/></label>}
        <p className="compatNote">Changes save automatically. Generated source is for inspection; compilation and in-game testing are not available for this candidate profile.</p>
        <button type="button" className="portalButton" disabled={saving.current || serialized !== lastSaved.current} onClick={() => void inspectSource()}>Inspect generated source</button>
      </section><section className="creationCard previewCard"><h2>Draft summary</h2><div className="draftPreview"><div className="draftMark">▧</div><strong>{document.displayName || 'Unnamed'}</strong><code>{source?.modId ?? 'project'}:{document.identifier}</code><span>{document.kind.toUpperCase()}</span></div><p className="compatNote">Generated models use vanilla placeholder textures. No custom texture or in-game preview is available yet.</p></section></div>
      {source && <section className="creationCard sourcePanel" aria-label="Generated source"><h2>Generated source · untested</h2>{source.diagnostics.map(message => <p className="compatNote" key={message}>{message}</p>)}<label>File<select value={selectedFile} onChange={event => setSelectedFile(event.target.value)}>{Object.keys(source.files).map(path => <option key={path} value={path}>{path}</option>)}</select></label><pre><code>{source.files[selectedFile]}</code></pre></section>}
    </div>
  </main>;
}
