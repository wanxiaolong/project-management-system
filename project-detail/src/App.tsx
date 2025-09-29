import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  Chip,
  Divider,
  TextField
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

// 解析URL参数
const getQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    id: params.get('id') || ''
  };
};

const ProjectDetailApp: React.FC = () => {
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = getQueryParams();

  // 获取项目详情
  useEffect(() => {
    if (id && window.parentApp && window.parentApp.getProjectById) {
      const projectData = window.parentApp.getProjectById(id);
      if (projectData) {
        setProject(projectData);
      } else {
        setError('未找到该项目');
      }
      setLoading(false);
    } else if (!id) {
      setError('项目ID不存在');
      setLoading(false);
    }
  }, [id]);

  // 返回项目列表
  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>加载中...</Typography>
      </Container>
    );
  }

  if (error || !project) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography color="error">{error || '项目数据加载失败'}</Typography>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          返回项目列表
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            项目详情
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
          >
            返回
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          <Grid size={{xs:12, md:6}}>
            <Typography variant="subtitle1" color="text.secondary">
              项目编号
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {project.id}
            </Typography>
          </Grid>
          
          <Grid size={{xs:12, md:6}}>
            <Typography variant="subtitle1" color="text.secondary">
              项目名称
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {project.name}
            </Typography>
          </Grid>
          
          <Grid size={{xs:12, md:6}}>
            <Typography variant="subtitle1" color="text.secondary">
              项目类型
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {project.type}
            </Typography>
          </Grid>
          
          <Grid size={{xs:12, md:6}}>
            <Typography variant="subtitle1" color="text.secondary">
              负责人
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {project.manager}
            </Typography>
          </Grid>
          
          <Grid size={{xs:12, md:6}}>
            <Typography variant="subtitle1" color="text.secondary">
              预算
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              ¥{project.budget.toLocaleString()}
            </Typography>
          </Grid>
          
          <Grid size={{xs:12, md:6}}>
            <Typography variant="subtitle1" color="text.secondary">
              预估成本
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              ¥{project.estimatedCost.toLocaleString()}
            </Typography>
          </Grid>
          
          <Grid size={{xs:12, md:6}}>
            <Typography variant="subtitle1" color="text.secondary">
              开始日期
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {project.startDate}
            </Typography>
          </Grid>
          
          <Grid size={{xs:12, md:6}}>
            <Typography variant="subtitle1" color="text.secondary">
              截止日期
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {project.endDate}
            </Typography>
          </Grid>
          
          <Grid size={{xs:12, md:6}}>
            <Typography variant="subtitle1" color="text.secondary">
              状态
            </Typography>
            <Chip 
              label={project.status === 'in-progress' ? '进行中' : '已完成'} 
              color={project.status === 'in-progress' ? 'primary' : 'success'} 
              size="medium" 
              sx={{ mt: 1 }}
            />
          </Grid>
          
          <Grid size={{xs:12, md:6}}>
            <Typography variant="subtitle1" color="text.secondary">
              创建时间
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {project.createdAt}
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Box>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
            备注信息
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={project.notes || '无备注信息'}
            InputProps={{ readOnly: true }}
            variant="outlined"
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default ProjectDetailApp;
