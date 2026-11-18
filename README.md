# HOPEFIRE

> *When all hope is lost, the ship still fires.*

Incremental tower defense: a crashed ship on a planet of blind monsters. Open salvage crates, build element synergies, keep **HOPE** burning, repair the ship between runs.

---

## 👋 Đọc trước nếu bạn là Claude (hoặc AI) mới vào dự án

File này + `CLAUDE.md` là **toàn bộ trí nhớ** của dự án. Đọc xong 2 file này là làm tiếp được, không cần hỏi lại Duy.

**Chủ dự án:** Duy (handle *duyluma*) — dựng phim/nhiếp ảnh, **không phải lập trình viên**.
- Nói chuyện **tiếng Việt**, ngắn, TL;DR trước, thẳng thắn (chỉ ra chỗ sai).
- Mục tiêu duy nhất: **kiếm tiền** từ game. Mọi quyết định tối đa xác suất bán được.
- Duy cho phép: dùng AI khác (ChatGPT Plus để sinh ảnh), dùng trình duyệt Chrome của anh ấy (đã đăng nhập Google/ChatGPT), chạy lệnh trên máy Windows của anh ấy (Desktop Commander).
- **Quy tắc Duy đã chốt:**
  1. Game phải **cuốn hút ngay từ những ván đầu** (gameplay + phản hồi + hiệu ứng + animation + nhạc + âm thanh).
  2. **Không làm trailer/ảnh store** cho tới khi Duy chơi và **duyệt** game hoàn chỉnh.
  3. Giữ **Electron** cho bản desktop (đã cân nhắc Tauri/Rust → không đổi).
  4. Làm cẩn thận: sau này sẽ dùng AI để review và nâng cấp tiếp (xem `docs/REVIEW_PROMPT.md`).
  5. Cập nhật README + CLAUDE.md mỗi khi xong việc lớn.
- Việc **chỉ Duy làm được** (pháp lý, danh tính): đăng ký Steamworks, trả $100, xác minh danh tính, ngân hàng, khai thuế W-8BEN.

### Đã làm / đang làm / sẽ làm (cập nhật: 2026-11-18)

**Đã xong** (chi tiết: `CHANGELOG.md`)
- Gameplay đầy đủ: 5 bãi + 5 boss, 8 loại quái, 16 module (4 hệ × lance/rail/mortar/drone), 5 phép, 8 relic, Nightmare cho từng bãi, Endless, 20+ nâng cấp vĩnh viễn, 25 thành tựu, cutscene mở đầu/kết thúc. Thời lượng ~3,5 giờ (đo bằng bot).
- Đồ họa: key art + sprite **AI-assisted** (ChatGPT → nền magenta → `tools/sprites/import_ai.py`) cho tàu, súng, 4 tháp pháo, 8 quái, 5 boss, đồ trang trí mặt đất. Hiệu ứng: tia lửa, vết dịch, xác tan, khựng hình khi chí mạng, slow-mo khi giết boss, ánh sáng ấm, bụi, tàn lửa.
- **Crate 2.0 (v0.8.2):** crate báo trước độ hiếm (màu đèn + độ rung), thẻ lật lần lượt có âm thanh theo độ hiếm, thanh build (ô trống, DPS đội, tiến độ hệ) có xem trước khi rê chuột, mỗi thẻ hiện **% DPS đội thay đổi**, hệ **được kích hoạt / bị phá**, nhãn **BEST DPS**; bấm vào hệ (trên thẻ, thanh build, chip trong trận) để xem bảng thông tin hệ; ăn mừng khi kích hoạt hệ trong trận.
- Bản desktop Windows (Electron): `tools/desktop/package_win.ps1` → `build/HOPEFIRE/HOPEFIRE.exe`. Shortcut “HOPEFIRE (test)” trên Desktop của Duy.
- Tài liệu store (đã làm **sớm**, sẽ làm lại sau khi Duy duyệt game): `store/` (key art, logo, capsule các cỡ, ảnh chụp, trailer nháp), `docs/STEAM_PAGE.md`.
- Pháp lý/thuế: `docs/BUSINESS_LEGAL.md`.

**Vừa xong v0.9.0 (2026-11-18):** Crate 2.0, nhạc thích ứng tự tổng hợp (`src/music.js`), SFX mới, game feel (nâng ★, module rơi xuống, streak, rung thanh Hope, màn chết slow-mo), ván đầu dạy synergy, màn kết có mục tiêu boss + số nâng cấp mua được, REVIEW_PROMPT v2, script test trong `tools/test/`. Bot cân bằng: cốt truyện 106 phút, toàn bộ 229 phút.

**Đang làm / chờ**
1. **Chờ Duy chơi thử + góp ý** (bản Windows: shortcut “HOPEFIRE (test)”; nghe demo nhạc `store/music_demo_v1.mp3`).
2. Nếu Duy mua **Suno Pro** ($10/tháng, phải có gói trước khi tạo bài mới có quyền thương mại): làm nhạc menu + nhạc boss + nhạc kết bằng Suno, nhạc trong trận giữ hệ thích ứng.
3. Chạy review AI độc lập theo `docs/REVIEW_PROMPT.md` v2 → sửa theo top 10.

