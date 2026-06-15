export const renderDashboard = () => `<!doctype html>
<html lang="vi">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Dịch vụ quan sát microservice</title>
    <style>
        :root {
            color-scheme: light;
            --bg: #f6f7f9;
            --panel: #ffffff;
            --panel-border: #dde3ea;
            --text: #17202a;
            --muted: #667085;
            --green: #087443;
            --green-bg: #dcfae6;
            --red: #b42318;
            --red-bg: #fee4e2;
            --amber: #b54708;
            --amber-bg: #fef0c7;
            --blue: #175cd3;
            --blue-bg: #dbeafe;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            background: var(--bg);
            color: var(--text);
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .shell {
            width: min(1180px, calc(100vw - 32px));
            margin: 0 auto;
            padding: 28px 0 36px;
        }

        header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 18px;
            margin-bottom: 22px;
        }

        h1 {
            margin: 0;
            font-size: 28px;
            line-height: 1.15;
            font-weight: 720;
            letter-spacing: 0;
        }

        .subtitle {
            margin: 8px 0 0;
            color: var(--muted);
            font-size: 14px;
        }

        .toolbar {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: flex-end;
        }

        .pill {
            display: inline-flex;
            align-items: center;
            min-height: 32px;
            padding: 0 12px;
            border: 1px solid var(--panel-border);
            border-radius: 999px;
            background: var(--panel);
            color: var(--muted);
            font-size: 13px;
            font-weight: 600;
            white-space: nowrap;
        }

        .summary {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
            margin-bottom: 16px;
        }

        .metric {
            border: 1px solid var(--panel-border);
            border-radius: 8px;
            background: var(--panel);
            padding: 14px 16px;
            min-height: 84px;
        }

        .metric-label {
            color: var(--muted);
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
        }

        .metric-value {
            margin-top: 8px;
            font-size: 26px;
            line-height: 1;
            font-weight: 760;
        }

        .grid {
            display: grid;
            grid-template-columns: 0.9fr 1.4fr;
            gap: 16px;
            align-items: start;
        }

        section {
            border: 1px solid var(--panel-border);
            border-radius: 8px;
            background: var(--panel);
            overflow: hidden;
        }

        .section-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 14px 16px;
            border-bottom: 1px solid var(--panel-border);
        }

        h2 {
            margin: 0;
            font-size: 15px;
            font-weight: 720;
            letter-spacing: 0;
        }

        .muted {
            color: var(--muted);
            font-size: 13px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        th,
        td {
            padding: 12px 16px;
            border-bottom: 1px solid #edf1f5;
            text-align: left;
            font-size: 13px;
            vertical-align: middle;
        }

        th {
            color: var(--muted);
            font-size: 11px;
            font-weight: 760;
            text-transform: uppercase;
            background: #fbfcfd;
        }

        tr:last-child td {
            border-bottom: 0;
        }

        .service-name,
        .path,
        .request-id {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .service-name {
            font-weight: 700;
        }

        .status,
        .code {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 58px;
            height: 26px;
            border-radius: 999px;
            padding: 0 10px;
            font-size: 12px;
            font-weight: 760;
        }

        .up,
        .ok {
            background: var(--green-bg);
            color: var(--green);
        }

        .down,
        .error {
            background: var(--red-bg);
            color: var(--red);
        }

        .warn {
            background: var(--amber-bg);
            color: var(--amber);
        }

        .info {
            background: var(--blue-bg);
            color: var(--blue);
        }

        .method {
            font-weight: 760;
            color: #344054;
        }

        .empty {
            padding: 28px 16px;
            text-align: center;
            color: var(--muted);
            font-size: 14px;
        }

        @media (max-width: 860px) {
            header {
                display: block;
            }

            .toolbar {
                justify-content: flex-start;
                margin-top: 14px;
            }

            .summary {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 560px) {
            .shell {
                width: min(100vw - 20px, 1180px);
                padding-top: 18px;
            }

            h1 {
                font-size: 23px;
            }

            .summary {
                grid-template-columns: 1fr;
            }

            th,
            td {
                padding: 10px 12px;
            }
        }
    </style>
</head>
<body>
    <main class="shell">
        <header>
            <div>
                <h1>Dịch vụ quan sát</h1>
            </div>
            <div class="toolbar">
                <span class="pill" id="last-updated">Đang chờ dữ liệu</span>
                <span class="pill">Tự cập nhật 2 giây</span>
            </div>
        </header>

        <div class="summary">
            <div class="metric">
                <div class="metric-label">Dịch vụ</div>
                <div class="metric-value" id="metric-total">0</div>
            </div>
            <div class="metric">
                <div class="metric-label">Đang bật</div>
                <div class="metric-value" id="metric-up">0</div>
            </div>
            <div class="metric">
                <div class="metric-label">Đang tắt</div>
                <div class="metric-value" id="metric-down">0</div>
            </div>
            <div class="metric">
                <div class="metric-label">Độ trễ trung bình</div>
                <div class="metric-value" id="metric-latency">-</div>
            </div>
        </div>

        <div class="grid">
            <section>
                <div class="section-head">
                    <h2>Dịch vụ</h2>
                    <span class="muted" id="service-count">0 dịch vụ</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 45%">Dịch vụ</th>
                            <th style="width: 22%">Trạng thái</th>
                            <th style="width: 33%">Lần cuối</th>
                        </tr>
                    </thead>
                    <tbody id="services-body">
                        <tr><td colspan="3" class="empty">Chưa nhận được tín hiệu heartbeat.</td></tr>
                    </tbody>
                </table>
            </section>

            <section>
                <div class="section-head">
                    <h2>Yêu cầu gần đây</h2>
                    <span class="muted" id="log-count">0 bản ghi</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 11%">Mã</th>
                            <th style="width: 12%">Phương thức</th>
                            <th style="width: 22%">Dịch vụ</th>
                            <th style="width: 37%">Đường dẫn</th>
                            <th style="width: 18%">Độ trễ</th>
                        </tr>
                    </thead>
                    <tbody id="logs-body">
                        <tr><td colspan="5" class="empty">Chưa nhận được log request nào.</td></tr>
                    </tbody>
                </table>
            </section>
        </div>
    </main>

    <script>
        const servicesBody = document.getElementById('services-body');
        const logsBody = document.getElementById('logs-body');
        const serviceCount = document.getElementById('service-count');
        const logCount = document.getElementById('log-count');
        const lastUpdated = document.getElementById('last-updated');
        const metricTotal = document.getElementById('metric-total');
        const metricUp = document.getElementById('metric-up');
        const metricDown = document.getElementById('metric-down');
        const metricLatency = document.getElementById('metric-latency');

        function formatAgo(ms) {
            if (!Number.isFinite(ms)) return '-';
            if (ms < 1000) return 'vừa nãy';
            const seconds = Math.round(ms / 1000);
            if (seconds < 60) return seconds + 's trước';
            const minutes = Math.round(seconds / 60);
            return minutes + 'm trước';
        }

        function statusClass(statusCode) {
            if (!statusCode) return 'info';
            if (statusCode >= 500) return 'error';
            if (statusCode >= 400) return 'warn';
            if (statusCode >= 300) return 'info';
            return 'ok';
        }

        function textCell(value, className) {
            const td = document.createElement('td');
            if (className) td.className = className;
            td.textContent = value || '-';
            return td;
        }

        function renderServices(services) {
            servicesBody.textContent = '';
            serviceCount.textContent = services.length + ' dịch vụ';
            metricTotal.textContent = services.length;

            const up = services.filter((service) => service.status === 'UP').length;
            const down = services.filter((service) => service.status === 'DOWN').length;
            metricUp.textContent = up;
            metricDown.textContent = down;

            if (!services.length) {
                servicesBody.innerHTML = '<tr><td colspan="3" class="empty">Chưa nhận được tín hiệu heartbeat.</td></tr>';
                return;
            }

            services
                .sort((a, b) => a.service.localeCompare(b.service))
                .forEach((service) => {
                    const tr = document.createElement('tr');
                    const status = document.createElement('span');
                    status.className = 'status ' + (service.status === 'UP' ? 'up' : 'down');
                    status.textContent = service.status === 'UP' ? 'Bật' : 'Tắt';

                    const statusTd = document.createElement('td');
                    statusTd.appendChild(status);

                    tr.appendChild(textCell(service.service, 'service-name'));
                    tr.appendChild(statusTd);
                    tr.appendChild(textCell(formatAgo(service.lastSeenAgoMs)));
                    servicesBody.appendChild(tr);
                });
        }

        function renderLogs(logs) {
            logsBody.textContent = '';
            logCount.textContent = logs.length + ' bản ghi';

            const latencyLogs = logs.filter((log) => Number.isFinite(log.durationMs));
            if (latencyLogs.length) {
                const avg = Math.round(latencyLogs.reduce((sum, log) => sum + log.durationMs, 0) / latencyLogs.length);
                metricLatency.textContent = avg + 'ms';
            } else {
                metricLatency.textContent = '-';
            }

            if (!logs.length) {
                logsBody.innerHTML = '<tr><td colspan="5" class="empty">Chưa nhận được log request nào.</td></tr>';
                return;
            }

            logs.slice(0, 25).forEach((log) => {
                const tr = document.createElement('tr');
                const code = document.createElement('span');
                code.className = 'code ' + statusClass(log.statusCode);
                code.textContent = log.statusCode || '-';

                const codeTd = document.createElement('td');
                codeTd.appendChild(code);

                tr.appendChild(codeTd);
                tr.appendChild(textCell(log.method, 'method'));
                tr.appendChild(textCell(log.service, 'service-name'));
                tr.appendChild(textCell(log.path, 'path'));
                tr.appendChild(textCell(Number.isFinite(log.durationMs) ? log.durationMs + 'ms' : '-'));
                logsBody.appendChild(tr);
            });
        }

        async function refresh() {
            try {
                const [servicesRes, logsRes] = await Promise.all([
                    fetch('/api/services'),
                    fetch('/api/logs'),
                ]);
                const servicesJson = await servicesRes.json();
                const logsJson = await logsRes.json();

                renderServices(servicesJson.services || []);
                renderLogs(logsJson.logs || []);
                lastUpdated.textContent = 'Cập nhật lúc ' + new Date().toLocaleTimeString('vi-VN');
            } catch (error) {
                lastUpdated.textContent = 'Lỗi kết nối';
            }
        }

        refresh();
        setInterval(refresh, 2000);
    </script>
</body>
</html>`;