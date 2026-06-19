# Nền tảng Thương mại điện tử theo kiến trúc Microservices

Nền tảng thương mại điện tử phân tán cho cửa hàng thời trang, xây dựng theo **kiến trúc microservices**. Các dịch vụ triển khai độc lập, tự quản lý dữ liệu của mình và giao tiếp bất đồng bộ qua message broker **NATS** sử dụng framework RPC **Hemera**.

<p align="left">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-24.x-339933?logo=node.js&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6.x-3178C6?logo=typescript&logoColor=white">
  <img alt="NATS" src="https://img.shields.io/badge/NATS-message%20broker-27AAE1?logo=natsdotio&logoColor=white">
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white">
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black">
</p>

---

## Mục lục

- [Tổng quan](#tổng-quan)
- [Kiến trúc](#kiến-trúc)
- [Các dịch vụ](#các-dịch-vụ)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Giao tiếp giữa các dịch vụ](#giao-tiếp-giữa-các-dịch-vụ)
- [Nhất quán dữ liệu (Saga)](#nhất-quán-dữ-liệu-saga)
- [Giám sát (Observability)](#giám-sát-observability)
- [Yêu cầu môi trường](#yêu-cầu-môi-trường)
- [Hướng dẫn cài đặt & chạy](#hướng-dẫn-cài-đặt--chạy)
- [Biến môi trường](#biến-môi-trường)
- [Tài liệu API](#tài-liệu-api)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Định hướng phát triển](#định-hướng-phát-triển)
- [Tác giả](#tác-giả)

---

## Tổng quan

Hệ thống tách một ứng dụng thương mại điện tử nguyên khối (monolith) thành năm dịch vụ backend độc lập cùng một ứng dụng web React. Mỗi dịch vụ:

- Sở hữu **một cơ sở dữ liệu PostgreSQL riêng** (database-per-service).
- Cung cấp **REST API** cho client.
- Giao tiếp với các dịch vụ khác **chỉ thông qua NATS** (không gọi HTTP trực tiếp, không dùng chung database).

Các chức năng chính: xác thực người dùng (JWT), quản lý sản phẩm/danh mục, giỏ hàng và đơn hàng, thanh toán trực tuyến qua [PayOS](https://payos.vn), và một **dịch vụ giám sát** tự xây để theo dõi sức khỏe hệ thống cùng log tập trung.

---

## Kiến trúc

```
                          ┌─────────────────────┐
                          │   Client (React)    │  :5173
                          └──────────┬──────────┘
                                     │  REST / HTTP (axios)
        ┌───────────┬────────────────┼────────────────┬──────────────────┐
        │           │                │                │                  │
 ┌──────▼─────┐ ┌───▼──────┐ ┌───────▼──────┐ ┌────────▼─────┐ ┌──────────▼─────────┐
 │   Auth     │ │ Product  │ │    Order     │ │   Payment    │ │   Observability    │
 │   :3002    │ │  :3003   │ │    :3004     │ │    :3005     │ │       :3010        │
 └──────┬─────┘ └───┬──────┘ └───────┬──────┘ └────────┬─────┘ └──────────▲─────────┘
        │           │                │                 │                  │
        └───────────┴────────┬───────┴─────────────────┴──────────────────┘
                             │   NATS + Hemera (RPC, pub/sub)  :4222
                       ┌─────▼─────┐
                       │   NATS    │
                       └───────────┘

   auth_db        product_db       order_db        payment_db
  (PostgreSQL)    (PostgreSQL)    (PostgreSQL)    (PostgreSQL)     ← mỗi dịch vụ một DB riêng
```

**Hai luồng giao tiếp:**

1. **Bắc–Nam (đồng bộ):** Trình duyệt → dịch vụ qua REST/HTTP.
2. **Đông–Tây (bất đồng bộ):** Dịch vụ → dịch vụ qua NATS theo mô hình request/reply. Một dịch vụ không bao giờ gọi trực tiếp HTTP endpoint hay database của dịch vụ khác.

---

## Các dịch vụ

| Dịch vụ | Cổng | Nhiệm vụ | Cơ sở dữ liệu | Tích hợp |
|---|---|---|---|---|
| **auth-service** | 3002 | Đăng ký, đăng nhập, cấp/làm mới JWT, Google OAuth, API key | `auth_db` | JWT (RS256), bcrypt |
| **product-service** | 3003 | Sản phẩm, biến thể, thuộc tính, thương hiệu, danh mục, tìm kiếm | `product_db` | Cloudinary, FlexSearch |
| **order-service** | 3004 | Giỏ hàng, đặt hàng, điều phối tồn kho | `order_db` | — |
| **payment-service** | 3005 | Khởi tạo, xác nhận, webhook thanh toán | `payment_db` | PayOS |
| **observability-service** | 3010 | Giám sát heartbeat + log request tập trung + dashboard | _(trong bộ nhớ)_ | — |
| **client** | 5173 | Giao diện khách hàng + trang quản trị (React SPA) | — | — |

---

## Công nghệ sử dụng

| Tầng | Công nghệ |
|---|---|
| Môi trường chạy | Node.js 24, TypeScript |
| Web framework | Express 5 |
| Giao tiếp giữa các dịch vụ | NATS + Hemera (`nats-hemera`) |
| Cơ sở dữ liệu | PostgreSQL 16 |
| ORM | Prisma |
| Xác thực | JSON Web Token (RS256, cặp khóa riêng cho từng người dùng), bcrypt |
| Frontend | React 19, Vite, TailwindCSS + shadcn/ui, Zustand, SWR, React Hook Form, Zod |
| Lưu trữ ảnh | Cloudinary |
| Thanh toán | PayOS |
| Trình quản lý gói | pnpm |

---

## Giao tiếp giữa các dịch vụ

Mỗi dịch vụ đăng ký các "hành động" (action) trên NATS, định danh bằng cặp `topic` + `cmd`, và gọi hành động từ xa qua `hemera.act(...)`. Cách này tách rời bên gọi khỏi vị trí mạng của bên được gọi.

```ts
// order-service yêu cầu product-service hoàn lại tồn kho cho một biến thể
await hemera.act({
  topic: "product",
  cmd: "increaseVariantStock",
  variantId,
  quantity,
});
```

Lợi ích trong hệ phân tán:

- **Tách rời (loose coupling)** — bên gọi định danh dịch vụ qua topic logic, không cần biết host/cổng.
- **Mở rộng theo chiều ngang** — nhiều bản (instance) của một dịch vụ cùng chia tải trên một subscription.
- **Khả năng chịu lỗi** — yêu cầu được broker đệm lại khi bên xử lý đang bận tạm thời.

---

## Nhất quán dữ liệu (Saga)

Vì mỗi dịch vụ sở hữu database riêng, các thao tác liên dịch vụ không thể dựa vào một transaction ACID duy nhất. Luồng đặt hàng/thanh toán sử dụng **mẫu Saga** với **hành động bù trừ (compensating action)**:

```
Đặt hàng ──► trừ tồn kho ──► thanh toán
                                  │
                    ┌─────────────┴──────────────┐
                THÀNH CÔNG                     THẤT BẠI
              đơn = PAID              hoàn kho + đơn = CANCELLED
                                      (giao dịch bù trừ)
```

Khi thanh toán thất bại, `order-service` phát message `increaseVariantStock` để hoàn lại tồn kho và đánh dấu đơn `CANCELLED`. Mốc thời gian `stockRestoredAt` đảm bảo việc bù trừ là **idempotent** (chỉ thực hiện đúng một lần).

---

## Giám sát (Observability)

Dịch vụ `observability-service` cung cấp theo dõi sức khỏe và truy vết cho hệ thống phân tán:

- **Heartbeat** — mỗi dịch vụ phát tín hiệu "còn sống" qua NATS sau mỗi `HEARTBEAT_INTERVAL_MS` (mặc định 10 giây). Bộ giám sát đánh dấu dịch vụ `DOWN` nếu quá `HEARTBEAT_TIMEOUT_MS` (mặc định 15 giây) không nhận được tín hiệu, và ghi log khi dịch vụ tự phục hồi.
- **Log request tập trung** — thông tin request (request ID, method, path, mã trạng thái, thời gian xử lý) được gửi qua NATS và lưu trong vùng đệm vòng (`MAX_OBSERVABILITY_LOGS`, mặc định 100).
- **Dashboard** — truy cập tại `http://localhost:3010`.

| Endpoint | Mô tả |
|---|---|
| `GET /` | Dashboard giám sát dạng HTML |
| `GET /api/services` | Ảnh chụp trạng thái sức khỏe các dịch vụ |
| `GET /api/logs` | Các log request gần đây |

---

## Yêu cầu môi trường

- **Node.js** ≥ 20 (phát triển trên 24.x)
- **pnpm** ≥ 9 (`npm install -g pnpm`)
- **PostgreSQL** 16 chạy local trên cổng `5432`
- **NATS server** ≥ 2.10 ([tải tại đây](https://github.com/nats-io/nats-server/releases)) — chỉ là một file binary ~15 MB, không cần Docker

---

## Hướng dẫn cài đặt & chạy

### 1. Clone & cấu hình

```bash
git clone <repository-url>
cd ecommerce-microservice
```

Tạo file `.env` trong mỗi dịch vụ backend (xem mục [Biến môi trường](#biến-môi-trường)).

### 2. Cài đặt phụ thuộc

```bash
# Chạy trong từng thư mục dịch vụ
pnpm install
```

Các dịch vụ: `auth-service`, `product-service`, `order-service`, `payment-service`, `observability-service`, `client`.

### 3. Thiết lập cơ sở dữ liệu (Prisma)

Với mỗi dịch vụ có database riêng (`auth-service`, `product-service`, `order-service`, `payment-service`):

```bash
pnpm prisma:generate
pnpm prisma:migrate:dev
```

### 4. Khởi động message broker

```bash
nats-server
```

> NATS phải chạy **trước** mọi dịch vụ.

### 5. Chạy các dịch vụ

Chạy mỗi dịch vụ trong một cửa sổ terminal riêng:

```bash
cd auth-service          && pnpm dev   # http://localhost:3002
cd product-service       && pnpm dev   # http://localhost:3003
cd order-service         && pnpm dev   # http://localhost:3004
cd payment-service       && pnpm dev   # http://localhost:3005
cd observability-service && pnpm dev   # http://localhost:3010
cd client                && pnpm dev   # http://localhost:5173
```

### 6. Kiểm tra

- Giao diện cửa hàng: <http://localhost:5173>
- Dashboard giám sát: <http://localhost:3010> — tất cả dịch vụ phải hiển thị `UP`.

---

## Biến môi trường

Mỗi dịch vụ được cấu hình qua file `.env` riêng.

### Dùng chung (mọi dịch vụ)

| Biến | Mô tả | Mặc định |
|---|---|---|
| `PORT` | Cổng HTTP | tùy dịch vụ |
| `NATS_URL` | Chuỗi kết nối NATS | `nats://localhost:4222` |
| `HEARTBEAT_INTERVAL_MS` | Chu kỳ phát heartbeat | `10000` |
| `NODE_ENV` | Tên môi trường | `development` |

### auth-service

| Biến | Mô tả |
|---|---|
| `DATABASE_URL` | Chuỗi kết nối PostgreSQL cho `auth_db` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |

### product-service

| Biến | Mô tả |
|---|---|
| `DATABASE_URL` | Chuỗi kết nối PostgreSQL cho `product_db` |
| `CLOUD_DINARY_NAME` | Tên cloud Cloudinary |
| `CLOUD_DINARY_KEY` | API key Cloudinary |
| `CLOUD_DINARY_SECRET` | API secret Cloudinary |

### order-service

| Biến | Mô tả |
|---|---|
| `DATABASE_URL` | Chuỗi kết nối PostgreSQL cho `order_db` |

### payment-service

| Biến | Mô tả |
|---|---|
| `DATABASE_URL` | Chuỗi kết nối PostgreSQL cho `payment_db` |
| `PAYOS_CLIENT_ID` | PayOS client ID |
| `PAYOS_API_KEY` | PayOS API key |
| `PAYOS_CHECKSUM_KEY` | PayOS checksum key |
| `PAYOS_RETURN_URL` | URL chuyển hướng sau khi thanh toán thành công |
| `PAYOS_CANCEL_URL` | URL chuyển hướng sau khi hủy thanh toán |

### observability-service

| Biến | Mô tả | Mặc định |
|---|---|---|
| `HEARTBEAT_TIMEOUT_MS` | Đánh dấu `DOWN` sau khoảng thời gian này | `15000` |
| `HEARTBEAT_SWEEP_MS` | Chu kỳ quét kiểm tra sức khỏe | `20000` |
| `MAX_OBSERVABILITY_LOGS` | Số log lưu giữ | `100` |

### client

| Biến | Mô tả |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (phía frontend) |

> **Ví dụ `DATABASE_URL`:** `postgresql://postgres:<mật_khẩu>@localhost:5432/auth_db`

---

## Tài liệu API

Base URL theo dạng `http://localhost:<cổng>`.

### Auth — `/api/auths` (:3002)

| Method | Đường dẫn | Mô tả |
|---|---|---|
| `POST` | `/register` | Tạo tài khoản |
| `POST` | `/login` | Đăng nhập bằng email/mật khẩu |
| `POST` | `/google` | Đăng nhập bằng Google OAuth |
| `GET` | `/me` | Thông tin người dùng hiện tại |
| `GET` | `/refresh` | Làm mới access token |
| `GET` | `/logout` | Đăng xuất / hủy phiên |

### Products — `/api/products` (:3003)

| Method | Đường dẫn | Mô tả |
|---|---|---|
| `GET` | `/` | Danh sách sản phẩm |
| `GET` | `/:id` | Chi tiết sản phẩm |
| `POST` | `/` | Tạo sản phẩm |
| `POST` | `/upload` | Tải ảnh sản phẩm |
| `POST` | `/:id/variants` | Thêm biến thể |
| `PATCH` | `/:id/variants/:variantId` | Cập nhật biến thể |
| `POST` | `/:id/variants/:variantId/attributes` | Thêm thuộc tính cho biến thể |
| `PATCH` | `/:id` | Cập nhật sản phẩm |
| `DELETE` | `/:id` | Xóa sản phẩm |

> Ngoài ra còn cung cấp `/api/categories` và `/api/brands`.

### Cart — `/api/carts` (:3004)

| Method | Đường dẫn | Mô tả |
|---|---|---|
| `GET` | `/` | Lấy giỏ hàng hiện tại |
| `POST` | `/` | Thêm sản phẩm vào giỏ |
| `PATCH` | `/:id` | Cập nhật món trong giỏ |
| `DELETE` | `/:id` | Xóa món khỏi giỏ |

### Orders — `/api/orders` (:3004)

| Method | Đường dẫn | Mô tả |
|---|---|---|
| `POST` | `/checkout/preview` | Xem trước tổng tiền trước khi đặt |
| `POST` | `/` | Đặt hàng |
| `GET` | `/me` | Đơn hàng của người dùng hiện tại |
| `GET` | `/` | Danh sách đơn hàng (quản trị) |
| `PATCH` | `/:id` | Cập nhật trạng thái đơn |

### Payment — `/api/payment` (:3005)

| Method | Đường dẫn | Mô tả |
|---|---|---|
| `POST` | `/:orderId` | Tạo liên kết thanh toán cho đơn hàng |
| `POST` | `/confirm` | Xác nhận thanh toán |
| `POST` | `/webhook` | Callback webhook từ PayOS |
| `GET` | `/:orderId/status` | Truy vấn trạng thái thanh toán |

---

## Cấu trúc dự án

```
ecommerce-microservice/
├── auth-service/            # Xác thực & định danh
├── product-service/         # Danh mục, biến thể, tìm kiếm, ảnh
├── order-service/           # Giỏ hàng & đơn hàng, điều phối tồn kho
├── payment-service/         # Tích hợp thanh toán PayOS
├── observability-service/   # Giám sát heartbeat + dashboard log
├── client/                  # React SPA (cửa hàng + quản trị)
└── docker-compose.yml       # Tùy chọn: Postgres + NATS qua container
```

Mỗi dịch vụ backend tuân theo một bố cục thống nhất:

```
src/
├── actions/        # Handler hành động NATS/Hemera (API Đông–Tây)
├── controllers/    # Xử lý request HTTP
├── routes/         # Định nghĩa route Express
├── services/       # Logic nghiệp vụ
├── middlewares/    # Xác thực, kiểm tra dữ liệu, xử lý lỗi, ghi log request
├── schemas/        # Schema kiểm tra dữ liệu bằng Zod
├── observability/  # Bộ phát heartbeat
├── configs/        # Prisma, NATS/Hemera, client bên thứ ba
└── server.ts       # Điểm khởi chạy dịch vụ
```

---

## Định hướng phát triển

- [ ] **API Gateway** làm điểm vào duy nhất cho client.
- [ ] Lưu trữ log/metrics giám sát (ví dụ Prometheus + Grafana) thay cho lưu trong bộ nhớ.
- [ ] Đóng gói container & điều phối (Docker Compose / Kubernetes) cho toàn bộ dịch vụ.
- [ ] Bộ kiểm thử tự động và pipeline CI.
- [ ] Quản lý cấu hình và bí mật (secrets) tập trung.

---

## Tác giả

**Nguyễn Kiếm Mạnh** — Đồ án môn Ứng dụng Phân tán (UDPT).

---

> README này mô tả một đồ án minh họa các nguyên lý microservices và hệ phân tán: tách dịch vụ, giao tiếp qua message broker, database-per-service, mẫu Saga, và giám sát tập trung.
