"""通过前端代理和真实后端接口补齐演示数据；不直接写数据库，可重复执行。"""
from pathlib import Path
import hashlib
import io
import json
from decimal import Decimal
from datetime import datetime, timedelta, timezone
import zipfile
import requests

ROOT = Path(__file__).resolve().parents[1]
BASE = 'http://127.0.0.1:5173'
data = json.loads((ROOT/'db/demo-data.json').read_text(encoding='utf-8'))
now = datetime.now(timezone(timedelta(hours=8)))
assert now.date().isoformat() == data['baseDate'] and (now.hour, now.minute) < (23, 58), '已超出演示数据准备日期或时间窗口，停止写入'
manifest_path = ROOT/'db/api-demo-manifest.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8')) if manifest_path.exists() else {'images': {}, 'users': {}, 'recipes': {}, 'menus': {}, 'orders': {}}
def save():
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
def api(session, method, path, **kwargs):
    r = session.request(method, BASE+'/api'+path, timeout=40, **kwargs)
    r.raise_for_status()
    result = r.json()
    assert result['code'] == 200, (method, path, result)
    return result.get('data')
def login(name):
    s = requests.Session()
    api(s, 'POST', '/auth/login', json={'loginName':name, 'password':data['password']})
    return s
manager = login('liuming')
def listing(path):
    result = api(manager, 'GET', path, params={'pageSize':100})
    assert result['total'] == len(result['list']), '分页超限，停止避免遗漏'
    return result['list']
users = {u['loginName']:u for u in listing('/users')}
for _, name, login_name, phone, department, workstation, role in data['users']:
    if login_name not in users:
        api(manager, 'POST', '/users', json=dict(name=name, loginName=login_name, password=data['password'], phone=phone, department=department, workstation=workstation, role=role))
        users = {u['loginName']:u for u in listing('/users')}
    assert users[login_name]['role'] == role
    manifest['users'][login_name] = users[login_name]['id']
    save()
sessions = {row[2]:login(row[2]) for row in data['users']}
print('七个演示账户均通过实际登录验证', flush=True)
recipes = {r['name']:r for r in listing('/recipes')}
for recipe in data['recipes']:
    key = str(recipe['id'])
    source = ROOT/'src/main/resources/static/uploads/demo/food'/recipe['image']
    raw = source.read_bytes()
    if key not in manifest['images']:
        uploaded = api(manager, 'POST', '/files/upload/image', files={'file':(source.name, raw, 'image/jpeg')})
        manifest['images'][key] = {'url':uploaded['url'], 'source':recipe['image'], 'sha256':hashlib.sha256(raw).hexdigest()}
        save()
    photo = manifest['images'][key]['url']
    assert photo.startswith('/uploads/image/')
    downloaded = requests.get(BASE+photo, timeout=40)
    downloaded.raise_for_status()
    assert downloaded.content == raw, photo
    if recipe['name'] not in recipes:
        api(manager, 'POST', '/recipes', json={**{k:recipe[k] for k in ('name','unit','classify','price')}, 'photo':photo})
        recipes = {r['name']:r for r in listing('/recipes')}
    actual = recipes[recipe['name']]
    assert actual['photo'] == photo
    assert Decimal(str(actual['price'])) == Decimal(recipe['price'])
    manifest['recipes'][key] = actual['id']
    save()
print('十张图片上传及逐字节回读验证通过，十道食谱已保存', flush=True)
def menu(name, recipe_keys):
    existing = [m for m in listing('/menus') if m['name'] == name]
    assert len(existing) <= 1
    if existing:
        result = api(manager, 'PUT', f"/menus/{existing[0]['id']}/activate")
    else:
        result = api(manager, 'POST', '/menus', json={'name':name, 'recipeIds':[manifest['recipes'][str(k)] for k in recipe_keys]})
    assert sorted(i['recipeId'] for i in result['items']) == sorted(manifest['recipes'][str(k)] for k in recipe_keys)
    manifest['menus'][name] = result['id']
    save()
    return result
