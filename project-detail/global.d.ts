// 扩展Window类型，添加qiankun需要的属性和我们自定义的属性
declare global {
  interface Window {
    // qiankun框架使用的属性，标识是否在微前端环境中运行
    __POWERED_BY_QIANKUN__?: boolean;
    // qiankun注入的公共路径
    __INJECTED_PUBLIC_PATH_BY_QIANKUN__?: string;
    // 存储主应用传递过来的方法和数据，统一类型定义
    parentApp?: {
      getProjectById: (id: string) => any;
      currentUser: any;
    };
  }
}

// 关键：添加空导出语句，使文件成为"外部模块"
// 这是TypeScript要求的，用于标识这是一个环境模块声明文件
export {};