"""从本地配置读取连接信息，使用现有JDBC驱动导出；不输出凭据。"""
from pathlib import Path
import argparse
import os
import subprocess
import yaml

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--output', default='db/reset.sql')
parser.add_argument('--manifest', default='db/api-demo-snapshot.json')
args = parser.parse_args()
public = yaml.safe_load((ROOT/'src/main/resources/application.yml').read_text(encoding='utf-8'))
local = yaml.safe_load((ROOT/'src/main/resources/application-local.yml').read_text(encoding='utf-8'))
config = {**public['spring']['datasource'], **local['spring']['datasource']}
def resolve(value):
    if isinstance(value, str) and value.startswith('${') and value.endswith('}'):
        name, _, default = value[2:-1].partition(':')
        return os.environ.get(name, default)
    return str(value)
environment = os.environ.copy()
for key, value in [('URL',config['url']), ('USER',config['username']), ('PASSWORD',config['password'])]:
    environment['DEMO_DB_'+key] = resolve(value)
jars = [p for p in (Path.home()/'.m2/repository/com/mysql/mysql-connector-j').glob('*/*.jar') if not p.name.endswith(('-sources.jar','-javadoc.jar'))]
driver = sorted(jars)[-1]
for name in (args.output,args.manifest): (ROOT/name).parent.mkdir(parents=True, exist_ok=True)
subprocess.run(['java','-Dfile.encoding=UTF-8','-cp',str(driver),str(ROOT/'db/DatabaseSnapshot.java'),str(ROOT/args.output),str(ROOT/args.manifest)], env=environment, check=True)
