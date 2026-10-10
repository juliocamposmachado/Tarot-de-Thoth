import { TarotCard } from '../types/tarot';

export const courtCards: TarotCard[] = [
  // Bastões (Wands)
  {
    id: 'king-wands',
    name: 'Rei de Bastões',
    englishName: 'King of Wands',
    suit: 'Bastões',
    element: 'Fogo do Fogo',
    description: 'Energia pura, ímpeto, ação decisiva, coragem ardente.',
    keywords: ['Energia', 'Ímpeto', 'Coragem', 'Ação'],
    category: 'court'
  },
  {
    id: 'queen-wands',
    name: 'Rainha de Bastões',
    englishName: 'Queen of Wands',
    suit: 'Bastões',
    element: 'Água do Fogo',
    description: 'Confiança, liderança, carisma, poder criativo.',
    keywords: ['Confiança', 'Liderança', 'Carisma', 'Criatividade'],
    category: 'court'
  },
  {
    id: 'prince-wands',
    name: 'Príncipe de Bastões',
    englishName: 'Prince of Wands',
    suit: 'Bastões',
    element: 'Ar do Fogo',
    description: 'Velocidade, impulsividade, aventura, expressão dinâmica.',
    keywords: ['Velocidade', 'Impulso', 'Aventura', 'Dinamismo'],
    category: 'court'
  },
  {
    id: 'princess-wands',
    name: 'Princesa de Bastões',
    englishName: 'Princess of Wands',
    suit: 'Bastões',
    element: 'Terra do Fogo',
    description: 'Entusiasmo jovem, nova energia, potencial criativo.',
    keywords: ['Entusiasmo', 'Juventude', 'Potencial', 'Criação'],
    category: 'court'
  },
  // Copas (Cups)
  {
    id: 'knight-cups',
    name: 'Cavaleiro de Copas',
    englishName: 'Knight of Cups',
    suit: 'Copas',
    element: 'Fogo da Água',
    description: 'Romance, idealismo, busca espiritual, sensibilidade.',
    keywords: ['Romance', 'Idealismo', 'Espiritualidade', 'Sensibilidade'],
    category: 'court'
  },
  {
    id: 'queen-cups',
    name: 'Rainha de Copas',
    englishName: 'Queen of Cups',
    suit: 'Copas',
    element: 'Água da Água',
    description: 'Intuição profunda, compaixão, sabedoria emocional.',
    keywords: ['Intuição', 'Compaixão', 'Sabedoria', 'Emoção'],
    category: 'court'
  },
  {
    id: 'prince-cups',
    name: 'Príncipe de Copas',
    englishName: 'Prince of Cups',
    suit: 'Copas',
    element: 'Ar da Água',
    description: 'Artista, sonhador, charme, sedução emocional.',
    keywords: ['Arte', 'Sonho', 'Charme', 'Sedução'],
    category: 'court'
  },
  {
    id: 'princess-cups',
    name: 'Princesa de Copas',
    englishName: 'Princess of Cups',
    suit: 'Copas',
    element: 'Terra da Água',
    description: 'Pureza emocional, receptividade, início de sentimentos.',
    keywords: ['Pureza', 'Receptividade', 'Sentimentos', 'Início'],
    category: 'court'
  },
  // Espadas (Swords)
  {
    id: 'king-swords',
    name: 'Rei de Espadas',
    englishName: 'King of Swords',
    suit: 'Espadas',
    element: 'Fogo do Ar',
    description: 'Intelecto agressivo, ação rápida, determinação cortante.',
    keywords: ['Intelecto', 'Velocidade', 'Determinação', 'Agressividade'],
    category: 'court'
  },
  {
    id: 'queen-swords',
    name: 'Rainha de Espadas',
    englishName: 'Queen of Swords',
    suit: 'Espadas',
    element: 'Água do Ar',
    description: 'Clareza mental, percepção aguçada, sabedoria intelectual.',
    keywords: ['Clareza', 'Percepção', 'Sabedoria', 'Intelecto'],
    category: 'court'
  },
  {
    id: 'prince-swords',
    name: 'Príncipe de Espadas',
    englishName: 'Prince of Swords',
    suit: 'Espadas',
    element: 'Ar do Ar',
    description: 'Mente analítica, lógica pura, pensamento estratégico.',
    keywords: ['Análise', 'Lógica', 'Estratégia', 'Pensamento'],
    category: 'court'
  },
  {
    id: 'princess-swords',
    name: 'Princesa de Espadas',
    englishName: 'Princess of Swords',
    suit: 'Espadas',
    element: 'Terra do Ar',
    description: 'Curiosidade intelectual, aprendizado, comunicação jovem.',
    keywords: ['Curiosidade', 'Aprendizado', 'Comunicação', 'Juventude'],
    category: 'court'
  },
  // Discos (Disks)
  {
    id: 'king-disks',
    name: 'Rei de Discos',
    englishName: 'King of Disks',
    suit: 'Discos',
    element: 'Fogo da Terra',
    description: 'Trabalho árduo, persistência, conquista material.',
    keywords: ['Trabalho', 'Persistência', 'Conquista', 'Materialidade'],
    category: 'court'
  },
  {
    id: 'queen-disks',
    name: 'Rainha de Discos',
    englishName: 'Queen of Disks',
    suit: 'Discos',
    element: 'Água da Terra',
    description: 'Abundância, generosidade, sabedoria prática.',
    keywords: ['Abundância', 'Generosidade', 'Praticidade', 'Sabedoria'],
    category: 'court'
  },
  {
    id: 'prince-disks',
    name: 'Príncipe de Discos',
    englishName: 'Prince of Disks',
    suit: 'Discos',
    element: 'Ar da Terra',
    description: 'Competência, habilidade, mestria técnica.',
    keywords: ['Competência', 'Habilidade', 'Mestria', 'Técnica'],
    category: 'court'
  },
  {
    id: 'princess-disks',
    name: 'Princesa de Discos',
    englishName: 'Princess of Disks',
    suit: 'Discos',
    element: 'Terra da Terra',
    description: 'Estudos, aplicação prática, início de projetos.',
    keywords: ['Estudos', 'Aplicação', 'Projetos', 'Início'],
    category: 'court'
  }
];