import { Position, SpreadPosition, SpreadType } from '../types/tarot';

// Three Card Spread Positions
const threeCardPositions: Position[] = [
  {
    id: 'past',
    name: 'Passado',
    description: 'Representa o que veio antes, as influências passadas que formam o presente.',
    crowleyInterpretation: 'O passado não está inerte, mas continua a pulsar através da corrente de sangue que flui no presente. Representa a base causal das circunstâncias atuais.'
  },
  {
    id: 'present',
    name: 'Presente',
    description: 'Representa a situação atual e as energias em jogo no momento.',
    crowleyInterpretation: 'O presente é o ponto preciso de equilíbrio entre todas as forças, o momento da manifestação da Vontade Verdadeira. É a condensação de todas as causalidades em um único instante.'
  },
  {
    id: 'future',
    name: 'Futuro',
    description: 'Representa as tendências emergentes e os possíveis resultados.',
    crowleyInterpretation: 'O futuro não é fixo, mas uma probabilidade que depende da compreensão e ação consciente no presente. Representa a direção na qual a corrente de energia está fluindo.'
  }
];

// Celtic Cross Positions
const celticCrossPositions: Position[] = [
  {
    id: 'significator',
    name: 'Significador',
    description: 'Representa o consultante ou a questão central.',
    crowleyInterpretation: 'A carta que representa a essência da questão ou do consulente. É o centro gravitacional da leitura, contendo em si o DNA completo da situação.'
  },
  {
    id: 'crossing',
    name: 'Influência Cruzada',
    description: 'Representa as forças que ajudam ou atrapalham a situação central.',
    crowleyInterpretation: 'As energias que cruzam o caminho - oposições, desafios ou complementos. Podem ser forças internas contraditórias ou obstáculos externos. A natureza do conflito a ser transcendido.'
  },
  {
    id: 'crown',
    name: 'Coroa',
    description: 'Representa o que o consultante espera alcançar ou o que pode ser alcançado.',
    crowleyInterpretation: 'O que paira acima da consciência - o ideal aspiracional ou o pensamento superior que guia a situação, mesmo que inconscientemente. Relaciona-se à Tríade Superna na Árvore da Vida.'
  },
  {
    id: 'foundation',
    name: 'Base',
    description: 'Representa as fundações da situação, o passado recente.',
    crowleyInterpretation: 'A base material e psicológica sobre a qual toda a situação está construída. O terreno fértil ou estéril de onde emergem as possibilidades. Corresponde a Malkuth na Árvore da Vida.'
  },
  {
    id: 'past',
    name: 'Passado Recente',
    description: 'Eventos recentes que influenciam a situação atual.',
    crowleyInterpretation: 'A influência que está se afastando mas ainda pulsa no tecido da situação. O que acabou de moldar o presente e ainda deixa sua marca energética.'
  },
  {
    id: 'future',
    name: 'Futuro Imediato',
    description: 'O que está prestes a acontecer.',
    crowleyInterpretation: 'O que está por vir, as sementes que já germinaram mas ainda não romperam a superfície. O próximo movimento na dança do Destino e Vontade.'
  },
  {
    id: 'self',
    name: 'O Consultante',
    description: 'Como o consultante se vê ou como está agindo na situação.',
    crowleyInterpretation: 'A atitude atual do consulente, seu estado mental e emocional. O papel que adotou no drama sendo representado. A máscara que utiliza para enfrentar o desafio.'
  },
  {
    id: 'environment',
    name: 'Ambiente Externo',
    description: 'As influências externas, como outras pessoas veem a situação.',
    crowleyInterpretation: 'A atmosfera que circunda a questão - influências sociais, ambientais e de outros seres. As forças do macrocosmo que espelham e interagem com o microcosmo do consulente.'
  },
  {
    id: 'hopes-fears',
    name: 'Esperanças e Medos',
    description: 'Os desejos e temores do consultante relacionados à situação.',
    crowleyInterpretation: 'A projeção do desejo e da ansiedade - muitas vezes indistinguíveis, pois tememos o que desejamos e desejamos o que tememos. A tensão psicológica que colore a percepção da situação.'
  },
  {
    id: 'outcome',
    name: 'Resultado Final',
    description: 'O resultado provável se o caminho atual for seguido.',
    crowleyInterpretation: 'A cristalização final de todas as forças em jogo, caso continuem em suas trajetórias atuais. Não é uma sentença imutável, mas a culminação natural das energias presentes, a menos que sejam conscientemente transmutadas.'
  }
];

