# HOPEFIRE — Review tổng thể v0.4.0

*Ngày 18/11/2026 · theo `docs/REVIEW_PROMPT.md` · đo bằng trình duyệt headless (Chrome, phần mềm render CPU)*

## 1. TL;DR
- **Điểm tổng: 6.0/10.** Lõi gameplay chắc, kỹ thuật rất tốt. Còn ở mức prototype vì **chưa có đồ họa thật** và **nội dung quá ngắn so với giá bán**.
- **3 điểm mạnh nhất:** (1) ý tưởng "vòng tròn phát hiện + bóng tối + mắt phát sáng" vừa là cơ chế vừa là bản sắc hình ảnh; (2) hiệu năng xuất sắc (58–60 FPS với 119 quái, 3–6 MB RAM); (3) onboarding mượt, cutscene gắn chặt với gameplay.
- **3 vấn đề nghiêm trọng nhất:** (1) 🔴 **phá đảo chỉ mất ~1,5–2 giờ**: vượt mốc 2 giờ hoàn tiền của Steam vừa đủ, rủi ro bị refund và bị chê "ngắn"; (2) 🔴 **đồ họa placeholder**: chưa thể làm trailer hay ảnh store; (3) 🟠 **lượt chơi lặp lại**: lượt nào cũng phải đi lại Threat 1→9 (~180 giây) trước khi gặp boss, kể cả khi đã quá mạnh.

## 2. Bảng điểm
| # | Hạng mục | Điểm | Nhận xét | Bằng chứng |
|---|---|---|---|---|
| 1 | Onboarding | **8** | Cutscene 39s có nút skip; thùng đầu tiên ở giây thứ 4; lượt đầu không thể thua trước 55s; mẹo hiện đúng lúc | đo: `firstCrateTipAt: 4s`; `game.js` (`!meta.tut.done1&&R.t<55`) |
| 2 | Vòng lặp lõi và độ "đã" | **7** | Mở thùng rung rồi bung thẻ, tia nhiệt, nổ, orb bay về tàu: rất sướng. Module trông giống nhau, bắn chưa có "lực" | ảnh `rv_stress`; `ui.js` `openPack`/`revealCards` |
| 3 | Chiều sâu lựa chọn | **5** | Cùng một lớp, 4 phái có **chỉ số y hệt nhau** (Flame Lance = Frost Lance); khác biệt chỉ đến từ cộng hưởng. Bot chọn tham lam vẫn phá đảo cả 3 lần | `data.js` `CLS` + `MODS` |
| 4 | Nhịp tiến độ | **5** | Lượt nào cũng ~3,2 phút cố định (Threat 1→10). Ch1 thua 3 lượt đầu là hợp lý, nhưng cuối game phải chơi lại đoạn đầu nhàm. **Cây nâng cấp gần như max khi phá đảo**, nên Endless không còn gì để tiêu | 3 lần mô phỏng: `avgRun 184–202s`; `upAtEnd` hầu hết = max |
| 5 | Cân bằng | **6** | Không còn chết sớm (0–1 lượt chết ở Threat ≤3 / chiến dịch). Ch3–4 dao động lớn giữa các lần chạy (2–11 lượt). Endless gặp "tường" vì máu quái tăng 1,2^Threat mà nâng cấp đã hết | lượt/bãi: `{4,4,9,9,9}` `{4,7,7,11,3}` `{4,5,2,8,8}` |
| 6 | Nội dung | **5** | 16 module, 8 quái, 5 boss, 5 phép, 8 relic, 11 nâng cấp, 19 thành tựu. **Thời lượng chơi: bot 83–118 phút**; người thật có thể 2–3 giờ. Booster Pack Heroes khoảng 6 giờ với giá ~$7 | `camp_out`: `totalMin 118 / 103 / 83` |
| 7 | Đồ họa và độ dễ đọc | **5** | Bản sắc mạnh (tối, mắt, vòng sáng) nhưng vẽ bằng code. Cảnh đông thì **số sát thương chồng nhau thành một đống không đọc được**. Trên điện thoại sprite rất nhỏ | ảnh `rv_stress`, `rv_mobile_stress` |
| 8 | Âm thanh | **4** | Tổng hợp WebAudio: đủ phản hồi nhưng còn "bíp bíp", chưa có nhạc. *(Ý kiến, chưa nghe trên loa thật)* | `audio.js` |
| 9 | UI/UX | **6** | Thẻ bài rõ ràng, trên điện thoại xếp 2×2 ổn. Nhưng **không có nút tạm dừng**, HUD cũ hiện sau menu, thanh chip chiếm 3 hàng trên điện thoại, relic dùng emoji (hiển thị khác nhau giữa các máy) | xem mục 5 (bug) |
| 10 | Cốt truyện và không khí | **8** | Tên tàu HOPE ↔ tên game; twist "you are not the first" khớp cơ chế "thùng từ xác tàu cũ"; màn kết mọi đôi mắt chuyển đỏ | `cutscene.js` |
| 11 | Hiệu năng | **9** | Cảnh nặng: 58 FPS, update 0,49 ms + render 5,2 ms/khung; bộ nhớ 5→6 MB sau 20 giây ở 3x (không rò rỉ); tải trang 67 ms, 112 KB | `STRESS`, `SOAK`, `LOAD` |
| 12 | Chất lượng code | **6** | Tách file hợp lý, không phụ thuộc thư viện, có hệ thống cập nhật. Nhưng 146 hằng số "thần kỳ" trong `game.js`, nhiều dòng >300 ký tự, biến toàn cục giữa 12 file, không có test tự động, save chưa có số phiên bản | `grep` đếm |
| 13 | Sẵn sàng thương mại | **3** | Chưa có art, trailer, capsule. Thời lượng ngắn. Thiếu nút pause, fullscreen, hỗ trợ tay cầm | — |

