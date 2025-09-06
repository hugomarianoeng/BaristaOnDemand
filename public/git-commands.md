# Comandos para criar branch master no seu repositório GitHub

# 1. Clone o repositório (se ainda não tiver localmente)
git clone git@github.com:hugomarianoeng/BaristaOnDemand.git
cd BaristaOnDemand

# 2. Criar e fazer checkout da branch master baseada na main
git checkout -b master

# 3. Push da nova branch master para o GitHub
git push origin master

# 4. (Opcional) Definir master como branch padrão no GitHub
# Vá em Settings > Branches no GitHub e mude a branch padrão para master