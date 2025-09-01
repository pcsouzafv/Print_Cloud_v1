# 📊 Dados de Demonstração - Print Cloud AI

## 🎯 Resumo dos Dados para Análise da IA

O script `prisma/seed.ts` está configurado para criar um conjunto abrangente de dados realistas para análise da IA:

### 👥 **Usuários (5 usuários criados)**
```
🏢 ADMINISTRADOR SISTEMA
- Email: admin@empresa.com 
- Papel: ADMIN
- Departamento: TI

👨‍💼 JOÃO SILVA  
- Email: joao.silva@empresa.com
- Papel: USER  
- Departamento: Administração

👩‍💼 MARIA SANTOS
- Email: maria.santos@empresa.com  
- Papel: MANAGER
- Departamento: Marketing

👨‍💼 CARLOS OLIVEIRA
- Email: carlos.oliveira@empresa.com
- Papel: USER
- Departamento: Vendas  

👩‍💼 ANA COSTA
- Email: ana.costa@empresa.com
- Papel: MANAGER  
- Departamento: Financeiro
```

### 🏢 **Departamentos (5 departamentos)**
```
🖥️ TI: Orçamento R$ 5.000 | Cota 10.000 P&B + 2.000 Coloridas
🎨 MARKETING: Orçamento R$ 8.000 | Cota 15.000 P&B + 5.000 Coloridas  
💰 VENDAS: Orçamento R$ 6.000 | Cota 12.000 P&B + 3.000 Coloridas
📊 FINANCEIRO: Orçamento R$ 4.000 | Cota 8.000 P&B + 1.500 Coloridas
📋 ADMINISTRAÇÃO: Orçamento R$ 3.000 | Cota 6.000 P&B + 1.000 Coloridas
```

### 🖨️ **Impressoras (5 impressoras)**
```
✅ HP LaserJet Pro M404dn (Administração) - P&B - IP: 192.168.1.101
✅ Canon ImageRunner C3226i (Marketing) - Colorida - IP: 192.168.1.102
🔧 Xerox VersaLink C405 (Vendas) - Colorida - EM MANUTENÇÃO
✅ Brother HL-L6400DW (Financeiro) - P&B - IP: 192.168.1.104
❌ Epson EcoTank L15150 (TI) - Colorida - COM ERRO
```

### 💰 **Custos por Departamento**
```
TI: R$ 0,03 (P&B) | R$ 0,12 (Colorida)
Marketing: R$ 0,04 (P&B) | R$ 0,15 (Colorida)  
Vendas: R$ 0,04 (P&B) | R$ 0,13 (Colorida)
Financeiro: R$ 0,03 (P&B) | R$ 0,10 (Colorida)
Administração: R$ 0,03 (P&B) | R$ 0,11 (Colorida)
```

### 📊 **Cotas de Usuários**
```
👤 Admin (TI): 450/2000 P&B (22%) | 120/500 Coloridas (24%)
👤 João (Admin): 234/500 P&B (47%) | 45/100 Coloridas (45%)  
👤 Maria (Marketing): 678/1000 P&B (68%) | 189/300 Coloridas (63%)
👤 Carlos (Vendas): 756/800 P&B (94%) ⚠️ | 198/200 Coloridas (99%) ⚠️
👤 Ana (Financeiro): 423/1500 P&B (28%) | 67/500 Coloridas (13%)
```

### 📄 **Trabalhos de Impressão (5 exemplos)**
```
✅ CONCLUÍDO: João - "Relatório Mensal.pdf" - 15 pgs x 2 - R$ 0,90
✅ CONCLUÍDO: Maria - "Apresentação Marketing.pptx" - 25 pgs x 10 coloridas - R$ 37,50  
🖨️ IMPRIMINDO: Carlos - "Proposta Comercial.docx" - 8 pgs x 5 - R$ 1,20
⏳ PENDENTE: Ana - "Demonstrativo Financeiro.xlsx" - 3 pgs - R$ 0,09
❌ FALHADO: João - "Manual do Funcionário.pdf" - 45 pgs coloridas - R$ 6,75
```

### 📝 **Logs de Auditoria (3 exemplos)**
```
🔧 Admin: Criou impressora HP LaserJet Pro M404dn (1 dia atrás)
📊 Maria: Atualizou cota de 800 → 1000 páginas (12h atrás)  
🔧 Admin: Colocou Xerox em manutenção preventiva (6h atrás)
```

---

## 🤖 **Potencial de Análise para IA**

### 📈 **Insights Automáticos Disponíveis:**
- **Detecção de Problemas**: Carlos próximo dos limites (necessita intervenção)
- **Oportunidades de Economia**: Marketing usa muito colorido (R$ 37,50/job)
- **Manutenção Preditiva**: 2 impressoras com problemas identificados
- **Padrões de Uso**: Administração é mais econômica, Marketing mais custosa
- **Balanceamento**: TI subutilizada, Vendas sobrecarregada

### 💡 **Recomendações Inteligentes:**
- Implementar duplex automático (40% economia papel)
- Redistribuir carga: TI pode absorver demanda de Vendas
- Alertas proativos: Carlos precisa otimização urgente
- Manutenção: Reparar Xerox e Epson prioritariamente
- Políticas: Restringir coloridas para jobs >10 páginas

---

## ⚡ **Status: Pronto para Análise**

✅ **5 usuários** com padrões realistas de uso
✅ **5 departamentos** com orçamentos e cotas diferenciadas  
✅ **5 impressoras** com status variados (ativa, manutenção, erro)
✅ **5 custos** departamentais personalizados
✅ **5 cotas** com níveis de utilização realistas
✅ **5 jobs** representativos (sucesso, falha, pendente)
✅ **3 logs** de auditoria para rastreabilidade

🔥 **Total: 33 registros** com relacionamentos complexos para análise avançada da IA

---

> **Nota**: Para executar o seed e popular o banco com esses dados, basta executar:
> ```bash  
> # 1. Iniciar PostgreSQL via Docker
> docker-compose up -d postgres
> 
> # 2. Aplicar schema
> npx prisma db push
> 
> # 3. Executar seed
> npm run db:seed
> ```
>
> **IA PrintBot** estará então pronto para analisar padrões reais e fornecer insights inteligentes! 🚀