menu('经典家常菜单', [1,3,4,7,8,9])
menu('清爽轻食菜单', [1,2,5,7,8,10])
selections = [
    [[(1,1),(3,1),(7,1),(8,1)],[(1,2),(6,1),(10,1)],[(1,1),(4,1),(5,1),(8,1)],[(1,1),(5,1),(7,1),(9,2)],[(1,1),(3,1),(8,1),(10,1)],[(1,1),(4,1),(7,1),(8,1)]],
    [[(2,1),(5,1),(8,1)],[(1,2),(3,1),(7,1)],[(1,1),(6,1),(8,1)],[(1,1),(4,1),(10,1),(9,2)],[(1,1),(3,1),(5,1),(8,1)],[(2,1),(7,1),(8,1),(9,1)]]]
original_config = manifest.setdefault('originalConfig', api(manager, 'GET', '/configs'))
save()
try:
    for day, name, keys, deadline, serve in [(0,'周日午餐菜单',[1,3,4,5,6,7,8,9,10],'23:58','23:59'), (1,'周一精选菜单',list(range(1,11)),'00:00','00:01')]:
        current = menu(name, keys)
        items = {i['recipeId']:i for i in current['items']}
        if day == 0:
            api(manager, 'PUT', f"/menus/items/{items[manifest['recipes']['3']]['id']}/price", json={'price':15})
        api(manager, 'PUT', '/configs', json={'orderDeadline':deadline,'serveStartTime':serve})
        date = ['2026-10-18','2026-10-19'][day]
        status = api(manager, 'GET', '/orders/status')
        assert status['canOrder'] and status['mealDate'] == date, status
        total = Decimal(0)
        for row, chosen in zip(data['users'][:6], selections[day]):
            username = row[2]
            session = sessions[username]
            body = {'items':[{'menuItemId':items[manifest['recipes'][str(k)]]['id'],'qty':qty} for k,qty in chosen]}
            previous = api(session, 'GET', '/orders/mine', params={'mealDate':date,'pageSize':100})['list']
            assert len(previous) <= 1
            order = previous[0] if previous else api(session, 'POST', '/orders', json=body)
            expected = sum((Decimal('15') if day == 0 and k == 3 else Decimal(data['recipes'][k-1]['price']))*qty for k,qty in chosen)
            assert Decimal(str(order['totalPrice'])) == expected, order
            total += expected
            manifest['orders'][date+'/'+username] = order['id']
            save()
        assert total == Decimal(['150','147.50'][day])
        duplicate = sessions['employee01'].post(BASE+'/api/orders', json=body, timeout=40)
        assert duplicate.json()['code'] == 400, duplicate.text
        assert not api(sessions['employee03'], 'GET', '/orders/mine', params={'mealDate':date})['list']
        api(sessions['chef'], 'GET', '/orders/blanket', params={'mealDate':date})
        api(sessions['deliverer'], 'GET', '/orders/delivery', params={'mealDate':date})
        print(f'{date} 六张订单已验证，合计 {total}', flush=True)
finally:
    api(manager, 'PUT', '/configs', json=original_config)
assert api(manager, 'GET', '/configs') == original_config
assert not any(u['loginName'].startswith('import0') for u in listing('/users'))
monthly = api(sessions['finance'], 'GET', '/reports/monthly', params={'month':'2026-10'})
assert Decimal(str(monthly['totalAmount'])) == Decimal('319.30'), monthly
mine = api(sessions['employee01'], 'GET', '/reports/mine/monthly', params={'month':'2026-10'})
assert Decimal(str(mine['totalAmount'])) == Decimal('57.00')
for session, path in [(sessions['finance'],'/reports/monthly/export'), (sessions['finance'],f"/reports/employee/{manifest['users']['employee01']}/export"), (sessions['employee01'],'/reports/mine/monthly/export'), (sessions['employee01'],'/reports/mine/orders/export')]:
    response = session.get(BASE+'/api'+path, params={'month':'2026-10'}, timeout=40)
    response.raise_for_status()
    with zipfile.ZipFile(io.BytesIO(response.content)) as workbook:
        assert workbook.testzip() is None
        assert 'xl/workbook.xml' in workbook.namelist()
assert sessions['employee01'].get(BASE+'/api/users', timeout=40).status_code == 403
manifest['verified'] = True
manifest['monthlyTotal'] = str(monthly['totalAmount'])
save()
print('四类Excel导出、财务报表、角色权限、未导入账户与配置恢复全部验证通过', flush=True)
