# todomate-desktop

데스크톱에서 쓰는 Todomate 투두 PWA. 비공식 [todomate-api](https://github.com/3x-haust/todomate-api)를 직접 띄워서 사용한다.

## 기능

- 로그인 1회 → bearer token만 저장 (비밀번호는 저장하지 않음, 만료·401이면 로그인 화면으로)
- 달력에서 날짜 선택, 큰 날짜를 누르면 오늘로
- 투두 조회(목표별 묶음), 추가(목표 선택 + Enter), 완료/미완료
- 수정: 글자 더블클릭(Enter 저장 / Esc 취소), `⋯` 메뉴에서 목표·날짜 변경
- 삭제: 화면에서 바로 지우고 5초간 되돌리기 토스트, 그 뒤 실제 삭제
- 테마: 라이트 / 다크(포인트 색 선택)

## 실행

먼저 API 서버를 켠다 (`../todomate-api`, `.env`는 git에 올리지 않는다).

```bash
cd ../todomate-api
npm install && npm run build
node --env-file=.env dist/main.js   # http://localhost:3000
```

`.env`에는 `TODOMATE_FIREBASE_API_KEY`(todomate.net 웹의 공개 Firebase 키)와 `SESSION_ENCRYPTION_KEY`(`openssl rand -hex 32`)가 필요하다. 다른 주소의 서버를 쓰려면 앱 빌드 때 `VITE_API_URL`을 지정한다.

그다음 앱:

```bash
npm install
npm run dev        # 개발 서버
npm run build      # 빌드
npm run preview    # 빌드 결과 확인 (http://localhost:4173)
```

## 데스크톱 앱으로 설치

`npm run preview`(또는 배포한 주소)를 Chrome/Edge로 열고 주소창 오른쪽의 "앱 설치" 아이콘을 누른다. 별도 창과 작업표시줄 아이콘이 생긴다.

## 주의

- 비공식 API라 Todomate 쪽 변경으로 깨질 수 있다.
- 로그인 시 이메일/비밀번호가 내 PC의 todomate-api 서버를 거쳐 Firebase로 간다.
- API 서버가 꺼져 있으면 로그인과 모든 요청이 실패한다.
- 모든 변경은 실제 Todomate 계정에 반영된다.
