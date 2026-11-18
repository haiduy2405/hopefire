# HOPEFIRE — Review v0.9.12 (panel: designer · game-feel · audio · UX · Steam marketer)

*2026-11-18 · theo `docs/REVIEW_PROMPT.md` v2 · Claude tự review, đo bằng headless Chrome (CPU render) — chưa có người chơi thật.*
*Ảnh/số đo: ftue_bot, feel_check, music_render, sim --runs 2, bot chơi 3 run 1920×1080 + 1 run 390×844 (`/tmp/rv`).*

## 1. TL;DR
- **Điểm tổng: 6.8/10** (v0.4.0: 6.0). Lõi game, art, lồng tiếng, crew, mini-game khóa đều tiến xa. Kéo điểm xuống: **giao diện thiếu "độ mướt" ở những chi tiết nhỏ** (hover/focus/press gần như không có, con trỏ nhảy về đầu sau mỗi lần nâng cấp), **màn mở crate còn đơn giản so với tầm quan trọng của nó**, **chữ chồng nhau lúc đông**, và **thời lượng bot 64–81 phút cho story** (thấp hơn mục tiêu 75–110).
- **3 thay đổi tăng doanh số nhiều nhất:** (1) vòng "hover → tiếng/animation → xác nhận" cho MỌI nút + giữ vị trí con trỏ khi UI vẽ lại; (2) làm lại màn mở crate thành khoảnh khắc "wow" (cảnh, ánh sáng, nhịp, thưởng); (3) tăng chiều sâu/nội dung sau bãi 2 để qua mốc 2 giờ hoàn tiền với người chơi thật.

## 2. Bảng điểm
| # | Hạng mục | Điểm | Bằng chứng |
|---|---|---|---|
| 1 | 60 giây đầu | 8 | ftue_bot: crate miễn phí ở t=0, 5 crate trong 79 s, 65 kill; tip đúng lúc; không có tường chữ |
| 2 | 3 run đầu (hook) | 7 | bot chơi: hub hiện mục tiêu boss + nâng cấp mua được; thiếu "tease" thứ mới ngay sau run 1 |
| 3 | Khoảnh khắc crate | 7 | tell độ hiếm + lật thẻ + khóa + JACKPOT rất tốt; nhưng panel khóa trơn (một vòng tròn trên nền xám), crate tĩnh, không có cảnh/ánh sáng/hạt (`crate.js:129`, `css .lockwrap`) |
| 4 | Chiều sâu lựa chọn | 6 | synergy + phản ứng + crew + relic + reactor có trade-off; chưa thể chứng minh "không có chiến lược thống trị" nếu không có người chơi (bot chọn ngẫu nhiên vẫn thắng) |
| 5 | Combat feel | 8 | hit-stop, slow-mo boss, streak, rung Hope, rumble tay cầm; feel_check không lỗi |
| 6 | Dễ đọc | 6 | ảnh 1080p: "14× STREAK" đè lên "SHATTER"; toast thành tựu che tip hướng dẫn; tip phone chiếm ~1/6 màn hình |
| 7 | Nhạc & SFX | 6 | music_render: đỉnh ≤0,55 (<0,9), RMS 0,019→0,047 (calm→boss) đúng hướng; nhạc vẫn là tổng hợp, chưa có bản thật (chờ Suno thương mại) |
| 8 | Art | 7 | tàu, quái, boss, crew, carrier, crate là AI-art nhất quán; còn code-art: drone, đồ rơi, FX phép, hành tinh cutscene (procedural, đã ổn), nền bãi 2–5 |
| 9 | Tiến độ & nhịp | 6 | sim 2 lần: story 64–81 phút (mục tiêu 75–110), toàn bộ 203–214 phút (OK); 62–68 lượt |
| 10 | UX & nền tảng | 6 | chỉ **6 rule `:hover`, 8 `transition`** cho cả game → nút gần như không phản hồi; `menu()` vẽ lại cả modal nên **focus/cuộn reset sau mỗi lần nâng cấp**; tay cầm đã có (v0.9.8+); 1080p/phone hiển thị đúng |
| 11 | Hiệu năng/ổn định | 8* | 0 lỗi console ở 4 phiên; heap 3–7 MB; (*FPS đo được 26–60 chỉ phản ánh render CPU + chạy 3× + 2 trình duyệt song song, **cần đo lại trên máy thật**) |
| 12 | Sellability | 6 | Hook mạnh (bóng tối + mắt + twist Trái Đất) nhưng: <2h với người giỏi, Steam SDK/achievements/cloud chưa có, trang store chưa mở |

