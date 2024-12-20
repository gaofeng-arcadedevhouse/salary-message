<script setup>
import axios from 'axios';
import { ElMessage } from "element-plus";
import { onMounted, reactive, ref, watch } from "vue";
import * as XLSX from "xlsx";
const active = ref(0);
const startYear = 2021;
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() == 0 ? 12 : new Date().getMonth();
const yearOptions = Array.from({ length: 10 }, (_, i) => `${startYear + i}年`);
const monthOptions = Array.from({ length: 12 }, (_, i) => `${i + 1}月`);
const email = ref(false);
const weChat = ref(false);
const selectAll = ref(false);
const fullscreenLoading = ref(false);
const sentRecords = ref([]);

const form = reactive({
  payType: "薪资",
  date1: `${currentYear}年`,
  date2: `${currentMonth}月`,
  payTitle: "",
});
const uploadedData = ref([]);
const selectedEmployee = reactive({});
const checkedEmployees = ref([]);

const updatePayTitle = () => {
  form.payTitle = `${form.date1}${form.date2}${form.payType}`;
};

const formatCurrency = (row, column, cellValue) => {
  return cellValue ? cellValue.toFixed(2) : '0.00';
};

watch(() => [form.date1, form.date2, form.payType], updatePayTitle);

const handlePreview = (uploadFile) => {
  console.log(uploadFile, "uploadFile");
};

const beforeUpload = async (rawFile) => {
  fullscreenLoading.value = true;
  try {
    saveSentRecords([]);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (!parsedData || parsedData.length === 0) {
        throw new Error("文件内容为空或格式不正确");
      }
      const keys = parsedData[0];

      const dataRows = parsedData.slice(1).filter((row) => {
        return (
          row[0] !== "合计" &&
          row.some((cell) => cell !== null && cell !== undefined && cell !== "")
        );
      });

      const employees = dataRows.map((row) => {
        return keys.reduce((obj, key, index) => {
          obj[key] = row[index] !== null ? row[index] : "-";
          return obj;
        }, {});
      });
      uploadedData.value = employees;
      if (uploadedData.value.length > 0) {
        Object.assign(selectedEmployee, uploadedData.value[0]);
      }
      setTimeout(() => {
        fullscreenLoading.value = false;
      }, 1000);

      nextStep();
    };
    reader.readAsArrayBuffer(rawFile);
  } catch (error) {
    console.error("文件上传解析失败:", error.message);
  }
  return false;
};

const nextStep = () => {
  if (active.value++ > 2) active.value = 0;
};

const prevStep = () => {
  if (active.value-- < 0) active.value = 0;
};


onMounted(() => {
  loadSentRecords();
  if (uploadedData.value.length > 0) {
 
    Object.assign(selectedEmployee, uploadedData.value[0]);
    
    checkedEmployees.value = [uploadedData.value[0]];
  }
});

watch(checkedEmployees, () => {
  selectAll.value = uploadedData.value.length === checkedEmployees.value.length;
});

const handleCheckAllChange = () => {
  if (selectAll.value) {
    checkedEmployees.value = [...uploadedData.value];
  } else {
    checkedEmployees.value = [];
  }
};

const handleNameClick = (employee) => {
  Object.assign(selectedEmployee, employee);
};

const convertToPinyin = (data) => {
  const fieldMapping = {
    '编号': 'id',
    '姓名': 'name',
    '工号': 'employeeId',
    '邮箱': 'email',
    '基本工资': 'jbgz',
    '岗位津贴': 'gwjt',
    '绩效工资基数': 'jxgzjs',
    '绩效系数': 'jxxs',
    '实发绩效工资': 'sfjxgz',
    '总额': 'ze',
    '工作时长': 'gzsc',
    '工作人月': 'gzry',
    '请假扣除': 'qjkc',
    '餐费补贴': 'cfbt',
    '其它+': 'qt_add',
    '其它-': 'qt_minus',
    '应发总额': 'yfze',
    '公积金缴纳基数': 'gjjjnjs',
    '公积金缴纳-': 'gjjjn',
    '社保缴纳-': 'sbjn',
    '税前总额': 'sqze',
    '个税': 'gs',
    '实发工资总额': 'sfgzze'
  };

  return data.map(item => {
    const convertedItem = {};
    for (const [key, value] of Object.entries(item)) {
      convertedItem[fieldMapping[key] || key] = value;
    }
    return convertedItem;
  });
};

