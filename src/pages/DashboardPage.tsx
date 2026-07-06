const summaryItems = [
  { label: '菜单数量', value: '3' },
  { label: '内容模块', value: '2' },
  { label: '待处理项', value: '0' },
];

export default function DashboardPage() {
  return (
    <div className="page-stack">
      <section className="hero-section">
        <div>
          <p className="section-eyebrow">Dashboard</p>
          <h2>首页概览</h2>
          <p>查看当前内容模块的概览信息与处理状态。</p>
        </div>
      </section>

      <section className="summary-grid" aria-label="概览数据">
        {summaryItems.map((item) => (
          <article className="summary-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>
    </div>
  );
}
