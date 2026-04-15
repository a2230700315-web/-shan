// 测试完整的订单流程
const fs = require('fs');
const path = require('path');

// 模拟 localStorage
const localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  },
  clear() {
    this.data = {};
  }
};

// 模拟 Date.now()
const now = Date.now();

// 导入必要的模块
const { applyAction } = require('./src/modules/provider-web/domain/workflow.ts');
const { mockOrders, mockEmployees } = require('./src/modules/provider-web/domain/mockData.ts');

// 测试流程
async function testOrderFlow() {
  console.log('=== 开始测试完整订单流程 ===\n');
  
  // 1. 初始化订单数据
  let order = mockOrders[0];
  console.log('1. 初始订单状态:', order.id, '当前节点:', order.currentNode);
  
  // 2. 服务商接单
  console.log('\n2. 服务商接单...');
  try {
    order = applyAction(order, 'service', {
      type: 'provider_accept',
      at: now,
      operatorName: '林客服'
    });
    console.log('   接单成功，当前节点:', order.currentNode);
  } catch (error) {
    console.error('   接单失败:', error.message);
    return;
  }
  
  // 3. 服务商报价
  console.log('\n3. 服务商报价...');
  try {
    order = applyAction(order, 'service', {
      type: 'provider_quote_submit',
      at: now + 60000, // 1分钟后
      operatorName: '林客服',
      priceYuan: 2000,
      note: '含人力与设备调度'
    });
    console.log('   报价成功，当前节点:', order.currentNode);
    console.log('   报价金额:', order.quotes[0].providerPriceYuan, '元');
  } catch (error) {
    console.error('   报价失败:', error.message);
    return;
  }
  
  // 4. 用户确认报价
  console.log('\n4. 用户确认报价...');
  const { applyUserQuoteDecision } = require('./src/modules/provider-web/domain/workflow.ts');
  try {
    order = applyUserQuoteDecision(order, {
      at: now + 120000, // 2分钟后
      decision: 'accepted'
    });
    console.log('   确认报价成功，当前节点:', order.currentNode);
  } catch (error) {
    console.error('   确认报价失败:', error.message);
    return;
  }
  
  // 5. 资源分配
  console.log('\n5. 资源分配...');
  try {
    order = applyAction(order, 'service', {
      type: 'resource_assign',
      at: now + 180000, // 3分钟后
      operatorName: '林客服',
      assignment: {
        pilotEmployeeId: 'e_pilot_1',
        groundEmployeeId: 'e_ground_1',
        droneId: 'd_1',
        vehicleId: 'v_1'
      }
    });
    console.log('   资源分配成功，当前节点:', order.currentNode);
  } catch (error) {
    console.error('   资源分配失败:', error.message);
    return;
  }
  
  // 6. 地勤出发
  console.log('\n6. 地勤出发...');
  try {
    order = applyAction(order, 'ground', {
      type: 'ground_depart',
      at: now + 240000, // 4分钟后
      operatorName: '赵地勤',
      note: '已出发前往吊运地点'
    });
    console.log('   地勤出发成功，当前节点:', order.currentNode);
  } catch (error) {
    console.error('   地勤出发失败:', error.message);
    return;
  }
  
  // 7. 飞手开始吊运
  console.log('\n7. 飞手开始吊运...');
  try {
    order = applyAction(order, 'pilot', {
      type: 'pilot_start',
      at: now + 300000, // 5分钟后
      operatorName: '陈飞手',
      note: '开始吊运作业'
    });
    console.log('   开始吊运成功，当前节点:', order.currentNode);
  } catch (error) {
    console.error('   开始吊运失败:', error.message);
    return;
  }
  
  // 8. 飞手完成吊运
  console.log('\n8. 飞手完成吊运...');
  try {
    order = applyAction(order, 'pilot', {
      type: 'pilot_finish',
      at: now + 360000, // 6分钟后
      operatorName: '陈飞手',
      result: {
        actualWeightKg: 120,
        actualVolumeCm: { length: 80, width: 60, height: 45 },
        actualAmountYuan: 2000
      }
    });
    console.log('   完成吊运成功，当前节点:', order.currentNode);
  } catch (error) {
    console.error('   完成吊运失败:', error.message);
    return;
  }
  
  // 9. 财务开票
  console.log('\n9. 财务开票...');
  try {
    order = applyAction(order, 'finance', {
      type: 'finance_invoice',
      at: now + 420000, // 7分钟后
      operatorName: '周财务',
      invoice: {
        invoiceNo: 'INV-20260401-0001',
        invoicedAt: now + 420000
      }
    });
    console.log('   开票成功，当前节点:', order.currentNode);
  } catch (error) {
    console.error('   开票失败:', error.message);
    return;
  }
  
  // 10. 财务标记收款
  console.log('\n10. 财务标记收款...');
  try {
    order = applyAction(order, 'finance', {
      type: 'finance_invoice',
      at: now + 480000, // 8分钟后
      operatorName: '周财务',
      invoice: {
        invoiceNo: 'INV-20260401-0001',
        invoicedAt: now + 420000
      },
      receipt: {
        receivedAt: now + 480000,
        receivedAmountYuan: 2000,
        method: 'bank_transfer'
      }
    });
    console.log('   标记收款成功，当前节点:', order.currentNode);
    console.log('   订单状态:', order.lifecycleStatus);
  } catch (error) {
    console.error('   标记收款失败:', error.message);
    return;
  }
  
  console.log('\n=== 订单流程测试完成 ===');
  console.log('订单最终状态:', order.lifecycleStatus);
  console.log('当前节点:', order.currentNode);
  console.log('已完成的节点数:', order.timeline.length);
}

// 运行测试
testOrderFlow().catch(console.error);
