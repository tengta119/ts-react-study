"""
TASK-004 专属辅助后端服务 (FastAPI)
功能目标：
1. 专为前端 React 学习打造，模拟 Spring Boot RESTful API 服务；
2. 完美对齐前端 TASK-004 的 ApiUser DTO 契约；
3. 支持 CORS 跨域请求；
4. 内置模拟网络延迟 (delay) 与模拟故障 (fail) 功能，方便前端精准调试 Loading 和 Error 状态；
5. 自动生成交互式 Swagger 文档 (http://127.0.0.1:8000/docs)。
"""

import asyncio
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field

app = FastAPI(
    title="TASK-004 React 学习专用后端 API",
    description="对齐 Java Spring Boot RESTful 规范的前端教学辅助接口",
    version="1.0.0",
)

# --------------------------------------------------------------------------
# 1. 跨域配置 (CORS) - 解决前后端分离核心痛点
# --------------------------------------------------------------------------
# 相当于 Spring Boot 中的 @CrossOrigin 或 WebMvcConfigurer 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",  # 学习阶段放行所有本地开发源
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------------------------------
# 2. DTO 数据传输对象定义 (Pydantic Model)
# --------------------------------------------------------------------------
# 相当于 Java 的 Record 或带 @Data 的 POJO 类
class CompanyDTO(BaseModel):
    name: str = Field(..., description="公司/团队名称", example="Alibaba Cloud Architecture")

class UserDTO(BaseModel):
    id: int = Field(..., description="用户唯一主键 ID", example=1)
    name: str = Field(..., description="用户全名", example="张三 (Java 后端架构师)")
    username: str = Field(..., description="系统登录名", example="zhangsan")
    email: str = Field(..., description="电子邮箱", example="zhangsan@company.com")
    phone: str = Field(..., description="联系电话", example="138-0000-0001")
    company: Optional[CompanyDTO] = Field(
        default_factory=lambda: CompanyDTO(name="独立开发者"),
        description="所在公司或部门信息"
    )

class PageResult(BaseModel):
    """分页响应包裹 DTO (对齐 Spring Data 的 Page<T> 常用字段)

    对应 Java:
        {"list": [...], "total": 25, "page": 1, "size": 5, "totalPages": 5}
    前端 TS 侧契约见 src/exercises/TASK-007-http-layer/types.ts
    """
    list: List[UserDTO] = Field(..., description="当前页数据切片", example=[])
    total: int = Field(..., description="符合条件的总记录数", example=25)
    page: int = Field(..., description="当前页码 (从 1 开始)", example=1)
    size: int = Field(..., description="每页条数", example=5)
    totalPages: int = Field(..., description="总页数 (由后端计算，避免前端重复推导)", example=5)


class CreateUserCommand(BaseModel):
    """新增用户请求入参 (类似 Spring @RequestBody CreateUserCommand cmd)"""
    name: str
    username: str
    email: str
    phone: str = "未登记"
    company_name: Optional[str] = "研发中心"

