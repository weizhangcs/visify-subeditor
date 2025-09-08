# 文件: Dockerfile

# --- STAGE 1: The Builder ---
# 使用一个包含完整构建工具的 Node.js 长期支持版 (LTS) 镜像
FROM node:20-alpine AS builder

# 【新增】声明一个名为 YARN_MIRROR 的构建参数
ARG YARN_MIRROR

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 yarn.lock 文件
COPY package.json yarn.lock ./

# 【修改】仅当 YARN_MIRROR 变量被设置时，才执行更换源的命令
RUN if [ -n "$YARN_MIRROR" ]; then \
        echo "Using Yarn mirror: $YARN_MIRROR" && \
        yarn config set registry $YARN_MIRROR; \
    fi

# 安装所有依赖，包括 devDependencies
RUN yarn install

# 复制应用的其余所有源代码
COPY . .

# 关键步骤：执行Nuxt的生产环境构建命令
RUN yarn build


# --- STAGE 2: The Runner ---
# 使用一个轻量级的、适合生产环境的 Node.js 镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 关键步骤：只从"builder"阶段复制出已编译好的产物
COPY --from=builder /app/.output .

# 暴露Nuxt生产服务器默认运行的端口
EXPOSE 3000

# 定义容器启动时执行的命令
CMD [ "node", "./server/index.mjs" ]