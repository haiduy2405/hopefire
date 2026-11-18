# HOPEFIRE — Đánh giá khả năng bán & kế hoạch phát hành (18/11/2026, v0.15.0)

## 1. Kết luận (TL;DR)
- **Điểm tự chấm: ~7.5/10 cho gói $4.99.** Đủ chất lượng để lên Steam, CHƯA đủ để lên khi chưa có dữ liệu người chơi thật.
- Thứ chặn bán không phải code mà là: (a) chưa có ai ngoài Duy chơi, (b) chưa có tích hợp Steam, (c) chưa có trailer có nhạc, (d) chưa có wishlist.
- Lộ trình khuyến nghị: **dựng trang Steam ngay → demo → Next Fest tháng 6/2027 → ra mắt ngay sau đó.** Ra mắt gấp không lợi.

## 2. Kiểm tra chất lượng (ảnh chụp gameplay thật 1920x1080 + sim)
**Tốt**
- Bộ UI viền kim loại cam thống nhất, thẻ crate có khung độ hiếm, HUD đọc rõ. Nhìn là "game có đầu tư", không giống asset flip.
- Tàu HOPE nổi bật giữa các tháp; vòng detection dễ hiểu; tooltip hướng dẫn rõ.
- Cân bằng (sim bot, 2 lượt): truyện ~115 phút, toàn bộ (5 Nightmare) ~252 phút, 0 lỗi console, 20/25 thành tựu. Dài hơn mục tiêu cũ 3.5h — đúng ý Duy muốn kéo dài.
- 8 ngôn ngữ, voice-over, nhạc Suno, 3 slot save, gamepad.

**Rủi ro bị chê trên stream (xếp theo mức nguy hiểm)**
1. **Đám quái xa tàu chỉ là mắt phát sáng** (xanh/đỏ) trên nền đen: đọc được "bầy đông" nhưng ngoài vòng detection trông trống/rẻ so với trung tâm. Streamer sẽ nói "màn hình đen".
2. **Hình AI:** phong cách đồng nhất, nhưng sprite quái nhỏ, một số chỗ mờ. Phải khai báo "AI-generated" trên Steam (đã có sẵn đoạn văn). Một bộ phận người chơi sẽ trừ điểm vì việc này — chấp nhận, đừng giấu.
3. **Chưa có bằng chứng người lạ hiểu game:** FTUE bot chạy được, nhưng bot không phải người. Cần 10–20 người chơi thật.
4. **Hiệu năng:** từng báo drop FPS ở bầy đông (đã tối ưu ở v0.14.x). Chưa thử trên máy yếu/laptop. Headless Chrome không đo được thật.
5. **Replay value mỏng:** 5 site + Nightmare + Endless. Chỉ ổn nếu cảm giác "một lượt nữa" mạnh — chỉ playtest mới biết.
6. **Bản dịch máy:** chấp nhận được cho game $4.99, nhưng ghi rõ trên trang Steam là "machine-assisted", sửa nhanh khi có phản hồi.
7. Đã sửa trong phiên này: tooltip che thanh máu boss (src/ui.js, tip hạ xuống 310px khi có boss).

**Nên làm trước khi bán (Claude làm được)**
- Chiếu sáng/đánh dấu nhẹ đám quái xa (silhouette thay vì chỉ mắt) hoặc giảm tương phản nền.
- Tích hợp Steamworks (thành tựu, cloud save), cờ build tắt kiểm tra cập nhật online.
- Demo = Site 1–2, cờ build riêng.
- Ghi log playtest ẩn (thời gian chết ở đâu, bỏ ở màn nào) cho bản demo/itch.
- Trailer 60–90s **có nhạc** (sau khi Duy duyệt game).

## 3. Việc Duy phải tự làm (Claude không làm hộ được)
| # | Việc | Ghi chú |
|---|------|---------|
| 1 | Tạo tài khoản Steamworks, đóng **phí Steam Direct $100/game** | Hoàn lại khi doanh thu đạt $1.000 |
| 2 | Khai thông tin pháp lý, ngân hàng nhận USD, **W-8BEN** | Xem docs/BUSINESS_LEGAL.md; VN–Mỹ chưa có hiệp ước → khấu trừ 30% trên doanh thu từ khách Mỹ |
| 3 | Kiểm tra nhãn hiệu "HOPEFIRE" (tìm Steam, USPTO/EUIPO, Google) | Nếu trùng, đổi tên TRƯỚC khi làm trailer/capsule |
| 4 | Chờ giai đoạn xét duyệt (≈ vài tuần sau khi nộp hồ sơ + 30 ngày sau khi trả phí là mức tối thiểu trước ngày ra mắt) | Nộp sớm |
| 5 | Trang "Coming Soon" phải public **≥ 2 tuần** trước ngày ra mắt (nên ≥ 4–6 tháng để gom wishlist) | |
| 6 | Tự chơi và **duyệt** game trước khi Claude làm trailer/ảnh chụp cửa hàng | Quy tắc đã đặt |
| 7 | Chọn khóa vùng Việt Nam (region lock) + khai báo AI | Đã chuẩn bị nội dung |
| 8 | Tìm 10–20 người chơi thử (bạn bè, Discord, Reddit r/incremental_games, r/TowerDefense) | Cần cho dữ liệu thật |

