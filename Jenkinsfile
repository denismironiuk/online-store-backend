pipeline {
    agent {
        kubernetes {
            yaml '''
            apiVersion: v1
            kind: Pod
            spec:
              containers:
              - name: node
                image: node:22-slim  # Используем ту версию, что указана у тебя в engines
                command: ['cat']
                tty: true
              - name: kaniko
                image: gcr.io/kaniko-project/executor:debug
                command: ['cat']
                tty: true
            '''
        }
    }

    environment {
        // Замени на свои данные для Docker Hub или ECR
        IMAGE_NAME = "den4ik/shop-server"
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

        stage('4. Notify GitOps') {
            steps {
                // Здесь мы будем обновлять твой инфраструктурный репозиторий
                echo "Подготовка к обновлению манифестов в Git..."
            }
        }
    }
}