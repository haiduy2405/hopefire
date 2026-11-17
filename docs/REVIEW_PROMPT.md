# HOPEFIRE — Prompt tự review game

> Cách dùng: dán nguyên khối dưới đây cho Claude (kèm quyền truy cập repo `haiduy2405/hopefire`).
> Có thể chạy lại sau mỗi version lớn để so sánh điểm số giữa các lần.

---

## PROMPT

Bạn là một nhóm review gồm 4 vai, làm việc cùng lúc:
1. **Game designer** chuyên thể loại incremental / idle / tower defense (đã chơi kỹ Booster Pack Heroes, Nodebuster, Zero Stress King, Vampire Survivors).
2. **Art director** pixel-art 2D, góc nhìn 3/4 top-down.
3. **Kỹ sư front-end / game engine** (Canvas 2D, vanilla JS, hiệu năng web và mobile).
4. **Người làm marketing Steam** cho game indie giá $4.99.

Nhiệm vụ: **review toàn diện game HOPEFIRE** ở version hiện tại, chỉ ra cái tốt, cái chưa tốt và lộ trình cải thiện. **Không sửa code trong lúc review.** Chỉ đánh giá và đề xuất.

### Bối cảnh game
- Incremental tower defense: tàu S.V. HOPE rơi xuống hành tinh lạ. Quái mù, chỉ phát hiện tàu trong một vòng tròn. Thanh HOPE tự cạn. Mở thùng cứu hộ để chọn module / phép / relic. Hết Hope thì dùng Xeno-core nâng cấp tàu vĩnh viễn. Hạ boss để qua bãi tiếp theo (5 bãi). Phá đảo thì mở Endless.
- Mục tiêu thương mại: Steam, $4.99, bán một lần, không có giao dịch trong game, khoảng 5–6 giờ nội dung, game tiếng Anh, khóa vùng Việt Nam.
- Đối thủ tham chiếu: Booster Pack Heroes (91–92% positive). Người chơi khen nhiều nội dung, vòng lặp gây nghiện. Người chơi chê Act 3 mất cân bằng, đầu game chậm và cày nhiều, lựa chọn ít ý nghĩa, lag cuối game.
- Code: `index.html`, `css/style.css`, `src/*.js` (vanilla JS, không build). Thiết kế ở `docs/DESIGN.md`, lộ trình ở `docs/ROADMAP.md`, lịch sử ở `CHANGELOG.md`.
- Đồ họa hiện tại **toàn bộ vẽ bằng code** (placeholder). Bước tiếp theo của dự án là **làm đồ họa thật**, nên phần đồ họa cần đánh giá kỹ nhất.

### Quy trình bắt buộc (làm đủ, theo thứ tự)
1. **Đọc toàn bộ code và tài liệu.** Ghi lại kiến trúc, luồng dữ liệu, các con số cân bằng chính (`src/data.js`).
2. **Chạy game thật** bằng trình duyệt headless qua một server cục bộ (`python3 -m http.server`), không mở bằng `file://`. Ít nhất các bước sau:
   - Chơi từ đầu như người mới: cutscene → lượt 1 có hướng dẫn → menu nâng cấp. Chụp màn hình mỗi bước.
   - Chạy bot tự chơi trọn chiến dịch (mua nâng cấp rẻ nhất, chọn thẻ hợp lý) ít nhất **3 lần**. Ghi số lượt cần để qua mỗi bãi, thời lượng mỗi lượt, % máu boss còn lại khi thua.
   - Thử Endless tới Threat 30+, khi có 8 module, 3 relic và 3 phép, để đo trường hợp nặng nhất.
   - Thử trên viewport điện thoại (390×820) và desktop (1280×800).
   - Đo: FPS trung bình và thấp nhất ở cảnh đông nhất, số object trên màn, thời gian tải, lỗi console.
3. **Đánh giá theo bảng điểm** bên dưới, mỗi mục chấm 1–10 kèm **bằng chứng cụ thể**: file:dòng, ảnh chụp, hoặc số liệu đo được. Không có bằng chứng thì không được chấm.
4. **So sánh với Booster Pack Heroes:** game đã sửa được điểm yếu nào của đối thủ, còn thua ở đâu.
5. **Viết báo cáo** đúng định dạng đầu ra.

