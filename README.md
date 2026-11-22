# site-astro

[isaack.dev](https://isaack.dev)를 Jekyll(Minimal Mistakes)에서 Astro로 옮기는 작업 저장소입니다.
작업이 끝나면 내용을 `isaac-kwon.github.io` 저장소로 옮겨 배포합니다.

## 명령

```bash
npm ci
npm run dev          # http://localhost:4321
npm run build        # dist/
npm run check:urls   # 기존 Jekyll URL이 dist/에 모두 있는지 확인
```

## 배포

`main`에 push하면 GitHub Actions(`.github/workflows/deploy.yml`)가 빌드하고 GitHub Pages에 미리보기를 배포합니다.

- 주소: https://isaack.dev/site-astro/ (계정 사용자 사이트의 커스텀 도메인 아래 하위 경로)
- 미리보기 빌드는 `SITE_BASE=/site-astro/`로 만들어지고, `scripts/prefix-base.mjs`가 HTML의 `/...` 경로에 base를 붙입니다.
- 미리보기에는 `noindex`가 붙고 canonical은 실제 주소(`https://isaack.dev/...`)를 가리키며, GA는 꺼집니다. 기존 글과 중복 콘텐츠로 잡히지 않습니다.
- 같은 워크플로에서 base 없는 프로덕션 형태 빌드로 기존 URL 검증(`check:urls`)도 함께 돌립니다.

## 구조

| 경로 | 내용 |
|---|---|
| `src/content/posts/` | 포스트. Jekyll 파일명(`YYYY-MM-DD-slug.md`)과 front matter를 그대로 사용 |
| `src/lib/posts.ts` | URL 규칙. Jekyll `permalink: /:categories/:title/`을 그대로 재현 |
| `src/content.config.ts` | front matter 스키마 |
| `src/pages/` | 페이지, `feed.xml`, `sitemap.xml` (기존과 같은 주소) |
| `src/components/RootPlotLoader.astro` | JSROOT 그래프. 그래프가 있는 페이지에서만, 화면에 보일 때 로드 |
| `public/` | `/assets/...` 경로를 그대로 유지하는 정적 파일 |
| `scripts/prefix-base.mjs` | 하위 경로 배포용 base 경로 보정 (base가 `/`면 아무것도 안 함) |
| `scripts/migrate-post.mjs` | Jekyll 포스트 변환 + 참조 에셋 복사 |
| `scripts/jekyll-urls.txt` | 기존 Jekyll 사이트가 제공하던 모든 URL (검증 기준) |

## 포스트 옮기기

```bash
node scripts/migrate-post.mjs ../isaac-kwon.github.io _posts/2021-04-13-TrendlineWithExcel.md
```

스크립트가 자동으로 바꾸는 것:

- `{:target="_blank"}` 제거 (외부 링크는 모두 새 탭으로 자동 처리)
- 문단 전체가 `$$...$$`인 수식 → 디스플레이 수식 블록 (kramdown 규칙)
- `![](src){: .cls}` → `<img class="cls">`
- JSROOT `<iframe>` → `<div class="root-plot" data-file data-item>`
- `{% capture %}` + `{% include expand %}` → `<details class="expand">`
- `\require{cancel}` 제거, HTML 블록 뒤 빈 줄 보정

남은 Liquid/kramdown 문법은 `NEEDS MANUAL REVIEW`로 출력되니 직접 고칩니다.

## 작성 규칙

- 수식은 `$$...$$`만 사용합니다(`$` 하나는 일반 문자). 디스플레이 수식은 `$$`를 별도 줄에 둡니다.
- JSROOT 그래프:
  ```html
  <div class="root-plot" data-file="/assets/img/posts/x.root" data-item="c1;1" style="--ratio:70%"></div>
  ```
