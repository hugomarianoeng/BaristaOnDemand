# Bar Sitting - Deploy no Umbler

## ✅ PROBLEMA RESOLVIDO

O problema era que o Umbler estava configurado para fazer deploy no diretório `/public/`, mas os arquivos já estavam dentro de uma pasta `public/`, criando uma estrutura `public/public/`.

## 📁 Nova Estrutura (Corrigida)

```
BaristaOnDemand/
├── index.html              # Página principal
├── dashboard-barista.html  # Dashboard do barista
├── dashboard-establishment.html # Dashboard do estabelecimento
├── install.html           # Página de instalação
├── .htaccess              # Configuração do Apache
├── .gitignore             # Arquivos ignorados pelo Git
├── README.md              # Este arquivo
├── css/
│   ├── styles.css         # Estilos principais
│   └── dashboard.css      # Estilos dos dashboards
├── js/
│   ├── main.js           # JavaScript principal
│   ├── dashboard-barista.js
│   └── dashboard-establishment.js
└── assets/
    ├── favicon.ico       # (adicionar)
    └── logo.png          # (adicionar)
```

## 🚀 Configuração no Umbler

### Opção 1: Deploy Path na Raiz (RECOMENDADO)
- **Repositório**: `git@github.com:hugomarianoeng/BaristaOnDemand.git`
- **Branch**: `master`
- **Deploy Path**: `/` (raiz)

### Opção 2: Manter Deploy Path /public/
Se preferir manter a configuração atual:
- **Deploy Path**: `/public/`
- Mas você precisará mover todos os arquivos de volta para dentro da pasta `public/`

## 📋 Comandos Git para Atualizar o Repositório

```bash
# 1. Adicionar todos os arquivos
git add .

# 2. Fazer commit das mudanças
git commit -m "Fix: Move files to root to resolve Umbler deploy path issue"

# 3. Push para a branch master
git push origin master
```

## 🔧 Configuração da Chave SSH

1. **No Umbler**: Copie a chave pública gerada
2. **No GitHub**: 
   - Vá em Settings > Deploy keys do repositório
   - Adicione a chave pública do Umbler
   - Marque "Allow write access" se necessário

## 📝 Assets Necessários

Adicione estes arquivos na pasta `assets/`:
- `favicon.ico` - Ícone do site
- `logo.png` - Logo da empresa
- `hero-cafe.jpg` - Imagem do hero
- `cafe-owner.jpg` - Imagem do proprietário
- `barista-working.jpg` - Imagem do barista

## ✅ Checklist de Deploy

- [x] Estrutura de arquivos corrigida
- [x] Arquivos movidos para a raiz
- [x] .htaccess configurado
- [x] .gitignore criado
- [ ] Assets adicionados
- [ ] Chave SSH configurada no GitHub
- [ ] Deploy path configurado no Umbler
- [ ] Deploy executado

## 🎯 Próximos Passos

1. **Fazer push das mudanças** para o GitHub
2. **Configurar a chave SSH** no GitHub
3. **Configurar o deploy path** no Umbler para `/` (raiz)
4. **Executar o deploy** no painel do Umbler
5. **Adicionar as imagens** na pasta assets
6. **Testar o site** em https://barsitting.com

## 🐛 Troubleshooting

Se ainda houver problemas:

1. **Verificar se a branch master existe**:
   ```bash
   git branch -a
   ```

2. **Verificar se o push foi feito**:
   ```bash
   git log --oneline
   ```

3. **Recriar a configuração Git no Umbler** se necessário

4. **Fazer deploy manual via FTP** como alternativa

## 📞 Suporte

Se precisar de ajuda adicional, verifique:
- Logs de deploy no painel do Umbler
- Console do navegador para erros JavaScript
- Configurações de DNS do domínio