import React, { useState } from 'react';

const FAQSection: React.FC = () => {
  // Set section to be collapsed by default
  const [sectionExpanded, setSectionExpanded] = useState(false);
  
  const initialQuestions = [
    { id: 1, question: "O que é o Tarot de Thoth?", answer: "O Tarot de Thoth é um baralho esotérico criado pelo mago e ocultista britânico Aleister Crowley no século XX, com ilustrações de sua discípula Frieda Harris. Também conhecido como Tarot de Crowley, destaca-se por suas 78 cartas repletas de simbolismos complexos, que integram astrologia, cabala, gematria (numerologia) e mitologia, sobretudo egípcia." },
    { id: 2, question: "Qual a origem do Tarot de Thoth?", answer: "Aleister Crowley (1875-1947), fundador da filosofia Thelema baseada no Livro da Lei – que ele afirmava ter sido ditado por Aiwass, mensageiro do deus Horus – idealizou o Tarot de Thoth junto à artista Frieda Harris, que sugeriu uma releitura do tarot tradicional. Trabalharam juntos de 1938 a 1943, porém o baralho somente foi publicado em 1969, após o falecimento de ambos. Crowley também escreveu o Livro de Thoth, que expõe sua filosofia e métodos de tiragem." },
    { id: 3, question: "Quais as características do Tarot de Thoth?", answer: "Suas cartas apresentam ricas ilustrações com simbolismos esotéricos, incluindo astrologia, cabala, gematria e filosofia, com forte influência egípcia. O baralho contém 22 Arcanos Maiores e 56 Menores. Algumas cartas possuem nomes diferentes do tarot tradicional, aumentando sua complexidade interpretativa." },
    { id: 4, question: "Quais são as diferenças entre o Tarot de Thoth e o Tarot tradicional?", answer: "Além dos elaborados simbolismos e da arte única, algumas cartas possuem nomenclaturas distintas: Volúpia substitui A Força, Fortuna substitui A Roda da Fortuna, Ajustamento substitui A Justiça, Arte substitui A Temperança, Aeon substitui O Julgamento, O Universo substitui O Mundo. No Tarot de Thoth, as cartas de corte também diferem: Cavaleiro substitui o Rei, Príncipe substitui o Cavaleiro, Princesa substitui o Valete." },
    { id: 5, question: "Como funciona a leitura do Tarot de Thoth?", answer: "O Tarot de Thoth pode ser utilizado como outros oráculos: embaralhando-se as cartas e interpretando-as. Entretanto, Crowley propôs um método específico descrito no Livro de Thoth, utilizando 10 cartas para uma leitura profunda e completa." },
    { id: 6, question: "Como jogar o Tarot de Thoth em um método simplificado?", answer: "Mentalização: embaralhe as cartas enquanto mentaliza sua questão. Retirada: retire três cartas que indicarão: Primeira Carta: causa da situação. Segunda Carta: desenvolvimento do cenário. Terceira Carta: consequência provável." },
    { id: 7, question: "Quem foi Aleister Crowley?", answer: "Aleister Crowley foi um renomado ocultista, mago, escritor e fundador da Thelema, conhecido por suas contribuições à magia cerimonial, filosofia esotérica e tarologia. Sua figura controversa inspira estudos até hoje por sua visão profunda sobre a espiritualidade e o tarot." }
  ];

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    if (id === -1) {
      setSectionExpanded(!sectionExpanded);
    } else {
      setExpandedId(expandedId === id ? null : id);
    }
  };

  return (
    <div className="mt-16 mb-12">
      <div className="max-w-4xl mx-auto">
        <div 
          className="flex flex-col items-center cursor-pointer group" 
          onClick={() => toggleExpand(-1)}
        >
          <div className="w-20 h-1 bg-yellow-400/40 mb-6"></div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 font-cinzel">
            Tarot de Thoth – Perguntas Frequentes (FAQ)
          </h2>
          <div className="w-48 h-0.5 bg-yellow-400/40 mt-3 mb-6 group-hover:w-56 transition-all duration-300"></div>
          <div className={`text-yellow-400 transition-transform duration-300 ${sectionExpanded ? 'rotate-180' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className={`mt-8 space-y-4 ${sectionExpanded ? '' : 'hidden'}`}>
          {initialQuestions.map(({ id, question, answer }) => (
            <div key={id} className="bg-indigo-900/40 rounded-lg overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-indigo-800/50 transition-colors"
                onClick={() => toggleExpand(id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400">
                    <i className={`fas fa-${id === 1 ? 'ankh' : id === 2 ? 'moon' : id === 3 ? 'eye' : id === 4 ? 'star' : id === 5 ? 'book-open' : id === 6 ? 'hands' : 'user-alt'}`}></i>
                  </div>
                  <h3 className="text-xl font-semibold text-white font-cinzel">{question}</h3>
                </div>
                <div className={`text-yellow-400 transition-transform duration-300 ${expandedId === id ? 'rotate-45' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="faq-answer transition-all duration-300" style={{ 
                maxHeight: expandedId === id ? '1000px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease-in-out'
              }}>
                <div className="p-4 pt-0 text-purple-200 bg-indigo-900/20">
                  <p className="leading-relaxed">{answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
