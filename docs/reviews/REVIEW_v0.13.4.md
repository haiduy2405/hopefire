# HOPEFIRE — Review v0.13.4 (panel: designer · game-feel · audio · UX · Steam marketer)

*2026-11-18 · theo `docs/REVIEW_PROMPT.md` v2 · Claude tự review (không sửa code trong lúc review). Đo bằng headless Chrome **render CPU, không GPU** → số FPS chỉ để so sánh tương đối. Chưa có người chơi thật. Không nghe được âm thanh (chỉ đo số liệu).*
*Số đo: ftue_bot, feel_check, music_render, `sim --runs 2`, ảnh 1920×1080 + 390×844 (`/tmp/rv`), profiler canvas.*

## 1. TL;DR
- **Điểm tổng: 7.2/10** (v0.9.12: 6.8 · v0.4.0: 6.0). Art/UI giờ đồng bộ và "đắt tiền", quái đa dạng hơn hẳn, mỗi wave có việc để làm (đánh dấu mục tiêu, bấm Surge Cell, né Charger/Leaper). Cái đang cản điểm không còn là "game thô" mà là: **(a) chưa có người chơi thật nào kiểm chứng, (b) chưa có đường tới Steam (SDK, trang store, wishlist), (c) hết nội dung sau lần phá đảo đầu thì ít lý do chơi tiếp.**
- **3 thay đổi tăng doanh số nhiều nhất:**
  1. **Playtest có đo đạc**: thêm log cục bộ (chọn thẻ, chết ở wave nào, thời gian mỗi run, FPS) + 3–5 người chơi thật. Mọi con số cân bằng hiện giờ là của bot.
  2. **Mở trang Steam "Coming soon" sớm** (chỉ cần capsule + mô tả; không cần trailer) vì wishlist tích lũy theo thời gian; kèm làm Steamworks (achievements 25 sẵn, cloud save, tắt update check).
  3. **Thêm lý do chơi lại**: chọn tàu/hero khởi đầu khác nhau + "mutator" (luật chạy đặc biệt) — hạ tầng cờ `R.*` ở `threat.js` đã sẵn sàng cho mode mới Duy đã nói sẽ thêm.

## 2. Bảng điểm
| # | Hạng mục | Điểm | Bằng chứng |
|---|---|---|---|
| 1 | 60 giây đầu | 8 | ftue_bot: crate miễn phí t=0, 10 crate trong 162 s, 204 kill, tip đúng lúc, không có tường chữ |
| 2 | 3 run đầu (hook) | 7 | hub có mục tiêu boss + repairs mua được + hạng S–C kèm thưởng core; **chưa "tease" thứ mới ngay sau run 1** (vd. bóng mờ quái chưa gặp) |
| 3 | Khoảnh khắc crate | 8 | tell độ hiếm, khóa mini-game, thẻ lật, khung AI; v0.13.4 thu nhỏ crate 250→170 px, không còn đè chữ. Còn thiếu: crate "bay" thẻ ra, rung camera nhẹ khi mở |
| 4 | Chiều sâu lựa chọn | 6 | 16 module (4 hệ×4 loại), 5 phép, 8 relic, 4 crew, reactor, phản ứng nguyên tố. Bot chọn ngẫu nhiên vẫn thắng → **nguy cơ "không cần nghĩ"**; chưa có dữ liệu người |
| 5 | Combat feel | 8 | hit-stop, crit, chữ damage có pop/gradient, Overcharge, banner "SITE CLEARED", rung tay cầm; feel_check 0 lỗi |
| 6 | Dễ đọc | 6 | ảnh 1080p site 4, 148 quái: tâm màn hình thành **một cục hiệu ứng che tàu/tháp** (`d_run4.png`); thẻ tip che giữa-trên màn hình; 4 ô module trống nhỏ xíu. Phone: thanh dưới bị tràn, nút âm thanh mất |
| 7 | Nhạc & SFX | 6 | music_render: đỉnh ≤0.55, RMS 0.019→0.047 (calm→boss) đúng hướng; vẫn là nhạc tổng hợp, chưa có bản thật (chờ Suno thương mại). SFX chưa nghe được |
| 8 | Art cohesion | 8 | UI kit, 15 loại quái + 5 boss, crew, crate cùng một phong cách AI-art; còn code-art ở danh sách mục 4 |
| 9 | Tiến độ & nhịp | 7 | sim 2 lần: story **89 phút** (mục tiêu 75–110), toàn bộ **214 phút** (~3.5 h), 76 lượt. Chưa có nội dung "đỉnh" sau Nightmare 5 ngoài Endless |
| 10 | UX & nền tảng | 7 | hub vừa 1 màn hình ở 1280–2560 px; tay cầm OK; **phone: title chữ đè nền, thanh dưới tràn, tip Commander đè nút BEGIN RUN**; chỉ 1 chỗ lưu localStorage, không backup/xuất file |
| 11 | Hiệu năng & ổn định | 6* | 0 lỗi console (title/hub/2 run, 2 viewport); menu hub 11→53 fps sau v0.13.4. **Run 148 quái 1080p: ~20 fps ở render CPU**, `render()` 37 ms, 8.4k lệnh canvas/khung, 156 sprite/khung từ atlas 2048×1911. (*Phải đo trên máy Duy: có GPU thì khác nhiều, nhưng chưa có số thật) |
| 12 | Sellability | 6.5 | Hook mạnh (bóng tối + mắt + twist Trái Đất), art đẹp hơn mặt bằng $4.99. Nhưng: chưa có trang store/wishlist, chưa Steam SDK, replay value hạn chế, chưa ai ngoài Duy chơi |

