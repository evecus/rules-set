const { type, name } = $arguments

// 1. 获取订阅节点数据
// 这里会根据传入的 type 自动判断是 Sub-Store 的“单条订阅”还是“组合订阅”
let proxies = await produceArtifact({
  name,
  type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
  platform: 'mihomo', // 关键：指定输出格式为 mihomo/clash
  produceType: 'internal',
})

// 2. 解析原始配置文件 (通常是 YAML 格式)
let config = jsyaml.load($files[0])

// 3. 注入节点到 proxies 列表
// 如果原配置没有 proxies 字段，则初始化为空数组
if (!config.proxies) {
  config.proxies = []
}
config.proxies.push(...proxies)

// 4. 将节点名提取出来，注入到“默认代理”策略组中
const proxyNames = proxies.map(p => p.name)

if (Array.isArray(config['proxy-groups'])) {
  config['proxy-groups'].forEach(group => {
    // 寻找名为“默认代理”的策略组
    if (group.name === '默认代理') {
      // 如果该组原本有节点，则合并；如果没有，则直接赋值
      if (Array.isArray(group.proxies)) {
        group.proxies.push(...proxyNames)
      } else {
        group.proxies = [...proxyNames]
      }
    }
  })
}

// 5. 将处理后的对象转回 YAML 字符串
$content = jsyaml.dump(config)