### Bảng điểm (1–10)
| # | Hạng mục | Câu hỏi cần trả lời |
|---|---|---|
| 1 | 5 phút đầu / onboarding | Người mới có hiểu phải làm gì không? Có chỗ nào chán, rối, hoặc chờ đợi không? |
| 2 | Vòng lặp lõi và độ "đã" (juice) | Mở thùng, bắn, nổ, nhặt loot có sướng không? Phản hồi hình ảnh, âm thanh, rung màn hình có đủ không? |
| 3 | Chiều sâu lựa chọn | Module, phép, relic, cộng hưởng, lò phản ứng có tạo ra lựa chọn thật không? Có build nào áp đảo mọi build khác không? |
| 4 | Nhịp tiến độ | Đường cong lượt chơi / nâng cấp / chapter có mượt không? Có đoạn nào bị "tường" hoặc cày vô nghĩa không? |
| 5 | Cân bằng | Quái, boss, nâng cấp nào quá mạnh / quá yếu? Kinh tế scrap và Xeno-core có hợp lý không? |
| 6 | Nội dung và đa dạng | Có đủ cho 5–6 giờ không? Bãi sau có thực sự khác bãi trước không? |
| 7 | Đồ họa và độ dễ đọc | Phân biệt được quái / module / đạn / loot ở cảnh đông không? Phong cách có nhất quán không? |
| 8 | Âm thanh | Có thiếu, chói, lặp hay gây mệt không? |
| 9 | UI/UX | Menu, HUD, thẻ bài, tooltip, nút trên điện thoại có dễ dùng không? Thông tin có thiếu hoặc thừa không? |
| 10 | Cốt truyện và không khí | Cutscene, tagline, twist có gắn với gameplay không? |
| 11 | Hiệu năng | FPS, rò rỉ bộ nhớ, giật khi đông quái hoặc khi hết lượt |
| 12 | Chất lượng code | Dễ bảo trì không? Có bug tiềm ẩn, trùng lặp, magic number rải rác không? Save có bị hỏng khi cập nhật không? |
| 13 | Độ sẵn sàng thương mại | So với game cùng giá trên Steam thì đứng ở đâu? Thiếu gì để người xem trailer bấm Wishlist? |

### Phần riêng: kiểm kê đồ họa (bắt buộc, vì đây là bước tiếp theo)
Lập **danh sách đầy đủ mọi thứ đang vẽ bằng code** cần thay bằng sprite, theo dạng bảng:

| Thành phần | File / hàm hiện tại | Kích thước đề xuất (px) | Số frame / animation cần | Biến thể (màu theo phái, độ hiếm, chapter) | Mức ưu tiên |
|---|---|---|---|---|---|

Gồm ít nhất: tàu (nguyên vẹn, hỏng, cất cánh), pháo nhiệt, 4 lớp module × 4 phái, Drone, 8 loại quái + 5 boss (đi, lao tới, đánh, chết), đạn / tia / nổ, orb loot (scrap, core, cell), nền 5 bãi (đất, đá, xác tàu, cây phát sáng), vòng tròn phát hiện, UI (thẻ bài, thùng cứu hộ, icon phép, icon relic, nút), logo HOPEFIRE.

Sau đó đề xuất:
- **Art direction:** bảng màu cho từng bãi, độ phân giải pixel (16/24/32px?), kích thước "pixel ảo" so với màn hình, cách giữ ánh sáng / bóng tối hiện tại khi chuyển sang sprite.
- **Con đường làm đồ họa rẻ nhất mà vẫn đẹp:** asset pack có license thương mại (gợi ý cụ thể nếu biết), tự vẽ bằng Aseprite, hoặc kết hợp. Ước lượng giờ công và chi phí.
- **Kiến trúc kỹ thuật:** cách nạp sprite sheet / atlas vào code hiện tại mà không phá game; giữ chế độ "vẽ bằng code" làm fallback.
- **Thứ tự làm:** cái gì thay trước để ảnh chụp màn hình và trailer đẹp lên nhanh nhất.

### Định dạng đầu ra (tiếng Việt, ngắn gọn, dễ quét)
1. **TL;DR**: 5 dòng. Điểm tổng /10, 3 điểm mạnh nhất, 3 vấn đề nghiêm trọng nhất.
2. **Bảng điểm**: 13 hạng mục, mỗi mục gồm điểm, 1 câu nhận xét và bằng chứng.
3. **Điểm tốt**: giữ nguyên, đừng phá.
4. **Điểm chưa tốt**: chia mức 🔴 Nghiêm trọng / 🟠 Quan trọng / 🟡 Nhỏ.
5. **Danh sách bug**: cách tái hiện, kết quả mong đợi, kết quả thực tế, file:dòng nghi ngờ.
6. **Đề xuất cải thiện**: bảng gồm *Việc · Tác động (1–5) · Công sức (S/M/L) · Lý do*, sắp theo tác động / công sức.
7. **Quick wins**: việc làm dưới 1 giờ mà cải thiện rõ.
8. **Kiểm kê đồ họa và kế hoạch đồ họa**: phần riêng ở trên.
9. **Số liệu đo được**: lượt / bãi, thời lượng lượt, FPS, lỗi console.
10. **Đề xuất version tiếp theo**: gom các việc ưu tiên nhất thành v0.5.0, kèm danh sách việc cụ thể.

### Quy tắc
- **Thẳng thắn.** Chỗ nào dở thì nói dở, kèm lý do. Không khen xã giao.
- Mọi nhận định phải có **bằng chứng**. Đừng đoán khi có thể đo được.
- Phân biệt rõ **đã kiểm chứng** và **ý kiến / giả định**.
- Ưu tiên những gì **ảnh hưởng tới doanh thu**: tỉ lệ wishlist, review tích cực, refund dưới 2 giờ chơi.
- Không đề xuất thêm hệ thống mới khi hệ thống hiện có còn chưa ổn.
