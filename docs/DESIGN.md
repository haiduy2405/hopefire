# HOPEFIRE — Thiết kế game

## Ý tưởng
Phi hành gia trên tàu **S.V. HOPE** rơi xuống một hành tinh lạ. Tàu gần như hỏng hoàn toàn.
Xung quanh là vô số sinh vật **mù**: chúng chỉ cảm nhận được tàu trong một **vòng tròn** quanh nó
(nhiệt/rung từ lò phản ứng). Con nào lạc vào vòng sẽ rú lên và lao thẳng vào tàu.
Pháo nhiệt trên đỉnh tàu vẫn bắn được, nhưng mỗi giây trôi qua là năng lượng (HOPE) cạn dần.

Tên game: **HOPE** (tên con tàu, cũng là hi vọng) + **FIRE** (tia nhiệt). Tagline: *When all hope is lost, the ship still fires.*

## Vòng lặp chính
1. **Lượt chơi** (~3–4 phút): Hope tự cạn. Quái tới lác đác → càng lúc càng đông (Threat 1→10) → boss.
2. Giết quái → **Scrap** (mua thùng trong lượt) + **Xeno-core** (tiền vĩnh viễn) + đôi khi **pin năng lượng** (hồi Hope).
3. **Thùng cứu hộ** (lục từ xác tàu của các đoàn trước): chọn 1 trong 3 thẻ — module hoặc phép.
4. Hết Hope → dùng Xeno-core để **sửa tàu** (cây nâng cấp vĩnh viễn) → lượt sau trụ lâu hơn.
5. Hạ boss (con quái đã nuốt linh kiện tàu) → tàu "nhảy" sang **bãi xác tàu** kế tiếp (chapter).

## Hệ thống
| Hệ thống | Chi tiết |
|---|---|
| Module | 12 loại = 4 phái (Thermal/Cryo/Arc/Nano) × 3 lớp (Lance tầm gần, Rail tầm xa, Mortar diện rộng). Trùng thẻ = lên sao |
| Cộng hưởng | 2 cùng phái: +25% dmg. 4 cùng phái: Thermal đốt, Cryo làm chậm, Arc sét lan, Nano hồi Hope |
| Phép | 5 phép, tối đa 3, dùng thủ công (Q/W/E), có hồi chiêu. Trùng thẻ = lên cấp |
| Lò phản ứng | LOW / NORMAL / OVERDRIVE: mạnh hơn & nhiều loot hơn nhưng vòng tròn rộng hơn, quái tới nhiều hơn |
| Độ hiếm | Common / Rare / Epic / Legendary (×1 / ×1.8 / ×3.2 / ×6) |
| Nâng cấp | 10 nhánh sửa tàu (dmg, Hope, pháo, scrap, tốc bắn, may mắn, giảm hao Hope, giảm giá, thêm slot…) |
| Chapter | 5 bãi: Crash Site → Research Wreck → Mining Hulk → War Graveyard → The Origin |

## Khác biệt so với Booster Pack Heroes (sửa đúng điểm bị chê)
- Chọn 1/3 thẻ thay vì random hoàn toàn → lựa chọn có ý nghĩa.
- Cộng hưởng phái + lò phản ứng rủi ro/phần thưởng → chiến thuật thật sự.
- Chơi lại chapter cũ thoải mái (cày được).
- Tốc độ 1x/2x/3x. Render canvas 2D nhẹ (chống lag cuối game).

## Hướng nghệ thuật
- Góc nhìn 3/4 top-down, pixel-art sci-fi u tối, rùng rợn nhưng không máu me.
- Bóng tối là nhân vật chính: ngoài vòng sáng chỉ thấy **mắt phát sáng**.
- Cutscene mở đầu dựng trong engine (không dùng 3D/AI video).

## Phát hành
- Steam (premium, $4.99), sau đó Android bản trả phí. **Khóa vùng Việt Nam.**
- Bán một lần, không giao dịch trong game.