**Sẽ làm**
- Đồ họa còn vẽ bằng code: drone, đồ rơi, hiệu ứng phép, hành tinh trong cutscene, nền đất bãi 2–5.
- Steam SDK (steamworks.js): thành tựu + cloud save; bản demo (bãi 1–2) cho Next Fest.
- Sau khi Duy duyệt game: trailer + ảnh store làm lại, nhạc trailer có bản quyền, mở trang **Coming Soon** ngay để gom wishlist.
- Thị trường: đối thủ trực tiếp *Booster Pack Heroes* ra mắt 10/11/2026 trên Steam/App Store/Google Play, 91% đánh giá tích cực → thể loại có người mua; HOPEFIRE cần khác biệt (ánh sáng/bóng tối, hệ nguyên tố, cốt truyện).

---

## Chơi / test

- **Bản Windows:** chạy `build\HOPEFIRE\HOPEFIRE.exe` (F11 = toàn màn hình). Build lại: `powershell -ExecutionPolicy Bypass -File tools\desktop\package_win.ps1`.
- **Bản web:** GitHub Pages của repo, hoặc mở bằng server local: `python -m http.server 8765` rồi vào `http://localhost:8765` (đừng mở bằng file:// khi test cập nhật).
- **Phím:** `Space` mở crate · `1–5` chọn thẻ · `Q/W/E` phép · `R` lò phản ứng · `Esc/P` tạm dừng · `F11` toàn màn hình (desktop).

## Quy trình phát hành (mỗi version)

1. Tăng version ở `index.html` **và** `version.json` (cùng số; ghi chú cho người chơi bằng tiếng Anh). `tools/bump.ps1` làm cả hai.
2. Ghi `CHANGELOG.md`, tick `docs/ROADMAP.md`, cập nhật mục “Đã/đang/sẽ” ở README này + `CLAUDE.md`.
3. `node --check src/*.js`, test headless (Playwright + Chrome) — xem `CLAUDE.md` mục Testing; cân bằng: `python tools/sim/run.py --runs 2`.
4. `git push` lên `main` (GitHub Pages tự cập nhật; game hiện bảng “Update available”). Trên máy Duy: `git pull` trong `D:\GITHUB\HOPEFIRE`, build lại bản Windows.

## Cấu trúc

```
index.html            khung HTML + HUD; nạp assets/sprites.js rồi src/*.js theo thứ tự cố định
css/style.css         giao diện (UI tự phóng to theo màn hình qua biến --uz)
src/data.js           số liệu: module, quái, độ hiếm, nâng cấp, boss, cân bằng (CH_HP, CH_DMG, NM…)
src/core.js           lưu game (localStorage 'hopefire_v1', merge với defMeta) + tiện ích
src/audio.js          SFX tổng hợp WebAudio + bus tổng có compressor
src/music.js          nhạc nền thích ứng (layer theo mức nguy hiểm, boss, menu, stinger)
src/render.js         canvas, ánh sáng/bóng tối, vẽ tàu/module/quái/hiệu ứng, nền đất
src/sprites.js        atlas sprite; sprite AI vẽ đúng kích thước thế giới (meta px), icon HTML ico()
src/game.js           logic 1 lượt: spawn, AI quái, bắn, Hope, boss, hiệu ứng chết
src/spells.js         5 phép
src/relics.js         8 relic
src/progress.js       thành tựu, thống kê, settings, autocast
src/cutscene.js       cutscene mở đầu + màn kết
src/update.js         kiểm tra bản mới (tắt trong bản desktop: window.HF_DESKTOP)
src/crate.js          Crate 2.0: nghi thức mở, thẻ, thanh build, % DPS, hệ, bảng thông tin hệ
src/ui.js             menu, chọn thẻ (pick), HUD, hướng dẫn, kết thúc lượt
src/main.js           vòng lặp game (hit-stop, slow-mo)
assets/ai/            sprite AI đã xử lý (PNG + JSON) — build.py ưu tiên dùng
tools/sprites/        build.py (atlas), import_ai.py (tách nền magenta, cắt, mắt, khung đi bộ)
tools/sim/            bot chơi cả chiến dịch để cân bằng
tools/desktop/        Electron: main.js, preload.js, icon, package_win.ps1
store/                key art, logo, capsule Steam, ảnh chụp, trailer nháp
docs/                 DESIGN, ROADMAP, REVIEW_PROMPT, BUSINESS_LEGAL, STEAM_PAGE, STORE_ART, ASSETS
```

## Quy trình đồ họa AI (đã kiểm chứng)

1. Trong ChatGPT (cùng cuộc chat “Create Pixel Art Key Art” để giữ phong cách): yêu cầu sprite sheet **cùng phong cách key art, góc 3/4, quay sang phải, không bóng đổ, nền magenta #FF00FF phẳng, nhiều khoảng trống, không chữ**.
2. Tải ảnh về `D:\DOWNLOADS` → chép vào `store/<tên>_v1.png`.
3. `python3 tools/sprites/import_ai.py store/<sheet>.png ten1,ten2,... rong1,rong2,... [--cols 4] [--frames 4|1] [--legs 0.3] [--strict]` (dùng `--strict` nếu art có màu tím). Tên trùng sprite cũ sẽ ghi đè.
4. `python3 tools/sprites/build.py` → atlas mới. Khai báo AI trên Steam (đoạn mẫu trong `docs/STEAM_PAGE.md`).
