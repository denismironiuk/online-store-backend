pipeline {
    agent {
        kubernetes {
            yaml '''
            apiVersion: v1
            kind: Pod
            spec:
              containers:
              - name: node
                image: node:22-slim
                command: ['cat']
                tty: true
              - name: kaniko
                image: gcr.io/kaniko-project/executor:debug
                command: ['cat']
                tty: true
                volumeMounts:
                - name: docker-config
                  mountPath: /kaniko/.docker/
              volumes:
              - name: docker-config
                secret:
                  secretName: dockerhub-config
                  items:
                    - key: .dockerconfigjson
                      path: config.json
            '''
        }
    }

    environment {
        IMAGE_NAME = "akarv/online-store-backend"
        IMAGE_TAG = "v${env.BUILD_NUMBER}"
    }

    stages {
        stage('1. Checkout') {
            steps {
                checkout scm
            }
        }

        // --- НОВЫЙ РУБЕЖ: ВРАТА КАЧЕСТВА ---
        stage('2. Quality Gate: Tests') {
            steps {
                container('node') {
                    echo "Устанавливаем зависимости строго по package-lock.json..."
                    // Используем ci вместо install. Это стандарт для CI/CD серверов.
                    sh 'npm ci' 
                    
                    echo "Запускаем интеграционные тесты с in-memory MongoDB..."
                    // Если эта команда завершится с ошибкой, пайплайн будет остановлен (FAILURE)
                    sh 'npm run test' 
                }
            }
        }

        stage('3. Security Audit') {
            steps {
                container('node') {
                    echo "Проверяем зависимости на уязвимости..."
                    // Аудит запускается только если тесты прошли успешно
                    sh 'npm audit --audit-level=high' 
                }
            }
        }

        stage('4. Build & Push Image') {
            steps {
                container('kaniko') {
                    echo "Тесты и аудит пройдены. Собираем Docker-образ ${IMAGE_TAG}..."
                    sh """
                    /kaniko/executor --context `pwd` \
                    --dockerfile `pwd`/Dockerfile \
                    --destination ${IMAGE_NAME}:${IMAGE_TAG}
                    """
                }
            }
        }

        stage('5. Update GitOps Repo') {
            steps {
                container('node') {
                    script {
                        withCredentials([usernamePassword(credentialsId: 'github-pat', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
                            sh """
                            echo "Обновляем манифесты для ArgoCD..."
                            
                            # 0. Устанавливаем git и kustomize
                            apt-get update && apt-get install -y git curl
                            curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash
                            mv kustomize /usr/local/bin/

                            # 1. Настраиваем Git
                            git config --global user.email "jenkins@devops.local"
                            git config --global user.name "Jenkins CI"

                            # 2. Клонируем GitOps репозиторий
                            git clone https://${GIT_USER}:${GIT_PASS}@github.com/denismironiuk/online-store-gitops.git gitops-repo
                            
                            # 3. Переходим в нужную папку
                            cd gitops-repo/apps/backend/overlays/prod

                            # 4. Обновляем версию образа
                            kustomize edit set image akarv/online-store-backend=${IMAGE_NAME}:${IMAGE_TAG}

                            # 5. Пушим изменения
                            git add kustomization.yaml
                            git commit -m "cd: deploy verified backend version ${IMAGE_TAG}"
                            git push origin main
                            """
                        }
                    }
                }
            }
        }
    }
}