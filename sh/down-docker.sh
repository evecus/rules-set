#!/bin/bash

set -e

# ===============================
# 一键回退 Docker 到 28.5.2
# 系统：Ubuntu 24.04 ARM64
# 目标版本：docker-ce 28.5.2
# ===============================

TARGET_DOCKER_VERSION="5:28.5.2-1~ubuntu.24.04~noble"

echo "=== 停止 Docker 服务 ==="
sudo systemctl stop docker || true
sudo systemctl stop docker.docket || true

echo "=== 卸载当前 Docker 版本 ==="
sudo apt remove -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo apt autoremove -y

echo "=== 更新 apt 仓库 ==="
sudo apt update

echo "=== 安装指定版本 Docker ==="
sudo apt install -y \
  docker-ce=${TARGET_DOCKER_VERSION} \
  docker-ce-cli=${TARGET_DOCKER_VERSION} \
  containerd.io

echo "=== 启动 Docker ==="
sudo systemctl enable docker
sudo systemctl start docker

echo "=== 检查 Docker 版本 ==="
docker --version

echo "=== 列出所有容器和镜像（保留检查） ==="
docker ps -a
docker images

echo "=== 完成 ==="
echo "Docker 已回退到 ${TARGET_DOCKER_VERSION}，容器和镜像保留。"
