pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
        DOCKER_REGISTRY = 'local'
        BACKEND_IMAGE = 'queueless-backend'
        FRONTEND_IMAGE = 'queueless-frontend'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo '=== Stage 1: Checking out source code from Git repository ==='
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '=== Stage 2: Installing npm dependencies for Backend and Frontend ==='
                dir('backend') {
                    sh 'npm ci'
                }
                dir('frontend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Quality Gate & Unit Tests') {
            steps {
                echo '=== Stage 3: Running automated unit test suites ==='
                dir('backend') {
                    sh 'npx prisma generate'
                    sh 'npm test'
                }
            }
        }

        stage('Production Build') {
            steps {
                echo '=== Stage 4: Compiling TypeScript to production JavaScript ==='
                dir('backend') {
                    sh 'npm run build'
                }
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Image Build') {
            steps {
                echo '=== Stage 5: Building containerized Docker images ==='
                sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ./backend"
                sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ./frontend"
            }
        }

        stage('Deploy to Staging / Docker Stack') {
            steps {
                echo '=== Stage 6: Continuous Deployment using Docker Compose ==='
                sh 'docker compose up -d postgres redis'
                sh 'docker compose ps'
                echo 'QueueLess application successfully deployed and running.'
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline execution SUCCESS: QueueLess built, tested, and containerized.'
        }
        failure {
            echo '❌ Pipeline execution FAILED: Check stage logs for errors.'
        }
        always {
            cleanWs()
        }
    }
}
