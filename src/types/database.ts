export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      board_columns: {
        Row: {
          cor: string | null
          created_at: string
          id: string
          nome: string
          position: number
          updated_at: string
          wip_limit: number | null
        }
        Insert: {
          cor?: string | null
          created_at?: string
          id?: string
          nome: string
          position?: number
          updated_at?: string
          wip_limit?: number | null
        }
        Update: {
          cor?: string | null
          created_at?: string
          id?: string
          nome?: string
          position?: number
          updated_at?: string
          wip_limit?: number | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          nome: string
          owner_id: string | null
          segmento: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          nome: string
          owner_id?: string | null
          segmento?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          nome?: string
          owner_id?: string | null
          segmento?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          author_id: string | null
          conteudo_md: string
          created_at: string
          id: string
          opportunity_id: string
          source_template_id: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          conteudo_md?: string
          created_at?: string
          id?: string
          opportunity_id: string
          source_template_id?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          conteudo_md?: string
          created_at?: string
          id?: string
          opportunity_id?: string
          source_template_id?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_source_template_id_fkey"
            columns: ["source_template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          created_at: string
          deleted_at: string | null
          folder_id: string
          id: string
          is_current: boolean
          mime: string | null
          nome: string
          opportunity_id: string | null
          replaces_file_id: string | null
          size_bytes: number | null
          storage_path: string
          tags: string[]
          updated_at: string
          uploader_id: string | null
          versao: number
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          folder_id: string
          id?: string
          is_current?: boolean
          mime?: string | null
          nome: string
          opportunity_id?: string | null
          replaces_file_id?: string | null
          size_bytes?: number | null
          storage_path: string
          tags?: string[]
          updated_at?: string
          uploader_id?: string | null
          versao?: number
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          folder_id?: string
          id?: string
          is_current?: boolean
          mime?: string | null
          nome?: string
          opportunity_id?: string | null
          replaces_file_id?: string | null
          size_bytes?: number | null
          storage_path?: string
          tags?: string[]
          updated_at?: string
          uploader_id?: string | null
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "files_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_replaces_file_id_fkey"
            columns: ["replaces_file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          nome: string
          opportunity_id: string | null
          owner_id: string
          parent_id: string | null
          updated_at: string
          visibility: Database["public"]["Enums"]["folder_visibility"]
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          nome: string
          opportunity_id?: string | null
          owner_id: string
          parent_id?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["folder_visibility"]
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          nome?: string
          opportunity_id?: string | null
          owner_id?: string
          parent_id?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["folder_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "folders_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folders_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          client_id: string
          column_id: string
          created_at: string
          descricao: string | null
          due_date: string | null
          id: string
          owner_id: string
          position: number
          prioridade: Database["public"]["Enums"]["prioridade"]
          tags: string[]
          titulo: string
          updated_at: string
        }
        Insert: {
          client_id: string
          column_id: string
          created_at?: string
          descricao?: string | null
          due_date?: string | null
          id?: string
          owner_id: string
          position?: number
          prioridade?: Database["public"]["Enums"]["prioridade"]
          tags?: string[]
          titulo: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          column_id?: string
          created_at?: string
          descricao?: string | null
          due_date?: string | null
          id?: string
          owner_id?: string
          position?: number
          prioridade?: Database["public"]["Enums"]["prioridade"]
          tags?: string[]
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "board_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cargo: string | null
          created_at: string
          email: string
          id: string
          nome: string
          role: Database["public"]["Enums"]["user_role"]
          squad: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string
          email: string
          id: string
          nome: string
          role?: Database["public"]["Enums"]["user_role"]
          squad?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          role?: Database["public"]["Enums"]["user_role"]
          squad?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          author_id: string | null
          conteudo_md: string
          created_at: string
          id: string
          is_published: boolean
          tags: string[]
          tipo: Database["public"]["Enums"]["template_tipo"]
          titulo: string
          updated_at: string
          versao: number
        }
        Insert: {
          author_id?: string | null
          conteudo_md?: string
          created_at?: string
          id?: string
          is_published?: boolean
          tags?: string[]
          tipo: Database["public"]["Enums"]["template_tipo"]
          titulo: string
          updated_at?: string
          versao?: number
        }
        Update: {
          author_id?: string | null
          conteudo_md?: string
          created_at?: string
          id?: string
          is_published?: boolean
          tags?: string[]
          tipo?: Database["public"]["Enums"]["template_tipo"]
          titulo?: string
          updated_at?: string
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "templates_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      pode_escrever_pasta: { Args: { f_id: string }; Returns: boolean }
      pode_ler_pasta: { Args: { f_id: string }; Returns: boolean }
    }
    Enums: {
      folder_visibility: "private" | "team"
      prioridade: "baixa" | "media" | "alta" | "critica"
      template_tipo: "rfp" | "poc" | "proposta" | "topologia"
      user_role: "admin" | "engenheiro" | "leitor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      folder_visibility: ["private", "team"],
      prioridade: ["baixa", "media", "alta", "critica"],
      template_tipo: ["rfp", "poc", "proposta", "topologia"],
      user_role: ["admin", "engenheiro", "leitor"],
    },
  },
} as const

