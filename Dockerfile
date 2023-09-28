# syntax=docker/dockerfile:1
FROM ghcr.io/static-web-server/static-web-server:2-alpine
COPY /dist /public