## 3. Top 10 vấn đề (theo tác động tới doanh số)
1. **Không có dữ liệu người chơi thật.** Cân bằng, độ khó, "khoảnh khắc hay" đều là đoán. Fix: log cục bộ (`meta.stats` + file telemetry opt-in: thẻ được chọn/bỏ, wave chết, thời gian run) + overlay FPS (F3) rồi nhờ 3–5 người chơi. **S–M**.
2. **Chưa có đường tới Steam.** Thiếu: Steamworks, trang Coming soon, build Steam tắt `checkUpdate()` (`src/update.js`), achievements/cloud. Fix: Duy đăng ký Steamworks; Claude làm bridge `steam.js` (Electron `steamworks.js`) + cờ build. **L** (phần Duy làm là nút thắt).
3. **Nội dung thưa sau lần phá đảo đầu.** 16 module/5 phép/8 relic/4 crew; Endless là điểm dừng duy nhất. Fix: chọn tàu/hero khởi đầu (3 tàu, mỗi tàu 1 nội tại), mutator (vd. "Tối thui", "Elite liên tục", "Chỉ Cryo"), Codex sưu tầm quái (đã có `k_*` tip/`meta.tut`). **M–L**.
4. **Cảnh đông quái bị che bởi hiệu ứng** (`d_run4.png`): ship/tháp biến mất sau cục sáng. Fix: ngân sách FX (giới hạn hạt, giảm alpha vòng nổ khi >60 quái, luôn vẽ tàu lên trên cùng lớp FX), `render.js` + `game.js` particles. **S–M**.
5. **Hiệu năng chưa kiểm chứng trên phần cứng thật.** Fix: overlay FPS + cờ chất lượng (Low/High), culling sprite ngoài khung, gom `setTransform`/`drawImage` theo atlas, giảm 8.4k lệnh/khung. **M**.
6. **Layout phone** (Android là mục tiêu tiếp theo): thanh dưới tràn (mất nút ♪, "OPEN CRATE" xuống 3 dòng), title chữ đè nền, tip Commander đè BEGIN RUN. Fix: media query ≤480 px cho `#bar`, đẩy tip lên trên, cỡ chữ title. **S–M**.
7. **Nhạc thật chưa có.** Nhạc menu/boss là tổng hợp; thiếu = mất ~1 điểm cảm xúc. Fix: Suno model có giấy phép thương mại (chờ Duy). **M**.
8. **An toàn dữ liệu lưu.** Một khóa `localStorage` mỗi slot, không backup; mất = mất cả tiến trình → review 1 sao. Fix: giữ bản sao xoay vòng (`slot_n_bak`), nút "Export/Import save" (chuỗi base64), xác nhận khi ghi đè. **S**.
9. **"Không cần nghĩ"**: bot chọn thẻ ngẫu nhiên vẫn thắng (sim). Fix: đo tỉ lệ thắng bot-ngẫu-nhiên vs bot-tối-ưu, nếu lệch <10% thì tăng độ dốc ở site 3–5 hoặc thêm lựa chọn có chi phí (relic có đánh đổi). **M**.
10. **Programmer-art còn lại** (mục 4) — rẻ nhưng cộng dồn vào cảm giác "chưa xong". **M**.

## 4. Art còn là "programmer art" / placeholder
- drone + đạn drone; đồ rơi (scrap/core/cell) và orb; FX phép (Solar Flare…); nền đất 5 bãi (procedural, đẹp nhưng lặp); icon element vẽ bằng code; Surge Cell (hình thoi vẽ bằng code); biểu tượng emoji ở nút (⚙ 📊 🏆 🎬 🔊 ☰); chữ HUD dùng font hệ thống.
- Điểm tốt: toàn bộ quái, boss, crew, tàu, tháp, UI kit, crate đều là AI-art cùng phong cách.

## 5. Quick wins (<1 giờ mỗi cái)
- Phone: sửa thanh dưới + tip Commander (mục 3.6).
- Overlay FPS (phím F3 / Options) + log vào `meta.stats` để Duy gửi số cho tôi.
- Ngân sách FX khi >60 quái (giảm vòng nổ, bỏ hạt phụ).
- Sao lưu xoay vòng cho slot (`save()` ở `core.js`).
- Tip không che giữa-trên: đẩy xuống dưới thanh Hope hoặc rút 1 dòng.
- Hub: thêm "bóng mờ quái chưa gặp" làm tease sau run đầu.

## 6. So với v0.9.12
- **Cải thiện:** art/UI đồng bộ (7→8), crate (7→8), tiến độ (6→7), UX hub/hover/focus (6→7), content: +7 quái (Charger, Shellback, Hatcher, Screamer, Lurker, Mender, Leaper), sự kiện wave, elite, Surge Cell, hạng S–C, thưởng thắng; menu mượt hơn.
- **Không đổi/chưa giải:** nhạc (6), chiều sâu lựa chọn (6), Steam (chưa bắt đầu).
- **Thoái lui nhẹ:** dễ đọc khi đông quái (nhiều FX hơn, nhiều loại quái hơn) — mục 3.4; hiệu năng run chưa được đo trên máy thật.
