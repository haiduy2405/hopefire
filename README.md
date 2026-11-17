# HOPEFIRE

> *When all hope is lost, the ship still fires.*

An incremental tower-defense game about a crashed spaceship on a hostile alien planet.
Open salvage crates, build module synergies, and keep your **HOPE** burning.

**Status:** prototype v0.3 — web build (vanilla JS, no dependencies, no build step).

## Chạy game

- Mở `index.html` bằng trình duyệt (Chrome/Edge). Không cần cài gì.
- Hoặc bật **GitHub Pages** (Settings → Pages → Branch `main` / root) để chơi qua link, kể cả trên điện thoại.

**Điều khiển:** `Space` mở thùng · `1/2/3` chọn thẻ · `Q/W/E` dùng phép · `R` đổi chế độ lò phản ứng.

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
src/cutscene.js   cutscene mở đầu dựng trong engine
src/ui.js         menu, mở thùng, chọn thẻ, hướng dẫn, kết thúc lượt
src/main.js       vòng lặp game
docs/DESIGN.md    thiết kế game
docs/ROADMAP.md   lộ trình tới Steam
```

## Ghi chú

- Toàn bộ đồ họa hiện là vẽ bằng code (placeholder), sẽ thay bằng pixel-art thật.
- Save nằm trong `localStorage` của trình duyệt (key `hopefire_v1`).
- © duyluma. All rights reserved.