const sendEmail = () => {
  const url = "http://localhost:3000/api/send-payroll";
  const convertedData = convertToPinyin(checkedEmployees.value);

  const requestData = {
    title: form.payTitle,
    employees: convertedData
  };

  axios({
    method: "POST",
    url,
    headers: {
      "Content-Type": "application/json"
    },
    data: requestData,
    withCredentials: false
  })
    .then((response) => {
      console.log('收到响应:', response);
      
      if (response?.data?.success) {
        const newRecords = [
          ...sentRecords.value,
          ...checkedEmployees.value.map(emp => ({
            id: emp.工号,
            name: emp.姓名,
            email: emp.邮箱,
            title: form.payTitle,
            sentTime: new Date().toISOString()
          }))
        ];
        saveSentRecords(newRecords);

        ElMessage({
          message: "邮件发送成功",
          type: "success",
        });
      } else {
        throw new Error(response?.data?.message || "邮件发送失败");
      }
    })
    .catch((error) => {
      console.error("邮件发送失败:", error);
      const errorMessage = error.response?.data?.message 
        || error.message 
        || "邮件发送失败";
      ElMessage({
        message: errorMessage,
        type: "error",
      });
    });
};


const sendWeChat = () => {
  ElMessage({
      message: "暂时不支持该方式发送",
      type: "warning",
    });
};

const send = () => {
  if (!weChat.value && !email.value) {
    ElMessage({
      message: "请至少选择一种发送方式",
      type: "warning",
    });
    return;
  }

  if (checkedEmployees.value.length === 0) {
    ElMessage({
      message: "请至少选择一名员工",
      type: "warning",
    });
    return;
  }

  if (email.value) {
    sendEmail();
  }
  if (weChat.value) {
    sendWeChat();
  }
};

const loadSentRecords = () => {
  const records = localStorage.getItem('sentPayrollRecords');
  if (records) {
    sentRecords.value = JSON.parse(records);
  }
};

const saveSentRecords = (newRecords) => {
  localStorage.setItem('sentPayrollRecords', JSON.stringify(newRecords));
  sentRecords.value = newRecords;
};

const isEmployeeSent = (employee) => {
  return sentRecords.value.some(record => 
    record.id === employee.工号 && 
    record.title === form.payTitle
  );
};

updatePayTitle();
</script>

