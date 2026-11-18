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

**Vừa xong v0.12.0 (2026-11-18):** làm lại toàn bộ UI theo bộ AI-art (nút, tab, khung, panel, tile, dialog — `assets/ui/`, CSS section v0.12), thẻ crate luôn 1 hàng, chữ/damage/crit FX đẹp hơn. Trước đó: v0.10–0.11 (crate 2.0, thanh HOPE/boss AI-art, chế độ cửa sổ).

**Đã xong** (chi tiết: `CHANGELOG.md`)
- Gameplay đầy đủ: 5 bãi + 5 boss, 8 loại quái, 16 module (4 hệ × lance/rail/mortar/drone), 5 phép, 8 relic, Nightmare cho từng bãi, Endless, 20+ nâng cấp vĩnh viễn, 25 thành tựu, cutscene mở đầu/kết thúc. Thời lượng ~3,5 giờ (đo bằng bot).
- Đồ họa: key art + sprite **AI-assisted** (ChatGPT → nền magenta → `tools/sprites/import_ai.py`) cho tàu, súng, 4 tháp pháo, 8 quái, 5 boss, đồ trang trí mặt đất. Hiệu ứng: tia lửa, vết dịch, xác tan, khựng hình khi chí mạng, slow-mo khi giết boss, ánh sáng ấm, bụi, tàn lửa.
- **Crate 2.0 (v0.8.2):** crate báo trước độ hiếm (màu đèn + độ rung), thẻ lật lần lượt có âm thanh theo độ hiếm, thanh build (ô trống, DPS đội, tiến độ hệ) có xem trước khi rê chuột, mỗi thẻ hiện **% DPS đội thay đổi**, hệ **được kích hoạt / bị phá**, (nhãn BEST DPS đã bỏ ở v0.9.3); bấm vào hệ (trên thẻ, thanh build, chip trong trận) để xem bảng thông tin hệ; ăn mừng khi kích hoạt hệ trong trận.
- Bản desktop Windows (Electron): `tools/desktop/package_win.ps1` → `build/HOPEFIRE/HOPEFIRE.exe`. Shortcut “HOPEFIRE (test)” trên Desktop của Duy.
- Tài liệu store (đã làm **sớm**, sẽ làm lại sau khi Duy duyệt game): `store/` (key art, logo, capsule các cỡ, ảnh chụp, trailer nháp), `docs/STEAM_PAGE.md`.
- Pháp lý/thuế: `docs/BUSINESS_LEGAL.md`.

**Vừa xong v0.9.0 (2026-11-18):** Crate 2.0, nhạc thích ứng tự tổng hợp (`src/music.js`), SFX mới, game feel (nâng ★, module rơi xuống, streak, rung thanh Hope, màn chết slow-mo), ván đầu dạy synergy, màn kết có mục tiêu boss + số nâng cấp mua được, REVIEW_PROMPT v2, script test trong `tools/test/`. Bot cân bằng: cốt truyện 106 phút, toàn bộ 229 phút.

**Vừa xong v0.9.2 (2026-11-18) — chống “chơi thụ động”:** Duy góp ý người chơi chỉ bấm BEST DPS rồi ngồi xem. Đã làm: (A) **phản ứng nguyên tố** `src/react.js` — mỗi hệ để lại trạng thái, hệ thứ hai kích nổ SHATTER / OVERLOAD / SUPERCONDUCT / CONTAGION (chữ to, âm riêng, gợi ý lần đầu) → chọn thẻ phải tính combo; (C) **chạm quái để đánh dấu** (+25% sát thương, súng ưu tiên) → người chơi luôn có việc; (D) bỏ nhãn BEST DPS, thẻ hiện huy hiệu phản ứng sẽ mở. Cân bằng lại máu quái: cốt truyện 90 phút, toàn bộ 198 phút.

**Vừa xong v0.9.3:** **Crew** (`src/crew.js`: Guardian/Hunter/Medic/Engineer, tối đa 3, có hệ nguyên tố, gục/hồi sinh, ★ khi trùng), **Carrier** (quái chở hàng chạy vòng quanh ring, đánh dấu + giết = crate MIỄN PHÍ → lý do để đánh dấu), **Bounty** (giết quái đã đánh dấu = 2× scrap), **Reactor** giải thích rõ (nút, banner, bảng hướng dẫn lần đầu). Bot: cốt truyện 75–97 phút, toàn bộ 3–4 giờ.

