// Jenkins Pipeline for AI Lecture App
// All secrets are injected from Jenkins credentials (synced from 1Password by Terraform)

pipeline {
    agent none

    triggers {
        githubPush()
    }

    environment {
        DOCKER_BUILDKIT = '1'
        REGISTRY = 'docker-registry.docker-registry.svc.cluster.local:5000'
        NAMESPACE = 'ai-lecture'

        // Database credentials
        DB_USERNAME = credentials('ai-lecture-db-username')
        DB_PASSWORD = credentials('ai-lecture-db-password')
        DB_DATABASE = credentials('ai-lecture-db-database')

        // Docker Hub credentials (to avoid rate limits)
        DOCKERHUB_USERNAME = credentials('ai-lecture-dockerhub-username')
        DOCKERHUB_TOKEN    = credentials('ai-lecture-dockerhub-token')

        // Server IP for constructing public URLs
        SERVER_IP = credentials('ai-lecture-server-ip')
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '5'))
        disableConcurrentBuilds(abortPrevious: true)
        skipDefaultCheckout()
        timestamps()
        ansiColor('xterm')
    }

    stages {
        stage('Checkout & Prepare') {
            agent { label 'jenkins-agent' }
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_HASH = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    echo "Git commit hash: ${env.GIT_COMMIT_HASH}"
                }

                // Validate credentials and create secret manifests in same stage
                sh '''#!/bin/sh
                    set -ex

                    missing=""
                    [ -z "${DB_USERNAME}" ] && missing="${missing} ai-lecture-db-username"
                    [ -z "${DB_PASSWORD}" ] && missing="${missing} ai-lecture-db-password"
                    [ -z "${DB_DATABASE}" ] && missing="${missing} ai-lecture-db-database"
                    [ -z "${SERVER_IP}" ] && missing="${missing} ai-lecture-server-ip"
                    if [ -n "${missing}" ]; then
                        echo "ERROR: Missing Jenkins credentials:${missing}"
                        echo "Configure these credentials in Jenkins (or via Terraform/1Password sync)."
                        exit 1
                    fi

                    cat > ai-lecture-api-secrets.yaml <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: ai-lecture-api-secrets
  namespace: ai-lecture
type: Opaque
stringData:
  DATABASE_URL: "postgresql://${DB_USERNAME}:${DB_PASSWORD}@postgres.ai-lecture.svc.cluster.local:5432/${DB_DATABASE}"
  API_PORT: "3000"
  CORS_ORIGIN: "http://${SERVER_IP}:30093"
EOF

                    cat > ai-lecture-postgres-secret.yaml <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: ai-lecture-postgres
  namespace: ai-lecture
type: Opaque
stringData:
  POSTGRES_USER: "${DB_USERNAME}"
  POSTGRES_PASSWORD: "${DB_PASSWORD}"
  POSTGRES_DB: "${DB_DATABASE}"
EOF

                    cat > drizzle.env <<EOF
export DATABASE_URL=postgresql://${DB_USERNAME}:${DB_PASSWORD}@postgres.ai-lecture.svc.cluster.local:5432/${DB_DATABASE}
EOF
                '''

                stash includes: 'apps/**,packages/**,k8s/**,package.json,pnpm-workspace.yaml,pnpm-lock.yaml,Jenkinsfile',
                      excludes: '**/node_modules/**,**/dist/**,**/build/**,**/coverage/**,*.log',
                      name: 'source',
                      useDefaultExcludes: true
                stash includes: 'ai-lecture-api-secrets.yaml,ai-lecture-postgres-secret.yaml,drizzle.env',
                      name: 'secrets'
            }
        }

        stage('Deploy Namespace') {
            agent { label 'kubectl' }
            steps {
                unstash 'source'
                unstash 'secrets'
                container('kubectl') {
                    sh """
                        kubectl apply -f k8s/namespace.yaml
                        kubectl apply -f k8s/configmap.yaml
                        kubectl apply -f ai-lecture-api-secrets.yaml
                        kubectl apply -f ai-lecture-postgres-secret.yaml
                        rm -f ai-lecture-api-secrets.yaml ai-lecture-postgres-secret.yaml

                        if ! kubectl get statefulset postgres -n ${NAMESPACE} > /dev/null 2>&1; then
                            echo "PostgreSQL not found, deploying..."
                            kubectl apply -f k8s/postgres.yaml
                        else
                            echo "PostgreSQL already exists, skipping"
                        fi

                        kubectl wait --for=condition=ready pod -l app=postgres -n ${NAMESPACE} --timeout=5m
                    """
                }
            }
        }

        stage('Migrate, Build & Push') {
            parallel {
                stage('API: Migrate, Build & Push') {
                    agent { label 'docker' }
                    steps {
                        unstash 'source'
                        unstash 'secrets'
                        container('docker') {
                            sh '''
                                . ./drizzle.env
                                rm -f drizzle.env

                                if [ -z "${DATABASE_URL}" ]; then
                                    echo "ERROR: DATABASE_URL is empty. Check that Jenkins credentials are configured."
                                    exit 1
                                fi

                                echo "${DOCKERHUB_TOKEN}" | docker login -u "${DOCKERHUB_USERNAME}" --password-stdin

                                # Build the full API image (includes builder stage)
                                docker build --pull=false \
                                    -f apps/api/Dockerfile \
                                    -t ${REGISTRY}/ai-lecture-api:${GIT_COMMIT_HASH} \
                                    .

                                # Run migrations using the builder stage from the same build cache
                                docker build --pull=false \
                                    -f apps/api/Dockerfile \
                                    --target builder \
                                    -t ai-lecture-migrator:${GIT_COMMIT_HASH} \
                                    .

                                docker logout

                                docker run --rm \
                                    -e "DATABASE_URL=${DATABASE_URL}" \
                                    --network host \
                                    ai-lecture-migrator:${GIT_COMMIT_HASH} \
                                    sh -c "cd apps/api && npx drizzle-kit push"

                                # Push final image after successful migration
                                docker push ${REGISTRY}/ai-lecture-api:${GIT_COMMIT_HASH}

                                # Cleanup
                                docker rmi ai-lecture-migrator:${GIT_COMMIT_HASH} || true
                            '''
                        }
                    }
                }

                stage('Web: Build & Push') {
                    agent { label 'docker' }
                    steps {
                        unstash 'source'
                        container('docker') {
                            sh """
                                echo "${DOCKERHUB_TOKEN}" | docker login -u "${DOCKERHUB_USERNAME}" --password-stdin

                                docker build \
                                    --pull=false \
                                    --build-arg VITE_API_URL=/api \
                                    -f apps/web/Dockerfile \
                                    -t ${REGISTRY}/ai-lecture-web:${GIT_COMMIT_HASH} \
                                    .
                                docker push ${REGISTRY}/ai-lecture-web:${GIT_COMMIT_HASH}

                                docker logout
                            """
                        }
                    }
                }
            }
        }

        stage('Deploy') {
            agent { label 'kubectl' }
            steps {
                unstash 'source'
                container('kubectl') {
                    sh """
                        kubectl apply \
                            -f k8s/api-service.yaml \
                            -f k8s/web-service.yaml \
                            -f k8s/api-pdb.yaml \
                            -f k8s/api-deployment.yaml \
                            -f k8s/web-deployment.yaml

                        kubectl set image deployment/ai-lecture-api \
                            ai-lecture-api=${REGISTRY}/ai-lecture-api:${GIT_COMMIT_HASH} \
                            -n ${NAMESPACE}
                        kubectl set image deployment/ai-lecture-web \
                            ai-lecture-web=${REGISTRY}/ai-lecture-web:${GIT_COMMIT_HASH} \
                            -n ${NAMESPACE}

                        kubectl rollout status deployment/ai-lecture-api -n ${NAMESPACE} --timeout=5m
                        kubectl rollout status deployment/ai-lecture-web -n ${NAMESPACE} --timeout=5m

                        echo "=== Deployment Status ==="
                        kubectl get pods -n ${NAMESPACE}
                        kubectl get svc -n ${NAMESPACE}
                    """
                }
            }
        }
    }

    post {
        success {
            node('jenkins-agent') {
                sh """
                    echo "=== Application URLs ===" > urls.txt
                    echo "Backend URL:  http://${SERVER_IP}:30092" >> urls.txt
                    echo "Frontend URL: http://${SERVER_IP}:30093" >> urls.txt
                    cat urls.txt
                """
                archiveArtifacts artifacts: 'urls.txt', fingerprint: true
            }
            echo "AI Lecture app deployed successfully!"
            echo "Git commit: ${GIT_COMMIT_HASH}"
            echo "API: ${REGISTRY}/ai-lecture-api:${GIT_COMMIT_HASH}"
            echo "Web: ${REGISTRY}/ai-lecture-web:${GIT_COMMIT_HASH}"
        }
        failure {
            echo "Deployment failed. Check logs above."
        }
    }
}
