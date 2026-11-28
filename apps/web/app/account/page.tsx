'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../components/api-client';

export default function AccountPage() {
  const router = useRouter();
  const [register, setRegister] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const fields = new FormData(event.currentTarget);
    try {
      await api('/auth/' + (register ? 'register' : 'login'), { method: 'POST', body: { email: fields.get('email'), password: fields.get('password') } });
      router.push('/dashboard');
    } catch (problem) { setError(problem instanceof Error ? problem.message : 'Unable to sign in'); }
    finally { setBusy(false); }
  }
  return <main className="accountPage"><section className="accountCard">
    <Link href="/" className="eyebrow">ModFoundry / Foundry Bench</Link>
    <h1>{register ? 'Create your workspace' : 'Welcome back'}</h1>
    <p>Save draft projects for an exact Minecraft configuration. Compilation and installation are still in development.</p>
    <form onSubmit={submit}>
      <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>
      <label>Password<input name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} required minLength={12} maxLength={256}/></label>
      {error && <p role="alert" className="error">{error}</p>}
      <button type="submit" disabled={busy}>{busy ? 'Please wait…' : register ? 'Create free account' : 'Sign in'}</button>
    </form>
    <button className="textAction" type="button" onClick={() => { setRegister(!register); setError(''); }}>{register ? 'Already have an account? Sign in' : 'New here? Create a free account'}</button>
  </section></main>;
}
