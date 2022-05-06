<template>
  <n-card :bordered="false" class="proCard">
    <BasicForm @register="register" @submit="handleSubmit" :submitOnReset="true" />

    <BasicTable
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      ref="actionRef"
      :actionColumn="actionColumn"
      :scroll-x="1090"
    >
      <template #tableTitle>
        <n-button type="primary" @click="handleAdd">
          <template #icon>
            <n-icon>
              <PlusOutlined />
            </n-icon>
          </template>
          新建
        </n-button>
      </template>

      <template #toolbar>
        <n-button type="primary" @click="reloadTable">刷新数据</n-button>
      </template>
    </BasicTable>

    <n-modal v-model:show="showModal" :show-icon="false" preset="dialog" :title="title">
      <n-form
        :model="formParams"
        :rules="rules"
        ref="formRef"
        label-placement="left"
        :label-width="80"
        class="py-4"
      >
        <n-form-item label="用户名" path="username">
          <n-input
            :disabled="isUpdatePassword"
            placeholder="请输入用户名"
            v-model:value="formParams.username"
          />
        </n-form-item>
        <n-form-item v-if="isUpdatePassword || isAddUser" label="密码" path="password">
          <n-input
            placeholder="请输入密码"
            type="password"
            v-model:value="formParams.password"
            :input-props="{ autocomplete: 'new-password' }"
          />
        </n-form-item>
        <n-form-item v-if="isUpdatePassword" label="确认密码" path="confirmPassword">
          <n-input
            placeholder="请再次输入密码"
            type="password"
            v-model:value="formParams.confirmPassword"
            :input-props="{ autocomplete: 'new-password' }"
          />
        </n-form-item>
        <n-form-item v-if="!isUpdatePassword" label="姓名" path="nickName">
          <n-input placeholder="请输入姓名" v-model:value="formParams.nickName" />
        </n-form-item>
        <n-form-item v-if="!isUpdatePassword" label="角色" path="roleId">
          <n-select
            placeholder="请选择角色"
            v-model:value="formParams.roleId"
            :options="roleOptions"
          />
        </n-form-item>
      </n-form>

      <template #action>
        <n-space>
          <n-button @click="() => (showModal = false)">取消</n-button>
          <n-button type="info" :loading="formBtnLoading" @click="confirmForm">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </n-card>
</template>

