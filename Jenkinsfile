pipeline {
    agent any

    environment {
        IMAGE_NAME = 'chungdaeking/nestjs-api-server-sample:latest'
        CONTAINER_NAME = 'nestjs-api-server'
        PORT = '3101'
    }

    stages {
        stage('Pull Image') {
            steps {
                script {
                    echo 'Pulling Docker image...'
                    sh "docker pull ${IMAGE_NAME}"
                }
            }
        }

        stage('Stop and Remove Existing Container') {
            steps {
                script {
                    sh """
                    if [ \$(docker ps -al -q -f name=${CONTAINER_NAME}) ]; then
                        docker stop ${CONTAINER_NAME}
                        docker rm ${CONTAINER_NAME}
                    fi
                    """
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                withCredentials([string(credentialsId: 'NEST_API_SERVER_ENV', variable: 'ENV_FILE')]) {
                    sh '''
                    echo "$ENV_FILE" > .env

                    docker run \\
                        -e PORT=${PORT} \\
                        --env-file .env \\
                        -d \\
                        --name ${CONTAINER_NAME} \\
                        -p ${PORT}:${PORT} \\
                        ${DOCKER_IMAGE}
                    '''
                }
            }
        }
    }
}
