# HƯỚNG DẪN TRỎ TÊN MIỀN RIÊNG VÀO GITHUB PAGES

## 1. Gợi ý các tên miền ngắn, hay & phù hợp nhất:
1. **congnghevui.vn** / **congnghevui.com** (Chuẩn với tên website "Công Nghệ Vui")
2. **hoccongnghe.vn** (Như bạn gợi ý, rất hay và trực quan)
3. **hocdienthoai.vn** (Dễ hiểu cho các bác lớn tuổi)
4. **ongbahoc.vn** / **ongbadung.vn** (Cực kỳ thân thiện và gần gũi)

---

## 2. Các bước cấu hình từ A-Z:

### Bước 1: Đăng ký mua tên miền
Bạn có thể đăng ký tên miền tại các nhà đăng ký uy tín ở Việt Nam:
- **PA Việt Nam**: pavietnam.vn
- **Mắt Bão**: matbao.net
- **TENTEN**: tenten.vn
- **iNET**: inet.vn

### Bước 2: Trỏ DNS về GitHub Pages
Vào trang quản trị tên miền vừa mua, thêm các bản ghi DNS sau:

1. **Bản ghi CNAME (đối với tên miền phụ `www`):**
   - Host: `www`
   - Loại (Type): `CNAME`
   - Giá trị (Value): `vantan1405.github.io`

2. **Bản ghi A (đối với tên miền gốc ví dụ `hoccongnghe.vn`):**
   - Host: `@` (hoặc để trống tùy nhà cung cấp)
   - Loại (Type): `A`
   - Thêm 4 dòng trỏ về 4 địa chỉ IP chính thức của GitHub:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`

### Bước 3: Cài đặt trên GitHub
1. Vào repository: `https://github.com/vantan1405/Cong-dong`
2. Bấm vào tab **Settings** (Cài đặt) -> chọn mục **Pages** ở thanh bên trái.
3. Ở ô **Custom domain**, nhập tên miền của bạn (ví dụ: `hoccongnghe.vn`).
4. Nhấn **Save**.
5. Đợi khoảng 5-15 phút để GitHub cấp chứng chỉ bảo mật rồi tích vào ô **Enforce HTTPS**.