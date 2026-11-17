# HOPEFIRE

> *When all hope is lost, the ship still fires.*

An incremental tower-defense game about a crashed spaceship on a hostile alien planet.
Open salvage crates, build module synergies, and keep your **HOPE** burning.

**Status:** v0.4.0 — đủ nội dung chơi từ đầu tới cuối (5 bãi + màn kết + Endless) — web build (vanilla JS, no dependencies, no build step).

## Chạy game

- Mở `index.html` bằng trình duyệt (Chrome/Edge). Không cần cài gì.
- Hoặc bật **GitHub Pages** (Settings → Pages → Branch `main` / root) để chơi qua link, kể cả trên điện thoại.

**Điều khiển:** `Space` mở thùng · `1/2/3` chọn thẻ · `Q/W/E` dùng phép · `R` đổi chế độ lò phản ứng.

## Phát hành bản mới (người chơi nhận ngay)

1. Tăng version (sửa cả `index.html` lẫn `version.json`):
   ```powershell
   .\tools\bump.ps1 -Version 0.3.2 -Notes "Boss mới","Cân bằng lại"
   # bắt buộc cập nhật, ẩn nút "Later":  thêm -Force
   ```
2. Ghi vào `CHANGELOG.md`, rồi `git add -A; git commit -m "v0.3.2"; git push`.
3. GitHub Pages build khoảng 30–60 giây. Người đang chơi sẽ thấy bảng **Update available** trong vòng tối đa 60 giây sau đó (hoặc ngay khi quay lại tab game).

Mọi file đều kèm `?v=<version>` nên bản mới không bao giờ bị dính cache cũ.

## Cấu trúc

```
index.html        khung HTML + HUD
css/style.css     giao diện
src/data.js       số liệu: module, quái, độ hiếm, nâng cấp, chapter
src/core.js       lưu game (localStorage) + tiện ích
src/audio.js      âm thanh tổng hợp bằng WebAudio (không dùng file)
src/render.js     canvas, ánh sáng/bóng tối, vẽ tàu/module/quái/hiệu ứng
src/game.js       logic 1 lượt chơi: spawn, AI quái, bắn, Hope, boss
src/spells.js     thẻ phép (Solar Flare, Cryo Nova, Overcharge, Emergency Cell, Shock Pulse)
src/relics.js     relic bị động (tối đa 3/lượt)
src/progress.js   thành tựu, thống kê, settings, tự dùng phép
src/cutscene.js   cutscene mở đầu + màn kết, dựng trong engine
src/update.js     kiểm tra bản mới (version.json) + bảng cập nhật
src/ui.js         menu, mở thùng, chọn thẻ, hướng dẫn, kết thúc lượt
src/main.js       vòng lặp game
docs/DESIGN.md    thiết kế game
docs/ROADMAP.md   lộ trình tới Steam
version.json      version mới nhất + ghi chú cập nhật (game đọc file này)
tools/bump.ps1    tăng version 1 lệnh
CHANGELOG.md      lịch sử phiên bản
```

## Ghi chú

- Toàn bộ đồ họa hiện là vẽ bằng code (placeholder), sẽ thay bằng pixel-art thật.
- Save nằm trong `localStorage` của trình duyệt (key `hopefire_v1`).
- © duyluma. All rights reserved.
