import React, { useState } from 'react';

/**
 * TASK-002: 经典待办清单 (Todo List)
 *
 * 🎯 你的目标：
 * 1. 定义 TodoItem 接口（id, text, completed 等）
 * 2. 使用 useState 管理待办事项数组列表
 * 3. 实现新增待办（输入框回车或点击添加）
 * 4. 实现勾选切换完成状态（必须使用不可变数据 map，严禁原地修改！）
 * 5. 实现删除待办（使用 filter）
 * 6. 支持 3 种筛选过滤：'all' | 'active' | 'completed'
 */

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export type FilterStatus = 'all' | 'active' | 'completed';

export const TodoList: React.FC = () => {
  // TODO: 声明 todos 状态列表
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: '1', text: '理解 React 状态不可变性', completed: true, createdAt: Date.now() },
    { id: '2', text: '完成 TodoList 自主编码', completed: false, createdAt: Date.now() },
  ]);

  // 输入框文字状态
  const [inputText, setInputText] = useState<string>('');

  // 过滤状态
  const [filter, setFilter] = useState<FilterStatus>('all');

  // TODO: 实现添加待办
  const handleAddTodo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    const newTodo: TodoItem = {
      id: crypto.randomUUID(),
      text: inputText.trim(),
      completed: false,
      createdAt: Date.now()
    }
    setTodos((prev) => [... prev, newTodo]);
    setInputText('');
  };

  // TODO: 实现切换勾选状态
  const handleToggleTodo = (id: string) => {
    // TODO: 使用 todos.map(...) 产生新数组，切勿原地修改！
    setTodos((prev) => prev.map((t) => (t.id === id ? {... t, completed: !t.completed} : t)));
  };

  // TODO: 实现删除待办
  const handleDeleteTodo = (id: string) => {
    // TODO: 使用 todos.filter(...) 过滤掉对应 id
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  // 派生状态：根据 filter 筛选后的待办列表（不需要定义新的 state！）
  const filteredTodos = todos.filter((item) => {
    if (filter === 'active') return !item.completed;
    if (filter === 'completed') return item.completed;
    return true;
  });

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px' }}>
      <h2>TASK-002: Todo List</h2>

      {/* 新增输入表单 */}
      <form onSubmit={handleAddTodo} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="输入新待办并回车..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
        />
        <button
          type="submit"
          style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          添加
        </button>
      </form>

      {/* 筛选切换按钮 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {(['all', 'active', 'completed'] as FilterStatus[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '4px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              background: filter === tab ? '#3b82f6' : '#f3f4f6',
              color: filter === tab ? '#fff' : '#374151',
              border: 'none',
            }}
          >
            {tab === 'all' ? '全部' : tab === 'active' ? '待办' : '已完成'}
          </button>
        ))}
      </div>

      {/* 待办列表 */}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {filteredTodos.map((item) => (
          <li
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => handleToggleTodo(item.id)}
              />
              <span style={{ textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? '#9ca3af' : '#111827' }}>
                {item.text}
              </span>
            </label>
            <button
              onClick={() => handleDeleteTodo(item.id)}
              style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px' }}
            >
              删除
            </button>
          </li>
        ))}
      </ul>

      {/* 统计提示 */}
      <div style={{ marginTop: '16px', fontSize: '13px', color: '#6b7280' }}>
        总计: {todos.length} | 剩余未完成: {todos.filter(t => !t.completed).length}
      </div>
    </div>
  );
};
