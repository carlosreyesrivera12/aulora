import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON } from './config.js';

const PLACEHOLDER = !SUPABASE_URL || SUPABASE_URL.indexOf('REEMPLAZA') >= 0;

if (PLACEHOLDER) {
  window.AuloraBackend = { enabled: false };
  console.info('[Aulora] Supabase sin configurar: modo local (localStorage).');
  if (window.auloraBackendReady) window.auloraBackendReady();
} else {
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON);
  let saveT = null, colegioId = null;

  async function getColegio() {
    if (colegioId) return colegioId;
    const { data } = await sb.from('perfiles').select('colegio_id').limit(1).maybeSingle();
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
      const cid = await getColegio(); if (!cid) return null;
      const { data } = await sb.from('colegio_datos').select('data').eq('colegio_id', cid).maybeSingle();
      return data ? data.data : null;
    },
    save: (db) => {
      if (saveT) clearTimeout(saveT);
      const clean = JSON.parse(JSON.stringify(db));
      saveT = setTimeout(async () => {
        const cid = await getColegio(); if (!cid) return;
        const { error } = await sb.from('colegio_datos')
          .upsert({ colegio_id: cid, data: clean, updated_at: new Date().toISOString() });
        if (error) console.error('[Aulora] save:', error);
      }, 700);
    }
  };
  if (window.auloraBackendReady) window.auloraBackendReady();
}
