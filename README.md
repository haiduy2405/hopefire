# HOPEFIRE

> *When all hope is lost, the ship still fires.*

An incremental tower-defense game about a crashed spaceship on a hostile alien planet.
Open salvage crates, build module synergies, and keep your **HOPE** burning.

**Status:** v0.6.0 — chiến dịch 5 bãi + Nightmare + nâng cấp tầng 2 (~3,5 giờ+), pixel-art đợt 1 — web build (vanilla JS, no dependencies, no build step).

## Chạy game

- Mở `index.html` bằng trình duyệt (Chrome/Edge). Không cần cài gì.
- Hoặc bật **GitHub Pages** (Settings → Pages → Branch `main` / root) để chơi qua link, kể cả trên điện thoại.

**Điều khiển:** `Space` mở thùng · `1/2/3` chọn thẻ · `Q/W/E` dùng phép · `R` đổi chế độ lò phản ứng · `Esc`/`P` tạm dừng.

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
src/sprites.js    nạp atlas sprite, vẽ pixel-art phóng to theo số nguyên (thiếu thì vẽ bằng code)
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
docs/REVIEW_PROMPT.md  prompt tự review toàn diện game (chạy lại mỗi version lớn)
docs/BUSINESS_LEGAL.md pháp lý, thuế VN/Mỹ, Steam, tiền thực nhận
version.json      version mới nhất + ghi chú cập nhật (game đọc file này)
tools/bump.ps1    tăng version 1 lệnh
tools/sprites/build.py  tạo sprite pixel-art → assets/sprites.png/.json/.js
assets/           atlas sprite (xem docs/ASSETS.md)
CHANGELOG.md      lịch sử phiên bản
```

## Ghi chú

- Sprite pixel-art tạo bằng `tools/sprites/build.py` (xem `docs/ASSETS.md` để thay bằng hình vẽ tay).
- Save nằm trong `localStorage` của trình duyệt (key `hopefire_v1`).
- © duyluma. All rights reserved.
