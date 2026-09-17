import { useState, useEffect } from 'react';
import type { ApiUser } from './types';
/**
 * 通用泛型数据请求 Hook: useFetch<T>
 *
 * @template T 期望返回的数据契约类型 (类似 Java 泛型 <T>)
 * @param url 请求的目标后端 API 接口地址
 * @param initialData 初始默认值 (如空数组 [] 或 null)
 */
export function useFetch<T>(url: string, initialData: T) {
  // 1. 数据状态使用泛型 T
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP 错误: ${res.status}, ${errorText}`);
      }
      // 2. 将返回的 JSON 断言或推导为泛型 T
      const result: T = await res.json();
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '未知网络异常');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]); // 依赖项为 url：当请求地址变化时自动重新拉取！

  return {
    data,
    setData,      // 导出 setData，方便外部进行不可变删除或追加
    loading,
    error,
    refetch: fetchData,
  };
}

//  在同一个文件底部，用 useFetch 组装出具体的 useUsers：
export function useUsers() {
  // 1. 调用通用的 useFetch，传入类型 <ApiUser[]>、URL 和初始空数组 []
  // 巧妙利用解构重命名：把通用的 data 重命名为 users，把 setData 重命名为 setUsers
  const { data: users, setData: setUsers, loading, error, refetch } =
      useFetch<ApiUser[]>('http://127.0.0.1:8000/api/users', []);

  // 2. 赋予业务专属的删除能力
  const removeUser = (id: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // 3. 导出组件所期待的完整业务能力
  return {
    users,
    loading,
    error,
    refetch,
    removeUser,
  };
}