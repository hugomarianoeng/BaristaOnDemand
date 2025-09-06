# Estrutura Recomendada para o Repositório GitHub

## Estrutura Atual (Problemática):
```
BaristaOnDemand/
└── public/
    ├── index.html
    ├── css/
    ├── js/
    └── ...
```

## Estrutura Recomendada (Opção 1 - Manter /public/):
```
BaristaOnDemand/
├── public/
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── ...
└── README.md
```

## Estrutura Recomendada (Opção 2 - Arquivos na raiz):
```
BaristaOnDemand/
├── index.html
├── css/
├── js/
├── assets/
├── .htaccess
└── README.md
```

## Configuração no Umbler:
- Se usar Opção 1: Deploy path = `/public/`
- Se usar Opção 2: Deploy path = `/` (raiz)