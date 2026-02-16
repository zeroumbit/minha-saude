# Projeto Minha Saúde

Este é um projeto Flutter gerado com integração Supabase e design inspirado no projeto Stitch "Minha Saúde".

## Estrutura do Projeto

- `lib/core`: Configurações principais (Router, etc).
- `lib/ui`: Telas (Auth, Home, Splash, Theme).
- `lib/main.dart`: Ponto de entrada.
- `pubspec.yaml`: Dependências.

## Como Iniciar

### Web (Navegador)

1.  Certifique-se de ter o Flutter instalado e configurado no PATH.
2.  Rode `flutter pub get` para instalar as dependências.
3.  Execute o app na porta 5000:

**Windows:**
```bash
run_web.bat
```

**Linux/Mac:**
```bash
flutter run -d web-server --web-port=5000
```

Acesse: **http://localhost:5000**

### Mobile (Emulador/Dispositivo)

```bash
flutter run
```

## Configuração do Supabase

O projeto já está configurado com as chaves do Supabase fornecidas.

## Build para Play Store

Para gerar o build de produção, siga as instruções em `BUILD_INSTRUCTIONS.md`.
