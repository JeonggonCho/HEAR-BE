# 1. 기본 Node.js 이미지 사용
FROM node:21-alpine

LABEL author="jeonggon"
LABEL version="1.0"
LABEL description="HEAR 서버용 도커파일"

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. package.json과 package-lock.json 복사
COPY package*.json ./

# 4. 의존성 설치 install 대신 ci를 사용하여 동일한 버전 설치
RUN npm ci

# 5. 모든 소스 코드 복사
COPY . .

# 6. 컨테이너 실행 시 사용할 포트 설정
EXPOSE 8080

# 7. 애플리케이션 실행
CMD ["npm", "run", "dev"]
