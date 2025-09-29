import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  FormHelperText,
  SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useNavigate } from 'react-router-dom';

const ProjectCreateApp: React.FC = () => {
  const navigate = useNavigate();
  
  // 状态管理
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    manager: '',
    budget: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    notes: ''
  });
  
  // 保存表单上的字段验证的错误
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [projectTypes, setProjectTypes] = useState<string[]>([]);
  const [managers, setManagers] = useState<string[]>([]);
  const [estimatedCost, setEstimatedCost] = useState(0);

  // 从父应用获取数据
  useEffect(() => {
    if (window.parentApp) {
      setProjectTypes(window.parentApp.projectTypes);
      setManagers(window.parentApp.users.map(user => user.name));
    }
  }, []);

  // 计算预估成本
  useEffect(() => {
    const budget = parseFloat(formData.budget);
    if (!isNaN(budget) && budget > 0) {
      setEstimatedCost(budget * 1.15);
    } else {
      setEstimatedCost(0);
    }
  }, [formData.budget]);

  // 表单变更处理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // 清除对应字段的错误
      if (errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  // 日期变更处理
  const handleDateChange = (name: string, date: Date | null) => {
    setFormData(prev => ({ ...prev, [name]: date }));
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 表单验证，返回一个错误Map，Key=字段名字，Value=错误原因
  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    
    // 项目名称验证
    if (!formData.name.trim()) {
      newErrors.name = '项目名称不能为空';
    }
    
    // 项目类型验证
    if (!formData.type) {
      newErrors.type = '请选择项目类型';
    }
    
    // 负责人验证
    if (!formData.manager) {
      newErrors.manager = '请选择负责人';
    }
    
    // 预算验证
    const budget = parseFloat(formData.budget);
    if (!formData.budget) {
      newErrors.budget = '预算不能为空';
    } else if (isNaN(budget) || budget <= 0) {
      newErrors.budget = '预算必须为正数';
    }
    
    // 开始日期
    if (!formData.startDate) {
      newErrors.startDate = '请选择开始日期';
    }
    
    // 截止日期必需在开始日期之后
    if (!formData.endDate) {
      newErrors.endDate = '请选择截止日期';
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = '截止日期不能早于开始日期';
    }

    setErrors(newErrors);
    return newErrors;
  };

  // 表单提交处理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证表单
    const newErrors: Record<string, string> = validateForm();

    if (Object.keys(newErrors).length === 0 && window.parentApp) {
      const project = {
        name: formData.name,
        type: formData.type,
        manager: formData.manager,
        budget: parseFloat(formData.budget),
        estimatedCost: estimatedCost,
        startDate: formData.startDate?.toISOString().split('T')[0] || '',
        endDate: formData.endDate?.toISOString().split('T')[0] || '',
        notes: formData.notes
      };
      
      // 调用父应用的方法添加project
      const result = window.parentApp.addProject(project);
      const isSuccess = result.startsWith('true')
      if (isSuccess) {
        // 创建project成功，则重置表单并返回project列表
        setFormData({
          name: '',
          type: '',
          manager: '',
          budget: '',
          startDate: null,
          endDate: null,
          notes: ''
        });
        navigate('/');
      } else {
        // 创建project失败，则显示对应错误
        const reason = result.split('|');
        newErrors[reason[1]] = reason[2];
        setErrors(newErrors);
      }
    }
  };

  // 取消按钮处理
  const handleCancel = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          创建新项目
        </Typography>
        
        {/* 把Box渲染为一个表单<form> */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid size={{xs:12}} component={Box}>
              <TextField
                required
                fullWidth
                label="项目名称"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            
            <Grid size={{xs:12}} component={Box}>
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel>项目类型</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  label="项目类型"
                  onChange={handleChange}
                >
                  {projectTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
                {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid size={{xs:12}} component={Box}>
              <FormControl fullWidth error={!!errors.manager}>
                <InputLabel>负责人</InputLabel>
                <Select
                  name="manager"
                  value={formData.manager}
                  label="负责人"
                  onChange={handleChange}
                >
                  {managers.map(manager => (
                    <MenuItem key={manager} value={manager}>{manager}</MenuItem>
                  ))}
                </Select>
                {errors.manager && <FormHelperText>{errors.manager}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid size={{xs:12, sm:6}} component={Box}>
              <TextField
                required
                fullWidth
                label="预算"
                name="budget"
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                value={formData.budget}
                onChange={handleChange}
                error={!!errors.budget}
                helperText={errors.budget || "单位：元"}
              />
            </Grid>
            
            <Grid size={{xs:12, sm:6}} component={Box}>
              <TextField
                fullWidth
                label="预估成本"
                value={`¥${estimatedCost.toFixed(2)}`}
                InputProps={{ readOnly: true }}
                helperText="预算 × 1.15"
              />
            </Grid>
            
            <Grid size={{xs:12, sm:6}} component={Box}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="开始日期"
                  value={formData.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  slotProps={{
                    textField: {
                      error: !!errors.startDate,
                      helperText: errors.startDate || ""
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid size={{xs:12, sm:6}} component={Box}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="截止日期"
                  value={formData.endDate}
                  onChange={(date) => handleDateChange('endDate', date)}
                  slotProps={{
                    textField: {
                      error: !!errors.endDate,
                      helperText: errors.endDate || ""
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid size={{xs:12}} component={Box}>
              <TextField
                fullWidth
                label="备注信息"
                name="notes"
                multiline
                rows={4}
                value={formData.notes}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid size={{xs:12}} component={Box} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
              >
                取消
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                创建项目
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProjectCreateApp;
