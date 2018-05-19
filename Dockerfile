FROM ubuntu:14.04

MAINTAINER owenluke <hi.owen.luke@gmail.com>

EXPOSE 3000

# 安装 wget 和 make 工具。否则 npm install 时会出错：
# node-gyp rebuild Error: not found: make
RUN sudo apt-get update && \
    sudo apt-get install -y wget && \
    sudo apt-get install -y xz-utils && \
    sudo apt-get install -y python && \
    sudo apt-get install -y build-essential

# 安装Node.js v8.9.4
RUN wget https://nodejs.org/dist/v8.9.4/node-v8.9.4-linux-x64.tar.xz && \
    tar -C /usr/local --strip-components 1 -xf node-v8.9.4-linux-x64.tar.xz && \
    rm -f node-v8.9.4-linux-x64.tar.xz

WORKDIR /app

# 安装npm模块（注意以下步骤的顺序，不要变动）
ADD package.json /app/package.json

# 安装 app 的依赖库
RUN npm install

# 添加源代码（注意这里包括了 node_modules 文件夹，需要用 .dockerignore 来排除）
ADD . /app

# 运行app.js
CMD ["node", "/app/app.js"]
