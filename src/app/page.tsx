import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page-shell stack">
      <section className="hero-card">
        <span className="eyebrow">Classroom Virtual Gallery</span>
        <h1 className="hero-title">작품을 올리면, 아이들은 3D 전시실을 걸어 다닙니다.</h1>
        <p className="hero-subtitle">
          교사는 PC에서 키보드로 운영하고, 학생은 태블릿에서 다이얼패드로 움직입니다. 미술 사진과 국어 글을 같은
          공간에 전시하고, 작품마다 감상 댓글을 남길 수 있는 교실 전용 가상 갤러리입니다.
        </p>
        <div className="cta-row">
          <Link className="cta-link" href="/gallery/class-3-2?role=student&name=김민수">
            학생 모드로 들어가기
          </Link>
          <Link className="ghost-link" href="/gallery/class-3-2?role=teacher&name=담임">
            교사 모드 미리보기
          </Link>
          <Link className="ghost-link" href="/admin">
            관리자 화면 보기
          </Link>
        </div>
      </section>

      <section className="card-grid">
        <article className="panel-card stack">
          <span className="eyebrow">교사용 운영</span>
          <h2 className="section-title">PC 키보드 중심 운영</h2>
          <p className="muted">작품 배치, 댓글 관리, 공개 제어를 넓은 화면에서 빠르게 처리합니다.</p>
        </article>

        <article className="panel-card stack">
          <span className="eyebrow">학생용 감상</span>
          <h2 className="section-title">태블릿 다이얼패드 이동</h2>
          <p className="muted">왼손으로 이동하고 오른손으로 작품을 탭하는 단순한 한 손 + 한 손 흐름을 기준으로 설계합니다.</p>
        </article>

        <article className="panel-card stack">
          <span className="eyebrow">준비 시간 단축</span>
          <h2 className="section-title">파일명 기반 일괄 업로드</h2>
          <p className="muted">
            `01_김민수_봄풍경.jpg` 같은 파일명을 분석해 번호, 이름, 제목 후보를 자동 채우고 교사는 틀린 항목만 고칩니다.
          </p>
        </article>
      </section>
    </main>
  );
}