## 4. Ngân sách (khoảng, tự cập nhật khi có giá thực)
- **Bắt buộc: ~$100** (Steam Direct). Mọi thứ khác Claude/Duy tự làm được.
- **Mức $0 thêm:** chỉ phí bắt buộc, tự quảng bá (Reddit, TikTok/Shorts, Discord, itch.io). Chậm nhưng khả thi.
- **Mức ~$300–500:** thêm keys cho streamer cỡ nhỏ, công cụ gửi key, dịch/chỉnh lại 1–2 ngôn ngữ chính bởi người thật, nhạc/âm thanh bổ sung.
- **Mức ~$1–2k:** thêm quảng cáo thử nghiệm nhỏ, thuê editor/trailer, đặt chỗ bài báo. Chỉ nên làm nếu wishlist chứng tỏ có đà.
- Đã có sẵn: Suno Pro, công cụ art/voice miễn phí/bản quyền thương mại.

## 5. Doanh thu thực tế
- Giá $4.99 → Steam giữ 30%, thuế/khấu trừ/đổi tiền → **về túi khoảng $2.75/bản** (BUSINESS_LEGAL.md).
- Hòa vốn $100: ~37 bản. 1.000 bản ≈ $2.7k. 5.000 bản ≈ $13.7k.
- **Wishlist là chỉ số dẫn đường:** ~5–7k tối thiểu để có cơ hội được Steam đẩy, ~8k là vững; khoảng 10–15% wishlist mua trong tuần đầu (giả định ~12%). Dưới 2–3k wishlist thì doanh thu tuần đầu thường rất nhỏ.
- Cảnh báo: tỷ lệ hoàn tiền tăng nếu game bị lỗi/chơi dưới 2 giờ. Game incremental ngắn dễ bị hoàn → cần 2+ giờ giữ chân thật.
- **Kỳ vọng trung thực:** phần lớn game indie bán rất ít. Đây là canh bạc rẻ nhưng không đảm bảo. Giữ chi phí thấp, đừng bỏ thêm tiền trước khi có tín hiệu.

## 6. Dòng thời gian đề xuất
| Mốc | Việc |
|-----|------|
| Tháng 11–12/2026 | Duy chơi duyệt game; mở Steamworks, nộp hồ sơ + $100; kiểm tra nhãn hiệu; dựng Discord |
| Tháng 12/2026–1/2027 | Claude: Steam bridge, build demo, log playtest, sửa đọc-quái-xa; Duy mời playtester |
| Đầu 1/2027 | Trang Steam public (capsule, ảnh chụp, trailer có nhạc). **Hạn đăng ký Next Fest tháng 2 là 10/1/2027 — khó kịp, đừng ép** |
| Tháng 2–4/2027 | Gom wishlist, vá theo phản hồi demo, gửi key streamer |
| **25/4/2027** | Hạn đăng ký **Next Fest 14–21/6/2027** — mục tiêu thực tế |
| Tháng 6/2027 | Next Fest với demo; ra mắt ngay sau đó (tránh đụng đợt giảm giá lớn của Steam) |
| Sau ra mắt | Giảm 10–20% tuần đầu; vá nhanh; theo dõi đánh giá |

Next Fest chỉ dùng được 1 lần/game → chỉ tham gia khi demo đã mượt.

## 7. Chiến thuật có người chơi
1. **Trang Steam là quảng cáo chính:** capsule rõ, 4–5 ảnh thật, trailer ≤ 90s mở bằng cảnh bầy quái trong 5 giây đầu. Nội dung sẵn trong docs/STEAM_PAGE.md.
2. **Demo (Site 1–2)** + nút Wishlist trong game và trên itch.io/IncrementalDB.
3. **Clip ngắn** (GIF/TikTok/Shorts/Reddit): cảnh bầy đông + crate + boss. Duy là editor — lợi thế lớn, tự làm.
4. **Cộng đồng:** r/incremental_games, r/TowerDefense, Discord riêng; đăng nhật ký phát triển.
5. **Streamer cỡ nhỏ-vừa:** gửi key 2–4 tuần trước ra mắt/Next Fest; thích hợp thể loại incremental/tower defense. Email ngắn, kèm key + 1 GIF.
6. **8 ngôn ngữ** có sẵn: dịch trang cửa hàng ít nhất EN/ZH/ES/PT/RU/DE/JA để lên danh sách tìm kiếm theo ngôn ngữ. Ngôn ngữ trên Steam rất lệch theo tháng (khảo sát Steam gần đây cho thấy tiếng Anh ~39%, Hoa giản thể ~22%, Nga ~10%), nên hỗ trợ tiếng Hoa/Nga có giá trị.
7. **Giá:** $4.99, giảm 10–20% tuần đầu. Không bán rẻ hơn trước khi có đánh giá.
8. **Sau ra mắt:** trả lời mọi đánh giá tiêu cực lịch sự, vá trong tuần đầu — đánh giá 10–50 bài đầu quyết định đẩy thuật toán.

## 8. Việc tiếp theo (Claude)
1. Duy chơi và duyệt v0.15.0, gửi danh sách lỗi/cảm giác.
2. Claude: cải thiện đọc quái xa, Steam bridge, cờ build Steam/demo, log playtest.
3. Sau khi Duy duyệt: ảnh cửa hàng + trailer có nhạc.
