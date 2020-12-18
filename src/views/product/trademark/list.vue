<template>
  <div>
    <!-- 添加按钮 -->
    <el-button type="primary" @click="addTrademark">+添加</el-button>

    <!-- 表格的数据:data="tableData" -->
    <el-table :data="trademarkList" border style="width: 100%">
      <el-table-column type="index" label="序号" width="100"> </el-table-column>

      <el-table-column prop="tmName" label="品牌名称"> </el-table-column>

      <el-table-column label="品牌LOGO">
        <template v-slot="scope">
          <img class="trademark-img" :src="scope.row.logoUrl" alt="logo" />
        </template>
      </el-table-column>

      <el-table-column label="操作">
        <template v-slot="{ row }">
          <el-button
            type="warning"
            icon="el-icon-edit"
            @click="updateTrademark(row)"
            >修改</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            @click="delOnetrademark(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 点击添加或修改弹出的对话框el-dialog -->
    <el-dialog
      :title="`${trademarkFormData.id ? '修改' : '添加'}品牌`"
      :visible.sync="dialogshow"
      width="50%"
    >
      <el-form :model="trademarkFormData" ref="formName" :rules="rules">
        <!-- 每一个表单域都要用el-form-item包裹 -->
        <el-form-item label="品牌名称" label-width="100px" prop="tmName">
          <el-input
            v-model="trademarkFormData.tmName"
            placeholder="请输入内容"
          ></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" label-width="100px" prop="logoUrl">
          <el-upload
            class="avatar-uploader"
            :action="`${$BASE_API}/admin/product/fileUpload`"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img
              v-if="trademarkFormData.logoUrl"
              :src="trademarkFormData.logoUrl"
              class="avatar"
            />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
          <span>只能上传jpg/png文件，且不超过50kb</span>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogshow = false">取 消</el-button>
        <el-button type="primary" @click="confirmUpdateTrademark('formName')"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 分页器 -->
    <div class="block">
      <el-pagination
        @size-change="getTrademark(page, $event)"
        @current-change="getTrademark($event, limit)"
        :current-page="page"
        :page-sizes="[3, 6, 9]"
        :page-size.sync="limit"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: "TrademarkList",
  data() {
    return {
      trademarkList: [],
      dialogshow: false,
      input: "",
      trademarkFormData: {
        tmName: "",
        logoUrl: "",
      },
      currentpage: 3,
      page: 1,
      limit: 3,
      total: 0,
      rules: {
        tmName: [
          {
            // 只有tmName使用了validator
            validator: this.validator,
            trigger: "blur",
          },
        ],
        logoUrl: [
          {
            required: true,
            message: "请上传品牌LOGO",
          },
        ],
      },
    };
  },
  methods: {
    //删除掉某一行的品牌
    delOnetrademark(row) {
      this.$confirm(`确定删除${row.tmName}吗？`, "提示一下", {
        type: "warning",
      }).then(async () => {
        const result = await this.$API.trademark. deleteTradeark(row.id);

        this.$message.success('删除成功');
        this.getTrademark(this.page,this.limit)
      }).catch((error)=>{
        if(error ==='cancel'){this.$message.info('已取消删除')}

      })
    },
    //必写。图片上传成功之后触发的回调，不上传新的图片不触发，将表单里面logo的地址更改为服务器响应的地址

    handleAvatarSuccess(res) {
      // console.log(res);
      this.trademarkFormData.logoUrl = res.data;
    },
    //必写。上传图片之前触发的回调。负责检测图片的格式和大小。并且返回检测的结果。都为true时才可以上传
    beforeAvatarUpload(file) {
      const imageType = ["image/jpg", "image/jpeg", "image/png"];
      const filetype = imageType.indexOf(file.type) > -1;
      const filesize = file.size / 1024 < 50;
      if (!filetype) {
        this.$message.error("上传的品牌logo只能是jpg或者png格式");
      }
      if (!filesize) {
        this.$message.error("上传的图片大小应该在50kb以内");
      }
      return filetype && filesize;
    },
    //品牌名的自定义校验函数
    validator(rule, value, callback) {
      if (!value) {
        callback(new Error("请输入品牌名称"));
        return;
      } else if (value.length < 2 || value.length > 10) {
        callback(new Error("品牌名称长度在2~10位之间"));
        return;
      }
      callback();
    },
    // 点击对话框确定之后触发的函数
    confirmUpdateTrademark(formName) {
      this.$refs[formName].validate(async (valid) => {
        const { trademarkFormData } = this;
        if (valid) {
          //判断是更新（trademarkFormData.id有值）还是添加。双叹号是转化为布尔值
          const isUpdate = !!trademarkFormData.id;
          const data = this.trademarkList.find(
            (tm) => (tm.id = trademarkFormData.id)
          );
          //如果是更新
          if (isUpdate) {
            //再判断品牌名和品牌LOGO改动了没
            if (
              data.tmName === trademarkFormData.tmName &&
              data.logoUrl === trademarkFormData.logoUrl
            ) {
              //没改动
              this.$message.warning("修改的值不能与原来一样");
              return;
            }
            //不是没改动，那么就是改动了
            const result = await this.$API.trademark.updateTrademark(
              trademarkFormData
            );

            this.dialogshow = false;
            // console.log(trademarkFormData);
            // console.log(result.code);
            this.getTrademark(this.page, this.limit);
          }
          //不是更新，那么就是添加了
          const result = await this.$API.trademark.addTrademark(
            trademarkFormData
          );
          if (result.code === 200) {
            this.$message.success("添加品牌成功");
            this.getTrademark(this.page, this.limit);
          }
          this.dialogshow = false;
        }
      });
    },
    //请求品牌数据。让页面得以重新展示
    async getTrademark(page, limit) {
      const result = await this.$API.trademark.reqGetTrademark(page, limit);
      if (result.code === 200) {
         console.log(11);
        this.trademarkList = result.data.records;
        this.limit = result.data.size;
        this.page = result.data.current;
        this.total = result.data.total;
      } else {
        this.$message.error("获取分页列表失败");
      }
    },
    //点击添加按钮，显示出对话框
    addTrademark() {
      this.dialogshow = true;
      this.trademarkFormData.tmName = "";
      this.trademarkFormData.logoUrl = "";
    },
    //更新品牌
    updateTrademark(row) {
      this.dialogshow = true;
      this.trademarkFormData = { ...row };
    },
    handleClose(done) {
      this.$confirm("确认关闭？")
        .then((_) => {
          done();
        })
        .catch((_) => {});
    },
  },
  //一上来就请求品牌数据
  async mounted() {
    this.getTrademark(this.page, this.limit);
  },
};
</script>
<style lang='sass' scoped>
.trademark-img
  width: 150px

>>>.avatar-uploader .el-upload
  border: 1px dashed #d9d9d9
  border-radius: 6px
  cursor: pointer
  position: relative
  overflow: hidden
  &:hover
    border-color: #409EFF

>>>.avatar-uploader-icon
  font-size: 28px
  color: #8c939d
  width: 178px
  height: 178px
  line-height: 178px
  text-align: center

>>>.avatar
  width: 178px
  height: 178px
  display: block
</style>
