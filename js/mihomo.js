/**
 * Sub-Store Script for Mihomo (Clash Meta)
 * 参数说明:
 * name: 订阅或组合的名字
 * type: 1 或 col 代表组合订阅，其他代表单条订阅
 */

const { type, name } = $arguments

async function main() {
  // 1. 获取订阅节点数据
  // 根据输入参数判断从 Sub-Store 的哪个分类取回节点
  const isCollection = /^1$|col/i.test(type)
  
  let proxies = await produceArtifact({
    name,
    type: isCollection ? 'collection' : 'subscription',
    platform: 'mihomo', // 确保输出为 Mihomo 兼容格式
    produceType: 'internal',
  })

  // 2. 解析原始 YAML 配置文件
  // $files[0] 是你关联的原始配置文件内容
  let config = jsyaml.load($files[0])

  // 3. 确保配置基础结构存在
  if (!config.proxies) config.proxies = []
  if (!config['proxy-groups']) config['proxy-groups'] = []

  // 4. 注入节点对象到全局 proxies 列表
  // 使用解构赋值合并，避免重复（如果原配置已有手动节点）
  config.proxies.push(...proxies)

  // 5. 提取所有节点名称
  let proxyNames = proxies.map(p => p.name)

  // 6. 安全检查：如果没有任何节点，添加 DIRECT 兜底
  if (proxyNames.length === 0) {
    proxyNames.push('DIRECT')
  }

  // 7. 寻找并填充“默认代理”策略组
  let targetGroupFound = false
  config['proxy-groups'].forEach(group => {
    if (group.name === '默认代理') {
      targetGroupFound = true
      // 确保该组的 proxies 是数组
      if (!Array.isArray(group.proxies)) {
        group.proxies = []
      }
      // 将节点名注入到该组中
      group.proxies.push(...proxyNames)
    }
  })

  // 8. 自动补偿：如果 YAML 里忘了写“默认代理”组，脚本帮你创建一个
  if (!targetGroupFound) {
    config['proxy-groups'].push({
      name: '默认代理',
      type: 'select',
      proxies: proxyNames
    })
  }

  // 9. 将处理后的对象转回 YAML 字符串输出
  $content = jsyaml.dump(config)
}

// 执行主函数
main().catch(err => {
  console.log('脚本执行出错:', err)
  $content = $files[0] // 出错时返回原始配置，防止程序崩溃
})
