export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          icon: string
          id: number
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon: string
          id?: number
          name: string
          sort_order: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: number
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      ingredients: {
        Row: {
          category_id: number
          created_at: string
          icon: string | null
          id: number
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_id: number
          created_at?: string
          icon?: string | null
          id?: number
          name: string
          sort_order: number
          updated_at?: string
        }
        Update: {
          category_id?: number
          created_at?: string
          icon?: string | null
          id?: number
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ingredients_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }
      portions: {
        Row: {
          amount: string
          created_at: string
          id: number
          ingredient_id: number | null
          name: string | null
          recipe_id: number
          updated_at: string
        }
        Insert: {
          amount: string
          created_at?: string
          id?: number
          ingredient_id?: number | null
          name?: string | null
          recipe_id: number
          updated_at?: string
        }
        Update: {
          amount?: string
          created_at?: string
          id?: number
          ingredient_id?: number | null
          name?: string | null
          recipe_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'portions_ingredient_id_fkey'
            columns: ['ingredient_id']
            isOneToOne: false
            referencedRelation: 'ingredients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'portions_recipe_id_fkey'
            columns: ['recipe_id']
            isOneToOne: false
            referencedRelation: 'recipes'
            referencedColumns: ['id']
          },
        ]
      }
      recipes: {
        Row: {
          calories: number | null
          cooking_time: number
          created_at: string
          description: string | null
          difficulty: number
          genre: number
          id: number
          image_prompt: string | null
          image_url: string | null
          servings: number
          title: string
          updated_at: string
        }
        Insert: {
          calories?: number | null
          cooking_time: number
          created_at?: string
          description?: string | null
          difficulty: number
          genre: number
          id?: number
          image_prompt?: string | null
          image_url?: string | null
          servings: number
          title: string
          updated_at?: string
        }
        Update: {
          calories?: number | null
          cooking_time?: number
          created_at?: string
          description?: string | null
          difficulty?: number
          genre?: number
          id?: number
          image_prompt?: string | null
          image_url?: string | null
          servings?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      records: {
        Row: {
          cooked_at: string
          created_at: string
          id: number
          memo: string | null
          rating: number | null
          recipe_id: number
          updated_at: string
          user_id: string
          user_image_url: string | null
        }
        Insert: {
          cooked_at: string
          created_at?: string
          id?: number
          memo?: string | null
          rating?: number | null
          recipe_id: number
          updated_at?: string
          user_id: string
          user_image_url?: string | null
        }
        Update: {
          cooked_at?: string
          created_at?: string
          id?: number
          memo?: string | null
          rating?: number | null
          recipe_id?: number
          updated_at?: string
          user_id?: string
          user_image_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'records_recipe_id_fkey'
            columns: ['recipe_id']
            isOneToOne: false
            referencedRelation: 'recipes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'records_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      steps: {
        Row: {
          created_at: string
          id: number
          image_url: string | null
          instruction: string
          recipe_id: number
          step_number: number
          tips: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          image_url?: string | null
          instruction: string
          recipe_id: number
          step_number: number
          tips?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          image_url?: string | null
          instruction?: string
          recipe_id?: number
          step_number?: number
          tips?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'steps_recipe_id_fkey'
            columns: ['recipe_id']
            isOneToOne: false
            referencedRelation: 'recipes'
            referencedColumns: ['id']
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
