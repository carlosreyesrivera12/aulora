import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON } from './config.js';

const PLACEHOLDER = !SUPABASE_URL || SUPABASE_URL.indexOf('REEMPLAZA') >= 0;

if (PLACEHOLDER) {
  window.AuloraBackend = { enabled: false };
  console.info('[Aulora] Supabase sin configurar: modo local (localStorage).');
  if (window.auloraBackendReady) window.auloraBackendReady();
} else {
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON);
  let saveT = null, colegioId = null, pending = null;

  function backupLocal(d) { try { localStorage.setItem('aulora_db', JSON.stringify(d)); } catch (e) {} }
  async function doSave() {
    if (!pending) return;
    const data = pending;
    const { error } = await sb.rpc('aulora_save', { new_data: data });
    if (error) { console.error('[Aulora] save:', error); backupLocal(data); setTimeout(doSave, 4000); return; } // offline/denegado: respaldo + reintento
    try { localStorage.removeItem('aulora_db'); } catch (e) {} // guardado en nube: no dejar datos en el navegador
    if (pending === data) pending = null;
  }

  async function getColegio() {
    if (colegioId) return colegioId;
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;
    const { data } = await sb.from('perfiles').select('colegio_id').eq('id', user.id).maybeSingle();
    colegioId = data ? data.colegio_id : null;
    return colegioId;
  }

  window.AuloraBackend = {
    enabled: true,
    signIn: (email, pass) =>
      sb.auth.signInWithPassword({ email, password: pass }).then(r => { if (r.error) throw r.error; return r; }),
    signOut: () => sb.auth.signOut(),
    signInGoogle: () => sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href.split('#')[0] } }),
    onAuth: (cb) => {
      sb.auth.getSession().then(({ data }) => cb(data.session ? data.session.user : null));
      sb.auth.onAuthStateChange((_e, s) => { colegioId = null; cb(s ? s.user : null); });
    },
    load: async () => {
      const { data, error } = await sb.rpc('aulora_load');
      if (error) { console.error('[Aulora] load:', error); return null; }
      return data || null;
    },
    save: (db) => {
      pending = JSON.parse(JSON.stringify(db));
      if (saveT) clearTimeout(saveT);
      saveT = setTimeout(doSave, 700);
    },
    flush: () => { if (saveT) { clearTimeout(saveT); saveT = null; } return doSave(); },
    myProfile: async () => { const { data: { user } } = await sb.auth.getUser(); if (!user) return null; const { data } = await sb.from('perfiles').select('rol,nombre').eq('id', user.id).maybeSingle(); return data || null; }
  };
  if (window.auloraBackendReady) window.auloraBackendReady();
}
