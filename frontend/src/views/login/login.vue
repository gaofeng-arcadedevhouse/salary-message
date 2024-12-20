<script setup>
import { UserService } from "@/api/userService";
import { ElMessage } from "element-plus";
import { reactive } from "vue";
const ruleFormRef = ref();
const form = reactive({
  email: "",
  password: "",
});

const submitForm = (formEl) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (valid) {
      const formData = new FormData();
      formData.append("account", form.email);
      formData.append("password", form.password);
      UserService.login(formData)
        .then((res) => {
          if (res.statusCode === 200) {
            localStorage.setItem("_unbound_token", res.data.accessToken || "");
            localStorage.setItem(
              "_unbound_user",
              JSON.stringify(res.data.user)
            );
          } else {
            ElMessage.error(
              res.msg || "The email or password you entered is incorrect"
            );
          }
        })
        .catch(() => {
          ElMessage.error("Login failed, please try again.");
        });
    }
  });
};

</script>
<template>
     <div class="auth-wrap login-wrap">
       <div class="auth-bg login-bg"></div>
       <div class="auth-content">
         <div class="register-box">
           <span class="title">Log in </span>
   
           <el-form :model="form"  ref="ruleFormRef" class="form">
             <el-form-item prop="email">
               <label class="control-label" for="email">Email address</label>
               <el-input
                 id="email"
                 v-model="form.email"
                 placeholder="Your email here..."
               ></el-input>
             </el-form-item>
   
             <el-form-item prop="password">
               <label class="control-label" for="password">Password</label>
               <el-input
                 type="password"
                 id="password"
                 placeholder="Password here..."
                 v-model="form.password"
               >
             
               </el-input>
             </el-form-item>
   
             <div
               class="register_link tx-right xs-mb-35"
               style="margin-top: -15px"
               @click="forgotPwd"
             >
               <span class="tx-orange">Forgot password?</span>
             </div>
   
             <el-form-item style="margin-bottom: 24px">
               <el-button
                 class="el-button_block"
                 type="primary"
                 @click="submitForm(ruleFormRef)"
                 >Log in</el-button
               >
             </el-form-item>
   
             <div class="tx-center">
               <span class="xs-mb-35 desc"
                 >New user? <span @click="signUp">Create an account</span>
               </span>
             </div>
   
         
           </el-form>
         </div>
       </div>
     </div>
   </template>
   <style lang="less" scoped>
 .auth-wrap {
    display: flex;
    justify-content: space-between;

    .auth-bg {
        flex: 0 0 980px;
        position: relative;
        min-height: 100vh;
        background: #FFFFFF url("~assets/image/login-bg.png") 0 0/cover no-repeat;

        @media (min-width: 780px) and (max-width: 1440px) {
            flex: 12;
        }

        @media screen and (max-width: 780px) {
            display: none;
        }

        .logo {
            position: absolute;
            width: 224px;
            height: 98px;
            left: 58px;
            top: 58px;
        }
    }

    .auth-content {
        flex: 7;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        padding: 0 110px 40px 110px;
        overflow: auto;
        max-height: 100vh;
        overflow-y: auto;

        @media screen and (max-width: 670px) {
            padding: 0 24px 40px 24px;
        }

        &.register-custom {
            display: block;
            padding-top: 40px;
        }
    }

    .btn-back {
        position: absolute;
        top: 23px;
        left: 19px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 50px;
        height: 50px;
        background: #ffffff;
        border: 1px solid #d3d3d3;
        border-radius: 10px;
        cursor: pointer;

        .svg-icon {
            font-size: 32.5px;
        }

        &:hover {
            border: 1px solid darken(#d3d3d3, 5%);
        }
    }

    .register-box {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: stretch;
        width: 385px;
        margin: 0 auto;

        @media screen and (max-width: 450px) {
            width: auto;
        }

        .desc {
              
            font-style: normal;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
            color: #2E2C34;

            span {
                
                font-style: normal;
                font-weight: 600;
                font-size: 14px;
                line-height: 20px;
                color: #FF5A00;
                cursor: pointer;
            }
        }

        .title {
            
            font-weight: 600;
            font-size: 36px;
            line-height: 48px;
            color: #2E2C34;
            margin-bottom: 12px;
        }

        .describe {
            width: 385px;
              
            font-style: normal;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
            color: #000000;
            margin-top: 12px;
            margin-bottom: 24px;

            @media screen and (max-width: 450px) {
                width: auto;
            }
        }

        .sub-title {
            
            font-weight: 400;
            font-size: 18px;
            line-height: 27px;
            color: #3d3d3d;
        }

        .register-text {
            display: flex;
            flex-direction: column;

            .line-all {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 12px;

                .line-left,
                .line-right {
                    width: 178px;
                    height: 1px;
                    background: #EBEAED;
                }

                span {
                    font-family: 'Manrope', sans-serif;
                    font-style: normal;
                    font-weight: 500;
                    font-size: 14px;
                    line-height: 20px;
                    color: #2E2C34;
                }
            }

            .google,
            .facebook {
                border: 1px solid #EBEAED;
                border-radius: 4px;
                height: 48px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 20px;

                svg {
                    font-size: 16px;
                }

                span {
                      
                    font-style: normal;
                    font-weight: 400;
                    font-size: 14px;
                    line-height: 20px;
                    color: #2E2C34;
                    margin-left: 8px;
                }
            }

            .description {
                margin-top: 20px;
                  
                font-style: normal;
                font-weight: 400;
                font-size: 12px;
                line-height: 18px;
                color: #84818A;
                text-align: left;

                span {
                    color: #5542f6;
                    font-weight: 500;
                    cursor: pointer;
                }
            }
        }

        .resend-text {
              
            font-style: normal;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
            color: #2E2C34;
            cursor: pointer;

            span {
                color: #2F80ED;
                font-weight: 600;
            }
        }

        .register_link {
            
            font-weight: 400;
            font-size: 14px;
            line-height: 22px;
            color: #3d3d3d;

            span {
                cursor: pointer;
            }
        }
    }

    :deep(.el-button) {
        border: none;
        background-color: #000000;
        border-radius: 15px;
        height: 52px;

        span {
              
            font-style: normal;
            font-weight: 600;
            font-size: 14px;
            line-height: 20px;
            color: #FFFFFF;
        }
    }


    &.login-wrap {
        height: 100%;

        .auth-bg {
            flex: 0 0 548px;
            position: relative;
            min-height: 100vh;
            background: #040728 url("~assets/image/login-bg.png") center cover no-repeat;

            @media screen and (max-width: 1440px) {
                background-position: center center;
                flex: 0 0 40%;
            }

            @media screen and (max-width: 780px) {
                display: none;
            }

            .logo {
                position: absolute;
                width: 116px;
                height: auto;
                left: 48px;
                top: 40px;
            }
        }

        .register-box {

            .title {
                margin-bottom: 48px;
            }

            .desc {
                span {
                    font-weight: 400;
                }
            }
        }


        :deep(.el-button) {
            border: none;
            background: #000;
            border-radius: 100px;
            height: 52px;

            span {
                
                font-style: normal;
                font-weight: 600;
                font-size: 14px;
                line-height: 20px;
                color: #FFFFFF;
            }
        }

    }
}
   </style>
   