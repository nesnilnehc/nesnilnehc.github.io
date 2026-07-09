# 电影海报下载

按优先级尝试来源，每张图下载后必须用 Read 工具实际查看内容确认是官方海报本体，再写入 `_data/movies.yml` 的 `poster` 字段——不要只凭文件名或搜索结果文字判断。

优先使用原版（首映地区/语言）海报，而非其他地区的本地化重制版（如日版覆盖了当地片名字体的版本）；Wikipedia 英文条目的 infobox 通常就是原版。

1. Wikipedia 电影条目 infobox 的 "Theatrical release poster"（`upload.wikimedia.org`，标注明确，最可靠）
2. TMDb 电影页面海报（`themoviedb.org`）——注意非英语 locale 页面可能把重映/特别版宣传图当作海报展示，务必核实
3. 豆瓣电影页面海报

存放路径：`assets/images/movies/<kebab-case-slug>.jpg`（或原始格式）。