## 3. So với Booster Pack Heroes
| Điểm yếu của họ | HOPEFIRE | Trạng thái |
|---|---|---|
| Lựa chọn ít ý nghĩa | Chọn 1/3 thẻ + cộng hưởng + lò phản ứng + relic | ✅ tốt hơn, nhưng module cùng lớp vẫn giống nhau |
| Đầu game chậm, cày | Thắng Ch1 ở lượt 4 (~13 phút) | ✅ |
| Act 3 mất cân bằng | Bảng độ khó từng bãi chỉnh bằng mô phỏng | 🟡 vẫn dao động |
| Không cày lại màn cũ được | Chơi lại bãi cũ thoải mái | ✅ |
| Lag cuối game | 58 FPS khi có 119 quái | ✅ |
| **Họ hơn mình ở:** | Nhiều nội dung (~6 giờ), art hoàn chỉnh, cây kỹ năng sâu | ❌ |

## 4. Điểm tốt, giữ nguyên
- Vòng tròn phát hiện, bóng tối và mắt phát sáng: **đây là "hook" cho trailer**, khi làm art phải giữ.
- Thanh Hope vừa là máu vừa là đồng hồ, tạo nhịp chơi gọn ~3 phút mỗi lượt.
- Chỉ ra relic/phép khi đã có 2 module: chặn được tình huống chết vì xui.
- Hệ thống cập nhật, bot mô phỏng cân bằng, hiệu năng.

## 5. Điểm chưa tốt
**🔴 Nghiêm trọng**
1. **Thời lượng ~1,5–2 giờ.** Steam cho hoàn tiền nếu chơi dưới 2 giờ trong 14 ngày, nên người chơi có thể phá đảo rồi refund.
2. **Đồ họa placeholder:** chặn mọi việc marketing.

**🟠 Quan trọng**
3. Lượt nào cũng phải đi lại Threat 1→9 trước boss.
4. Cây nâng cấp max trước khi phá đảo; Endless thiếu mục tiêu dài hạn.
5. Module cùng lớp khác phái không khác chỉ số; thiếu cá tính.
6. Số sát thương che hết cảnh đông.
7. Không có nút pause (Esc/P).
8. Điện thoại: chip module + relic + cộng hưởng chiếm 3 hàng, sprite quá nhỏ.

