/**
 * 自动解析参数版 Sing-box 脚本
 * 兼容所有环境，防止 type: undefined 报错
 */

async function main() {
    // --- 1. 强化版参数解析 ---
    let args = {};
    if (typeof $arguments !== 'undefined' && $arguments) {
        if (typeof $arguments === 'string') {
            // 如果是字符串 (如 "name=all&type=collection")，手动解析
            $arguments.split('&').forEach(item => {
                const [key, value] = item.split('=');
                args[key] = value;
            });
        } else {
            // 如果已经是对象，直接赋值
            args = $arguments;
        }
    }

    // 获取参数并设定默认值
    const name = args.name || "all";
    const type = args.type || "collection"; 
    const isCollection = /^1$|col/i.test(String(type));

    console.log(`解析成功 - 模式: ${isCollection ? '组合' : '订阅'}, 名称: ${name}`);

    // --- 2. 获取节点数据 ---
    let proxies = [];
    try {
        proxies = await produceArtifact({
            name: name,
            type: isCollection ? 'collection' : 'subscription',
            platform: 'sing-box',
            produceType: 'internal',
        });
    } catch (e) {
        throw new Error(`无法从 Sub-Store 获取 [${name}]: ${e.message}`);
    }

    // --- 3. 解析并填充 JSON ---
    let config = JSON.parse($files[0]);
    if (!config.outbounds) config.outbounds = [];

    // 注入节点对象
    config.outbounds.push(...proxies);
    const proxyTags = proxies.map(p => p.tag);

    // 填充【默认代理】和【自动选择】
    config.outbounds.forEach(outbound => {
        if (outbound.tag === '默认代理' || outbound.tag === '自动选择') {
            outbound.outbounds = Array.isArray(outbound.outbounds) ? outbound.outbounds : [];
            outbound.outbounds.push(...proxyTags);
        }
    });

    // --- 4. 输出结果 ---
    $content = JSON.stringify(config, null, 2);
}

main().catch(err => {
    // 弹出具体错误信息
    if (typeof $notification !== 'undefined') {
        $notification.post("脚本执行失败", err.message, "请检查 Sub-Store 资源名称");
    }
    console.log("Error: " + err.message);
    $content = $files[0];
});
