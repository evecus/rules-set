/**
 * 终极兼容版 - 解决 GUI.for.SingBox 参数解析问题
 */

async function main() {
    console.log("--- 脚本开始执行 ---");
    
    // 1. 强制兼容性参数获取
    let name = "all"; // 默认值
    let type = "collection"; // 默认值

    try {
        if (typeof $arguments !== 'undefined' && $arguments) {
            console.log("检测到 $arguments 类型:", typeof $arguments);
            let rawArgs = $arguments;
            
            // 如果是对象，直接取值
            if (typeof rawArgs === 'object') {
                name = rawArgs.name || name;
                type = rawArgs.type || type;
            } 
            // 如果是字符串，手动切割
            else if (typeof rawArgs === 'string') {
                console.log("原始参数字符串:", rawArgs);
                const pairs = rawArgs.split('&');
                pairs.forEach(p => {
                    const [k, v] = p.split('=');
                    if (k === 'name') name = v;
                    if (k === 'type') type = v;
                });
            }
        }
    } catch (e) {
        console.log("参数解析异常，使用默认值:", e.message);
    }

    console.log(`最终确定参数 - 名称: ${name}, 类型: ${type}`);

    // 2. 获取 Sub-Store 节点
    const isCollection = /^1$|col/i.test(String(type));
    let proxies = [];
    try {
        proxies = await produceArtifact({
            name: name,
            type: isCollection ? 'collection' : 'subscription',
            platform: 'sing-box',
            produceType: 'internal',
        });
        console.log(`成功获取节点数量: ${proxies ? proxies.length : 0}`);
    } catch (e) {
        console.log("Sub-Store 获取失败:", e.message);
    }

    // 3. 处理 JSON 配置文件
    let config;
    try {
        config = JSON.parse($files[0]);
    } catch (e) {
        console.log("JSON 解析失败，请检查原始文件内容");
        $content = $files[0];
        return;
    }

    // 4. 核心注入逻辑
    if (!config.outbounds) config.outbounds = [];
    
    // 先把节点对象塞进全局出站
    if (proxies && proxies.length > 0) {
        config.outbounds.push(...proxies);
        const proxyTags = proxies.map(p => p.tag);

        // 填充【默认代理】和【自动选择】
        config.outbounds.forEach(outbound => {
            if (outbound.tag === '默认代理' || outbound.tag === '自动选择') {
                console.log(`正在填充组: ${outbound.tag}`);
                outbound.outbounds = Array.isArray(outbound.outbounds) ? outbound.outbounds : [];
                outbound.outbounds.push(...proxyTags);
            }
        });
    }

    // 5. 输出结果
    $content = JSON.stringify(config, null, 2);
    console.log("--- 脚本执行完毕 ---");
}

main().catch(e => {
    console.log("主函数崩溃:", e.message);
    $content = $files[0];
});
