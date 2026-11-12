/* Thư viện biển báo vẽ bằng SVG (đơn giản hoá, mang tính minh hoạ).
 * Mỗi biển: { id, code, name, group, desc, svg } */
(function () {
  const RED = '#d32f2f', BLUE = '#1565c0', YEL = '#ffcc00', BLK = '#111';

  const wrap = (inner) =>
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img">${inner}</svg>`;

  // ---- Khung biển ----
  const prohib = (c = '', bg = '#fff') =>
    `<circle cx="50" cy="50" r="45" fill="${bg}" stroke="${RED}" stroke-width="9"/>${c}`;
  const slash = `<line x1="20" y1="20" x2="80" y2="80" stroke="${RED}" stroke-width="8"/>`;
  const warn = (c = '') =>
    `<polygon points="50,7 95,88 5,88" fill="${YEL}" stroke="${RED}" stroke-width="7" stroke-linejoin="round"/>${c}`;
  const mand = (c = '') => `<circle cx="50" cy="50" r="46" fill="${BLUE}" stroke="#fff" stroke-width="2"/>${c}`;
  const info = (c = '') => `<rect x="6" y="6" width="88" height="88" rx="8" fill="${BLUE}" stroke="#fff" stroke-width="3"/>${c}`;
  const text = (t, size = 34, fill = BLK, y = 62) =>
    `<text x="50" y="${y}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${size}" text-anchor="middle" fill="${fill}">${t}</text>`;

  // ---- Hình vẽ ----
  const car = (f = BLK, s = 1, tx = 0, ty = 0) =>
    `<g transform="translate(${tx} ${ty}) scale(${s})" fill="${f}">
      <path d="M22 56 L28 44 Q30 40 35 40 L63 40 Q68 40 71 44 L77 54 L80 56 Q82 57 82 60 L82 64 L18 64 L18 60 Q18 57 22 56 Z"/>
      <rect x="31" y="44" width="16" height="9" fill="#fff" rx="1"/><rect x="51" y="44" width="16" height="9" fill="#fff" rx="1"/>
      <circle cx="32" cy="65" r="6"/><circle cx="68" cy="65" r="6"/>
    </g>`;
  const truck = (f = BLK) =>
    `<g fill="${f}">
      <rect x="18" y="34" width="44" height="26" rx="1"/>
      <path d="M64 42 L74 42 L82 52 L82 60 L64 60 Z"/>
      <rect x="68" y="45" width="7" height="6" fill="#fff"/>
      <circle cx="30" cy="63" r="6"/><circle cx="44" cy="63" r="6"/><circle cx="72" cy="63" r="6"/>
    </g>`;
  const arrowUp = (f) =>
    `<path d="M50 18 L70 40 L57 40 L57 82 L43 82 L43 40 L30 40 Z" fill="${f}"/>`;
  const walker = (f = BLK, tx = 0, ty = 0, s = 1) =>
    `<g transform="translate(${tx} ${ty}) scale(${s})" stroke="${f}" stroke-width="6" stroke-linecap="round" fill="none">
      <circle cx="52" cy="26" r="6" fill="${f}" stroke="none"/>
      <path d="M50 36 L46 56"/><path d="M48 40 L36 50"/><path d="M50 40 L60 50"/>
      <path d="M46 56 L36 72"/><path d="M46 56 L56 70"/>
    </g>`;

  const motorbike =
    `<g fill="none" stroke="${BLK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="29" cy="62" r="10"/><circle cx="71" cy="62" r="10"/>
      <path d="M29 62 L44 48 L62 48 L71 62"/><path d="M62 48 L66 36 L74 36"/></g>
     <rect x="38" y="40" width="20" height="8" rx="3" fill="${BLK}"/>`;
  const rearCar = (x, f) =>
    `<g fill="${f}"><rect x="${x - 9}" y="33" width="18" height="12" rx="3"/><rect x="${x - 13}" y="43" width="26" height="15" rx="3"/>
      <rect x="${x - 12}" y="57" width="6" height="7" rx="1"/><rect x="${x + 6}" y="57" width="6" height="7" rx="1"/></g>`;
  const endLines = [-16, -8, 0, 8, 16].map((d) => {
    const cx = 50 + d * 0.707, cy = 50 + d * 0.707;
    return `<line x1="${cx - 21}" y1="${cy + 21}" x2="${cx + 21}" y2="${cy - 21}" stroke="${BLK}" stroke-width="2.5"/>`;
  }).join('');
  const roundabout = [0, 1, 2].map((k) => {
    const r = 24, t0 = ((k * 120 + 15) * Math.PI) / 180, t1 = ((k * 120 + 95) * Math.PI) / 180;
    const P = (t) => [50 + r * Math.cos(t), 50 - r * Math.sin(t)];
    const [x0, y0] = P(t0), [x1, y1] = P(t1);
    const tx = -Math.sin(t1), ty = -Math.cos(t1), nx = Math.cos(t1), ny = -Math.sin(t1);
    const f = (v) => v.toFixed(1);
    return `<path d="M${f(x0)} ${f(y0)} A${r} ${r} 0 0 0 ${f(x1)} ${f(y1)}" fill="none" stroke="#fff" stroke-width="7"/>` +
      `<polygon points="${f(x1 + tx * 10)},${f(y1 + ty * 10)} ${f(x1 + nx * 8)},${f(y1 + ny * 8)} ${f(x1 - nx * 8)},${f(y1 - ny * 8)}" fill="#fff"/>`;
  }).join('');
  const houses =
    `<rect x="4" y="20" width="92" height="60" rx="4" fill="#fff" stroke="${BLK}" stroke-width="3"/>
     <g fill="${BLK}"><polygon points="14,70 14,50 24,40 34,50 34,70"/><polygon points="38,70 38,44 50,32 62,44 62,70"/><polygon points="66,70 66,52 76,42 86,52 86,70"/></g>`;

  const S = [
    // ===== Biển báo cấm =====
    { id: 'P101', code: 'P.101', group: 'cam', name: 'Đường cấm',
      desc: 'Cấm tất cả các loại phương tiện đi lại cả hai hướng, trừ xe ưu tiên theo quy định.',
      svg: wrap(prohib()) },
    { id: 'P102', code: 'P.102', group: 'cam', name: 'Cấm đi ngược chiều',
      desc: 'Cấm các loại xe đi vào theo chiều đặt biển, trừ xe ưu tiên.',
      svg: wrap(`<circle cx="50" cy="50" r="46" fill="${RED}"/><rect x="18" y="42" width="64" height="16" fill="#fff"/>`) },
    { id: 'P103a', code: 'P.103a', group: 'cam', name: 'Cấm xe ô tô',
      desc: 'Cấm các loại xe cơ giới kể cả xe máy 3 bánh có thùng đi qua, trừ xe máy 2 bánh, xe gắn máy và xe ưu tiên.',
      svg: wrap(prohib(car(BLK, 0.82, 9, 6))) },
    { id: 'P106a', code: 'P.106a', group: 'cam', name: 'Cấm xe ô tô tải',
      desc: 'Cấm các loại xe ô tô tải đi qua (kể cả máy kéo, xe máy chuyên dùng), trừ xe ưu tiên.',
      svg: wrap(prohib(`<g transform="translate(6 4) scale(.88)">${truck()}</g>`)) },
    { id: 'P115', code: 'P.115', group: 'cam', name: 'Hạn chế khối lượng toàn bộ xe',
      desc: 'Cấm các xe có khối lượng toàn bộ (xe + hàng) vượt quá trị số ghi trên biển đi qua.',
      svg: wrap(prohib(text('10t', 32))) },
    { id: 'P117', code: 'P.117', group: 'cam', name: 'Hạn chế chiều cao',
      desc: 'Cấm các xe có chiều cao (kể cả hàng) vượt quá trị số ghi trên biển đi qua.',
      svg: wrap(prohib(`<polygon points="42,18 58,18 50,28" fill="${BLK}"/><polygon points="42,82 58,82 50,72" fill="${BLK}"/>${text('3,5m', 24, BLK, 59)}`)) },
    { id: 'P123a', code: 'P.123a', group: 'cam', name: 'Cấm rẽ trái',
      desc: 'Cấm các loại xe rẽ trái tại nơi đường giao nhau (không cấm quay đầu).',
      svg: wrap(prohib(`<path d="M60 82 L60 50 Q60 40 50 40 L38 40 L38 30 L22 45 L38 60 L38 50 L48 50 Q50 50 50 52 L50 82 Z" fill="${BLK}"/>` + slash)) },
    { id: 'P124a', code: 'P.124a', group: 'cam', name: 'Cấm quay đầu xe',
      desc: 'Cấm các loại xe quay đầu (theo kiểu chữ U); không cấm rẽ trái.',
      svg: wrap(prohib(`<path d="M62 80 L62 42 Q62 26 48 26 Q34 26 34 42 L34 56" fill="none" stroke="${BLK}" stroke-width="9"/><polygon points="22,54 46,54 34,72" fill="${BLK}"/>` + slash)) },
    { id: 'P127', code: 'P.127', group: 'cam', name: 'Tốc độ tối đa cho phép',
      desc: 'Cấm các loại xe chạy quá tốc độ ghi trên biển (km/h), trừ xe ưu tiên.',
      svg: wrap(prohib(text('50', 40, BLK, 64))) },
    { id: 'P128', code: 'P.128', group: 'cam', name: 'Cấm sử dụng còi',
      desc: 'Cấm các loại xe sử dụng còi trong phạm vi đặt biển.',
      svg: wrap(prohib(`<path d="M26 44 L40 44 L66 30 L66 70 L40 56 L26 56 Z" fill="${BLK}"/>` + slash)) },
    { id: 'P130', code: 'P.130', group: 'cam', name: 'Cấm dừng xe và đỗ xe',
      desc: 'Cấm các loại xe dừng và đỗ ở phía đường có đặt biển (trừ xe ưu tiên).',
      svg: wrap(prohib(`<line x1="20" y1="20" x2="80" y2="80" stroke="${RED}" stroke-width="8"/><line x1="80" y1="20" x2="20" y2="80" stroke="${RED}" stroke-width="8"/>`, BLUE)) },
    { id: 'P131a', code: 'P.131a', group: 'cam', name: 'Cấm đỗ xe',
      desc: 'Cấm các loại xe đỗ ở phía đường có đặt biển; được phép dừng xe.',
      svg: wrap(prohib(slash, BLUE)) },

    // ===== Biển hiệu lệnh =====
    { id: 'R122', code: 'R.122', group: 'hieulenh', name: 'Dừng lại (STOP)',
      desc: 'Các xe phải dừng lại trước vạch dừng, quan sát và chỉ được đi khi đảm bảo an toàn, nhường đường.',
      svg: wrap(`<polygon points="30,4 70,4 96,30 96,70 70,96 30,96 4,70 4,30" fill="${RED}" stroke="#fff" stroke-width="3"/>${text('STOP', 26, '#fff', 59)}`) },
    { id: 'R301a', code: 'R.301a', group: 'hieulenh', name: 'Các xe chỉ được đi thẳng',
      desc: 'Các loại xe chỉ được đi thẳng (trừ xe ưu tiên).',
      svg: wrap(mand(arrowUp('#fff'))) },
    { id: 'R302a', code: 'R.302a', group: 'hieulenh', name: 'Hướng phải đi vòng chướng ngại vật sang phải',
      desc: 'Báo các loại xe phải đi vòng sang phía bên phải chướng ngại vật.',
      svg: wrap(mand(`<g transform="rotate(135 50 50)">${arrowUp('#fff')}</g>`)) },
    { id: 'R306', code: 'R.306', group: 'hieulenh', name: 'Tốc độ tối thiểu cho phép',
      desc: 'Xe cơ giới phải chạy với tốc độ không nhỏ hơn trị số ghi trên biển.',
      svg: wrap(mand(text('30', 40, '#fff', 64))) },

    // ===== Biển nguy hiểm =====
    { id: 'W201a', code: 'W.201a', group: 'nguyhiem', name: 'Chỗ ngoặt nguy hiểm vòng bên trái',
      desc: 'Báo trước sắp đến chỗ ngoặt nguy hiểm vòng bên trái; giảm tốc độ, đi đúng phần đường.',
      svg: wrap(warn(`<path d="M57 78 L57 58 Q57 48 47 48 L40 48" fill="none" stroke="${BLK}" stroke-width="8"/><polygon points="41,38 28,48 41,58" fill="${BLK}"/>`)) },
    { id: 'W208', code: 'W.208', group: 'nguyhiem', name: 'Giao nhau với đường ưu tiên',
      desc: 'Báo trước sắp đến nơi giao nhau với đường ưu tiên; xe trên đường không ưu tiên phải nhường đường.',
      svg: wrap(`<polygon points="5,10 95,10 50,93" fill="#fff" stroke="${RED}" stroke-width="8" stroke-linejoin="round"/>`) },
    { id: 'W210', code: 'W.210', group: 'nguyhiem', name: 'Giao nhau với đường sắt có rào chắn',
      desc: 'Báo trước sắp đến chỗ giao nhau với đường sắt có rào chắn kín hoặc nửa kín và có người gác.',
      svg: wrap(warn(`<g fill="${BLK}"><rect x="30" y="44" width="5" height="34"/><rect x="65" y="44" width="5" height="34"/><rect x="24" y="50" width="52" height="6"/><rect x="24" y="64" width="52" height="6"/></g>`)) },
    { id: 'W224', code: 'W.224', group: 'nguyhiem', name: 'Đường người đi bộ cắt ngang',
      desc: 'Báo trước sắp đến phần đường dành cho người đi bộ sang ngang; giảm tốc độ, nhường đường.',
      svg: wrap(warn(walker(BLK, 13, 22, 0.75) + `<g fill="${BLK}"><rect x="24" y="78" width="8" height="5"/><rect x="38" y="78" width="8" height="5"/><rect x="52" y="78" width="8" height="5"/><rect x="66" y="78" width="8" height="5"/></g>`)) },
    { id: 'W245a', code: 'W.245a', group: 'nguyhiem', name: 'Đi chậm',
      desc: 'Nhắc người lái xe giảm tốc độ, đi chậm.',
      svg: wrap(warn(text('Đi chậm', 15, BLK, 74))) },

    // ===== Biển chỉ dẫn =====
    { id: 'I401', code: 'I.401', group: 'chidan', name: 'Bắt đầu đường ưu tiên',
      desc: 'Báo bắt đầu đoạn đường ưu tiên; xe đi trên đường này được ưu tiên đi trước tại nơi giao nhau.',
      svg: wrap(`<polygon points="50,4 96,50 50,96 4,50" fill="#fff" stroke="${BLK}" stroke-width="2"/><polygon points="50,18 82,50 50,82 18,50" fill="${YEL}"/>`) },
    { id: 'I402', code: 'I.402', group: 'chidan', name: 'Hết đoạn đường ưu tiên',
      desc: 'Báo hết đoạn đường ưu tiên; tại nơi giao nhau phải tuân theo quy tắc nhường đường thông thường.',
      svg: wrap(`<polygon points="50,4 96,50 50,96 4,50" fill="#fff" stroke="${BLK}" stroke-width="2"/><polygon points="50,18 82,50 50,82 18,50" fill="${YEL}"/><line x1="26" y1="74" x2="74" y2="26" stroke="${BLK}" stroke-width="8"/>`) },
    { id: 'I407a', code: 'I.407a', group: 'chidan', name: 'Đường một chiều',
      desc: 'Chỉ dẫn những đoạn đường chạy một chiều; chỉ cho phép xe đi theo chiều mũi tên.',
      svg: wrap(info(arrowUp('#fff'))) },
    { id: 'I408', code: 'I.408', group: 'chidan', name: 'Nơi đỗ xe',
      desc: 'Chỉ dẫn những nơi được phép đỗ xe.',
      svg: wrap(info(text('P', 64, '#fff', 74))) },
    { id: 'I423', code: 'I.423', group: 'chidan', name: 'Đường người đi bộ sang ngang',
      desc: 'Chỉ dẫn vị trí dành cho người đi bộ sang ngang đường.',
      svg: wrap(info(`<polygon points="50,14 88,84 12,84" fill="#fff"/>` + walker(BLK, 18, 28, 0.62))) },
    // ===== Bổ sung =====
    { id: 'P104', code: 'P.104', group: 'cam', name: 'Cấm xe máy',
      desc: 'Cấm xe mô tô và xe gắn máy đi qua, trừ xe ưu tiên.',
      svg: wrap(prohib(motorbike)) },
    { id: 'P112', code: 'P.112', group: 'cam', name: 'Cấm người đi bộ',
      desc: 'Cấm người đi bộ qua lại.',
      svg: wrap(prohib(walker(BLK, 0, 4))) },
    { id: 'P118', code: 'P.118', group: 'cam', name: 'Hạn chế chiều ngang xe',
      desc: 'Cấm các xe có chiều ngang (kể cả hàng) vượt quá trị số ghi trên biển đi qua.',
      svg: wrap(prohib(`<polygon points="15,42 25,50 15,58" fill="${BLK}"/><polygon points="85,42 75,50 85,58" fill="${BLK}"/>${text('2,5m', 19, BLK, 57)}`)) },
    { id: 'P123b', code: 'P.123b', group: 'cam', name: 'Cấm rẽ phải',
      desc: 'Cấm các loại xe rẽ phải tại nơi đường giao nhau.',
      svg: wrap(prohib(`<g transform="translate(100 0) scale(-1 1)"><path d="M60 82 L60 50 Q60 40 50 40 L38 40 L38 30 L22 45 L38 60 L38 50 L48 50 Q50 50 50 52 L50 82 Z" fill="${BLK}"/></g>` + slash)) },
    { id: 'P125', code: 'P.125', group: 'cam', name: 'Cấm vượt',
      desc: 'Cấm các xe cơ giới vượt nhau; được vượt xe mô tô hai bánh, xe gắn máy.',
      svg: wrap(prohib(rearCar(35, RED) + rearCar(65, BLK))) },
    { id: 'P136', code: 'P.136', group: 'cam', name: 'Cấm đi thẳng',
      desc: 'Cấm các loại xe đi thẳng, chỉ được rẽ trái hoặc rẽ phải.',
      svg: wrap(prohib(`<g transform="translate(10 10) scale(.8)">${arrowUp(BLK)}</g>` + slash)) },
    { id: 'DP127', code: 'DP.127', group: 'cam', name: 'Hết tốc độ tối đa cho phép',
      desc: 'Báo hết đoạn đường hạn chế tốc độ tối đa; áp dụng tốc độ theo quy định chung.',
      svg: wrap(`<circle cx="50" cy="50" r="45" fill="#fff" stroke="#666" stroke-width="3"/>${text('50', 38, '#888', 63)}${endLines}`) },
    { id: 'DP135', code: 'DP.135', group: 'cam', name: 'Hết tất cả các lệnh cấm',
      desc: 'Báo hết đoạn đường áp dụng các biển cấm đặt trước đó.',
      svg: wrap(`<circle cx="50" cy="50" r="45" fill="#fff" stroke="#666" stroke-width="3"/>${endLines}`) },

    { id: 'R302b', code: 'R.302b', group: 'hieulenh', name: 'Hướng phải đi vòng chướng ngại vật sang trái',
      desc: 'Báo các loại xe phải đi vòng sang phía bên trái chướng ngại vật.',
      svg: wrap(mand(`<g transform="rotate(-135 50 50)">${arrowUp('#fff')}</g>`)) },
    { id: 'R303', code: 'R.303', group: 'hieulenh', name: 'Nơi giao nhau chạy theo vòng xuyến',
      desc: 'Các xe phải đi vòng xuyến theo chiều mũi tên; nhường đường cho xe đi đến từ bên trái.',
      svg: wrap(mand(roundabout)) },
    { id: 'R307', code: 'R.307', group: 'hieulenh', name: 'Hết hạn chế tốc độ tối thiểu',
      desc: 'Báo hết đoạn đường áp dụng tốc độ tối thiểu.',
      svg: wrap(mand(text('30', 40, '#fff', 64) + `<line x1="80" y1="20" x2="20" y2="80" stroke="${RED}" stroke-width="7"/>`)) },
    { id: 'R420', code: 'R.420', group: 'hieulenh', name: 'Bắt đầu khu đông dân cư',
      desc: 'Bắt đầu khu đông dân cư; áp dụng tốc độ tối đa và các quy định trong khu đông dân cư.',
      svg: wrap(houses) },
    { id: 'R421', code: 'R.421', group: 'hieulenh', name: 'Hết khu đông dân cư',
      desc: 'Hết khu đông dân cư; áp dụng tốc độ và quy định ngoài khu đông dân cư.',
      svg: wrap(houses + `<line x1="10" y1="78" x2="90" y2="22" stroke="${RED}" stroke-width="6"/>`) },

    { id: 'W202a', code: 'W.202a', group: 'nguyhiem', name: 'Nhiều chỗ ngoặt nguy hiểm liên tiếp (đầu tiên vòng trái)',
      desc: 'Báo trước nhiều chỗ ngoặt liên tiếp, chỗ đầu tiên vòng sang trái.',
      svg: wrap(warn(`<path d="M56 84 C56 72 42 72 42 62 C42 52 58 52 58 46" fill="none" stroke="${BLK}" stroke-width="7"/><polygon points="50,47 58,33 66,47" fill="${BLK}"/>`)) },
    { id: 'W203b', code: 'W.203b', group: 'nguyhiem', name: 'Đường bị hẹp về phía phải',
      desc: 'Báo trước đoạn đường bị thu hẹp về phía bên phải.',
      svg: wrap(warn(`<g fill="none" stroke="${BLK}" stroke-width="6"><path d="M40 82 L40 38"/><path d="M62 82 L62 64 L54 54 L54 38"/></g>`)) },
    { id: 'W205a', code: 'W.205a', group: 'nguyhiem', name: 'Đường giao nhau (cùng cấp)',
      desc: 'Báo trước sắp đến nơi giao nhau của các tuyến đường cùng cấp.',
      svg: wrap(warn(`<rect x="45" y="36" width="10" height="46" fill="${BLK}"/><rect x="28" y="54" width="44" height="10" fill="${BLK}"/>`)) },
    { id: 'W207a', code: 'W.207a', group: 'nguyhiem', name: 'Giao nhau với đường không ưu tiên',
      desc: 'Báo trước sắp đến nơi giao nhau với đường không ưu tiên; xe trên đường đang đi được ưu tiên.',
      svg: wrap(warn(`<rect x="44" y="34" width="12" height="49" fill="${BLK}"/><rect x="26" y="58" width="48" height="4" fill="${BLK}"/>`)) },
    { id: 'W209', code: 'W.209', group: 'nguyhiem', name: 'Giao nhau có tín hiệu đèn',
      desc: 'Báo trước nơi giao nhau có điều khiển giao thông bằng tín hiệu đèn.',
      svg: wrap(warn(`<rect x="41" y="34" width="18" height="48" rx="4" fill="${BLK}"/><circle cx="50" cy="44" r="5" fill="#e53935"/><circle cx="50" cy="58" r="5" fill="#ffb300"/><circle cx="50" cy="72" r="5" fill="#43a047"/>`)) },
    { id: 'W219', code: 'W.219', group: 'nguyhiem', name: 'Dốc xuống nguy hiểm',
      desc: 'Báo trước sắp đến đoạn dốc xuống nguy hiểm; về số thấp, dùng phanh động cơ.',
      svg: wrap(warn(`<polygon points="22,58 78,82 22,82" fill="${BLK}"/>${text('10%', 13, BLK, 62).replace('x="50"', 'x="58"')}`)) },
    { id: 'W220', code: 'W.220', group: 'nguyhiem', name: 'Dốc lên nguy hiểm',
      desc: 'Báo trước sắp đến đoạn dốc lên nguy hiểm.',
      svg: wrap(warn(`<polygon points="78,58 22,82 78,82" fill="${BLK}"/>${text('10%', 13, BLK, 62).replace('x="50"', 'x="42"')}`)) },
    { id: 'W225', code: 'W.225', group: 'nguyhiem', name: 'Trẻ em',
      desc: 'Báo trước gần trường học, nơi trẻ em hay qua lại; giảm tốc độ, chú ý quan sát.',
      svg: wrap(warn(walker(BLK, 6, 36, 0.6) + walker(BLK, 30, 42, 0.5))) },
    { id: 'W233', code: 'W.233', group: 'nguyhiem', name: 'Nguy hiểm khác',
      desc: 'Báo trước có nguy hiểm mà không có biển riêng; cần chú ý, giảm tốc độ.',
      svg: wrap(warn(text('!', 46, BLK, 80))) },
    { id: 'W242a', code: 'W.242a', group: 'nguyhiem', name: 'Nơi đường sắt giao vuông góc với đường bộ',
      desc: 'Đặt ngay trước nơi giao nhau với đường sắt không có rào chắn; phải dừng lại quan sát nếu có tàu.',
      svg: wrap(`<g transform="rotate(35 50 50)"><rect x="4" y="42" width="92" height="16" fill="#fff" stroke="${RED}" stroke-width="4"/></g><g transform="rotate(-35 50 50)"><rect x="4" y="42" width="92" height="16" fill="#fff" stroke="${RED}" stroke-width="4"/></g>`) },

    { id: 'I409', code: 'I.409', group: 'chidan', name: 'Chỗ quay xe',
      desc: 'Chỉ dẫn vị trí được phép quay đầu xe.',
      svg: wrap(info(`<path d="M62 80 L62 42 Q62 26 48 26 Q34 26 34 42 L34 56" fill="none" stroke="#fff" stroke-width="9"/><polygon points="22,54 46,54 34,72" fill="#fff"/>`)) },
  ];

  const GROUPS = {
    cam: { name: 'Biển báo cấm', hint: 'Hình tròn, viền đỏ, nền trắng (hoặc xanh)' },
    hieulenh: { name: 'Biển hiệu lệnh', hint: 'Phần lớn hình tròn, nền xanh, hình vẽ trắng' },
    nguyhiem: { name: 'Biển nguy hiểm & cảnh báo', hint: 'Tam giác, viền đỏ, nền vàng' },
    chidan: { name: 'Biển chỉ dẫn', hint: 'Hình vuông/chữ nhật, nền xanh (hoặc hình thoi vàng)' },
  };

  window.SIGNS = S;
  window.SIGN_GROUPS = GROUPS;
  window.signById = (id) => S.find((s) => s.id === id);
})();
