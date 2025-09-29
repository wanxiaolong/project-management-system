// 引入公共路径配置，确保微应用在主应用中正确加载资源
import './public-path';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import ProjectDetailApp from './App';
import './index.css';

// 空导入，强制TypeScript加载全局类型
import type {} from '../global';

// 用于存储React根实例的变量
let root: ReactDOM.Root | null = null;

// 渲染函数：根据是否在微前端环境中，决定渲染到哪个容器
const render = (container?: HTMLElement) => {
  // 确定渲染容器：如果有传入容器（来自主应用），就用主应用提供的容器
  // 否则用当前应用自己的root容器
  const renderContainer = container 
    ? container.querySelector('#root') as HTMLElement 
    : document.getElementById('root') as HTMLElement;
  
  // 创建React根实例并渲染应用
  root = ReactDOM.createRoot(renderContainer);
  root.render(
    <React.StrictMode>
      {/* 路由配置，用于处理页面跳转 */}
      <BrowserRouter>
        <ProjectDetailApp />
      </BrowserRouter>
    </React.StrictMode>
  );
};

// 如果不是在微前端环境中（即独立运行时），直接渲染应用
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

// 微前端生命周期函数：初始化阶段
export async function bootstrap() {
  console.log('[project-detail] 初始化完成');
}

// 微前端生命周期函数：挂载阶段（当微应用被主应用加载时调用）
export async function mount(props: any) {
  console.log('[project-detail] 开始挂载，接收主应用参数：', props);
  
  // 调用渲染函数，将微应用渲染到主应用提供的容器中
  render(props.container);
  
  // 将主应用传递过来的方法和数据挂载到window上，方便在App组件中使用
  window.parentApp = {
    getProjectById: props.getProjectById,  // 获取项目详情的方法
    currentUser: props.currentUser         // 当前登录用户信息
  };
}

// 微前端生命周期函数：卸载阶段（当微应用从主应用中移除时调用）
export async function unmount() {
  console.log('[project-detail] 开始卸载');
  
  // 卸载React组件，清理资源
  if (root) {
    root.unmount();
  }
  root = null;
  
  // 清除存储的主应用方法
  window.parentApp = undefined;
}
    