# --------------------------------------------------------------------------
# 3. 内存模拟数据库与初始种子数据 (In-Memory Database)
# --------------------------------------------------------------------------
INITIAL_USERS: List[UserDTO] = [
    UserDTO(
        id=1,
        name="李明 (Java 首席架构师)",
        username="liming_arch",
        email="liming@enterprise.com",
        phone="138-1111-2222",
        company=CompanyDTO(name="分布式基础架构部")
    ),
    UserDTO(
        id=2,
        name="王芳 (全栈研发工程师)",
        username="wangfang_fullstack",
        email="wangfang@tech.io",
        phone="139-2222-3333",
        company=CompanyDTO(name="云原生研发中心")
    ),
    UserDTO(
        id=3,
        name="张伟 (Spring 核心微服务专家)",
        username="zhangwei_spring",
        email="zhangwei@spring.net",
        phone="137-3333-4444",
        company=CompanyDTO(name="金融交易中台团队")
    ),
    UserDTO(
        id=4,
        name="赵强 (DevOps & SRE 专家)",
        username="zhaoqiang_k8s",
        email="zhaoqiang@cloud.com",
        phone="136-4444-5555",
        company=CompanyDTO(name="基础设施保障部")
    ),
    UserDTO(
        id=5,
        name="孙丽 (前端技术专家 / TS 研习者)",
        username="sunli_fe",
        email="sunli@react.org",
        phone="135-5555-6666",
        company=CompanyDTO(name="用户体验创新实验室")
    ),
    UserDTO(
        id=6,
        name="周洋 (消息中间件工程师)",
        username="zhouyang_mq",
        email="zhouyang@mq.io",
        phone="134-6666-7777",
        company=CompanyDTO(name="消息中间件平台组")
    ),
    UserDTO(
        id=7,
        name="吴倩 (数据仓库建模师)",
        username="wuqian_dw",
        email="wuqian@data.com",
        phone="133-7777-8888",
        company=CompanyDTO(name="数据中台建设部")
    ),
    UserDTO(
        id=8,
        name="郑凯 (高并发交易系统研发)",
        username="zhengkai_trade",
        email="zhengkai@trade.cn",
        phone="132-8888-9999",
        company=CompanyDTO(name="证券交易核心系统组")
    ),
    UserDTO(
        id=9,
        name="张敏 (前端工程化负责人)",
        username="zhangmin_fe",
        email="zhangmin@frontend.dev",
        phone="131-9999-0000",
        company=CompanyDTO(name="前端基础设施建设组")
    ),
    UserDTO(
        id=10,
        name="刘德华 (安全合规专家)",
        username="liudehua_sec",
        email="liudehua@sec.org",
        phone="130-1234-5678",
        company=CompanyDTO(name="信息安全与合规部")
    ),
    UserDTO(
        id=11,
        name="陈曦 (MySQL 内核优化)",
        username="chenxi_dba",
        email="chenxi@mysql.io",
        phone="189-1111-0001",
        company=CompanyDTO(name="数据库内核研发组")
    ),
    UserDTO(
        id=12,
        name="黄磊 (Redis 缓存架构师)",
        username="huanglei_cache",
        email="huanglei@redis.cn",
        phone="188-2222-0002",
        company=CompanyDTO(name="高可用缓存平台组")
    ),
    UserDTO(
        id=13,
        name="张一鸣 (算法工程师)",
        username="zhangyiming_algo",
        email="zhangyiming@ai.io",
        phone="187-3333-0003",
        company=CompanyDTO(name="智能推荐算法组")
    ),
    UserDTO(
        id=14,
        name="林芳 (产品经理)",
        username="linfang_pm",
        email="linfang@product.com",
        phone="186-4444-0004",
        company=CompanyDTO(name="企业产品规划部")
    ),
    UserDTO(
        id=15,
        name="徐斌 (微服务治理专家)",
        username="xubin_gov",
        email="xubin@gov.net",
        phone="185-5555-0005",
        company=CompanyDTO(name="服务治理与注册中心组")
    ),
    UserDTO(
        id=16,
        name="何静 (测试开发工程师)",
        username="hejing_qa",
        email="hejing@qa.dev",
        phone="184-6666-0006",
        company=CompanyDTO(name="自动化测试平台组")
    ),
    UserDTO(
        id=17,
        name="马超 (Kubernetes 运维)",
        username="machao_k8s",
        email="machao@k8s.cloud",
        phone="183-7777-0007",
        company=CompanyDTO(name="云平台运维保障组")
    ),
    UserDTO(
        id=18,
        name="高圆 (用户增长运营)",
        username="gaoyuan_growth",
        email="gaoyuan@growth.com",
        phone="182-8888-0008",
        company=CompanyDTO(name="用户增长运营中心")
    ),
    UserDTO(
        id=19,
        name="张涛 (支付网关研发)",
        username="zhangtao_pay",
        email="zhangtao@pay.cn",
        phone="181-9999-0009",
        company=CompanyDTO(name="支付清结算系统组")
    ),
    UserDTO(
        id=20,
        name="罗琳 (技术文档工程师)",
        username="luolin_doc",
        email="luolin@docs.io",
        phone="180-1234-0010",
        company=CompanyDTO(name="开发者体验部")
    ),
    UserDTO(
        id=21,
        name="宋佳 (大数据实时计算)",
        username="songjia_flink",
        email="songjia@flink.org",
        phone="170-2345-0011",
        company=CompanyDTO(name="实时计算平台组")
    ),
    UserDTO(
        id=22,
        name="邓超 (物联网平台研发)",
        username="dengchao_iot",
        email="dengchao@iot.dev",
        phone="171-3456-0012",
        company=CompanyDTO(name="物联网终端接入组")
    ),
    UserDTO(
        id=23,
        name="张宁 (AI 平台后端)",
        username="zhangning_ai",
        email="zhangning@aibackend.io",
        phone="172-4567-0013",
        company=CompanyDTO(name="大模型应用平台组")
    ),
]

# 运行时内存用户列表
db_users: List[UserDTO] = [u.model_copy() for u in INITIAL_USERS]
next_user_id = 24

# --------------------------------------------------------------------------
# 4. RESTful 业务接口
# --------------------------------------------------------------------------

