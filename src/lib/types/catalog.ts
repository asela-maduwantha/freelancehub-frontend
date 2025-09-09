export interface Category {
  _id: string;
  name: string;
  description?: string;
  parentId?: string | null;
}

export interface Skill {
  _id: string;
  name: string;
  categoryId?: string;
  popularity?: number;
}
