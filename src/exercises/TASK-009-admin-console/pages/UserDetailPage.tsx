import type React from 'react';

/**
 * TASK-009: 用户详情页（动态路由 + 三态）
 *
 * ================== TODO ④【你来实现】==================
 * 1) 取路径参数：`const { id } = useParams<{ id: string }>()`
 *      ⚠️ 拿到的是 `string | undefined`，需要做非空判断与 Number() 转换
 * 2) 请求详情：`GET /api/users/{id}`（公开接口，可用 TASK-007 的 httpClient 直接调）
 *      - 三态：loading / error（404 时后端返回中文「用户 ID=x 未找到」）/ data
 * 3) 展示：name / username / email / phone / company.name
 * 4) 返回：`navigate('/users')` 或 `navigate(-1)`
 * 5) （进阶）页面内直接提供「编辑」入口：打开 UserFormModal（编辑模式），保存后重新拉详情
 * ======================================================
 */
export const UserDetailPage: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: '#fffbeb',
        border: '1px solid #fde68a',
        color: '#92400e',
        borderRadius: '10px',
        padding: '20px',
        fontSize: '13px',
        lineHeight: 1.8,
      }}
    >
      <strong>📄 TODO ④：用户详情页待实现</strong>
      <div>· useParams 取 :id（string | undefined，注意类型收窄）</div>
      <div>· GET /api/users/:id + 三态渲染（404 显示后端中文提示）</div>
      <div>· 展示 name / username / email / phone / company</div>
      <div>· 返回列表按钮（navigate('/users') 或 navigate(-1)）</div>
    </div>
  );
};