**🟡 Nhỏ**
9. Relic dùng emoji (🔍🔋📡…), hiển thị khác nhau giữa Windows / Android / iOS.
10. Tốc độ bị reset về mặc định mỗi lượt.
11. Một thùng có thể ra 2 thẻ trùng.
12. HUD cũ hiện sau menu.

## 6. Danh sách bug
| # | Tái hiện | Mong đợi | Thực tế | File |
|---|---|---|---|---|
| B1 | Mở thùng nhiều lần | 3 thẻ khác nhau | Có lúc 2 thẻ giống hệt (ảnh: Overcharge ×2) | `ui.js` `openPack` (không chặn trùng) |
| B2 | Đang trong lượt → bấm UPDATE NOW | Giữ Xeno-core đã nhặt | Core của lượt đó **mất** (chỉ `save()` meta, không gọi `endRun`) | `update.js` `doUpdate` |
| B3 | Thua lượt → về menu | HUD và thanh dưới ẩn | HUD cũ (vàng, Threat, chip) vẫn hiện sau menu | `ui.js` `menu()` |
| B4 | Bật 3x → hết lượt → lượt mới | Giữ 3x | Về 1x (theo Settings) | `game.js` `newRun` |
| B5 | Endless: boss xuất hiện | Mẹo phù hợp | Mẹo "swallowed a part we need" vô nghĩa trong Endless (chỉ hiện nếu chưa xem) | `game.js` `spawnBoss` |

## 7. Đề xuất cải thiện (sắp theo tác động ÷ công sức)
| Việc | Tác động | Công sức | Lý do |
|---|---|---|---|
| Sửa B1–B5 + nút Pause | 3 | S | Lỗi lộ ngay khi playtest |
| Gộp số sát thương (chỉ hiện số lớn / cộng dồn theo mục tiêu) + chế độ chip gọn trên điện thoại | 3 | S | Dễ đọc ở cảnh đông |
| **"Warp start"**: sau khi thắng một bãi, cho bắt đầu từ Threat 5; hoặc tự tua 3x khi không có quái trong vòng | 4 | S | Bỏ đoạn lặp nhàm |
| **Pipeline pixel-art** (xem mục 8) | 5 | M | Mở khóa toàn bộ marketing |
| **Kéo dài nội dung lên ~5 giờ**: chế độ "Nightmare" cho từng bãi đã thắng (quái mạnh hơn, thưởng core ×2, relic hiếm) + cây nâng cấp tầng 2 mở theo bãi | 5 | M | Rủi ro refund; tận dụng nội dung sẵn có |
| Cá tính module theo phái (Thermal bắn chậm nhưng mạnh, Cryo nhanh yếu, Arc xuyên, Nano hồi) | 4 | M | Chiều sâu build |
| Mục tiêu dài hạn cho Endless (nâng cấp vô hạn với giá tăng dần, bảng xếp hạng cục bộ) | 3 | S | Giữ chân sau khi phá đảo |
| Tách hằng số cân bằng ra `data.js`, thêm số phiên bản cho save | 2 | S | Dễ chỉnh, tránh hỏng save |
| Nhạc + SFX thật | 3 | M | Để sau, theo quyết định hiện tại |

## 8. Kiểm kê đồ họa và kế hoạch đồ họa

### 8.1 Mọi thứ đang vẽ bằng code
Kích thước tính theo **độ phân giải nội bộ 640×360** (xem 8.2).

