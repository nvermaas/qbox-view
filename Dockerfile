# production environment
FROM nginx:latest
COPY build /var/www/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]