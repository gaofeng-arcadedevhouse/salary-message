const express = require('express');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const app = express();

// 简化的 CORS 配置
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: '*',
  credentials: false,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

// 设置SendGrid API密钥
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/api/send-payroll', async (req, res) => {
  try {
    console.log('收到请求数据:', req.body);
    
    // 验证请求数据
    if (!req.body || !req.body.employees || !Array.isArray(req.body.employees) || req.body.employees.length === 0) {
      throw new Error('无效的请求数据格式');
    }

    const { title, employees } = req.body;
    
    // 验证每个员工数据
    employees.forEach((employee, index) => {
      if (!employee.email) {
        throw new Error(`第 ${index + 1} 个员工缺少邮箱地址`);
      }
      if (!employee.name) {
        throw new Error(`第 ${index + 1} 个员工缺少姓名`);
      }
    });

    const emailPromises = employees.map(async (employee) => {
      console.log('处理员工数据:', employee);
      
      const emailContent = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; font-size: 13px; color: #333;">
          <div style="background: #f8f9fa; padding: 15px; text-align: center; border-bottom: 3px solid #28a745;">
            <h2 style="margin: 0; color: #28a745; font-size: 18px;">${employee.name}的工资条</h2>
          </div>
          
          <table style="border-collapse: collapse; width: 100%; background: #fff; font-size: 12px;">
            <tr>
              <td style="border: 1px solid #eee; padding: 6px 8px; width: 40%;">编号</td>
              <td style="border: 1px solid #eee; padding: 6px 8px;">${employee.id}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #eee; padding: 6px 8px;">姓名</td>
              <td style="border: 1px solid #eee; padding: 6px 8px;">${employee.name}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #eee; padding: 6px 8px;">工号</td>
              <td style="border: 1px solid #eee; padding: 6px 8px;">${employee.employeeId}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #eee; padding: 6px 8px;">邮箱</td>
              <td style="border: 1px solid #eee; padding: 6px 8px;">${employee.email}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #eee; padding: 6px 8px;">基本工资</td>
              <td style="border: 1px solid #eee; padding: 6px 8px; color: #28a745;">¥${employee.jbgz}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #eee; padding: 6px 8px;">岗位津贴</td>
              <td style="border: 1px solid #eee; padding: 6px 8px; color: #28a745;">¥${employee.gwjt}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #eee; padding: 6px 8px;">绩效工资基数</td>
              <td style="border: 1px solid #eee; padding: 6px 8px;">¥${employee.jxgzjs}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #eee; padding: 6px 8px;">绩效系数</td>
              <td style="border: 1px solid #eee; padding: 6px 8px;">${employee.jxxs}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #eee; padding: 6px 8px;">实发绩效工资</td>
              <td style="border: 1px solid #eee; padding: 6px 8px; color: #28a745;">¥${employee.sfjxgz}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #eee; padding: 6px 8px;">总额</td>
              <td style="border: 1px solid #eee; padding: 6px 8px;">¥${employee.ze}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #eee; padding: 6px 8px;">工作时长</td>
              <td style="border: 1px solid #eee; padding: 6px 8px;">${employee.gzsc}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #eee; padding: 6px 8px;">工作人月</td>
              <td style="border: 1px solid #eee; padding: 6px 8px;">${employee.gzry}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #eee; padding: 6px 8px;">请假扣除</td>
              <td style="border: 1px solid #eee; padding: 6px 8px; color: #dc3545;">-¥${employee.qjkc}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #eee; padding: 6px 8px;">餐费补贴</td>
              <td style="border: 1px solid #eee; padding: 6px 8px; color: #28a745;">¥${employee.cfbt}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #eee; padding: 6px 8px;">其它+</td>
              <td style="border: 1px solid #eee; padding: 6px 8px; color: #28a745;">¥${employee.qt_add}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #eee; padding: 6px 8px;">其它-</td>
              <td style="border: 1px solid #eee; padding: 6px 8px; color: #dc3545;">-¥${employee.qt_minus}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #eee; padding: 6px 8px;">应发总额</td>
              <td style="border: 1px solid #eee; padding: 6px 8px; color: #28a745;">¥${employee.yfze}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #eee; padding: 6px 8px;">公积金缴纳基数</td>
              <td style="border: 1px solid #eee; padding: 6px 8px;">¥${employee.gjjjnjs}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #eee; padding: 6px 8px;">公积金缴纳-</td>
              <td style="border: 1px solid #eee; padding: 6px 8px; color: #dc3545;">-¥${employee.gjjjn}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #eee; padding: 6px 8px;">社保缴纳-</td>
              <td style="border: 1px solid #eee; padding: 6px 8px; color: #dc3545;">-¥${employee.sbjn}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #eee; padding: 6px 8px;">税前总额</td>
              <td style="border: 1px solid #eee; padding: 6px 8px;">¥${employee.sqze}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #eee; padding: 6px 8px;">个税</td>
              <td style="border: 1px solid #eee; padding: 6px 8px; color: #dc3545;">-¥${employee.gs}</td>
            </tr>
            <tr style="background: #f8f9fa; font-weight: bold;">
              <td style="border: 1px solid #eee; padding: 6px 8px;">实发工资总额</td>
              <td style="border: 1px solid #eee; padding: 6px 8px; color: #28a745; font-size: 14px;">¥${employee.sfgzze}</td>
            </tr>
          </table>
          
          <div style="font-size: 11px; color: #666; margin-top: 10px; text-align: center;">
            <p style="margin: 5px 0;">此工资条为系统自动生成，请勿回复。如有疑问请联系人力资源部门。</p>
          </div>
        </div>
      `;

      const msg = {
        to: employee.email,
        from: process.env.SENDER_EMAIL,
        subject: title || '工资单',
        html: emailContent,
      };
      
      console.log('准备发送邮件:', {
        to: msg.to,
        from: msg.from,
        subject: msg.subject
      });
      
      try {
        const result = await sgMail.send(msg);
        console.log('邮件发送成功:', {
          to: msg.to,
          statusCode: result?.[0]?.statusCode
        });
        return result;
      } catch (error) {
        console.error('邮件发送失败:', {
          to: msg.to,
          error: error.message,
          code: error.code,
          response: error.response?.body
        });
        throw error;
      }
    });

    const results = await Promise.all(emailPromises);
    console.log('所有邮件发送完成:', results.length);
    
    res.json({ 
      success: true, 
      message: '邮件发送成功',
      count: results.length 
    });
  } catch (error) {
    console.error('处理请求失败:', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({ 
      success: false, 
      message: error.message || '邮件发送失败',
      error: {
        message: error.message,
        code: error.code,
        response: error.response?.body
      }
    });
  }
});

// 添加错误处理��间件
app.use((err, req, res, next) => {
  console.error('未捕获的错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: err.message
  });
});

// 处理未找到的路由
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '未找到请求的资源'
  });
});

// 添加一个预检请求处理器
app.options('*', cors(corsOptions));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 