@app.get("/api/users", response_model=List[UserDTO], summary="获取用户列表 (支持关键字搜索与延迟模拟)")
async def get_users(
    keyword: Optional[str] = Query(None, description="模糊搜索关键词 (匹配姓名或邮箱)"),
    delay: float = Query(0.4, description="模拟网络延迟(秒)，方便前端观察 Loading 转圈状态"),
    fail: bool = Query(False, description="模拟后端 500 异常，方便前端测试 Error 错误状态与重试按钮")
):
    """
    【学习教学专供接口】
    - 请求示例：GET http://127.0.0.1:8000/api/users
    - 慢速网络测试：GET http://127.0.0.1:8000/api/users?delay=1.5
    - 故障重试测试：GET http://127.0.0.1:8000/api/users?fail=true
    """
    # 模拟真实网络 I/O 延迟，让前端 Loading 动效看得见
    if delay > 0:
        await asyncio.sleep(delay)

    # 模拟后端异常，方便前端测试错误提示与重试
    if fail:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="【模拟异常】后端数据库连接超时，请检查服务可用性或点击重试！"
        )

    # 关键字过滤
    if keyword:
        kw = keyword.strip().lower()
        return [
            u for u in db_users
            if kw in u.name.lower() or kw in u.email.lower() or kw in u.username.lower()
        ]

    return db_users


@app.get("/api/users/page", response_model=PageResult, summary="分页 + 关键字模糊查询用户列表 (TASK-007 专属)")
async def get_users_page(
    page: int = Query(1, ge=1, description="页码，从 1 开始"),
    size: int = Query(5, ge=1, le=50, description="每页条数"),
    keyword: Optional[str] = Query(None, description="模糊搜索关键词 (匹配姓名/邮箱/登录名)"),
    delay: float = Query(0.4, description="模拟网络延迟(秒)"),
    fail: bool = Query(False, description="模拟后端 500 异常")
):
    """
    【TASK-007 教学专供接口】真实后端的标准形态：
    - 请求示例：GET http://127.0.0.1:8000/api/users/page?page=2&size=5&keyword=张
    - 注意：本接口返回的是「包裹对象」(PageResult)，而不是裸数组！
    - 慢速网络测试：?delay=1.2   故障测试：?fail=true
    对应 Spring Boot 中的 Page<UserVO> 或自定义 PageResult<T>。
    """
    if delay > 0:
        await asyncio.sleep(delay)

    if fail:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="【模拟异常】分页查询失败，数据库连接超时！"
        )

    # 1) 先按关键字过滤出全量命中集合
    matched = db_users
    if keyword and keyword.strip():
        kw = keyword.strip().lower()
        matched = [
            u for u in matched
            if kw in u.name.lower() or kw in u.email.lower() or kw in u.username.lower()
        ]

    # 2) 再按页码切片（对应 SQL 的 LIMIT size OFFSET (page-1)*size）
    total = len(matched)
    total_pages = (total + size - 1) // size if total > 0 else 0
    start = (page - 1) * size
    page_slice = matched[start: start + size]

    return PageResult(
        list=page_slice,
        total=total,
        page=page,
        size=size,
        totalPages=total_pages
    )


@app.get("/api/users/{user_id}", response_model=UserDTO, summary="查询单个用户详情")
async def get_user_by_id(user_id: int):
    for u in db_users:
        if u.id == user_id:
            return u
    raise HTTPException(status_code=404, detail=f"用户 ID={user_id} 未找到")


@app.post("/api/users", response_model=UserDTO, status_code=status.HTTP_201_CREATED, summary="新增用户")
async def create_user(cmd: CreateUserCommand):
    global next_user_id
    new_user = UserDTO(
        id=next_user_id,
        name=cmd.name,
        username=cmd.username,
        email=cmd.email,
        phone=cmd.phone,
        company=CompanyDTO(name=cmd.company_name or "独立开发者")
    )
    next_user_id += 1
    db_users.append(new_user)
    return new_user


@app.delete("/api/users/{user_id}", summary="删除指定用户")
async def delete_user(user_id: int):
    global db_users
    before_len = len(db_users)
    db_users = [u for u in db_users if u.id != user_id]
    if len(db_users) == before_len:
        raise HTTPException(status_code=404, detail=f"用户 ID={user_id} 不存在")
    return {"success": True, "message": f"用户 ID={user_id} 已成功注销"}


@app.post("/api/reset", summary="重置内存数据库为初始数据")
async def reset_database():
    global db_users, next_user_id
    db_users = [u.model_copy() for u in INITIAL_USERS]
    next_user_id = 6
    return {"success": True, "message": f"内存数据库已成功重置为 {len(INITIAL_USERS)} 条初始数据"}


# --------------------------------------------------------------------------
# 5. 直接运行入口
# --------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("🚀 FastAPI 后端服务已启动！")
    print("🔗 接口根地址: http://127.0.0.1:8000")
    print("📖 Swagger API 交互文档: http://127.0.0.1:8000/docs")
    print("=" * 60)
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
