# Ôn thi bằng lái C1

Web app ôn thi lý thuyết sát hạch GPLX **hạng C1** (ô tô tải 3,5 – 7,5 tấn), tối ưu cho cả **máy tính** và **điện thoại**. HTML/CSS/JS thuần, không cần build, chạy offline (PWA).

## Chạy thử
```bash
python3 -m http.server 8000   # rồi mở http://localhost:8000
```
Hoặc deploy thư mục này lên GitHub Pages / Netlify / Vercel.

## Tính năng
- **Ôn tập** theo 7 chương, câu điểm liệt, câu hay sai, câu đánh dấu, câu chưa làm, ngẫu nhiên – có đáp án & giải thích ngay.
- **Thi thử** 35 câu / 22 phút / đạt ≥ 32 câu, sai câu điểm liệt là trượt; đồng hồ đếm ngược, tự nộp khi hết giờ, làm dở có thể quay lại; xem lại câu sai.
- **Biển báo** vẽ bằng SVG (sắc nét mọi màn hình), tìm kiếm, lọc theo nhóm.
- **Sa hình** ngã tư vẽ bằng SVG.
- **Mẹo ghi nhớ**: tốc độ, khoảng cách, thứ tự ưu tiên, nhận diện biển.
- **Thống kê**: tiến độ theo chương, biểu đồ điểm thi, câu hay sai.
- **Cài đặt**: sáng/tối, cỡ chữ, tự chuyển câu, đảo đáp án, rung; nhập/xuất bộ đề JSON; sao lưu/khôi phục tiến độ.

## UI/UX
| PC | Mobile |
|---|---|
| Sidebar cố định, bảng câu hỏi bên phải | Thanh điều hướng dưới, thanh thao tác cố định đáy màn hình |
| Phím tắt `1–4`/`A–D` chọn, `←` `→` chuyển câu, `F` đánh dấu, `Enter` câu tiếp | Vuốt trái/phải chuyển câu, bảng câu hỏi dạng bottom sheet (kéo xuống để đóng) |
| | Nút ≥ 44px, hỗ trợ safe-area (tai thỏ), rung phản hồi |

Ngoài ra: dark mode tự động, `prefers-reduced-motion`, điều hướng bàn phím/screen reader, lưu tiến độ trong `localStorage`.

## Bộ câu hỏi
`js/data/questions.js` chứa **72 câu mẫu** biên soạn theo Luật TTATGTĐB 2024 — **không phải** nguyên văn bộ 600 câu chính thức. Để ôn đúng ngân hàng đề, nạp file JSON trong **Cài đặt → Nhập bộ đề**:
```json
[{ "id": 1, "ch": 1, "q": "Câu hỏi", "a": ["Đáp án 1", "Đáp án 2"], "c": 0, "dl": false, "exp": "Giải thích", "img": "https://..." }]
```
`ch`: chương 1–7 · `c`: chỉ số đáp án đúng (từ 0) · `dl`: câu điểm liệt.

Cấu trúc đề thi (số câu, thời gian, điểm đạt, phân bổ theo chương) chỉnh ở hằng `EXAM` đầu file `js/app.js`.

> Nội dung mang tính tham khảo; hãy đối chiếu với văn bản pháp luật hiện hành và tài liệu của cơ sở đào tạo.
