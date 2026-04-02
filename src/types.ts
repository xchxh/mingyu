export type PromptFieldType = 'text' | 'textarea' | 'json';

export type PromptFieldDefinition = {
  id: string;
  label: string;
  type: PromptFieldType;
  placeholder: string;
  required?: boolean;
  helperText?: string;
};

export type PromptTemplate = {
  id: string;
  name: string;
  description: string;
  fields: PromptFieldDefinition[];
  build: (values: Record<string, string>) => {
    system: string;
    user: string;
  };
};
