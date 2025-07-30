# 文件: Dockerfile

# --- STAGE 1: The Builder ---
# 使用一个包含完整构建工具的 Node.js 长期支持版 (LTS) 镜像
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 yarn.lock 文件
# 这样做可以利用Docker的层缓存机制，只有在依赖发生变化时才重新安装
COPY package.json yarn.lock ./

# 安装所有依赖，包括 devDependencies
RUN yarn install

# 复制应用的其余所有源代码
COPY . .

# 关键步骤：执行Nuxt的生产环境构建命令
# 这会生成一个独立的、位于 .output/ 目录下的服务端应用
RUN yarn build


# --- STAGE 2: The Runner ---
# 使用一个轻量级的、适合生产环境的 Node.js 镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 关键步骤：只从"builder"阶段复制出已编译好的产物
# 我们不复制任何源代码或 node_modules
COPY --from=builder /app/.output .

# 暴露Nuxt生产服务器默认运行的端口
EXPOSE 3000

# 定义容器启动时执行的命令
# 运行 .output/server/index.mjs 这个Node.js服务器
CMD [ "node", "./server/index.mjs" ]