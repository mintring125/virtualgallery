import Link from "next/link";

export default function EnterPage() {
  return (
    <main className="page-shell two-column">
      <section className="hero-card stack">
        <span className="eyebrow">입장 흐름</span>
        <h1 className="section-title">누가 들어오나요?</h1>
        <p className="muted">
          실제 구현에서는 이름 입력과 역할 선택 후 갤러리에 입장합니다. 현재는 교사와 학생의 화면 차이를 먼저 검증할 수 있게
          빠른 입장 링크를 제공합니다.
        </p>
        <div className="cta-row">
          <Link className="cta-link" href="/gallery/class-3-2?role=student&name=김민수">
            학생으로 입장
          </Link>
          <Link className="ghost-link" href="/gallery/class-3-2?role=teacher&name=담임">
            교사로 입장
          </Link>
        </div>
      </section>

      <section className="panel-card input-grid">
        <label>
          이름
          <input defaultValue="김민수" placeholder="이름 입력" />
        </label>
        <label>
          역할
          <select defaultValue="student">
            <option value="student">학생</option>
            <option value="teacher">교사</option>
            <option value="guest">관람자</option>
          </select>
        </label>
        <label>
          안내
          <textarea defaultValue="학생은 태블릿 가로 모드와 왼쪽 하단 다이얼패드를 기준으로 사용합니다." readOnly />
        </label>
      </section>
    </main>
  );
}
