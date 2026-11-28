'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, DraftDocument, Identity, Profile, Project } from './api-client';

export function ProjectDashboard() {
  const router = useRouter();
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState('');
  const [profileId, setProfileId] = useState('');
  const [kind, setKind] = useState<'block' | 'item'>('block');
  useEffect(() => {
    Promise.all([api<Identity>('/auth/me'), api<Project[]>('/projects'), api<Profile[]>('/compatibility/profiles')])
      .then(([who, saved, available]) => { setIdentity(who); setProjects(saved); setProfiles(available); setProfileId(available[0]?.id ?? ''); })
      .catch(problem => {
        if (problem.message === 'Unauthorized') router.replace('/account');
        else setError(problem.message);
      }).finally(() => setLoading(false));
  }, [router]);
  const selected = profiles.find(value => value.id === profileId);
  const versions = profiles.filter(value => value.edition === selected?.edition);
  async function create() {
    if (!selected) return;
    setBusy(true); setError('');
    try {
      const label = name.trim();
      const identifier = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60);
      const safeIdentifier = /^[a-z]/.test(identifier) ? identifier : 'new_' + identifier;
      const document: DraftDocument = kind === 'block'
        ? { kind, identifier: safeIdentifier || 'new_block', displayName: label, lightLevel: 0, hardness: 1 }
        : { kind, identifier: safeIdentifier || 'new_item', displayName: label, stackSize: 64 };
      const project = await api<Project>('/projects', { method: 'POST', body: { name: label, profileId, document } });
      router.push('/projects/' + project.id);
    } catch (problem) { setError(problem instanceof Error ? problem.message : 'Could not create project'); }
    finally { setBusy(false); }
  }
  async function change(id: string, action: 'archive' | 'restore') {
    setError('');
    try {
      await api('/projects/' + id + '/' + action, { method: 'POST' });
      setProjects(await api<Project[]>('/projects'));
    } catch (problem) { setError(problem instanceof Error ? problem.message : 'Unable to update project'); }
  }
  async function logout() {
    try { await api('/auth/logout', { method: 'POST' }); router.replace('/account'); }
    catch (problem) { setError(problem instanceof Error ? problem.message : 'Unable to sign out'); }
  }
  return <main className="portal">
    <header className="portalHeader"><Link href="/" className="portalBrand">▧ ModFoundry</Link><span>Projects</span><div>{identity?.user.email}<button onClick={logout} disabled={!identity}>Sign out</button></div></header>
    <div className="portalBody"><div className="portalIntro"><span className="eyebrow">FOUNDRY BENCH / WORKSPACE</span><h1>Your projects</h1><p>Choose a Minecraft configuration before making a draft. A candidate profile is available for editor testing, but cannot produce a JAR yet.</p></div>
    {loading ? <p>Loading workspace…</p> : <>
      {error && <p className="error" role="alert">{error}</p>}
      <section className="creationCard"><h2>New project</h2>
        <div className="wizardGrid">
          <label>1. Edition<select value={selected?.edition ?? ''} onChange={event => setProfileId(profiles.find(profile => profile.edition === event.target.value)?.id ?? '')}>
            {[...new Set(profiles.map(profile => profile.edition))].map(edition => <option key={edition} value={edition}>{edition === 'JAVA' ? 'Java Edition' : 'Bedrock Edition'}</option>)}
          </select></label>
          <label>2. Minecraft version<select value={selected?.gameVersion ?? ''} onChange={event => setProfileId(versions.find(profile => profile.gameVersion === event.target.value)?.id ?? '')}>
            {[...new Set(versions.map(profile => profile.gameVersion))].map(version => <option key={version} value={version}>{version}</option>)}
          </select></label>
          <label>3. Loader / format<select value={profileId} onChange={event => setProfileId(event.target.value)}>
            {versions.filter(profile => profile.gameVersion === selected?.gameVersion).map(profile => <option key={profile.id} value={profile.id}>{profile.loader ?? 'Native packs'} {profile.loaderVersion ?? ''} · {profile.status.toLowerCase()}</option>)}
          </select></label>
          <label>4. Draft type<select value={kind} onChange={event => setKind(event.target.value as 'block' | 'item')}><option value="block">Block</option><option value="item">Item</option></select></label>
        </div>
        {selected && <p className="compatNote">Compatibility: <strong>{selected.status}</strong>. {selected.limitations?.join(' ') || 'No limitations recorded.'}</p>}
        <div className="createRow"><label>Project name<input value={name} maxLength={80} onChange={event => setName(event.target.value)} placeholder="Copper Lighting"/></label><button disabled={busy || !name.trim() || !selected} onClick={create}>{busy ? 'Creating…' : 'Create draft'}</button></div>
      </section>
      <section className="projectList"><h2>Saved projects</h2>{projects.length ? projects.map(project => <article key={project.id}>
        <div><h3>{project.name}</h3><p>{project.targets[0]?.profile.edition} {project.targets[0]?.profile.gameVersion} · {project.targets[0]?.profile.loader ?? 'Native'} · {project.status.toLowerCase()}</p></div>
        <div className="projectActions">{project.status === 'ACTIVE' ? <><Link href={'/projects/' + project.id}>Open editor</Link><button onClick={() => change(project.id, 'archive')}>Archive</button></> : <button onClick={() => change(project.id, 'restore')}>Restore</button>}</div>
      </article>) : <p>No saved projects yet.</p>}</section>
    </>}
    </div>
  </main>;
}
