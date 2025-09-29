import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { ArrowUpward, ArrowDownward, Height } from '@mui/icons-material';
import { useProjectContext } from './contexts/ProjectContext';

const ProjectDashboardApp: React.FC = () => {
  const { 
    projects, 
    deleteProject, 
    notifications, 
    removeNotification,
    currentUser
  } = useProjectContext();

  // 使用React的勾子，返回一个导航函数，用于在代码中触发路由跳转
  const navigate = useNavigate();
  
  // 状态管理
  // 保存"搜索"输入框的值
  const [searchTerm, setSearchTerm] = useState('');
  // 保存"状态"下拉列表的值
  const [statusFilter, setStatusFilter] = useState('all');
  // 保存"负责人"输入框的值
  const [managerFilter, setManagerFilter] = useState('all');
  // 保存过滤好的结果
  const [filteredProjects, setFilteredProjects] = useState(projects);
  // 排序的状态
  const [sortConfig, setSortConfig] = useState<{
    field: 'status' | 'manager' | null;
    direction: 'asc' | 'desc' | '';
  }>({ field: null, direction: '' });

  // 过滤和排序
  useEffect(() => {
    let result = [...projects];
    
    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        project => 
          // 按照项目名称或编号过滤
          project.name.toLowerCase().includes(term) || 
          project.id.toLowerCase().includes(term)
      );
    }
    
    // 状态过滤
    if (statusFilter !== 'all') {
      result = result.filter(project => project.status === statusFilter);
    }
    
    // 负责人过滤
    if (managerFilter !== 'all') {
      result = result.filter(project => project.manager === managerFilter);
    }
    
    // 将多轮过滤好的数据放在filteredProjects变量中
    setFilteredProjects(result);
  }, [searchTerm, statusFilter, managerFilter, projects]);

  // 获取所有project的负责人，用于显示“负责人”过滤器的下拉列表
  const managers = ['all', ...Array.from(new Set(projects.map(p => p.manager)))];

  // 查看项目详情，路由到project-detail微应用
  const viewProjectDetail = (id: string) => {
    navigate(`/project-detail?id=${id}`);
  };

  // 导航到创建项目页面，路由到project-create微应用
  const goToCreateProject = () => {
    navigate('/project-create');
  };

  // 处理表头点击排序
  const handleSort = (field: 'status' | 'manager') => {
    // 默认按照字段升序排序
    let direction: 'asc' | 'desc' | '' = 'asc';
    
    // 如果点击的是当前排序字段，则切换方向
    if (sortConfig.field === field) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = ''; // 取消排序
      }
    }
    
    setSortConfig({ field, direction });
  };

  // 获取排序图标
  const getSortIcon = (field: 'status' | 'manager') => {
    if (sortConfig.field !== field) {
      return <Height fontSize="small" />;
    }
    
    if (sortConfig.direction === 'asc') {
      return <ArrowUpward fontSize="small" />;
    }
    
    if (sortConfig.direction === 'desc') {
      return <ArrowDownward fontSize="small" />;
    }
    
    return <Height fontSize="small" />;
  };

  // 根据排序配置对项目进行排序
  const sortedProjects = React.useMemo(() => {
    if (!sortConfig.field || !sortConfig.direction) {
      return filteredProjects;
    }
    
    // 创建副本避免修改原始数组
    const sorted = [...filteredProjects];
    
    sorted.sort((a, b) => {
      // 按状态排序（进行中排在已完成前面）
      if (sortConfig.field === 'status') {
        // 状态优先级：进行中(in-progress) > 已完成(completed)
        const statusOrder = { 'in-progress': 1, 'completed': 2 };
        const orderA = statusOrder[a.status];
        const orderB = statusOrder[b.status];
        
        return sortConfig.direction === 'asc' 
          ? orderA - orderB  // 升序：进行中在前
          : orderB - orderA; // 降序：已完成在前
      }
      
      // 按负责人排序（字母/拼音顺序）
      if (sortConfig.field === 'manager') {
        return sortConfig.direction === 'asc' 
          ? a.manager.localeCompare(b.manager) 
          : b.manager.localeCompare(a.manager);
      }
      
      return 0;
    });
    
    return sorted;
  }, [filteredProjects, sortConfig]);

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          {/* MUI - Typography，用于文字的排版，它定义了符合Material Design的文本层级，可确保文字样式的一致性 */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            项目管理系统
          </Typography>
          {/* MUI - Box，一个通用的容器，用于给其他的组件分组，可以把它想象成一个<div> */}
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body1">
              {/* 根据当前用户的role来显示不同的角色文字 */}
              {currentUser.name} ({currentUser.role === 'admin' ? '管理员' : '用户'})
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* MUI - Container，让内容水平居中的基本布局元素 */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h1">
            项目列表
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={goToCreateProject}
          >
            创建项目
          </Button>
        </Box>

        {/* 搜索和过滤区域 */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="搜索项目名称或编号"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>项目状态</InputLabel>
            <Select
              value={statusFilter}
              label="项目状态"
              onChange={(e) => setStatusFilter(e.target.value as string)}
            >
              <MenuItem value="all">全部</MenuItem>
              <MenuItem value="in-progress">进行中</MenuItem>
              <MenuItem value="completed">已完成</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>负责人</InputLabel>
            <Select
              value={managerFilter}
              label="负责人"
              onChange={(e) => setManagerFilter(e.target.value as string)}
            >
              {managers.map(manager => (
                <MenuItem key={manager} value={manager}>
                  {manager === 'all' ? '全部' : manager}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* 展示projects的表格 */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>项目编号</TableCell>
                <TableCell>项目名称</TableCell>
                <TableCell>类型</TableCell>
                {/* 带排序功能的负责人表头 */}
                <TableCell 
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('manager')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>负责人</Typography>
                    <IconButton size="small" sx={{ p: 0 }}>
                      {getSortIcon('manager')}
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell>预算</TableCell>
                <TableCell>预估成本</TableCell>
                {/* 带排序功能的状态表头 */}
                <TableCell 
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleSort('status')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>状态</Typography>
                    <IconButton size="small" sx={{ p: 0 }}>
                      {getSortIcon('status')}
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedProjects.length > 0 ? (
                sortedProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>{project.id}</TableCell>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>{project.type}</TableCell>
                    <TableCell>{project.manager}</TableCell>
                    <TableCell>¥{project.budget.toLocaleString()}</TableCell>
                    <TableCell>¥{project.estimatedCost.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={project.status === 'in-progress' ? '进行中' : '已完成'} 
                        color={project.status === 'in-progress' ? 'primary' : 'success'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => viewProjectDetail(project.id)}
                      >
                        查看详情
                      </Button>

                      {/* 只有admin角色才能看见删除的按钮 */}
                      {currentUser.role === 'admin' && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => deleteProject(project.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                // 没找到projects的时候展示默认值
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    没有找到匹配的项目
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 微应用容器，用于挂载不同的微应用到这里来 */}
        <Box id="micro-app-container" sx={{ mt: 4 }} />
      </Container>

      {/* 通知提示 */}
      {notifications.map(notification => (
        // MUI - Snackbar，相当于一个toast，用来展示一个简短的notification。
        // Snackbar用来决定“通知如何表现”(何时显示，在哪里显示，何时消失，如何消失等)
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={5000}
          onClose={() => removeNotification(notification.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          {/* MUI - Alert，用于展示一个简短的消息给用户，并且不阻塞用户 */}
          {/* Alert它用来显示样式(样式、通知类型、文字)，所以需要使用Snackbar来包装Alert */}
          <Alert 
            onClose={() => removeNotification(notification.id)} 
            severity={notification.type} 
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </div>
  );
};

export default ProjectDashboardApp;
