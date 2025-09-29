// 扩展Window类型，解决TypeScript类型检查错误
// 告诉TypeScript window对象上会有这些额外属性
declare global {
  interface Window {
    // qiankun框架标识：是否在微前端环境中运行
    __POWERED_BY_QIANKUN__?: boolean;
    // qiankun注入的公共路径，用于资源加载
    __INJECTED_PUBLIC_PATH_BY_QIANKUN__?: string;
    // 存储主应用传递过来的方法和数据
    parentApp?: {
      addProject: (project: any) => string;
      projectTypes: string[];
      users: { id: string; name: string; role: string }[];
    };
  }
}

export {};