<script lang="ts" setup>
  import { h, reactive, ref } from 'vue';
  import { FormItemRule, useDialog, useMessage } from 'naive-ui';
  import { BasicTable, TableAction } from '@/components/Table';
  import { BasicForm, useForm } from '@/components/Form/index';
  import { addUser, deleteUser, getUserList, updateUser } from '@/api/table/user';
  import { columns } from './columns';
  import { PlusOutlined } from '@vicons/antd';
  import { cloneDeep } from "lodash";

  const roleOptions = [
    {
      label: '管理员',
      value: '1',
    },
  ];

  const rules = {
    username: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入用户名',
    },
    nickName: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入姓名',
    },
    password: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入密码',
    },
    confirmPassword: [
      {
        required: true,
        trigger: ['blur', 'input'],
        message: '请输入密码',
      },
      {
        validator: validatePasswordStartWith,
        message: '两次密码输入不一致',
        trigger: 'input',
      },
      {
        validator: validatePasswordSame,
        message: '两次密码输入不一致',
        trigger: ['blur', 'password-input'],
      },
    ],
    roleId: {
      required: true,
      trigger: ['blur', 'change'],
      message: '请选择角色',
    },
  };

  const schemas = [
    {
      field: 'username',
      component: 'NInput',
      label: '用户名',
      componentProps: {
        placeholder: '请输入用户名',
      },
    },
  ];

  const formRef: any = ref(null);
  const message = useMessage();
  const actionRef = ref();
  const dialog = useDialog();
  const showModal = ref(false);
  const isAddUser = ref(false);
  const isUpdateUser = ref(false);
  const isUpdatePassword = ref(false);
  const formBtnLoading = ref(false);
  const title = ref('');

  const initFormParams = {
    userId: '',
    username: '',
    password: '',
    confirmPassword: '',
    nickName: '',
    roleId: null,
  };
  const formParams = ref(cloneDeep(initFormParams));

  const params = ref({
    pageSize: 10,
  });

  const actionColumn = reactive({
    title: '操作',
    key: 'action',
    fixed: 'right',
    render(record) {
      return h(TableAction as any, {
        style: 'button',
        actions: [
          {
            label: '删除',
            icon: 'ic:outline-delete-outline',
            onClick: handleDelete.bind(null, record),
          },
          {
            label: '编辑',
            onClick: handleEdit.bind(null, record),
          },
          {
            label: '修改密码',
            onClick: handlePasswordEdit.bind(null, record),
          },
        ],
      });
    },
  });

  const [register, { getFieldsValue }] = useForm({
    gridProps: { cols: '1 s:1 m:2 l:3 xl:4 2xl:4' },
    labelWidth: 80,
    showAdvancedButton: false,
    schemas,
  });

  const loadDataTable = async (res) => {
    return await getUserList({ ...getFieldsValue(), ...params.value, ...res });
  };

  function handleAdd() {
    title.value = '新增用户';
    openModal();
    isAddUser.value = true;
    isUpdateUser.value = false;
    isUpdatePassword.value = false;
  }

  function handleEdit(record: Recordable) {
    title.value = '修改用户';
    openModal();
    isUpdateUser.value = true;
    isUpdatePassword.value = false;
    isAddUser.value = false;
    formParams.value = record;
    formParams.value.roleId = record.roleList[0].roleId.toString();
  }

  function handlePasswordEdit(record: Recordable) {
    title.value = '修改密码';
    openModal();
    isUpdateUser.value = false;
    isUpdatePassword.value = true;
    isAddUser.value = false;
    formParams.value = record;
    formParams.value.password = '';
  }

  function reloadTable() {
    actionRef.value.reload();
  }

  function confirmForm(e) {
    e.preventDefault();
    formBtnLoading.value = true;
    formRef.value.validate((errors) => {
      if (!errors) {
        if (!isUpdateUser.value) {
          addUser(formParams.value)
            .then(() => {
              message.success('新增用户成功');
              setTimeout(() => {
                showModal.value = false;
                reloadTable();
              });
            })
            .finally(() => {
              formBtnLoading.value = false;
            });
        } else {
          updateUser(formParams.value)
            .then(() => {
              message.success('修改用户成功');
              setTimeout(() => {
                showModal.value = false;
                reloadTable();
              });
            })
            .finally(() => {
              formBtnLoading.value = false;
            });
        }
      } else {
        message.error('请填写完整信息');
      }
    });
  }

  function handleDelete(record: Recordable) {
    dialog.warning({
      title: '警告',
      content: '确定要删除该用户信息吗？',
      positiveText: '确定',
      negativeText: '不确定',
      onPositiveClick: () => {
        deleteUser(record.userId).then((res) => {
          reloadTable();
          message.success('删除成功');
        });
      },
      onNegativeClick: () => {
        message.error('不确定');
      },
    });
    console.log('点击了删除', record);
  }

  function handleSubmit() {
    reloadTable();
  }

  const resetFormValue = () => {
    formParams.value = cloneDeep(initFormParams);
  };

  function openModal() {
    resetFormValue();
    showModal.value = true;
  }

  function validatePasswordStartWith(rule: FormItemRule, value: string): boolean {
    return (
      !!formParams.password &&
      formParams.password.startsWith(value) &&
      formParams.password.length >= value.length
    );
  }
  function validatePasswordSame(rule: FormItemRule, value: string): boolean {
    return value === formParams.password;
  }
</script>

<style lang="less" scoped></style>
