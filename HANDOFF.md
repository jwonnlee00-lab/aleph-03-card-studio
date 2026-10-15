# AI A → AI B 인수인계

## 1. 목표
모바일에서 문구 편집 후 한 번 눌러 결과를 보고, 긴 스크롤 없이 PNG를 저장한다. task05-card01.md의 M01~M10과 60분·80회 상한을 그대로 적용한다. 대화 전문은 필요하지 않다.

## 2. 현재 상태
A는 첫 재현 가능한 제품 실패 M03을 확인한 뒤 기능 수정을 중단했다. 모바일 하단 편집/미리보기/PNG 저장, DOM을 유지하는 화면 전환, 기존 PNG 준비 상태 전달을 구현했다. 자동 검사 기준 통과 5 / 실패 1 / 미검증 4. B는 완료된 것으로 가정하지 말고 동일 검사를 재실행한다.

## 3. 실행 환경
별도 빌드 없음. 저장소 루트에서 `python -m http.server 8000` 후 http://localhost:8000 을 연다. Python이 없으면 Node의 정적 HTTP 서버 사용 가능. 기존 final 폴더와 mobile.css/mobile.js를 함께 제공한다.

자동 검사: Node.js와 playwright 패키지, Chrome이 필요하다. `node verify-mobile.cjs`를 저장소 루트에서 실행한다. 기본 패키지 경로는 A의 Windows 환경 경로이므로 다른 환경에서는 PLAYWRIGHT_MODULE에 playwright 모듈 경로, CHROME_PATH에 Chrome 실행 파일을 설정한다. PowerShell 예: `$env:PLAYWRIGHT_MODULE='C:/path/to/node_modules/playwright'; $env:CHROME_PATH='C:/path/to/chrome.exe'; node verify-mobile.cjs`.

검사 스크립트가 임시 포트의 127.0.0.1 서버를 열고 새 브라우저 컨텍스트를 만든 뒤 닫는다. A에서는 sandbox 실행 시 ERR_NETWORK_ACCESS_DENIED가 발생해 승인된 실행 환경에서 검사했다. 최종 환경은 Windows, Chrome 155.0.8059.40 headless, 390×844 및 320×568이다. 실제 휴대폰이 아니다.

## 4. 변경 내용
- 시작 커밋: b033eaf4312a0df07949ce82df16b70adddb6dec.
- A 코드·검사 커밋: aa7ac91dd504b7e3a9215236d8da2fc8f4af940c.
- 브랜치: codex/task05-mobile-handoff. 이 브랜치의 인계 문서 포함 최신 커밋에서 시작하고 실제 SHA를 B 시작 기록에 적는다.
- index.html: mobile.css와 mobile.js 로드 추가.
- mobile.css: 780px 이하 화면 전환, 하단 조작, 입력 크기와 좁은 폭 처리.
- mobile.js: 입력 DOM 보존, 전환·저장·상태 전달. 기존 savePng 링크를 재사용하고 준비 중에는 저장하지 않는다.
- verify-mobile.cjs 및 evidence/: 재실행 도구와 결과·스크린샷·실제 다운로드 PNG.

## 5. 고정 검사
정의는 task05-card01.md v1, SHA256 7AE1252592AE5A7BEC9CA561C64506840971ECF287769B23FB33C2C4BC21EBA5. 정의를 바꾸지 않는다. A 결과는 results-A.md와 evidence/automated-results.json. B 실행 전 evidence 폴더를 별도 위치에 복사해 A 결과를 보존한다. 스크립트는 같은 이름의 증거 파일을 덮어쓴다. 자동 검사가 PNG의 문구를 OCR로 검사하지 않으므로 파일을 열어 문구·형태를 직접 확인해야 한다.

## 6. 제약·문제
- 첫 제품 실패 M03: 320×568에서 9:16 카드 하단이 고정 바 아래로 내려간다. evidence/M03.png. fullCard()가 false. 헤더·프레임 패딩·하단 상태 높이를 포함해 실제 사용 가능한 높이를 계산해야 한다.
- M04: 화면 키보드를 실기기에서 확인하지 못했다. visualViewport 기반 처리는 구현했으나 검증 안 됨.
- M07: 실기기에서 세 비율의 저장·열기 미검증.
- M08: 파일 공유 기능 미구현. Web Share 지원 실기기에서 취소·재시도 확인 필요. 취소를 저장 완료로 표시하지 말 것.
- M09: A의 Chrome은 navigator.share 함수를 제공해 공유 미지원 조건 불충족. 이전 실행에서 환경 assertion 실패였으며 제품 실패로 집계하지 않았다. 진짜 미지원 브라우저에서 검사 필요.
- 현재 공개 사이트는 이전 버전이다. A 브랜치를 배포하지 않았으며 공개 사이트에서 새 기능을 시험했다고 주장하면 안 된다.
- 고정 검사는 변경하지 않았고 실기기 결과를 추정하지 않았다. 저장 버튼은 다운로드 요청 사실만 알리며 기기 저장 완료를 단정하지 않는다.

## 7. 다음 행동
1. 새 대화에서 저장소와 이 문서만 읽고 B 시작 시각·SHA·60분 종료 기한·도구 호출 1회를 기록한다. task05-card01.md의 동일 최초 요청을 사용한다. A의 대화 이력은 주지 않는다.
2. M03부터 재현·수정하고 PNG 공유/취소/다운로드 대체 경로를 구현한다. 같은 검사 10개를 실행하고 실기기가 필요한 항목은 사용자 실기기 관찰 증거가 없으면 미검증으로 남긴다.
3. B 종료·검사 결과·실사용량·버전을 저장하고 이름을 가린 비교표를 작성한다. 무로그인 공개 보고서는 후속 단계에서 게시한다.
