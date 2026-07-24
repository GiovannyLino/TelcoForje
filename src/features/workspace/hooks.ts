import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { qk } from '@/lib/query-keys'
import { useAuth } from '@/features/auth/auth-context'
import type { Database } from '@/types/database'
import { uploadToStorage } from './upload'

type Tables = Database['public']['Tables']
export type Folder = Tables['folders']['Row']
export type FileRow = Tables['files']['Row']
export type FolderVisibility = Database['public']['Enums']['folder_visibility']

const BUCKET = 'files'

export function useFoldersByOpportunity(oppId: string | undefined) {
  return useQuery({
    queryKey: qk.folders.byOpportunity(oppId ?? null),
    enabled: Boolean(oppId),
    queryFn: async (): Promise<Folder[]> => {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('opportunity_id', oppId!)
        .is('deleted_at', null)
        .order('nome')
      if (error) throw error
      return data
    },
  })
}

export function useFilesByFolder(folderId: string | undefined) {
  return useQuery({
    queryKey: qk.files.byFolder(folderId ?? ''),
    enabled: Boolean(folderId),
    queryFn: async (): Promise<FileRow[]> => {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('folder_id', folderId!)
        .eq('is_current', true)
        .is('deleted_at', null)
        .order('nome')
      if (error) throw error
      return data
    },
  })
}

export function useFilesByOpportunity(oppId: string | undefined) {
  return useQuery({
    queryKey: qk.files.byOpportunity(oppId ?? ''),
    enabled: Boolean(oppId),
    queryFn: async (): Promise<FileRow[]> => {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('opportunity_id', oppId!)
        .eq('is_current', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useCreateFolder() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (input: {
      opportunityId: string
      nome: string
      visibility: FolderVisibility
    }) => {
      if (!user) throw new Error('Sem usuário autenticado')
      const { data, error } = await supabase
        .from('folders')
        .insert({
          owner_id: user.id,
          opportunity_id: input.opportunityId,
          nome: input.nome,
          visibility: input.visibility,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (row) => qc.invalidateQueries({ queryKey: qk.folders.byOpportunity(row.opportunity_id) }),
  })
}

function invalidateFiles(qc: ReturnType<typeof useQueryClient>, folderId: string, oppId: string | null) {
  qc.invalidateQueries({ queryKey: qk.files.byFolder(folderId) })
  if (oppId) qc.invalidateQueries({ queryKey: qk.files.byOpportunity(oppId) })
}

export function useUploadFile() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (input: {
      folderId: string
      opportunityId: string | null
      file: File
      onProgress: (pct: number) => void
    }) => {
      if (!user) throw new Error('Sem usuário autenticado')
      const fileId = crypto.randomUUID()
      const path = `${input.folderId}/${fileId}/1__${input.file.name}`
      await uploadToStorage(BUCKET, path, input.file, input.onProgress)
      const { data, error } = await supabase
        .from('files')
        .insert({
          id: fileId,
          folder_id: input.folderId,
          opportunity_id: input.opportunityId,
          nome: input.file.name,
          storage_path: path,
          mime: input.file.type || null,
          size_bytes: input.file.size,
          versao: 1,
          is_current: true,
          uploader_id: user.id,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (row) => invalidateFiles(qc, row.folder_id, row.opportunity_id),
  })
}

export function useCreateFileVersion() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (input: { current: FileRow; file: File; onProgress: (pct: number) => void }) => {
      if (!user) throw new Error('Sem usuário autenticado')
      const { current } = input
      const versao = current.versao + 1
      const fileId = crypto.randomUUID()
      const path = `${current.folder_id}/${fileId}/${versao}__${input.file.name}`
      await uploadToStorage(BUCKET, path, input.file, input.onProgress)
      const { data, error } = await supabase
        .from('files')
        .insert({
          id: fileId,
          folder_id: current.folder_id,
          opportunity_id: current.opportunity_id,
          nome: input.file.name,
          storage_path: path,
          mime: input.file.type || null,
          size_bytes: input.file.size,
          versao,
          replaces_file_id: current.id,
          is_current: true,
          uploader_id: user.id,
        })
        .select()
        .single()
      if (error) throw error
      const off = await supabase.from('files').update({ is_current: false }).eq('id', current.id)
      if (off.error) throw off.error
      return data
    },
    onSuccess: (row) => invalidateFiles(qc, row.folder_id, row.opportunity_id),
  })
}

export function useSoftDeleteFile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: FileRow) => {
      const { error } = await supabase
        .from('files')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', file.id)
      if (error) throw error
      return file
    },
    onSuccess: (file) => invalidateFiles(qc, file.folder_id, file.opportunity_id),
  })
}

export function useUpdateFileTags() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { file: FileRow; tags: string[] }) => {
      const { data, error } = await supabase
        .from('files')
        .update({ tags: input.tags })
        .eq('id', input.file.id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (row) => invalidateFiles(qc, row.folder_id, row.opportunity_id),
  })
}

/** URL assinada de expiração curta para download/preview. */
export async function getSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 300)
  if (error) throw error
  return data.signedUrl
}
