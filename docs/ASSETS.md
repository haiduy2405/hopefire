# HOPEFIRE — Đồ họa & nguồn gốc asset

## Hiện tại (v0.5.0)
Toàn bộ sprite là **tự tạo bằng code** (`tools/sprites/build.py`), thuộc sở hữu của dự án — không license bên thứ ba, không cần ghi công.

| File | Nội dung |
|---|---|
| `assets/sprites.png` | Atlas (tàu, 8 quái × 4 frame + bản chớp trắng, module 4 phái, drone, nền 5 bãi, đá, mảnh xác tàu) |
| `assets/sprites.json` / `assets/sprites.js` | Toạ độ từng frame, điểm neo (anchor), vị trí mắt phát sáng |

## Quy tắc pixel-art
- 1 pixel art = 1 đơn vị thế giới game. Game luôn phóng to theo **số nguyên** pixel màn hình → không méo.
- Viền tối 1px, sáng từ trên xuống. Sprite quái nhìn sang **phải**, chân ở hàng dưới cùng.
- **Mắt phát sáng, tia sáng, vòng phát hiện, bóng tối vẫn vẽ bằng code** — đó là bản sắc của game.
- Thiếu sprite nào thì game tự vẽ bằng code như cũ (không bao giờ hỏng).

## Thay bằng hình vẽ tay (Aseprite…)
1. Vẽ frame cùng kích thước (xem `sprites.json`), xuất PNG.
2. Thay hàm tương ứng trong `build.py` bằng việc nạp PNG đó (`Image.open(...)`), giữ tên sprite và toạ độ mắt.
3. Chạy `python tools/sprites/build.py`, mở game kiểm tra.

## Asset bên ngoài đã xem xét (không dùng)
4 bộ CC0 trên OpenGameArt (Alien set, Alien boss set, alienSpriteSheet, soldier & enemies) — license dùng được nhưng phong cách arcade sáng màu / vector, nhìn thẳng, khác hẳn HOPEFIRE. Lưu tạm ở `assets/_incoming/` (không đưa lên git).
