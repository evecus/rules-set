#!/bin/bash
# ========================================
# Armbian IPv6 禁用脚本
# 仅保留 IPv4，eth0 网卡可用
# Tested on: Armbian (Debian/Ubuntu based)
# ========================================

echo "=== 禁用 IPv6 开始 ==="

# 1️⃣ 写入 sysctl 配置
SYSCTL_FILE="/etc/sysctl.d/99-disable-ipv6.conf"
echo "写入 $SYSCTL_FILE ..."
cat <<EOF | sudo tee $SYSCTL_FILE > /dev/null
# 禁用 IPv6
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1
net.ipv6.conf.eth0.disable_ipv6 = 1
EOF

# 2️⃣ 立即生效
sudo sysctl -p $SYSCTL_FILE



# 4️⃣ NetworkManager 配置（如果存在）
if command -v nmcli >/dev/null 2>&1; then
  echo "检测到 NetworkManager，设置 eth0 IPv6 为 ignore ..."
  sudo nmcli connection modify eth0 ipv6.method ignore 2>/dev/null || echo "⚠️ 无法修改 eth0，请确认连接名称。"
fi

# 5️⃣ 重启网络
echo "重启网络以应用更改 ..."
if systemctl is-active --quiet NetworkManager; then
  sudo systemctl restart NetworkManager
else
  sudo systemctl restart networking
fi

echo "=== IPv6 已禁用，请重启系统以确保完全生效 ==="
