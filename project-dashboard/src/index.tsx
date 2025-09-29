import React, { useEffect } from 'react';

import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerMicroApps, start } from 'qiankun';
import { ProjectContextProvider, useProjectContext } from './contexts/ProjectContext';
import './index.css';
import ProjectDashboardApp from './App';

// 关键：创建一个“微应用注册组件”，用于从 Context 中获取数据
const MicroAppRegistry = () => {
  // 从 ProjectContext 中获取需要传递给微应用的属性
  const {
    projects,
    projectTypes,
    currentUser,
    users,
    addProject,
    getProjectById
  } = useProjectContext();

  // 是否已经注册过微应用到主应用，默认值是false
  // useRef()可以保证 isRegisteredMicroApp 变量跨组件唯一。
  const isRegisteredMicroApp = React.useRef(false);

  // 在组件挂载时注册微应用（确保能拿到 Context 数据）
  useEffect(() => {
    // 只有当没有注册过微应用：isRegisteredMicroApp = false
    // 并且projects加载完成（非空）：projects.length > 0
    // 才注册detail微应用
    if (isRegisteredMicroApp.current || projects.length === 0) {
      return;
    }
    // 注册微应用到qiankun
    registerMicroApps([
      {
        // [必需]：微应用的名字，唯一即可，通常与微应用的名称一致。
        name: 'project-create',
        // [必需]：微应用的入口地址。这里使用相对协议，自动继承访问dashboard的协议。
        entry: '//localhost:3001',
        // [必需]：在哪里挂载微应用。这里是ID=micro-app-container的DOM中。
        container: '#micro-app-container',
        // [必需]：微应用的激活规则。
        activeRule: '/project-create',
        // [可选]：向微应用传递的数据。
        props: {
          projectTypes,
          currentUser,
          users,
          addProject,
          getProjectById
        }
      },
      {
        name: 'project-detail',
        entry: '//localhost:3002',
        container: '#micro-app-container',
        activeRule: '/project-detail',
        props: {
          currentUser,
          getProjectById
        }
      }
    ]);

    // 注册后修改变量，避免重复注册微应用
    isRegisteredMicroApp.current = true;

    // 启动qiankun
    start();

    console.log("[project-dashboard] 微应用注册成功")
}, [projects]);

  // 该组件仅用于注册微应用，不渲染实际UI
  return null;
}

// 把React应用渲染在HTML中id=root的div上
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    {/* 路由配置，用于处理页面跳转 */}
    <BrowserRouter>
      {/* 宿主应用：用 ProjectContextProvider 包裹所有内容 */}
      <ProjectContextProvider>
        <ProjectDashboardApp />
        <MicroAppRegistry />
      </ProjectContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);

