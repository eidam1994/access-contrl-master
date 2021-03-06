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
        <n-form-item label="角色名称" path="roleName">
          <n-input placeholder="请输入角色名称" v-model:value="formParams.roleName" />
        </n-form-item>
        <n-form-item label="角色标识" path="roleCode">
          <n-input placeholder="请输入角色标识" v-model:value="formParams.roleCode" />
        </n-form-item>
        <n-form-item label="角色描述" path="roleDesc">
          <n-input placeholder="请输入角色描述" v-model:value="formParams.roleDesc" />
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
  import { useDialog, useMessage } from 'naive-ui';
  import { BasicTable, TableAction } from '@/components/Table';
  import { BasicForm, useForm } from '@/components/Form/index';
  import { addRole, deleteRole, getRoleList, updateRole } from '@/api/table/role';
  import { columns } from './columns';
  import { PlusOutlined } from '@vicons/antd';
  import { cloneDeep } from 'lodash';

  const rules = {
    roleName: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入角色名称',
    },
    roleDesc: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入角色描述',
    },
    roleCode: {
      required: true,
      trigger: ['blur', 'input'],
      message: '请输入角色标识',
    },
  };

  const schemas = [
    {
      field: 'roleName',
      component: 'NInput',
      label: '角色名称',
      componentProps: {
        placeholder: '请输入角色名称',
      },
    },
  ];

  const formRef: any = ref(null);
  const message = useMessage();
  const actionRef = ref();
  const dialog = useDialog();
  const showModal = ref(false);
  const isAddRole = ref(false);
  const isUpdateRole = ref(false);
  const formBtnLoading = ref(false);
  const title = ref('');

  const initFormParams = {
    roleId: '',
    roleName: '',
    roleDesc: '',
    roleCode: '',
    dsType: '0'
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
    return await getRoleList({ ...getFieldsValue(), ...params.value, ...res });
  };

  function handleAdd() {
    title.value = '新增角色';
    openModal();
    isAddRole.value = true;
    isUpdateRole.value = false;
  }

  function handleEdit(record: Recordable) {
    title.value = '修改角色';
    openModal();
    isUpdateRole.value = true;
    isAddRole.value = false;
    formParams.value = record;
  }

  function reloadTable() {
    actionRef.value.reload();
  }

  function confirmForm(e) {
    e.preventDefault();
    formBtnLoading.value = true;
    formRef.value.validate((errors) => {
      if (!errors) {
        if (!isUpdateRole.value) {
          addRole(formParams.value)
            .then(() => {
              message.success('新增角色成功');
              setTimeout(() => {
                showModal.value = false;
                reloadTable();
              });
            })
            .finally(() => {
              formBtnLoading.value = false;
            });
        } else {
          updateRole(formParams.value)
            .then(() => {
              message.success('修改角色成功');
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
      content: '确定要删除该角色信息吗？',
      positiveText: '确定',
      negativeText: '不确定',
      onPositiveClick: () => {
        deleteRole(record.roleId).then((res) => {
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
</script>

<style lang="less" scoped></style>
