const { type, name } = $arguments

async function main() {
  // 1. 获取节点数据
  const isCollection = /^1$|col/i.test(type)
  let proxies = await produceArtifact({
    name,
    type: isCollection ? 'collection' : 'subscription',
    platform: 'sing-box',
    produceType: 'internal',
  })

  // 2. 解析原始 JSON 配置
  let config = JSON.parse($files[0])

  // 3. 将节点对象注入全局出站列表
  if (!config.outbounds) config.outbounds = []
  config.outbounds.push(...proxies)

  // 4. 获取所有节点的 tag
  const proxyTags = proxies.map(p => p.tag)

  // 5. 遍历并填充指定的分组
  config.outbounds.forEach(outbound => {
    // 填充“默认代理” (手动选择)
    if (outbound.tag === '默认代理') {
      outbound.outbounds = Array.isArray(outbound.outbounds) ? outbound.outbounds : []
      outbound.outbounds.push(...proxyTags)
    }
    // 填充“自动选择” (延迟测试)
    if (outbound.tag === '自动选择') {
      outbound.outbounds = Array.isArray(outbound.outbounds) ? outbound.outbounds : []
      outbound.outbounds.push(...proxyTags)
    }
  })

  // 6. 输出结果
  $content = JSON.stringify(config, null, 2)
}

main().catch(err => {
  console.log('脚本错误:', err)
  $content = $files[0]
})