## 3. Top 10 vấn đề (theo tác động tới doanh số)
1. **Nút không phản hồi (hover/focus/press/idle)** → cảm giác "đồ chưa hoàn thiện". Fix: bộ style tương tác dùng chung (`css`: transition, hover lift + glow, active press, focus ring), tiếng `flip0` khi rê, hiệu ứng "thở" cho nút chính. Effort **S–M**.
2. **Con trỏ/cuộn reset sau khi nâng cấp ở hub** (`ui.js menu()` gán lại `modal.innerHTML`; pad.js chọn lại phần tử đầu). Fix: lưu `data-k`/id phần tử đang focus + `scrollTop`, khôi phục sau mỗi lần render; làm tương tự cho chuột. **S**.
3. **Màn mở crate đơn giản** → bước quan trọng nhất của vòng lặp mà đẹp ít nhất. Fix: nền ánh sáng/tia theo độ hiếm, crate nảy/rung có nhịp, khóa bật tung từng cái, hạt/vòng xung kích, thẻ bay ra từ crate, đếm "tension" bằng âm; **M**.
4. **Chữ chồng/toast che tip** (`STREAK` vs `SHATTER`, thành tựu vs tip). Fix: hàng đợi toast + làm lệch/xếp tầng chữ nổi (`render.js addTxt`); **S**.
5. **Thời lượng**: bot story 64–81 phút. Fix: thêm cơ chế sâu hơn ở bãi 3–5 (ví dụ 2 loại elite, sự kiện giữa run, relic hiếm), hoặc dãn đường cong nâng cấp; **M–L**; cần dữ liệu người chơi thật.
6. **Art còn code-vẽ** (drone, đồ rơi, hiệu ứng phép, nền bãi 2–5). Fix: đợt art AI #3 theo pipeline hiện có; **M**.
7. **Chưa có người chơi thật đánh giá cân bằng/độ sâu**. Fix: playtest có hướng dẫn + ghi log chọn thẻ (analytics cục bộ), **S** để cài, thời gian là của Duy.
8. **Steam**: chưa Steamworks (achievements 25 sẵn trong game, cloud save), build Steam phải tắt update check; **L**, Duy cần đăng ký.
9. **Test lỗi thời**: `tools/test/crate_shots.py` timeout vì chờ thẻ ngay (sau khi có mini-game khóa) → mất công cụ đo crate. Fix: dùng `lquick`/lock bot; **S**.
10. **Nhạc thật**: nhạc menu/boss vẫn tổng hợp; chờ Suno Pro thương mại; **M** (phụ thuộc Duy).

## 4. Art còn là "programmer art" / placeholder
drone & đạn drone; orb/đồ rơi; FX phép (Solar Flare…); nền đất bãi 2–5; hành tinh trong cutscene (procedural, hợp phong cách nhưng không phải pixel-art vẽ tay); biểu tượng UI vẽ bằng emoji ở vài nút (🔊 ☰ ⚙); icon element tạo bằng code.

## 5. Quick wins (<1 giờ)
- Rule hover/active/focus chung cho `button, .card, .tbtn, .up button, .chs button` (+ tiếng khi rê).
- Giữ focus + scroll sau `menu()`.
- Xếp tầng chữ nổi theo tuổi để không đè nhau; toast đợi tip.
- Sửa `crate_shots.py` cho mini-game khóa.
- Đóng tip phone gọn hơn (cỡ chữ, 2 dòng) trên màn hẹp.

## 6. So với v0.4.0
Cải thiện: crate (7), feel (8), art (7 từ 5), tay cầm/pause/fullscreen (đã có), lồng tiếng, cốt truyện (twist mới), crew/carrier/horde. Chưa cải thiện/thoái lui nhẹ: thời lượng bot story 64–81 phút (trước 83–118 vì thêm cơ chế tác động tới sim), độ dễ đọc khi đông.
