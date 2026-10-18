"""下载已选定的网络实拍图，并保存作者、许可和来源；不生成或修改图片。"""
from pathlib import Path
import hashlib
import html
import json
import re
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'src/main/resources/static/uploads/demo/food'
DEST.mkdir(parents=True, exist_ok=True)
data = json.loads((ROOT / 'db/demo-data.json').read_text(encoding='utf-8'))

def get(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'CompanyRestaurantDemo/1.0 (educational demonstration)'})
    with urllib.request.urlopen(request, timeout=45) as response:
        return response.read()

def plain(value):
    return re.sub(r'\s+', ' ', html.unescape(re.sub('<[^>]+>', '', value))).strip()

sources = []
authors = {'Mapo tofu.JPG': 'Yaoleilei', 'Egg drop soup.jpg': 'Stu Spivack (stu_spivack)'}
for recipe in data['recipes']:
    params = {'action': 'query', 'format': 'json', 'prop': 'imageinfo', 'iiprop': 'url|extmetadata',
              'iiurlwidth': 960, 'titles': 'File:' + recipe['sourceTitle']}
    result = json.loads(get('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params)))
    page = next(iter(result['query']['pages'].values()))
    info = page['imageinfo'][0]
    metadata = info['extmetadata']
    path = DEST / recipe['image']
    url = info.get('thumburl', info['url'])
    if not path.exists():
        try:
            content = get(url)
        except Exception:
            url = info['url']
            content = get(url)
        if not content.startswith(b'\xff\xd8\xff'):
            raise ValueError(f'Not a JPEG: {recipe["image"]}')
        path.write_bytes(content)
    sources.append({
        'dish': recipe['name'], 'file': recipe['image'], 'source': info['descriptionurl'],
        'downloadUrl': url, 'author': plain(metadata.get('Artist', {}).get('value', '')) or authors.get(recipe['sourceTitle'], ''),
        'license': plain(metadata.get('LicenseShortName', {}).get('value', '')),
        'licenseUrl': metadata.get('LicenseUrl', {}).get('value', ''),
        'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
        'changes': '无编辑；按来源提供的原图或缩略图下载'
    })
    print(f'{recipe["image"]}: {path.stat().st_size} bytes', flush=True)
(ROOT / 'db/demo-image-sources.json').write_text(json.dumps(sources, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
lines = ['# 演示菜品图片来源', '', '以下图片均为网络已有照片，未使用AI生成。文件随项目保存，演示时无需访问外网。', '', '| 菜品 | 作者 | 来源 | 许可 |', '|---|---|---|---|']
for source in sources:
    license_label = f'[{source["license"]}]({source["licenseUrl"]})' if source['licenseUrl'] else source['license']
    lines.append(f'| {source["dish"]} | {source["author"]} | [原始页面]({source["source"]}) | {license_label} |')
lines += ['', '图片文件位于 `src/main/resources/static/uploads/demo/food/`。未编辑图片内容，仅采用来源站提供的原图或缩略图。', '演示用静态图片与用户通过MinIO上传的图片互不影响。', '']
(ROOT / 'docs/demo-image-sources.md').write_text('\n'.join(lines), encoding='utf-8')
