# Node 24.11.1 베이스
FROM node:24.11.1

# Install basic tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    vim \
    zsh \
    postgresql-client \
    locales \
    fonts-noto-cjk \
    && rm -rf /var/lib/apt/lists/*

# Generate UTF-8 locale
RUN sed -i 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen \
    && locale-gen

# Set default locale
ENV LANG=en_US.UTF-8
ENV LC_ALL=en_US.UTF-8

# Enable corepack and install pnpm 10.20.0
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

# Install Oh My Zsh (for root and node)
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# Set default shell to zsh
SHELL ["/bin/zsh", "-c"]

# Set up working directory
WORKDIR /workspace

# Keep container running
CMD ["sleep", "infinity"]
