# Comandos Git para Resolver o Deploy no Umbler

## 🚀 Execute estes comandos em sequência:

```bash
# 1. Verificar status atual
git status

# 2. Adicionar todos os novos arquivos
git add .

# 3. Fazer commit das mudanças
git commit -m "Fix: Move all files to root directory to resolve Umbler deploy path issue

- Moved all files from public/ to root directory
- Fixed public/public/ structure issue
- Added .htaccess for Apache configuration
- Added .gitignore to prevent temporary files
- Updated README with deployment instructions"

# 4. Push para a branch master
git push origin master

# 5. Verificar se o push foi bem-sucedido
git log --oneline -5
```

## 📋 Checklist Pós-Deploy:

1. ✅ Arquivos movidos para a raiz
2. ✅ .htaccess criado
3. ✅ .gitignore configurado
4. ⏳ Push para GitHub
5. ⏳ Configurar chave SSH no GitHub
6. ⏳ Configurar deploy path no Umbler para "/"
7. ⏳ Executar deploy no Umbler
8. ⏳ Adicionar imagens na pasta assets/
9. ⏳ Testar site em https://barsitting.com

## 🔧 Configuração no Umbler:

**IMPORTANTE**: Altere a configuração no painel do Umbler:
- **Deploy Path**: `/` (raiz) - NÃO mais `/public/`
- **Branch**: `master`
- **Repositório**: `git@github.com:hugomarianoeng/BaristaOnDemand.git`

## 🎯 Próximo Passo:

Execute os comandos Git acima e depois configure o deploy no Umbler!