import socket
import smtplib
import json

def handler(event: dict, context) -> dict:
    '''Диагностика SMTP подключения'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    results = []
    
    # Test 1: DNS resolution
    host = 'smtp.yandex.com'
    port = 587
    
    results.append(f"=== Тест DNS для {host} ===")
    try:
        ip = socket.gethostbyname(host)
        results.append(f"✓ DNS разрешен: {host} → {ip}")
        dns_ok = True
    except socket.gaierror as e:
        results.append(f"✗ DNS ошибка: {e}")
        results.append("Проблема с DNS. Проверьте:")
        results.append("1. Доступ к интернету из контейнера")
        results.append("2. Настройки /etc/resolv.conf")
        results.append("3. Брандмауэр/прокси")
        dns_ok = False
    
    # Test 2: SMTP connection (only if DNS works)
    if dns_ok:
        results.append(f"\n=== Тест подключения к {host}:{port} ===")
        try:
            server = smtplib.SMTP(host, port, timeout=10)
            server.ehlo()
            results.append("✓ Подключение установлено")
            results.append(f"✓ EHLO ответ получен")
            server.quit()
            smtp_ok = True
        except Exception as e:
            results.append(f"✗ Ошибка подключения: {e}")
            smtp_ok = False
    else:
        smtp_ok = False
    
    # Test 3: Alternative hosts
    results.append("\n=== Тест альтернативных серверов ===")
    alt_hosts = [
        ('smtp.gmail.com', 587),
        ('smtp.mail.ru', 587),
        ('mail.sparcom.ru', 465)
    ]
    
    for alt_host, alt_port in alt_hosts:
        try:
            ip = socket.gethostbyname(alt_host)
            results.append(f"✓ {alt_host} → {ip}")
        except socket.gaierror:
            results.append(f"✗ {alt_host} - DNS не разрешается")
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'dns_ok': dns_ok,
            'smtp_ok': smtp_ok,
            'details': '\n'.join(results)
        }, ensure_ascii=False)
    }
