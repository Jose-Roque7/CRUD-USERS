<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Ejecutar en desarrollo

1. Clonar Repositorio
2. Instalalar modulos de Node
```
yarn install
```
3. Tener Nest CLI Instalado
```
npm i -g @nestjs/cli
```
4. Levantar base de datos
```
docker.compose up -d
```
5. Iniciar proyecto
```
yarn start:dev
```
6. Generar 20 usuarios de prueba
```
http://localhost:3000/Api/seed
```

## Stack utilizado
* MongoDB
* NestJS