| Thành phần | Hiện tại | Kích thước (px) | Frame / animation | Biến thể | Ưu tiên |
|---|---|---|---|---|---|
| Tàu rơi (thân) | `drawShip` | 80×48 | tĩnh + đèn nhấp nháy (2f) | — | ⭐⭐⭐ |
| Pháo nhiệt (đầu xoay) | `drawShip` | 16×16 | 1 (xoay bằng code) + flash 2f | — | ⭐⭐⭐ |
| Tàu cất cánh | `endRender` | 80×56 | lửa đẩy 4f | — | ⭐ |
| Nền bãi (đất) | `buildGround` | tileset 16×16 | — | 5 bảng màu | ⭐⭐⭐ |
| Trang trí: đá, mảnh xác tàu, hố va chạm | `buildGround` | 8–32 | tĩnh | 5 bảng màu | ⭐⭐⭐ |
| Cây phát sáng | `plants` | 6×12 | lung linh 3f | 3 màu | ⭐⭐ |
| Module: đế + đầu | `drawMod` | 20×24 | bắn 2–3f | 4 lớp × 4 phái (tô màu bằng code) | ⭐⭐⭐ |
| Drone | `drawDrone` | 12×10 | cánh quạt 2f | 4 phái (tô màu) | ⭐⭐ |
| Crawler / Skitter / Brute | `drawEnemy` | 16×12 / 14×8 / 26×22 | đi 4f, lao 4f, đánh 3f, chết 5f | — | ⭐⭐⭐ |
| Spitter / Bloater / Wisp / Phantom / Splitter | `drawEnemy` | 16–24 | như trên (+ bay 4f cho Wisp) | — | ⭐⭐ |
| 5 boss | `drawEnemy` | 56–72 | đi 4f, kỹ năng 4f, chết 6f | — | ⭐⭐ |
| **Mắt phát sáng** | `drawEyes` | — | **giữ bằng code** (lớp sáng cộng dồn) | — | giữ |
| Tia nhiệt / Lance / Zap | `drawFx` | — | **giữ bằng code** | — | giữ |
| Đạn Rail, đạn Mortar, axit | `render` | 4–8 | 2f | màu theo phái | ⭐⭐ |
| Nổ | `drawFx` boom | 32–64 | 6f | 3 màu | ⭐⭐ |
| Orb: scrap / core / cell | `render` | 6–8 | xoay 4f | — | ⭐⭐ |
| Vòng phát hiện | `render` | — | **giữ bằng code** | — | giữ |
| Thùng cứu hộ (UI) | CSS | 64×48 | rung 2f, bung 6f | — | ⭐⭐⭐ |
| Khung thẻ bài | CSS | 9-slice | — | 4 độ hiếm + relic | ⭐⭐ |
| Icon: 16 module, 5 phép, 8 relic (thay emoji), 3 tiền tệ | Unicode / emoji | 16×16 / 24×24 | tĩnh | — | ⭐⭐ |
| Logo HOPEFIRE | CSS gradient | 320×80 | lửa 4f | — | ⭐ |
| Capsule Steam (sau) | — | 920×430, 462×174… | — | — | ⭐ (khi lên Steam) |

### 8.2 Art direction và kỹ thuật
- **Render ở độ phân giải thấp cố định rồi phóng to theo số nguyên** (nearest-neighbor): 640×360 → ×3 = 1080p, ×4 = 1440p, ×2 = 720p. Pixel luôn đều, không bị méo khi scale lẻ như hiện tại (S ≈ 1,4). Lớp bóng tối và ánh sáng cũng vẽ ở 640×360 nên còn nhanh hơn. Trên điện thoại dọc dùng 360×640.
- **Giữ bằng code:** mắt, tia sáng, vòng phát hiện, bóng tối. Đây chính là bản sắc; sprite chỉ thay "thân".
- **Bảng màu:** mỗi bãi ~16 màu (nền tối, độ bão hòa thấp) + màu phát sáng dành riêng cho mắt, phái và loot, để vật quan trọng luôn nổi trên nền.
- **Nạp sprite an toàn:** một file atlas (PNG + JSON). Mỗi hàm vẽ kiểm tra `if(SPR.has('crawler'))` thì vẽ sprite, không thì dùng code cũ. Nhờ vậy thay dần từng món mà game không bao giờ hỏng.
- **Tô màu theo phái bằng code** (palette swap lúc nạp): vẽ 4 module xám, sinh ra 16 biến thể.

