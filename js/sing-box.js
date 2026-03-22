const { type, name } = $arguments
const compatible_outbound = {
  tag: 'COMPATIBLE',
  type: 'direct',
}

let compatible
let config = JSON.parse($files[0])
let proxies = await produceArtifact({
  name,
  type: /^1$|col/i.test(type) ? 'collection' : 'subscription',
  platform: 'sing-box',
  produceType: 'internal',
})

// 1. 将抓取到的节点注入全局出站
config.outbounds.push(...proxies)

// 2. 核心修改：同时向“默认代理”和“自动选择”注入节点标签
config.outbounds.map(i => {
  // 匹配“默认代理”或“自动选择”这两个 tag
  if (['默认代理', '自动选择'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies))
  }
})

// 3. 空分组兜底逻辑（保持不变）
config.outbounds.forEach(outbound => {
  if (Array.isArray(outbound.outbounds) && outbound.outbounds.length === 0) {
    if (!compatible) {
      config.outbounds.push(compatible_outbound)
      compatible = true
    }
    outbound.outbounds.push(compatible_outbound.tag);
  }
});

$content = JSON.stringify(config, null, 2)

// 获取标签的辅助函数（保持不变）
function getTags(proxies, regex) {
  return (regex ? proxies.filter(p => regex.test(p.tag)) : proxies).map(p => p.tag)
}