**Vừa xong v0.9.4:** **Mở crate = mini-game bẻ 3 khóa** (canh kim quay: xanh ≥Rare, tím ≥Epic, vàng ≥Legendary, giữa vùng = PERFECT; trúng cả 3 có tím/vàng = JACKPOT thêm 1 thẻ; tắt được trong Options). **Bầy quái (horde)** hàng trăm cặp mắt trong bóng tối, đông dần theo threat; **Surge**: bầy dồn về một phía rồi lao vào (mũi tên đỏ báo trước). Cân bằng lại độ hiếm gốc + máu quái. Bot (bẻ khóa giỏi): cốt truyện ~70–80 phút.

**Vừa xong v0.9.8:** **Hỗ trợ tay cầm** (src/pad.js): menu D-pad + A/B, trong trận A thùng, X/Y/B phép, LB/RB đánh dấu, LT reactor, RT tốc độ, Back loadout, Start pause; rung + gợi ý nút; Vader 4 Pro phải để chế độ XInput. Trước đó: v0.9.7: **Twist kết mới** — sau khi cất cánh, hành tinh "lạ" hóa ra là **Trái Đất**, phi hành gia bị điểm kỳ dị ném tới tương lai +4.000 năm (Trái Đất hoang tàn); 5 câu voice mới. **Pose đánh riêng cho 4 crew.** Trước đó: v0.9.6: **Art AI cho Crew (4 nhân vật) và Carrier** — thay hình vẽ bằng code; nguyên tố hiện bằng chấm màu dưới chân. Sheet gốc: `store/crew_v1.png`, `store/carrier_v1.png`.

**Vừa xong v0.9.5:** **Lồng tiếng** 25 câu (HOPE = Kokoro, COMMANDER = Chatterbox; miễn phí, dùng thương mại được). Tạo lại: trên máy Duy chạy `D:\AI\hopefire_tts\kokoro\Scripts\python.exe tools\voice\gen_lines.py kokoro` rồi `...\chatter\Scripts\python.exe tools\voice\gen_lines.py chatter` (ra `build\vo_raw`), sau đó `python tools/voice/post.py <thư mục vo_raw>` (cần ffmpeg) → `assets/vo/`.

**Đang làm / chờ** (cập nhật v0.9.5)
0. **Crew + Carrier** (v0.9.3, art AI từ v0.9.6) — chờ Duy chơi thử.
1. **Duy đang chơi thử** → chờ góp ý.
2. **Độ khó:** Duy chốt 4 mức Dễ / Vừa / Khó / Hell. Làm **Normal thật chuẩn trước**; save slot đã lưu `meta.diff`, màn tạo game hiện 4 mức (chỉ Normal mở). Làm 3 mức còn lại SAU khi Normal được duyệt.
3. **Lồng tiếng:** dùng TTS miễn phí, thương mại được: **Kokoro-82M** (Apache-2.0, giọng HOPE) + **Chatterbox** (MIT, có điều chỉnh cảm xúc, giọng COMMANDER). Cài trên máy Duy (RTX 3060 Ti): `tools/voice/setup_tts.ps1` → `D:\AI\hopefire_tts` (log `setup.log`). Kịch bản: `docs/VOICE_SCRIPT.md`. Code phát thoại sẵn sàng (`src/voice.js`).
4. **Suno Pro:** Duy nói đã mua Pro, nhưng trên Chrome (tài khoản haiduy2405) chọn model v6 Pro vẫn hiện bảng đòi nâng cấp → kiểm tra lại trước khi tạo nhạc menu/boss/ending (bài tạo khi chưa Pro = không có quyền thương mại).
5. Review AI độc lập theo `docs/REVIEW_PROMPT.md` v2.

**Sẽ làm**
- Đồ họa còn vẽ bằng code: drone, đồ rơi, hiệu ứng phép, hành tinh trong cutscene, nền đất bãi 2–5. (Crew/carrier đã có art AI từ v0.9.6.)
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
src/voice.js          lồng tiếng (assets/vo/, phụ đề, giảm nhạc khi nói) + nhạc file Suno (assets/music/: menu/boss/ending)
src/render.js         canvas, ánh sáng/bóng tối, vẽ tàu/module/quái/hiệu ứng, nền đất
src/sprites.js        atlas sprite; sprite AI vẽ đúng kích thước thế giới (meta px), icon HTML ico()
src/game.js           logic 1 lượt: spawn, AI quái, bắn, Hope, boss, hiệu ứng chết
src/spells.js         5 phép
src/relics.js         8 relic
src/progress.js       thành tựu, thống kê, settings, autocast
src/cutscene.js       cutscene mở đầu + màn kết
src/update.js         kiểm tra bản mới (tắt trong bản desktop: window.HF_DESKTOP)
src/title.js          màn hình tiêu đề, 3 save slot (đổi tên/xóa), Options theo tab, Credits
src/crate.js          Crate 2.0 + bảng Loadout (Tab): nghi thức mở, thẻ, thanh build, % DPS, hệ, bảng thông tin hệ
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
