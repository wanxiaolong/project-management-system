// 引入公共路径配置，确保微应用在主应用中能正确加载资源
// 这是qiankun微前端框架要求的配置，用于处理不同环境下的资源路径问题
import './public-path';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import ProjectCreateApp from './App';
import './index.css';

// 空导入，强制TypeScript加载全局类型
import type {} from '../global';

// 声明一个变量用于存储React根实例
// 这样在卸载时可以找到并销毁它，避免内存泄漏
let root: ReactDOM.Root | null = null;

/**
 * 渲染函数：负责将应用渲染到指定容器
 * @param container 可选的容器元素，主应用会传递此参数
 */
const render = (container?: HTMLElement) => {
  // 确定渲染容器：
  // - 如果有container（来自主应用），就用主应用提供的容器内的#root元素
  // - 否则用当前应用自己的#root元素（独立运行时）
  const renderContainer = container 
    ? container.querySelector('#root') as HTMLElement 
    : document.getElementById('root') as HTMLElement;
  
  // 创建React根实例并渲染应用
  root = ReactDOM.createRoot(renderContainer);
  root.render(
    <React.StrictMode>
      {/* 路由配置，用于处理页面跳转 */}
      <BrowserRouter>
        {/* 应用的主组件 */}
        <ProjectCreateApp />
      </BrowserRouter>
    </React.StrictMode>
  );
};

// 独立运行判断：如果不是在微前端环境中
// 直接调用渲染函数，让应用可以独立运行和开发
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

/**
 * 微前端生命周期函数：bootstrap（初始化）
 * 在应用第一次加载时调用，用于执行初始化操作
 */
export async function bootstrap() {
  console.log('[project-create] 初始化完成');
}

/**
 * 微前端生命周期函数：mount（挂载）
 * 当应用被主应用加载并显示时调用
 * @param props 主应用传递过来的参数和方法
 */
export async function mount(props: any) {
  console.log('[project-create] 开始挂载，接收主应用参数：', props);
  
  // 调用渲染函数，将应用渲染到主应用提供的容器中
  render(props.container);
  
  // 将主应用传递过来的方法和数据挂载到window上
  // 这样在微应用组件中就可以通过window.parentApp使用这些功能
  window.parentApp = {
    addProject: props.addProject,           // 添加项目的方法
    projectTypes: props.projectTypes,       // 项目类型列表
    users: props.users                      // 用户列表（用于选择负责人）
  };
}

/**
 * 微前端生命周期函数：unmount（卸载）
 * 当应用从主应用中移除时调用，用于清理资源
 */
export async function unmount() {
  console.log('[project-create] 开始卸载');
  
  // 卸载React组件，清理DOM和事件监听
  if (root) {
    root.unmount();
  }
  // mount方法里会调用render()方法给root赋值，所以在unmount方法中需要取消赋值以释放内存
  root = null;
  
  // 清除存储的主应用方法，避免内存泄漏
  window.parentApp = undefined;
}
    