<template>
  <div class="steps">
    <el-steps :active="active" finish-status="success" align-center>
      <el-step title="上传工资表" />
      <el-step title="核对数据" />
      <el-step title="预览并发送" />
    </el-steps>

    <div v-if="active == 0">
      <div class="card">
        <el-form :model="form" label-width="auto" style="width: 600px">
          <el-form-item label="发薪类型">
            <el-select
              v-model="form.payType"
              placeholder="please select your zone"
            >
              <el-option label="薪资" value="薪资" />
              <el-option label="奖金" value="奖金" />
            </el-select>
          </el-form-item>
          <el-form-item label="发薪时间">
            <div class="pay-date">
              <el-select v-model="form.date1" placeholder="请选择年份">
                <el-option
                  v-for="year in yearOptions"
                  :key="year"
                  :label="year"
                  :value="year"
                />
              </el-select>
              <el-select v-model="form.date2" placeholder="请选择月份">
                <el-option
                  v-for="month in monthOptions"
                  :key="month"
                  :label="month"
                  :value="month"
                />
              </el-select>
            </div>
          </el-form-item>
          <el-form-item label="工资表标题" class="">
            <el-input v-model="form.payTitle" type="text" />
          </el-form-item>
          <div class="upload-button">
            <el-form-item>
              <el-upload
                v-loading.fullscreen.lock="fullscreenLoading"
                :show-file-list="false"
                accept=".xlsx, .xls"
                class="upload-demo"
                action="#"
                multiple
                :on-preview="handlePreview"
                :limit="1"
                :before-upload="beforeUpload"
              >
                <el-button type="primary">上传工资表</el-button>
              </el-upload>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </div>

    <div v-if="active == 1">
      <div>{{ form.payTitle }}</div>
      <div class="table-container">
        <el-table :data="uploadedData" stripe style="width: 100%" height="550">
          <el-table-column fixed prop="编号" label="编号" width="120" />
          <el-table-column fixed prop="姓名" label="姓名" width="120" />
          <el-table-column fixed prop="邮箱" label="邮箱" width="120" />
          <el-table-column prop="工号" label="工号" width="120" />
          <el-table-column prop="基本工资" label="基本工资" width="120" />
          <el-table-column prop="岗位津贴" label="岗位津贴" width="120" />
          <el-table-column
            prop="绩效工资基数"
            label="绩效工资基数"
            width="120"
          />
          <el-table-column prop="绩效系数" label="绩效系数" width="120" />
          <el-table-column
            prop="实发绩效工资"
            label="实发绩效工资"
            width="120"
          />
          <el-table-column prop="总额" label="总额" width="120" />
          <el-table-column prop="工作时长" label="工作时长" width="120" />
          <el-table-column prop="工作人月" label="工作人月" width="120" />
          <el-table-column prop="请假扣除" label="请假扣除" width="120" />
          <el-table-column prop="餐费补贴" label="餐费补贴" width="120" />
          <el-table-column prop="其它+" label="其它+" width="120" />
          <el-table-column prop="其它-" label="其它-" width="120" />
          <el-table-column prop="应发总额" label="应发总额" width="120" />
          <el-table-column
            prop="公积金缴纳基数"
            label="公积金缴纳基数"
            width="130"
          />
          <el-table-column prop="公积金缴纳-" label="公积金缴纳-" width="120" />
          <el-table-column prop="社保缴纳-" label="社保缴纳-" width="120" />
          <el-table-column prop="税前总额" label="税前总额" width="120" />
          <el-table-column prop="个税" label="个税" width="120" />
          <el-table-column
            prop="实发工资总额"
            label="实发工资总额"
            width="120"
            :formatter="formatCurrency"
          />
          <el-table-column prop="备注" label="备注" width="120" />
        </el-table>
      </div>
      <div class="button-container">
        <el-button type="primary" @click="prevStep">上一步</el-button>
        <el-button type="primary" @click="nextStep">下一步</el-button>
        <div></div>
      </div>
    </div>

    <div v-if="active == 2">
      <div class="salary-container">
        <div class="salary-name">
          <div class="top">
            <el-checkbox v-model="selectAll" @change="handleCheckAllChange"
              >全选</el-checkbox
            >
          </div>
          <ul>
            <li
              v-for="list in uploadedData"
              :key="list.工号"
              :class="{ 
                active: list.工号 === selectedEmployee.工号,
                'sent': isEmployeeSent(list)
              }"
            >
              <el-checkbox
                size="large"
                v-model="checkedEmployees"
                :value="list"
                :label="list.姓名"
                @change="handleNameClick(list)"
                :checked="
                  checkedEmployees.some((item) => item.工号 === list.工号)
                "
              >
              </el-checkbox>
              <span v-if="isEmployeeSent(list)" class="sent-tag">已发送</span>
            </li>
          </ul>
          <div class="total">
            共 <span>{{ uploadedData.length }}</span> 条
            <span class="sent-count" v-if="sentRecords.length">
              (已发送: {{ sentRecords.length }})
            </span>
          </div>
        </div>
        <div class="salary-details">
          <div class="tip" v-if="selectedEmployee['实发工资总额']">
            <div class="left">
              <p>{{ form.payTitle }}</p>
              <p>实发工资总额</p>
            </div>
            <div class="right">￥{{ selectedEmployee["实发工资总额"] }}</div>
          </div>

          <ul v-if="Object.keys(selectedEmployee).length">
            <li v-for="(value, key) in selectedEmployee" :key="key">
              <div class="info">
                <div class="left">{{ key }}</div>
                <div class="right">{{ value }}</div>
              </div>
            </li>
          </ul>
        </div>
        <div class="send-email">
          <div class="send-box">
            <p>发送方式</p>
            <el-checkbox v-model="weChat" label="微信" />
            <el-checkbox v-model="email" label="邮件" size="large" />
          </div>
          <el-button type="primary" @click="send">立即发送</el-button>
        </div>
      </div>
      <div class="button-container">
        <el-button type="primary" @click="prevStep">上一步</el-button>
      </div>
    </div>
  </div>