// Tree of Life Positions
const treeOfLifePositions: Position[] = [
  {
    id: 'kether',
    name: 'Kether (Coroa)',
    description: 'O princípio supremo, a origem, o início da questão.',
    crowleyInterpretation: 'O ponto primordial da Vontade divina, de onde emana toda possibilidade. Na leitura, representa a essência pura e o propósito superior da questão, seu aspecto mais elevado e unificado.'
  },
  {
    id: 'chokmah',
    name: 'Chokmah (Sabedoria)',
    description: 'A força dinâmica, o princípio masculino da questão.',
    crowleyInterpretation: 'A força dinâmica e criativa, a energia pura em movimento. Representa o aspecto ativo, assertivo e expansivo da situação - a sabedoria que vem da experiência direta e não do intelecto.'
  },
  {
    id: 'binah',
    name: 'Binah (Entendimento)',
    description: 'O princípio formativo, o aspecto feminino da questão.',
    crowleyInterpretation: 'O grande mar da compreensão, onde as ideias tomam forma. Representa os limites necessários, a estrutura e a compreensão profunda das consequências. É o útero cósmico onde a energia de Chokmah é gestada em forma.'
  },
  {
    id: 'chesed',
    name: 'Chesed (Misericórdia)',
    description: 'A organização e estabilidade, os aspectos construtivos.',
    crowleyInterpretation: 'A força construtiva e ordenadora, a misericórdia e abundância. Representa a expansão benevolente, a estabilidade e a capacidade de construir estruturas duradouras na situação.'
  },
  {
    id: 'geburah',
    name: 'Geburah (Rigor)',
    description: 'A energia de ruptura, os desafios necessários.',
    crowleyInterpretation: 'A força purificadora e destruidora, o rigor necessário. Representa os desafios, obstáculos e a necessidade de eliminação do supérfluo. É a energia que corta o que não serve mais.'
  },
  {
    id: 'tiphareth',
    name: 'Tiphareth (Beleza)',
    description: 'O centro harmonizador, o equilíbrio da questão.',
    crowleyInterpretation: 'O sol central, o ponto de equilíbrio e harmonia. Representa o coração da questão, a beleza que emerge do equilíbrio das forças, a consciência solar que ilumina todo o sistema.'
  },
  {
    id: 'netzach',
    name: 'Netzach (Vitória)',
    description: 'As emoções, desejos e impulsos relacionados.',
    crowleyInterpretation: 'A esfera das emoções, da arte e da vitória natural. Representa os desejos, paixões e motivações emocionais que impulsionam a situação, bem como a beleza instintiva que busca expressão.'
  },
  {
    id: 'hod',
    name: 'Hod (Esplendor)',
    description: 'O intelecto, comunicação e análise da situação.',
    crowleyInterpretation: 'A esfera do intelecto, da comunicação e das formas mentais. Representa os aspectos racionais, analíticos e comunicativos da questão, bem como as estruturas de pensamento que a moldam.'
  },
  {
    id: 'yesod',
    name: 'Yesod (Fundação)',
    description: 'O subconsciente, as bases emocionais e psíquicas.',
    crowleyInterpretation: 'A fundação lunar, o reino do inconsciente e dos padrões automáticos. Representa as bases psíquicas da situação, as influências subconscientes, sonhos e padrões cíclicos em operação.'
  },
  {
    id: 'malkuth',
    name: 'Malkuth (Reino)',
    description: 'A manifestação material, o resultado prático.',
    crowleyInterpretation: 'O reino da manifestação física, o plano terrestre. Representa o aspecto mais concreto e tangível da questão, o resultado final na matéria e o que pode ser percebido pelos sentidos.'
  }
];

