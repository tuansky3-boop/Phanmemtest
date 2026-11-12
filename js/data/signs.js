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
  ];

  const GROUPS = {
    cam: { name: 'Biển báo cấm', hint: 'Hình tròn, viền đỏ, nền trắng (hoặc xanh)' },
    hieulenh: { name: 'Biển hiệu lệnh', hint: 'Hình tròn, nền xanh, hình vẽ trắng' },
    nguyhiem: { name: 'Biển nguy hiểm & cảnh báo', hint: 'Tam giác, viền đỏ, nền vàng' },
    chidan: { name: 'Biển chỉ dẫn', hint: 'Hình vuông/chữ nhật, nền xanh (hoặc hình thoi vàng)' },
  };

  window.SIGNS = S;
  window.SIGN_GROUPS = GROUPS;
  window.signById = (id) => S.find((s) => s.id === id);
})();
