import { supabase } from '@/lib/supabase'

/**
 * Upload com progresso real. O supabase-js v2 não expõe progresso de upload,
 * então vamos direto ao endpoint REST do Storage com XHR (upload.onprogress).
 * A RLS de storage.objects continua valendo (deriva o acesso pela pasta).
 */
export function uploadToStorage(
  bucket: string,
  path: string,
  file: File,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    void supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token
      if (!token) {
        reject(new Error('Sessão expirada. Entre de novo.'))
        return
      }
      const base = import.meta.env.VITE_SUPABASE_URL
      const url = `${base}/storage/v1/object/${bucket}/${path.split('/').map(encodeURIComponent).join('/')}`

      const xhr = new XMLHttpRequest()
      xhr.open('POST', url)
      xhr.setRequestHeader('authorization', `Bearer ${token}`)
      xhr.setRequestHeader('apikey', import.meta.env.VITE_SUPABASE_ANON_KEY)
      xhr.setRequestHeader('x-upsert', 'false')
      if (file.type) xhr.setRequestHeader('content-type', file.type)

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve()
        else reject(new Error(`Falha no upload (${xhr.status}).`))
      }
      xhr.onerror = () => reject(new Error('Falha de rede no upload.'))
      xhr.send(file)
    })
  })
}
