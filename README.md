# 미니붐이란?
미니붐은 회원 및 회원가입을 하지 않은 모든 유저들에게 유용하게 사용될 수 있는 웹 커뮤니티 소프트웨어입니다.

## 미니붐의 어원
**미니**란 개발자 2명의 마지막 이름을 따와서 만들어졌습니다. 또한 **붐은 폭탄 폭발 소리의 의성어**이며 폭탄은 작지만 큰 힘을 가지고 있습니다.
이처럼 작은 시작으로 큰 파급력을 노리는 의미를 가지고 있습니다.

# 0. 프로그램 개발 목표및 동기
비 대면 서비스가 많아지는 요즘 수많은 온라인 서비스가 등장하거나 발전해 나가고 있습니다. 그중에서도 커뮤니티라는 서비스는 회원가입을 요구하기 때문에 익명성을 보장받기 힘들며 자유롭게 자신들의 의견을 주고받기 힘듭니다. 또한 이러한 문제점이 커뮤니티의 진입장벽이 되기도 합니다. 이러한 문제점들을 해결하며 본 프로젝트에서는 프로그래밍 공부를 하는 사람들을 위한 커뮤니티를 만들어 활성화시키고자 하는걸 목표로 삼았습니다.


기존 PC모드의 커뮤니티는 어떤 새로운 게시글이 업로드 되었는지, 댓글이 달렸는지 일일이 확인하는 번거로움이 있습니다. 이 프로젝트에서는 이런 번거로움을 줄이기 위해 실시간으로 업데이트되는 커뮤니티의 정보를 푸시알림 형식으로 제공하여 사용자의 편의성과 재참여율을 증가시키고자하는걸 목표로 삼고 있습니다. 또한 사용자들의 소통을 더욱 활성화 시키기 위해 게시글 등록 뿐만 아니라 비회원도 사용가능한 그룹 채팅방을 제공하여 어떤 과제에 있어 ToDoList를 부여하거나 받으며 협업할수 있는 환경을 제공하고자 합니다.

# 1. 개발 환경
## 1.1 개발 도구
* 텍스트 편집기: atom
* 서버 접속기: xShell 7
* 소스코드 관리: Git, Github

## 1.2 개발 언어 및 프레임 워크
* [Node.js](https://nodejs.org/)
* Javascript
* HTML5
* CSS3
* Bootstrap 5

## 1.3 테스트 개발 서버
[네이버 클라우드](https://www.ncloud.com/) 서버를 사용함.

서버 사양:

* OS:Ubuntu 16.04
* CPU: 1vCPU
* Memory: 1GB Memory
* HDD: 50GB

# 2. 프로그램 특징
본 웹사이트는 참여율을 증가 시키기 위해 비회원과 푸시알림 기능을 제공한다.


버튼 클릭 한 번으로 비회원으로 웹 사이트를 이용할 수 있으며 구독 정보, 키워드, 댓글 등 사용자가 원하는 정보 등록 시 푸시알림으로 재참여율을 유도한다.

# 3. 프로그램 기능
## 3.1 RealTime 특징을 반영하고 있는 기능 소개

### 3.1.1. 질문
본 페이지에서는 사용자들이 궁금한 질문들을 등록하여 토론할 수 있는 환경을 제공한다. 작성자가 원할 경우
실시간으로 등록되는 댓글을 푸시알림으로 확인할 수 있다.

### 3.1.2. 잡담
실시간 채팅으로 방장은 팀원들에게 ToDoList를 부여할 수 있으며 각 팀원은 부여받은 list를 확인하며 소통할 수 있다
본 페이지는 어떤 과제에 있어 협업할 수 있는 환경을 제공하는 것이 목적이다.

### 3.1.3. 채팅
현재 웹 사이트에 접속되어 있는 회원, 비회원 모두 참여가능한 채팅방이다.  