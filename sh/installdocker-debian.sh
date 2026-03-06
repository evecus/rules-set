#!/bin/bash
# ============================================
# 一键安装 Docker & Docker Compose for Debian 12
# 作者: ChatGPT (2025)
# ============================================

set -e

echo "🚀 开始安装 Docker 环境..."

# 1. 更新系统
sudo apt update -y
sudo apt upgrade -y

# 2. 安装依赖
sudo apt install -y ca-certificates curl gnupg lsb-release

# 3. 添加 Docker 官方 GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | \
sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 4. 设置 Docker 软件源
echo \
  "deb [arch=$(dpkg --print-architecture) \
  signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. 安装 Docker
sudo apt update -y
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 6. 启动 Docker 并设为开机自启
sudo systemctl enable docker
sudo systemctl start docker

# 7. 添加当前用户到 docker 组（可选）
if [ "$SUDO_USER" ]; then
    sudo usermod -aG docker "$SUDO_USER"
    echo "✅ 用户 $SUDO_USER 已加入 docker 组（需重新登录生效）"
fi

# 8. 测试 Docker 是否安装成功
echo "🧩 测试 Docker..."
sudo docker run --rm hello-world

echo "✅ Docker 安装完成！"
echo "👉 版本信息："
docker --version
docker compose version

echo "🎉 一切搞定！可使用 'sudo docker run hello-world' 测试。"
