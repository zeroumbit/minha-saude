# Instruções de Build e Publicação (Google Play)

Como o comando `flutter create` não pôde ser executado automaticamente no seu ambiente, você precisará inicializar a parte nativa do projeto manualmente antes de gerar o build.

## 1. Inicializar o Projeto Nativo

Abra o terminal na pasta do projeto (`c:\PROJETOS\saude\minha_saude`) e execute:

```bash
flutter create . --org com.minhasaude
```

Isso criará as pastas `android/`, `ios/`, `web/`, etc., mantendo o código que eu já escrevi na pasta `lib/`.

## 2. Configurar Assinatura (Signing)

Para publicar na Play Store, o app precisa ser assinado digitalmente.

1.  **Gerar Keystore**: Execute o comando abaixo para criar sua chave de upload (guarde-a com segurança!):
    *   **Windows**:
        ```powershell
        keytool -genkey -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
        ```
    *   Mova o arquivo `upload-keystore.jks` gerado parta a pasta `android/app/`.

2.  **Configurar `local.properties`** (Opção mais segura que não vaza senhas no git):
    Abra `android/local.properties` e adicione (substitua pelas senhas que você definiu):
    ```properties
    storePassword=sua_senha_do_store
    keyPassword=sua_senha_da_chave
    keyAlias=upload
    storeFile=../app/upload-keystore.jks
    ```

3.  **Configurar `build.gradle`**:
    Abra `android/app/build.gradle` e no bloco `android { ... }`, substitua a configuração `buildTypes` por:

    ```gradle
    def localProperties = new Properties()
    def localPropertiesFile = rootProject.file('local.properties')
    if (localPropertiesFile.exists()) {
        localPropertiesFile.withReader('UTF-8') { reader ->
            localProperties.load(reader)
        }
    }

    android {
        // ... (resto da config)

        signingConfigs {
            release {
                keyAlias localProperties['keyAlias']
                keyPassword localProperties['keyPassword']
                storeFile file(localProperties['storeFile'])
                storePassword localProperties['storePassword']
            }
        }

        buildTypes {
            release {
                signingConfig signingConfigs.release
                minifyEnabled true // Opcional: ofuscação
                shrinkResources true // Opcional: remove recursos não usados
                proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            }
        }
    }
    ```

## 3. Gerar App Bundle (AAB)

Agora você pode gerar o arquivo final para upload na Play Store:

```bash
flutter build appbundle --release
```

O arquivo será gerado em: `build/app/outputs/bundle/release/app-release.aab`.

## 4. Ícones do App

Para gerar os ícones corretamente:
1.  Adicione seu ícone em `assets/icons/app_icon.png`.
2.  Descomente as linhas de `flutter_icons` no `pubspec.yaml`.
3.  Execute:
    ```bash
    dart run flutter_launcher_icons
    ```
