from pathlib import Path
from twaa.discover_sitemap import discover_vue_routes


def test_discover_vue_routes(tmp_path: Path) -> None:
    routers_dir = tmp_path / "src" / "routers"
    routers_dir.mkdir(parents=True)
    (routers_dir / "index.ts").write_text("""
import type { RouteRecordRaw } from 'vue-router';
const routes: RouteRecordRaw[] = [
  { path: '/home', name: 'home', component: Home, meta: { title: '首頁' } },
  { path: '/login', name: 'login', component: Login, meta: { title: '登入' } },
  { path: '/sitemap', name: 'sitemap', component: SiteMap, meta: { title: '網站導覽' } },
];
""", encoding="utf-8")

    routes = discover_vue_routes(tmp_path)
    paths = {r["path"] for r in routes}
    assert "/home" in paths
    assert "/login" in paths
    assert "/sitemap" in paths
