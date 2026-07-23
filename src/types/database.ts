// Tipos gerados por `npm run db:types` (supabase gen types typescript --local).
// Placeholder até a Fase 2 criar o schema no banco.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
