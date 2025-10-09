#!/usr/bin/env python3
# 文件名：simple-proxy.py
# 用途：简单的Dify API代理服务

import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import sys
import os
from urllib.error import HTTPError, URLError

# 配置
DIFY_API_BASE_URL = "http://47.90.156.219/v1"
DIFY_API_TOKEN = "app-EVYktrhqnqncQSV9BdDv6uuu"
PROXY_PORT = 3001

class DifyProxyHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            self.send_health_response()
        else:
            self.send_error(404, "Not Found")
    
    def do_POST(self):
        if self.path == '/api/dify-proxy':
            self.handle_dify_proxy()
        else:
            self.send_error(404, "Not Found")
    
    def send_health_response(self):
        """发送健康检查响应"""
        response = {
            "status": "ok",
            "timestamp": self.date_time_string(),
            "dify_api": DIFY_API_BASE_URL,
            "proxy_port": PROXY_PORT
        }
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(response, indent=2).encode())
    
    def handle_dify_proxy(self):
        """处理Dify API代理请求"""
        try:
            # 读取请求体
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            print(f"🔄 代理请求: {len(post_data)} 字节")
            
            # 构建Dify API请求
            url = f"{DIFY_API_BASE_URL}/workflows/run"
            headers = {
                'Authorization': f'Bearer {DIFY_API_TOKEN}',
                'Content-Type': 'application/json',
                'User-Agent': 'Dify-Simple-Proxy/1.0'
            }
            
            # 发送请求到Dify API
            req = urllib.request.Request(url, data=post_data, headers=headers)
            
            with urllib.request.urlopen(req, timeout=300) as response:
                response_data = response.read()
                status_code = response.status
                
                print(f"✅ Dify API响应: {status_code}")
                
                # 转发响应
                self.send_response(status_code)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(response_data)
                
        except HTTPError as e:
            print(f"❌ HTTP错误: {e.code} {e.reason}")
            error_response = {
                "error": "Dify API HTTP Error",
                "code": e.code,
                "message": e.reason,
                "timestamp": self.date_time_string()
            }
            self.send_response(e.code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(error_response).encode())
            
        except URLError as e:
            print(f"❌ 网络错误: {e.reason}")
            error_response = {
                "error": "Network Error",
                "message": str(e.reason),
                "timestamp": self.date_time_string()
            }
            self.send_response(503)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(error_response).encode())
            
        except Exception as e:
            print(f"❌ 未知错误: {str(e)}")
            error_response = {
                "error": "Internal Server Error",
                "message": str(e),
                "timestamp": self.date_time_string()
            }
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(error_response).encode())
    
    def log_message(self, format, *args):
        """自定义日志格式"""
        print(f"[{self.date_time_string()}] {format % args}")

def main():
    print("🚀 启动简单的Dify代理服务器...")
    print(f"📤 代理端口: {PROXY_PORT}")
    print(f"🎯 Dify API: {DIFY_API_BASE_URL}")
    print(f"🔑 Token: {DIFY_API_TOKEN[:25]}...")
    print("")
    
    try:
        with socketserver.TCPServer(("", PROXY_PORT), DifyProxyHandler) as httpd:
            print(f"✅ 代理服务器启动成功!")
            print(f"🌐 健康检查: http://localhost:{PROXY_PORT}/health")
            print(f"🎯 API代理: http://localhost:{PROXY_PORT}/api/dify-proxy")
            print("")
            print("按 Ctrl+C 停止服务器")
            print("")
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 收到停止信号，正在关闭服务器...")
        sys.exit(0)
    except Exception as e:
        print(f"❌ 服务器启动失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

