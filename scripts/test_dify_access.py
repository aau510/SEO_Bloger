#!/usr/bin/env python3
# 文件名：test_dify_access.py
# 用途：Python版本的Dify连通性测试

import requests
import socket
import time
import json
from urllib.parse import urlparse

def test_network_connectivity():
    """测试网络连通性"""
    print("🧪 测试服务器访问 Dify API 的能力...")
    print("")
    
    # 测试目标
    dify_host = "47.90.156.219"
    dify_port = 80
    dify_url = f"http://{dify_host}/v1/workflows/run"
    
    # 1. 测试基本连通性
    print("1️⃣ 测试基本网络连通性...")
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(10)
        result = sock.connect_ex((dify_host, dify_port))
        sock.close()
        
        if result == 0:
            print(f"✅ 端口 {dify_port} 连通正常")
        else:
            print(f"❌ 端口 {dify_port} 连接失败 (错误代码: {result})")
    except Exception as e:
        print(f"❌ 网络测试失败: {e}")
    print("")
    
    # 2. 测试HTTP访问
    print("2️⃣ 测试HTTP访问...")
    try:
        response = requests.get(f"http://{dify_host}/v1/health", timeout=10)
        print(f"✅ HTTP访问成功: {response.status_code}")
        print(f"   响应内容: {response.text[:100]}...")
    except requests.exceptions.ConnectTimeout:
        print("❌ 连接超时")
    except requests.exceptions.ConnectionError as e:
        print(f"❌ 连接错误: {e}")
    except Exception as e:
        print(f"❌ HTTP测试失败: {e}")
    print("")
    
    # 3. 测试Dify API
    print("3️⃣ 测试Dify API访问...")
    try:
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer app-EVYktrhqnqncQSV9BdDv6uuu',
            'User-Agent': 'Network-Test-Client/1.0'
        }
        
        data = {
            "inputs": {},
            "response_mode": "blocking",
            "user": "test"
        }
        
        start_time = time.time()
        response = requests.post(dify_url, json=data, headers=headers, timeout=30)
        duration = time.time() - start_time
        
        print(f"✅ Dify API访问成功: {response.status_code}")
        print(f"   响应时间: {duration:.2f}秒")
        print(f"   响应内容: {response.text[:200]}...")
        
        # 尝试解析JSON响应
        try:
            json_response = response.json()
            print(f"   JSON解析成功: {json.dumps(json_response, indent=2)[:300]}...")
        except:
            print("   JSON解析失败，响应可能不是JSON格式")
        
    except requests.exceptions.ConnectTimeout:
        print("❌ Dify API连接超时")
    except requests.exceptions.ConnectionError as e:
        print(f"❌ Dify API连接错误: {e}")
    except Exception as e:
        print(f"❌ Dify API测试失败: {e}")
    print("")
    
    # 4. 网络诊断信息
    print("📊 网络诊断信息:")
    try:
        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)
        print(f"   主机名: {hostname}")
        print(f"   本机IP: {local_ip}")
    except:
        print("   无法获取本机IP信息")
    
    print(f"   目标服务器: {dify_host}")
    print(f"   测试时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("")
    
    print("🎉 连通性测试完成!")

if __name__ == "__main__":
    test_network_connectivity()