</template>
<style lang="less" scoped>
.steps {
  width: 1000px;
  margin: 0 auto 100px auto;
  padding-top: 100px;
  :deep(.el-steps) {
    margin-bottom: 20px;
    .el-step__title {
      font-weight: 700;
    }
  }
  .card {
    padding: 30px;
    max-width: 750px;
    margin: 0 auto;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .el-form {
      margin: 0 auto;
    }

    .pay-date {
      width: 100%;
      display: flex;
      justify-content: space-between;

      .el-select {
        width: 48%;
      }
    }

    .upload-button {
      width: 100%;
      display: flex;
      justify-content: center;
      :deep(.el-form-item) {
        margin-bottom: 0;
        .upload-demo {
          .el-upload--text {
            button {
              padding: 20px 40px;
              box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
              background: #33ac37;
              border: none;
            }
          }
        }
      }
    }
  }

  .table-container {
    overflow-x: auto;
    margin: 0 auto;
    max-width: 100%;
    position: relative;
    border: 1px solid #ebeef5;

    table {
      thead {
        tr {
          th {
            padding: 10px 0;
          }
        }
      }
      td {
        min-width: 114px;
        padding: 10px 0;
        text-align: center;
      }
    }
  }
}
:deep(.el-table) {
  th {
    background-color: #fafafa !important;
    div {
      font-weight: 800;
    }
  }
  th,
  td {
    text-align: center;
    border-left: 1px solid #ebeef5;
    &:first-of-type {
      border-left: none;
    }
  }
}
.button-container {
  display: flex;
  justify-content: space-between;

  margin-top: 20px;
}
.salary-container {
  display: flex;
  justify-content: space-between;
  height: 550px;
  .salary-name {
    height: 100%;
    width: 30%;
    border: 1px solid #ebeef5;
    border-radius: 5px;
    .top {
      padding: 10px 0;
      border-bottom: 1px solid #ebeef5;
    }
    :deep(.el-checkbox) {
      display: flex;
      align-items: center;
      width: 100%;
      padding-left: 20px;
    }
    ul {
      height: 83%;
      overflow-y: auto;
      li {
        list-style: none;
        cursor: pointer;
        padding: 6px 0;
        &:hover,
        &.active {
          color: #34ad37;
          background-color: rgba(90, 186, 92, 0.1);
          span {
            color: #34ad37;
          }
        }
      }
    }
    .total {
      border-top: 1px solid #ebeef5;
      padding: 8px 0 0 20px;

      span {
        color: #34ad37;
      }
    }
  }
  .salary-details {
    width: 40%;
    padding: 20px;
    border: 1px solid #ebeef5;
    border-radius: 5px;
    height: 100%;
    overflow-y: auto;
    .tip {
      background: #37b03a;
      padding: 20px 15px;
      border-radius: 5px;
      margin-top: 0;
      box-shadow: 0 0 10px rgba(52, 173, 55, 0.57);
      display: flex;
      justify-content: space-between;
      color: #fff;
      .right {
        font-size: 22px;
        font-weight: 700;
        span {
          font-size: 24px;
          font-weight: 700;
        }
      }
    }
    .info {
      display: flex;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      padding: 3px 25px 3px 15px;
      font-size: 14px;
      color: #999;
      margin-top: 8px;
    }
    ul {
      li {
        list-style: none;
      }
    }
  }
  .send-email {
    width: 20%;
    padding: 20px;
    border: 1px solid #ebeef5;
    border-radius: 5px;
    height: 100%;
    overflow-y: auto;
    .send-box {
      margin-bottom: 20px;
      p {
        font-weight: 700;
      }
    }
  }
}

.salary-name {
  li {
    position: relative;
    
    &.sent {
      background-color: #f0f9eb;
    }
    
    .sent-tag {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 12px;
      color: #67c23a;
      background: #f0f9eb;
      padding: 2px 6px;
      border-radius: 2px;
    }
  }
}

.sent-count {
  font-size: 12px;
  color: #67c23a;
  margin-left: 5px;
}
</style>
