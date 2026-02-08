pipeline {
    agent any

    environment {
        IMAGE_NAME = 'chungdaeking/nestjs-api-server-sample:develop'
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
                withCredentials([
                    file(credentialsId: 'NEST_API_SERVER_ENV', variable: 'ENV_FILE')
                ]) {
                    sh '''
                    docker run \
                        --network nestjs-api-server-sample_server-prod \
                        --env-file $ENV_FILE \
                        -e PORT=${PORT} \
                        -d \
                        --name ${CONTAINER_NAME} \
                        -p ${PORT}:${PORT} \
                        ${IMAGE_NAME}
                    '''
                }
            }
        }
    }
}