### 8.3 Con đường rẻ nhất mà vẫn đẹp
- **Kết hợp:** mua quái từ **một họa sĩ duy nhất** (đồng bộ phong cách), còn tàu, module, UI thì tự vẽ hoặc chỉnh bằng **Aseprite (~$19.99 trên Steam)**.
- **Ứng viên cần kiểm tra license và độ hợp phong cách** (chưa xác minh là hợp):
  - Dòng *Sci-fi Character Pack* của PenUsbMic: sprite sci-fi độ phân giải thấp, góc top-down, có bundle nhiều pack.
  - *Super Pixel Alien Monster Pack* của unTied Games: cho phép dùng thương mại, cần ghi công.
  - *Pixel Alien Asset Pack* (sarpvisuals): miễn phí, cho phép dùng thương mại, ghi rõ "No AI".
- **Tránh pack gắn nhãn "AI Assisted":** Steam bắt khai báo nội dung AI, và cộng đồng indie thường chê.
- **Ước lượng:** $20–100 tiền asset; 40–60 giờ tự vẽ (tàu, module, UI, nền) nếu mới học Aseprite.

### 8.4 Thứ tự làm (ưu tiên cái lên ảnh và trailer nhanh nhất)
1. Pipeline 640×360 + atlas + fallback.
2. Nền Crash Site + tàu + pháo nhiệt.
3. Crawler, Skitter, Brute (đi, lao, chết).
4. Module 4 lớp (tô màu theo phái).
5. Thùng, khung thẻ, icon.
6. Nổ, orb, đạn.
7. Nền 4 bãi còn lại.
8. 5 quái mới + 5 boss.
9. Logo + capsule.

Xong bước 4 là đủ để quay một clip 15 giây cho trailer hoặc demo.

## 9. Số liệu đo
| Chỉ số | Kết quả |
|---|---|
| Lượt / bãi (3 lần) | `{4,4,9,9,9}` · `{4,7,7,11,3}` · `{4,5,2,8,8}` → tổng 35 / 32 / 27 lượt |
| Lượt thắng đầu tiên mỗi bãi | Ch1: lượt 4 · Ch2: 8–11 · Ch3: 11–18 · Ch4: 19–29 · Ch5: 27–35 |
| Thời lượng phá đảo (bot) | 118 / 103 / 83 phút |
| Lượt trung bình | 184–202 giây |
| Chết sớm (Threat ≤3) | 0 / 1 / 0 |
| Xeno-core kiếm cả chiến dịch | 47.540–65.530 |
| Tải trang | 67 ms · 112 KB |
| Cảnh thường (Ch1) | 60 FPS · update 0,14 ms · render 2,75 ms |
| Cảnh nặng (Endless Threat 30+, 8 module, 3 relic, 3x) | 58 FPS · khung tệ nhất 28 ms · update 0,49 ms · render 5,18 ms · 92–119 quái |
| Bộ nhớ | 3 MB → 6 MB sau 20 giây chạy nặng |
| Lỗi console | 0 |

*Lưu ý: FPS đo trên Chrome headless (CPU). Máy thật có GPU thường nhanh hơn; điện thoại yếu cần đo riêng.*

## 10. Đề xuất v0.5.0: "Nền móng đồ họa + sửa lỗi"
1. Sửa B1–B5, thêm Pause (Esc / P / nút ⏸).
2. Gộp số sát thương; chip gọn trên điện thoại; thay emoji relic bằng icon vẽ.
3. Warp start (bắt đầu từ Threat 5 ở bãi đã thắng).
4. Pipeline pixel-art 640×360 + atlas loader + fallback code.
5. Art đợt 1: nền Crash Site, tàu, pháo nhiệt, Crawler / Skitter / Brute, 4 module.

**v0.6.0 (sau đó):** kéo dài nội dung (Nightmare + cây nâng cấp tầng 2), cá tính module theo phái, mục tiêu Endless, art đợt 2.

---
*Đã kiểm chứng:* mọi số liệu ở mục 9, các bug B1–B5 (đọc code và ảnh chụp), hiệu năng, bố cục điện thoại.
*Ý kiến / giả định:* điểm âm thanh (chưa nghe trên loa thật), thời lượng của người thật (suy từ bot), độ hợp phong cách của các asset pack.