// Layout coordinates for visual representation
const threeCardLayout: SpreadPosition[] = threeCardPositions.map((position, index) => ({
  ...position,
  x: 50 + (index - 1) * 100,
  y: 50,
  rotation: 0,
  isReversed: false
}));

const celticCrossLayout: SpreadPosition[] = [
  { ...celticCrossPositions[0], x: 50, y: 50, rotation: 0 },
  { ...celticCrossPositions[1], x: 50, y: 50, rotation: 90 },
  { ...celticCrossPositions[2], x: 50, y: 0, rotation: 0 },
  { ...celticCrossPositions[3], x: 50, y: 100, rotation: 0 },
  { ...celticCrossPositions[4], x: 0, y: 50, rotation: 0 },
  { ...celticCrossPositions[5], x: 100, y: 50, rotation: 0 },
  { ...celticCrossPositions[6], x: 150, y: 0, rotation: 0 },
  { ...celticCrossPositions[7], x: 150, y: 25, rotation: 0 },
  { ...celticCrossPositions[8], x: 150, y: 50, rotation: 0 },
  { ...celticCrossPositions[9], x: 150, y: 75, rotation: 0 }
];

const treeOfLifeLayout: SpreadPosition[] = [
  { ...treeOfLifePositions[0], x: 50, y: 0, rotation: 0 },   // Kether
  { ...treeOfLifePositions[1], x: 15, y: 10, rotation: 0 },  // Chokmah
  { ...treeOfLifePositions[2], x: 85, y: 10, rotation: 0 },  // Binah
  { ...treeOfLifePositions[3], x: 15, y: 30, rotation: 0 },  // Chesed
  { ...treeOfLifePositions[4], x: 85, y: 30, rotation: 0 },  // Geburah
  { ...treeOfLifePositions[5], x: 50, y: 40, rotation: 0 },  // Tiphareth
  { ...treeOfLifePositions[6], x: 15, y: 60, rotation: 0 },  // Netzach
  { ...treeOfLifePositions[7], x: 85, y: 60, rotation: 0 },  // Hod
  { ...treeOfLifePositions[8], x: 50, y: 80, rotation: 0 },  // Yesod
  { ...treeOfLifePositions[9], x: 50, y: 100, rotation: 0 }, // Malkuth
];

// Define the spreads
export const spreads: SpreadType[] = [
  {
    id: 'three-card',
    name: 'Três Cartas',
    description: 'Uma leitura simples que mostra o passado, presente e futuro da questão.',
    positions: threeCardPositions,
    layout: threeCardLayout
  },
  {
    id: 'celtic-cross',
    name: 'Cruz Celta',
    description: 'Uma leitura abrangente que examina múltiplos aspectos da situação. Desenvolvida por leitura divinatória tradicional, mas interpretada aqui sob a ótica thelêmica de Crowley.',
    positions: celticCrossPositions,
    layout: celticCrossLayout
  },
  {
    id: 'tree-of-life',
    name: 'Árvore da Vida',
    description: 'Uma leitura esotérica baseada na Cabala, que mostra como a questão se manifesta através das dez Sephiroth.',
    positions: treeOfLifePositions,
    layout: treeOfLifeLayout
  }
];

// Helper function to get a spread by ID
export const getSpreadById = (id: 'three-card' | 'celtic-cross' | 'tree-of-life'): SpreadType => {
  return spreads.find(spread => spread.id === id) || spreads[0];
};

// Helper function to generate Crowley-inspired interpretations based on card and position
export const generateInterpretation = (cardId: string, positionId: string): string => {
  // This would ideally contain a database of Crowley's interpretations for each card in each position
  // For now, we'll return a generic message
  return `A carta nesta posição sugere uma influência importante segundo a visão de Crowley. 
  Examine cuidadosamente as correspondências cabalísticas, astrológicas e elementais para uma compreensão mais profunda.
  Lembre-se que para Crowley, cada carta é um microcosmo contendo o macrocosmo completo, e sua posição revela como esta energia específica se manifesta na questão.`;
};
