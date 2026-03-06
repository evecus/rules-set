#!/bin/bash

show_menu() {
    echo "==========================="
    echo "  OpenWrt 防火墙管理脚本"
    echo "==========================="
    echo "1) 添加防火墙放行规则"
    echo "2) 删除防火墙规则"
    echo "3) 退出"
    echo "==========================="
}

add_rule() {
    read -p "请输入防火墙规则名称 (name): " RULE_NAME
    read -p "请输入放行端口号 (dest_port): " DEST_PORT
    read -p "请输入协议 (tcp/udp): " PROTO

    uci add firewall rule
    uci set firewall.@rule[-1].name="$RULE_NAME"
    uci set firewall.@rule[-1].src='wan'
    uci set firewall.@rule[-1].dest='lan'
    uci set firewall.@rule[-1].proto="$PROTO"
    uci set firewall.@rule[-1].dest_port="$DEST_PORT"
    uci set firewall.@rule[-1].target='ACCEPT'

    uci commit firewall
    /etc/init.d/firewall restart

    echo ">>> 成功添加规则：$RULE_NAME ($PROTO/$DEST_PORT)"
}

delete_rule() {
    echo "当前防火墙规则列表："
    echo "---------------------------------------"
    # 列出所有 rule 并显示编号和名称
    uci show firewall | grep '=rule' | nl
    echo "---------------------------------------"

    read -p "请输入要删除的规则编号 (如 10 表示 firewall.@rule[9]): " NUM

    INDEX=$((NUM-1))

    echo ">>> 删除: firewall.@rule[$INDEX]"

    uci delete firewall.@rule[$INDEX]
    uci commit firewall
    /etc/init.d/firewall restart

    echo ">>> 规则已删除并生效"
}

while true; do
    show_menu
    read -p "请选择操作: " CHOICE

    case $CHOICE in
        1) add_rule ;;
        2) delete_rule ;;
        3) echo "退出脚本"; exit 0 ;;
        *) echo "无效选择，请重试" ;;
    esac
done
