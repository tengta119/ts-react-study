/**
 * TASK-005: 业务实体类型契约
 */
export interface ApiUser {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  company?: {
    name: string;
  };
}
