import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

// 定义项目类型
export interface Project {
  id: string;
  name: string;
  type: string;
  manager: string;
  budget: number;
  estimatedCost: number;
  startDate: string;
  endDate: string;
  status: 'in-progress' | 'completed';
  createdAt: string;
  notes?: string;
}

// 定义用户类型
export interface User {
  id: string;
  name: string;
  role: 'admin' | 'user';
}

// 定义上下文类型
interface ProjectContextType {
  // 定义共享的全局数据
  projects: Project[];
  users: User[];
  projectTypes: string[];
  currentUser: User;
  notifications: { id: string; message: string; type: 'success' | 'error' }[];

  // 定义共享的操作方法
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'status'>) => string;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  addNotification: (message: string, type: 'success' | 'error') => void;
  removeNotification: (id: string) => void;
}

// 模拟数据
const mockProjects: Project[] = [
  {
    id: '1',
    name: '网站重构',
    type: '研发',
    manager: '张三',
    budget: 10000,
    estimatedCost: 11500,
    startDate: '2023-06-01',
    endDate: '2023-08-30',
    status: 'in-progress',
    createdAt: '2023-05-15',
    notes: '重构公司官网，提升用户体验'
  },
  {
    id: '2',
    name: '夏季促销',
    type: '营销',
    manager: '李四',
    budget: 5000,
    estimatedCost: 5750,
    startDate: '2023-07-01',
    endDate: '2023-07-31',
    status: 'completed',
    createdAt: '2023-06-10',
    notes: '夏季产品促销活动'
  },
  {
    id: '3',
    name: '数据迁移',
    type: '运维',
    manager: '王五',
    budget: 8000,
    estimatedCost: 9200,
    startDate: '2025-07-01',
    endDate: '2025-08-31',
    status: 'completed',
    createdAt: '2025-06-10',
    notes: '新版本上线数据迁移'
  },
  {
    id: '4',
    name: '平台切换',
    type: '运维',
    manager: '张三',
    budget: 2000,
    estimatedCost: 2300,
    startDate: '2025-08-01',
    endDate: '2025-08-31',
    status: 'in-progress',
    createdAt: '2025-07-30',
    notes: '使用新的技术平台'
  }
];
const projectTypes = ['研发', '营销', '运维'];
const users: User[] = [
  { id: '1', name: '张三', role: 'admin' },
  { id: '2', name: '李四', role: 'user' },
  { id: '3', name: '王五', role: 'user' },
];

// 创建上下文
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// 上下文提供者组件
export const ProjectContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 状态管理
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const projectsRef = useRef<Project[]>(mockProjects);
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'success' | 'error' }[]>([]);

  // 监听projects的变化，并实时更新projectsRef
  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);
  
  // 默认登录用户为管理员用户
  const currentUser: User = users[0];

  // 添加项目
  // 如果成功，返回字符串：'true'
  // 如果失败，返回字符串：'false|失败的字段|具体原因'
  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'status'>) => {
    // prevProjects是最新状态
    const nameExists = projects.some(p => p.name === projectData.name);
      if (nameExists) {
        // addNotification('项目名称已存在', 'error');
        return 'false|name|项目名称已存在';
      }
      
      // 构建新项目
      const newProject: Project = {
        ...projectData,
        // 默认id：当前时间戳
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        // 默认状态：进行中
        status: 'in-progress'
      };;

    setProjects(prev => {
      const updatedProjects = [...prev, newProject];
      addNotification('项目创建成功', 'success');
      return updatedProjects;
    })
    
    // 返回是否创建成功
    return 'true';
  };

  // 删除项目
  const deleteProject = (id: string) => {
    if (currentUser.role !== 'admin') {
      addNotification('没有权限删除项目', 'error');
      return;
    }
    
    // 把选中的项目过滤掉，不显示
    setProjects(prev => {
      return prev.filter(project => project.id !== id)
    });
    addNotification('项目已删除', 'success');
  }

  const getProjectById = (id: string) => {
    // 从最新的projects中根据id找project
    return projectsRef.current.find(project => project.id === id);
  }

  // 添加通知
  const addNotification = (message: string, type: 'success' | 'error') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // 5秒后自动移除通知
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  // 移除通知
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // 要和子组件共享的属性或方法
  const value = {
    projects,
    users,
    projectTypes,
    currentUser,
    notifications,
    addProject,
    deleteProject,
    getProjectById,
    addNotification,
    removeNotification
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

// 自定义Hook，方便使用上下文
export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectContextProvider');
  }
  return context;
};
