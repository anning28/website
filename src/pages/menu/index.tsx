import styles from './index.module.scss';

type MenuPageProps = {
  title: string;
  description: string;
};

const placeholderRows = [
  { name: '内容项 01', status: '待处理' },
  { name: '内容项 02', status: '待处理' },
  { name: '内容项 03', status: '待处理' },
];

export default function MenuPage({ title, description }: MenuPageProps) {
  return (
    <div className={styles.pageStack}>
      <section className={styles.heroSection}>
        <div>
          <p className={styles.sectionEyebrow}>Menu</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </section>

      <section className={styles.tablePanel} aria-label={`${title}占位列表`}>
        <div className={styles.tablePanelHeader}>
          <h3>内容列表</h3>
          <span>当前数据</span>
        </div>

        <div className={styles.placeholderTable}>
          {placeholderRows.map((row) => (
            <div className={styles.placeholderTableRow} key={row.name}>
              <span>{row.name}</span>
              <strong>{row.status}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
