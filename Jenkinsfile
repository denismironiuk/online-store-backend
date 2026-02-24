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

        stage('2. Security Audit') {
            steps {
                container('node') {
                    // Проверяем зависимости на известные уязвимости
                    sh 'npm audit --audit-level=high' 
                }
            }
        }

        stage('3. Build & Push Image') {
            steps {
                container('kaniko') {
                    // Собираем образ по твоему Dockerfile
                    sh """
                    /kaniko/executor --context `pwd` \
                    --dockerfile `pwd`/Dockerfile \
                    --destination ${IMAGE_NAME}:${IMAGE_TAG}
                    """
                }
            }
        }

        stage('4. Update GitOps Repo') {
            steps {
                // Явно указываем, что работаем в контейнере node
                container('node') {
                    script {
                        // Используем переменные для надежной подстановки в URL
                        withCredentials([usernamePassword(credentialsId: 'github-pat', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
                            sh """
                            # 0. Устанавливаем git и kustomize (в node-slim их изначально нет)
                            apt-get update && apt-get install -y git curl
                            curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash
                            mv kustomize /usr/local/bin/

                            # 1. Представляемся (Git требует имя и email для коммита)
                            git config --global user.email "jenkins@devops.local"
                            git config --global user.name "Jenkins CI"

                            # 2. Клонируем твой инфраструктурный репозиторий с авторизацией прямо в URL
                            git clone https://${GIT_USER}:${GIT_PASS}@github.com/denismironiuk/online-store-gitops.git gitops-repo
                            
                            # 3. Заходим в папку с kustomization.yaml для продакшена
                            cd gitops-repo/apps/backend/overlays/prod

                            # 4. Магия Kustomize: меняем тег образа на свежесобранный
                            kustomize edit set image akarv/online-store-backend=${IMAGE_NAME}:${IMAGE_TAG}

                            # 5. Сохраняем и отправляем изменения в GitHub
                            git add kustomization.yaml
                            git commit -m "cd: deploy new backend version ${IMAGE_TAG}"
                            git push origin main
                            """
                        }
                    }
                }
            }
        }
    }
}