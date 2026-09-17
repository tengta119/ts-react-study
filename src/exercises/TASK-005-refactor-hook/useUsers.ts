import { useState, useEffect } from 'react';
import type { ApiUser } from './types';

/**
 * 自定义 Hook: useUsers
 * 
 * 🎯 目标：将数据请求、三态管理（Loading/Error/Data）从 UI 中彻底剥离！
 * 类比 Java: 类似 Spring 的 @Service UserService，提供获取数据与刷新的能力。
 */
export function useUsers() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/users');
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP 错误: ${res.status}, ${errorText}`);
      }
      const data: ApiUser[] = await res.json();
      setUsers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '未知网络异常');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 返回外部组件所需的状态与操作方法
  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
  };
}
