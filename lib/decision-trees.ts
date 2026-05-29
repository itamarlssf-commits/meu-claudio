import type { LeadMotivo } from '@/types/lead';

export interface ScriptOpcao {
  label: string;
  nextId: string;
}

export interface ScriptNo {
  id: string;
  texto: string;
  dica?: string;
  pergunta?: string;
  opcoes?: ScriptOpcao[];
}

export interface ArvoreDecisao {
  raiz: string;
  nos: Record<string, ScriptNo>;
}

export const ARVORES: Record<LeadMotivo, ArvoreDecisao> = {

  // ── GINECOLOGIA ─────────────────────────────────────────────────
  gineco: {
    raiz: 'inicio',
    nos: {
      inicio: {
        id: 'inicio',
        texto: 'Que boa iniciativa cuidar da saúde, [nome]! Me conta um pouquinho — o que te trouxe até nós hoje?',
        dica: 'Sorriso no rosto, tom caloroso. Ela precisa sentir que está falando com alguém que realmente se importa.',
        pergunta: 'Qual é o tipo de consulta?',
        opcoes: [
          { label: '📅 Rotina / preventivo',     nextId: 'rotina' },
          { label: '🔍 Tem alguma queixa',        nextId: 'sintoma' },
          { label: '💬 Segunda opinião',          nextId: 'segunda_opiniao' },
        ],
      },
      rotina: {
        id: 'rotina',
        texto: 'Que ótimo hábito! O Dr. Itamar faz uma consulta de rotina muito completa — preventivo, papanicolau e toda a orientação preventiva. Muitas pacientes nos contam que foi a consulta mais completa que já fizeram na vida. Vamos garantir um horário especial para você?',
        dica: 'Reforce que a agenda costuma fechar rápido — cria urgência natural sem pressão.',
      },
      sintoma: {
        id: 'sintoma',
        texto: 'Que bom que está buscando cuidado — você está tomando a decisão certa! O Dr. Itamar tem um atendimento muito atencioso e você vai ser muito bem ouvida.',
        dica: 'Valide a coragem dela de buscar ajuda. Muitas mulheres adiam por medo ou vergonha.',
        pergunta: 'Qual é a principal queixa?',
        opcoes: [
          { label: '💢 Dor pélvica ou menstrual',  nextId: 'sint_dor' },
          { label: '🔄 Irregularidade no ciclo',   nextId: 'sint_ciclo' },
          { label: '🌡️ Corrimento / desconforto',  nextId: 'sint_corrimento' },
          { label: '📋 Outra queixa',              nextId: 'sint_outro' },
        ],
      },
      sint_dor: {
        id: 'sint_dor',
        texto: 'Entendo, e que bom que está buscando avaliação! Dor pélvica ou menstrual intensa pode ser sinal de endometriose, mioma ou outras condições completamente tratáveis. O Dr. Itamar é especialista nisso — na consulta ele avalia tudo e, se precisar, já solicita o ultrassom. Você não precisa continuar convivendo com isso!',
        dica: 'Muitas mulheres normalizam a dor há anos. Mostre que existe solução e que ela chegou no lugar certo.',
      },
      sint_ciclo: {
        id: 'sint_ciclo',
        texto: 'Que bom que não deixou passar! Irregularidade no ciclo merece atenção e tem tratamento — e quanto antes avaliado, melhor. O Dr. Itamar faz avaliação hormonal completa e tem protocolos muito eficazes. Vamos marcar logo para te dar essa clareza?',
        dica: 'Transmita otimismo: há solução. Evite minimizar a queixa dela.',
      },
      sint_corrimento: {
        id: 'sint_corrimento',
        texto: 'Que bom que está cuidando! Isso é muito mais comum do que parece e tem resolução simples. O Dr. Itamar faz a avaliação completa, colhe os exames e já orienta o tratamento na mesma consulta. Você vai sair muito mais tranquila — prometo!',
        dica: 'Tom acolhedor e discreto. Algumas pacientes sentem vergonha ao falar sobre esse tipo de queixa.',
      },
      sint_outro: {
        id: 'sint_outro',
        texto: 'Pode me contar mais sobre o que está sentindo? Assim eu entendo melhor e te oriento da forma certa. O Dr. Itamar tem um atendimento muito abrangente — tenho certeza que vamos encontrar a solução!',
        dica: 'Demonstre interesse genuíno. Faça ela sentir que a queixa dela importa, por menor que seja.',
      },
      segunda_opiniao: {
        id: 'segunda_opiniao',
        texto: 'Ótima decisão buscar uma segunda opinião — é uma atitude muito inteligente! O Dr. Itamar recebe sem julgamentos e sem pressão. Peça para trazer todos os exames e relatórios — ele vai dar um panorama muito honesto e personalizado para o seu caso.',
        dica: 'Não questione o médico anterior. Foco total em acolhimento e confiança no Dr. Itamar.',
      },
    },
  },

  // ── PRÉ-NATAL ───────────────────────────────────────────────────
  pre_natal: {
    raiz: 'inicio',
    nos: {
      inicio: {
        id: 'inicio',
        texto: 'Que notícia maravilhosa! O pré-natal com o Dr. Itamar é muito especial — acompanhamento multiprofissional, app Nattal para acompanhar tudo pelo celular e presença real do início até o parto humanizado. Você não vai ficar sozinha em nenhum momento!',
        dica: 'Transmita alegria genuína. É um momento muito especial para ela — entre no clima!',
        pergunta: 'Qual é a situação atual?',
        opcoes: [
          { label: '🤰 Já está grávida',        nextId: 'gravida' },
          { label: '🌱 Planejando engravidar',  nextId: 'planejando' },
          { label: '❓ Acabou de descobrir',    nextId: 'confirmando' },
        ],
      },
      gravida: {
        id: 'gravida',
        texto: 'Maravilhoso! O Dr. Itamar acompanha do início até o parto — nenhum momento fica sem cuidado e você vai ter todo o suporte que merece.',
        dica: 'Sorria! Ela está numa fase muito especial. Seu entusiasmo genuíno cria conexão.',
        pergunta: 'Quantas semanas está?',
        opcoes: [
          { label: '🌱 1º trimestre (até 12 sem)',  nextId: 'grav_1tri' },
          { label: '🌷 2º trimestre (13–28 sem)',   nextId: 'grav_2tri' },
          { label: '🌟 3º trimestre (29+ sem)',     nextId: 'grav_3tri' },
        ],
      },
      grav_1tri: {
        id: 'grav_1tri',
        texto: 'Começo perfeito! O Dr. Itamar faz a 1ª consulta com todos os exames do 1º trimestre, configura o app Nattal e já começa a planejar o parto humanizado junto com você. Seu bebê vai ter o melhor começo possível — e você o melhor acompanhamento!',
        dica: 'Reforce: começar cedo é a melhor decisão. Isso é motivo de celebração!',
      },
      grav_2tri: {
        id: 'grav_2tri',
        texto: 'Ainda há muito tempo para um pré-natal incrível! O Dr. Itamar assume de onde parou, pega todo o histórico e continua com atenção total até o parto. Você vai sentir a diferença de um acompanhamento que realmente cuida!',
        dica: 'Não deixe ela se sentir culpada por estar começando "tarde". Reforce que ainda dá tempo.',
      },
      grav_3tri: {
        id: 'grav_3tri',
        texto: 'Bem-vinda, estamos muito felizes em receber você! No 3º trimestre o Dr. Itamar foca em preparar o parto humanizado — plano de parto, sinais de alerta, o momento do parto. Ainda há tempo para um final de gestação muito bem cuidado e com toda a segurança que você merece!',
        dica: 'Transmita muita segurança. Trocar de médico perto do parto pode gerar ansiedade — reconheça isso com empatia.',
      },
      planejando: {
        id: 'planejando',
        texto: 'Que decisão incrível se preparar antes! A consulta pré-concepcional com o Dr. Itamar dura em torno de 1 hora — avalia o histórico completo, ajusta medicações se necessário e cria um plano para a gravidez mais saudável possível. Que presente que você está dando para o seu bebê ainda antes de ele existir!',
        dica: 'Celebre a atitude proativa dela. Pré-concepção é um diferencial que muitas mulheres não conhecem.',
        pergunta: 'Tem alguma condição de saúde prévia?',
        opcoes: [
          { label: '✅ Sim, tenho histórico',      nextId: 'plan_sim' },
          { label: '💚 Não, só avaliação geral',  nextId: 'plan_nao' },
        ],
      },
      plan_sim: {
        id: 'plan_sim',
        texto: 'Que ótimo que está pensando nisso com antecedência — isso faz toda a diferença! O Dr. Itamar avalia e ajusta tudo antes de você engravidar: medicações, exames específicos, cuidados especiais. Essa consulta pode mudar completamente a segurança da sua gravidez!',
        dica: 'Mostre que a situação dela é exatamente a que o Dr. Itamar sabe tratar. Gere confiança.',
      },
      plan_nao: {
        id: 'plan_nao',
        texto: 'Ótimo! Mesmo sem condições prévias, a consulta pré-concepcional é muito valiosa — orientação sobre ácido fólico, vacinação, estilo de vida e tudo o que você pode fazer agora para ter a melhor gravidez possível. O Dr. Itamar deixa tudo preparado para quando o momento chegar!',
        dica: 'Mostre que prevenir é um presente. Ela vai sair da consulta muito mais tranquila e preparada.',
      },
      confirmando: {
        id: 'confirmando',
        texto: 'Que momento especial — e que bom que nos ligou! Não se preocupe, vamos cuidar de tudo juntos. O Dr. Itamar pode confirmar a gravidez e já iniciar o pré-natal na mesma consulta. Os primeiros exames são muito importantes — quanto antes, melhor para você e para o bebê!',
        dica: 'Transmita calma e acolhimento. Esse momento pode ser uma mistura de alegria, susto e dúvidas — seja gentil e segura.',
      },
    },
  },

  // ── ENDOMETRIOSE ────────────────────────────────────────────────
  endometriose: {
    raiz: 'inicio',
    nos: {
      inicio: {
        id: 'inicio',
        texto: 'Que bom que você nos procurou! O Dr. Itamar é especialista em endometriose — clínica e cirúrgica — e tem um protocolo que realmente transforma a qualidade de vida. Muitas pacientes chegam aqui depois de anos de sofrimento e finalmente encontram a resposta que precisavam. Você está no lugar certo!',
        dica: 'Ela provavelmente veio depois de muito tempo sofrendo. Reconheça isso com empatia antes de falar do Dr. Itamar.',
        pergunta: 'Qual é a situação?',
        opcoes: [
          { label: '📋 Já tem diagnóstico',              nextId: 'diagnosticada' },
          { label: '🔍 Suspeita / tem sintomas',         nextId: 'suspeita' },
          { label: '💬 Quer segundo acompanhamento',     nextId: 'acompanhamento' },
        ],
      },
      diagnosticada: {
        id: 'diagnosticada',
        texto: 'Que bom que já tem o diagnóstico — isso já é um passo enorme! O Dr. Itamar vai avaliar o caso com cuidado e pode dar continuidade ou reavaliar o tratamento para garantir a melhor qualidade de vida para você.',
        dica: 'Valide o caminho dela até aqui. Chegar ao diagnóstico muitas vezes é uma longa batalha.',
        pergunta: 'Já fez algum tratamento?',
        opcoes: [
          { label: '💊 Tratamento clínico (hormônios)',  nextId: 'diag_clinico' },
          { label: '🏥 Já fez cirurgia',                nextId: 'diag_cirurgia' },
          { label: '❌ Ainda não tratou',               nextId: 'diag_sem_trat' },
        ],
      },
      diag_clinico: {
        id: 'diag_clinico',
        texto: 'Ótimo que já está em tratamento! O Dr. Itamar vai avaliar se o protocolo atual está funcionando bem para você e ajustar o que for necessário. Ele tem experiência com todas as abordagens — hormonal e não hormonal — e o objetivo é sempre a melhor qualidade de vida.',
        dica: 'Não critique o tratamento anterior. Posicione o Dr. Itamar como alguém que soma, não que substitui.',
      },
      diag_cirurgia: {
        id: 'diag_cirurgia',
        texto: 'Que caminho corajoso você já percorreu! O Dr. Itamar faz um acompanhamento pós-cirúrgico muito cuidadoso para evitar recidivas. Quando indicado, também realiza novas cirurgias com toda segurança e suporte. Você vai estar muito bem amparada!',
        dica: 'Reconheça a coragem dela. Cirurgia é algo que gera medo e ansiedade — ela merece ser acolhida.',
      },
      diag_sem_trat: {
        id: 'diag_sem_trat',
        texto: 'Entendo — às vezes é difícil dar esse próximo passo. Mas a boa notícia é que há tratamento e ele realmente muda tudo! O Dr. Itamar vai avaliar com calma o melhor momento e abordagem para o seu caso. Você não precisa mais conviver com isso.',
        dica: 'Urgente mas sem pressão: o mais rápido que ela tratar, melhor para preservar a fertilidade e a qualidade de vida.',
      },
      suspeita: {
        id: 'suspeita',
        texto: 'Que bom que está investigando — você está certa em não normalizar isso! Muitas mulheres ficam anos achando que a dor é normal, e não é. O Dr. Itamar faz uma avaliação muito completa e, se necessário, já solicita os exames para confirmar.',
        dica: 'Valide a percepção dela. Ela foi invalidada por muito tempo — esse reconhecimento cria vínculo e confiança.',
        pergunta: 'Qual é o principal sintoma?',
        opcoes: [
          { label: '💢 Dor forte na menstruação',       nextId: 'susp_dor' },
          { label: '👶 Dificuldade para engravidar',    nextId: 'susp_infert' },
          { label: '💔 Dor durante relação',            nextId: 'susp_relacao' },
          { label: '📋 Outro sintoma',                  nextId: 'susp_outro' },
        ],
      },
      susp_dor: {
        id: 'susp_dor',
        texto: 'Entendo — e que bom que está buscando ajuda! Dor intensa na menstruação é exatamente o sintoma mais clássico da endometriose. Não precisa mais conviver com isso! O Dr. Itamar faz avaliação completa e já orienta o caminho do tratamento. Quanto antes avaliado, melhor!',
        dica: 'Mostre que ela chegou ao lugar certo. A validação que ela não sofria em vão é muito poderosa.',
      },
      susp_infert: {
        id: 'susp_infert',
        texto: 'Que bom que está investigando isso — e existe esperança! A endometriose é uma das principais causas de infertilidade, e o Dr. Itamar tem um protocolo específico para quem quer engravidar. Quanto antes avaliado, maiores as chances. Vamos marcar com urgência?',
        dica: 'Tom de esperança e urgência. Esse caso merece agilidade — não procastine o agendamento.',
      },
      susp_relacao: {
        id: 'susp_relacao',
        texto: 'Entendo — e esse tipo de dor impacta demais a qualidade de vida e o relacionamento. Não precisa ser assim! O Dr. Itamar trata com muito cuidado e toda discrição. Vamos agendar para que você tenha o alívio que merece?',
        dica: 'Tom muito acolhedor e discreto. Esse é um tema sensível — ela foi corajosa ao mencionar.',
      },
      susp_outro: {
        id: 'susp_outro',
        texto: 'Pode me contar um pouquinho mais? A endometriose pode se manifestar de formas muito variadas e o Dr. Itamar faz uma avaliação muito abrangente para identificar a causa e orientar o melhor caminho.',
        dica: 'Mostre interesse genuíno. Cada caso é único e ela precisa sentir isso.',
      },
      acompanhamento: {
        id: 'acompanhamento',
        texto: 'Ótima atitude buscar uma segunda opinião — você merece ter certeza do melhor caminho! O Dr. Itamar recebe sem julgamentos e sem pressão. Peça para trazer todos os exames e relatórios — ele vai dar uma avaliação muito honesta e um plano personalizado.',
        dica: 'Não questione o médico anterior. Reforce apenas que uma nova perspectiva sempre agrega.',
      },
    },
  },

  // ── ANTICONCEPÇÃO ───────────────────────────────────────────────
  anticoncep: {
    raiz: 'inicio',
    nos: {
      inicio: {
        id: 'inicio',
        texto: 'Que bom que está pensando nisso! O Dr. Itamar é referência em anticoncepção de longa duração — DIU e Implanon — e tem uma abordagem muito cuidadosa: apresenta todas as opções com calma e sem pressa, para que você escolha o que faz mais sentido para a sua vida.',
        dica: 'Tom acolhedor e sem julgamento. Ela está tomando o controle da própria saúde — celebre isso.',
        pergunta: 'Qual é a situação atual?',
        opcoes: [
          { label: '🔄 Quer trocar de método',  nextId: 'troca' },
          { label: '✨ Primeira vez',            nextId: 'primeira_vez' },
          { label: '🤱 Pós-parto',              nextId: 'pos_parto' },
        ],
      },
      troca: {
        id: 'troca',
        texto: 'Que bom que está buscando algo que funcione melhor para você! O Dr. Itamar vai avaliar o histórico e apresentar as melhores opções — sempre com calma e respeito pela sua decisão.',
        dica: 'Não questione o método anterior. Foco em encontrar o que é ideal para ela agora.',
        pergunta: 'Qual método usa hoje?',
        opcoes: [
          { label: '💊 Pílula diária',               nextId: 'troca_pilula' },
          { label: '💉 Injeção mensal ou trimestral', nextId: 'troca_injecao' },
          { label: '🔧 Outro método',                nextId: 'troca_outro' },
        ],
      },
      troca_pilula: {
        id: 'troca_pilula',
        texto: 'Totalmente compreensível querer algo mais prático! Muitas pacientes trocam a pílula pelo DIU ou Implanon exatamente por isso — sem precisar lembrar todo dia e com proteção muito mais longa. O Dr. Itamar explica tudo com calma e você decide com segurança.',
        dica: 'Não critique a pílula — ela funcionou até agora. Posicione o DIU/Implanon como evolução natural.',
      },
      troca_injecao: {
        id: 'troca_injecao',
        texto: 'Que ótimo que já conhece a praticidade dos contraceptivos duradouros! O DIU e o Implanon são ainda mais cômodos — sem retorno mensal ou trimestral. O Dr. Itamar vai explicar todas as diferenças para você fazer a melhor escolha.',
        dica: 'Ela já está predisposta a um método duradouro — facilite a transição.',
      },
      troca_outro: {
        id: 'troca_outro',
        texto: 'Que bom que está buscando algo que faça mais sentido para você! O Dr. Itamar avalia o histórico e apresenta todas as opções — inclusive DIU sem hormônio para quem prefere. Você vai sair da consulta muito mais informada e segura para decidir.',
        dica: 'Não assuma nada sobre o método atual. Deixe ela se sentir ouvida antes de apresentar opções.',
      },
      primeira_vez: {
        id: 'primeira_vez',
        texto: 'Que ótima decisão cuidar disso! O Dr. Itamar tem uma abordagem muito educativa — sem pressa e sem pressão. Ele apresenta todas as opções com clareza para você escolher o que faz mais sentido para a sua vida e sua saúde.',
        dica: 'Ela pode estar nervosa ou insegura. Transmita que não há julgamento e que ela tem controle sobre a decisão.',
        pergunta: 'Qual é a principal preocupação?',
        opcoes: [
          { label: '⏰ Praticidade / sem lembrar todo dia', nextId: 'pv_praticidade' },
          { label: '🌿 Quer anticoncepção sem hormônios',   nextId: 'pv_sem_hormonio' },
          { label: '⚠️ Medo de efeitos colaterais',        nextId: 'pv_efeitos' },
        ],
      },
      pv_praticidade: {
        id: 'pv_praticidade',
        texto: 'O Implanon é perfeito para quem quer praticidade total — colocado uma vez, funciona por até 3 anos sem precisar de nada. O DIU também é excelente, com proteção de 3 a 10 anos. O Dr. Itamar vai explicar qual encaixa melhor no seu perfil e na sua rotina!',
        dica: 'Seja entusiasmada com as opções. Esses métodos realmente mudam a qualidade de vida.',
      },
      pv_sem_hormonio: {
        id: 'pv_sem_hormonio',
        texto: 'Existe o DIU de cobre — sem nenhum hormônio, dura até 10 anos e é muito eficaz. É uma opção incrível para quem prefere algo natural. O Dr. Itamar é especialista nesse método e vai esclarecer todas as dúvidas com calma e sem pressa!',
        dica: 'Valide a preferência dela por hormônios zero. É uma escolha consciente e legítima.',
      },
      pv_efeitos: {
        id: 'pv_efeitos',
        texto: 'Que bom que está pensando nisso — é muito inteligente se informar antes! O Dr. Itamar dedica tempo real para explicar o perfil de cada método — benefícios, o que pode acontecer e como o corpo se adapta. Você não vai sair da consulta com dúvidas!',
        dica: 'O medo de efeitos colaterais é legítimo. Valide, não minimize. A consulta vai responder tudo isso.',
      },
      pos_parto: {
        id: 'pos_parto',
        texto: 'Que ótimo que está pensando na anticoncepção pós-parto — é o momento certo! O Dr. Itamar vai te orientar sobre o que é mais seguro e adequado para essa fase.',
        dica: 'Ela está num período de muitas mudanças. Seja gentil e prática.',
        pergunta: 'Está amamentando?',
        opcoes: [
          { label: '🤱 Sim, amamentando',      nextId: 'pp_amamentando' },
          { label: '🍼 Não está amamentando',  nextId: 'pp_nao_amament' },
        ],
      },
      pp_amamentando: {
        id: 'pp_amamentando',
        texto: 'Ótima notícia: o DIU de cobre e o Implanon são completamente seguros durante a amamentação! O Dr. Itamar pode orientar sobre o melhor momento de inserção e garantir que tanto você quanto o bebê fiquem bem protegidos.',
        dica: 'Informe que a pílula combinada (estrogênio + progesterona) não é recomendada na amamentação — oriente para as opções seguras.',
      },
      pp_nao_amament: {
        id: 'pp_nao_amament',
        texto: 'Ótimo que está pensando nisso! Nesse momento todas as opções estão disponíveis para você. O Dr. Itamar vai avaliar o melhor método considerando o pós-parto recente e a sua rotina — com toda calma e atenção.',
        dica: 'O pós-parto é um período de recuperação — transmita cuidado e tranquilidade.',
      },
    },
  },

  // ── CIRURGIA ────────────────────────────────────────────────────
  cirurgia: {
    raiz: 'inicio',
    nos: {
      inicio: {
        id: 'inicio',
        texto: 'Entendo que é uma decisão importante e que pode gerar alguma ansiedade — e isso é completamente normal. O Dr. Itamar acompanha cada paciente em todo o processo, antes, durante e depois, com toda a equipe disponível. Você vai estar em mãos muito cuidadosas!',
        dica: 'Reconheça o medo antes de vender. Empatia primeiro, confiança depois.',
        pergunta: 'Qual tipo de cirurgia está buscando?',
        opcoes: [
          { label: '🔵 Mioma / cisto',                nextId: 'mioma' },
          { label: '🔬 Laparoscopia / endometriose',  nextId: 'laparoscopia' },
          { label: '🩺 Histerectomia',               nextId: 'histerectomia' },
          { label: '📋 Não sabe ainda',              nextId: 'outra_cirurgia' },
        ],
      },
      mioma: {
        id: 'mioma',
        texto: 'O Dr. Itamar realiza miomectomia e cistectomia com muita precisão e cuidado. Ele explica a abordagem ideal para o seu caso — laparoscópica ou aberta — com toda clareza, para que você entenda e se sinta segura antes de qualquer decisão.',
        dica: 'Reforce que ela terá toda a informação para decidir com tranquilidade. Autonomia é fundamental.',
      },
      laparoscopia: {
        id: 'laparoscopia',
        texto: 'Ótima notícia: a laparoscopia é a abordagem menos invasiva, com recuperação muito mais rápida! O Dr. Itamar avalia se é a mais indicada para o seu caso e garante um procedimento seguro com acompanhamento completo antes e depois.',
        dica: 'Reforce os benefícios da laparoscopia para diminuir o medo — menos invasiva e recuperação mais rápida são pontos fortes.',
      },
      histerectomia: {
        id: 'histerectomia',
        texto: 'Entendo que é uma decisão muito importante — e você está certa em buscar a melhor avaliação. O Dr. Itamar avalia com muito cuidado a indicação e apresenta todas as alternativas antes de qualquer decisão. Se a cirurgia for indicada, você estará em mãos muito seguras e com acompanhamento de perto em toda a recuperação.',
        dica: 'Histerectomia gera muito medo e dúvidas. Seja muito acolhedora e transmita que ela não vai estar sozinha em nenhum momento.',
      },
      outra_cirurgia: {
        id: 'outra_cirurgia',
        texto: 'Sem problema! O Dr. Itamar vai avaliar com calma o seu caso na consulta e explicar qual procedimento é mais indicado — e às vezes uma boa avaliação já resolve sem necessidade de cirurgia. Quando necessário, você vai estar em ótimas mãos e com todo o suporte!',
        dica: 'Mostre que a consulta em si já tem valor — não é só "marcar para operar". Isso diminui a resistência.',
      },
    },
  },

  // ── PARTO ───────────────────────────────────────────────────────
  parto: {
    raiz: 'inicio',
    nos: {
      inicio: {
        id: 'inicio',
        texto: 'Que momento lindo! O Dr. Itamar é referência em parto humanizado — seja normal ou cesariana. Ele respeita cada detalhe do plano de parto, está presente de verdade no momento do nascimento e trabalha para que esse seja o momento mais seguro e especial da sua vida!',
        dica: 'Esse é um dos momentos mais especiais da vida dela. Transmita emoção genuína e segurança.',
        pergunta: 'Qual é a situação?',
        opcoes: [
          { label: '🔄 Quer trocar de médico',         nextId: 'trocar' },
          { label: '🌱 Início do pré-natal',           nextId: 'novo' },
          { label: '🤱 Já tem pré-natal, quer o parto', nextId: 'so_parto' },
        ],
      },
      trocar: {
        id: 'trocar',
        texto: 'Completamente compreensível — você merece se sentir segura e bem cuidada! Muitas pacientes chegam ao Dr. Itamar exatamente assim. Pode me contar um pouquinho o que está te motivando a buscar outro médico?',
        dica: 'Não questione o médico anterior. Seja acolhedora com a decisão dela — é corajoso tomar essa atitude.',
        pergunta: 'O que motivou a troca?',
        opcoes: [
          { label: '👂 Falta de atenção / comunicação',  nextId: 'troca_comunicacao' },
          { label: '🕊️ Quer parto mais humanizado',     nextId: 'troca_humanizacao' },
          { label: '📵 Médico pouco disponível',         nextId: 'troca_disponibilidade' },
        ],
      },
      troca_comunicacao: {
        id: 'troca_comunicacao',
        texto: 'Entendo completamente — você merece ser ouvida de verdade. O Dr. Itamar tem um atendimento completamente diferente: tempo real de consulta, explica tudo com clareza e está sempre acessível. Muitas pacientes nos contam que, pela primeira vez, sentiram que o médico realmente as escutou.',
        dica: 'Ela foi negligenciada antes. Reconheça isso com cuidado — não prometa demais, mas reforce o diferencial real.',
      },
      troca_humanizacao: {
        id: 'troca_humanizacao',
        texto: 'Você está no lugar certo! O Dr. Itamar é referência em parto humanizado — ele está presente de verdade no momento do parto, não manda substituto, respeita o plano de parto em cada detalhe e trabalha para que esse seja o momento mais bonito e seguro possível.',
        dica: 'Reforce o compromisso real do Dr. Itamar: ele aparece. Isso é um diferencial enorme que as pacientes valorizam.',
      },
      troca_disponibilidade: {
        id: 'troca_disponibilidade',
        texto: 'Que frustração ter passado por isso! O Dr. Itamar tem um compromisso muito claro com suas pacientes: ele está presente no parto. Isso é uma prioridade para ele e ele é muito transparente sobre esse compromisso desde o início do acompanhamento.',
        dica: 'Seja firme e segura nessa afirmação. Esse é um dos maiores diferenciais — e ela precisa ouvir isso com clareza.',
      },
      novo: {
        id: 'novo',
        texto: 'Que alegria! O Dr. Itamar vai adorar acompanhar você nessa fase!',
        dica: 'Transmita entusiasmo genuíno. Você está ajudando a construir uma memória que vai durar a vida toda.',
        pergunta: 'Quantas semanas está?',
        opcoes: [
          { label: '🌱 Até 12 semanas',     nextId: 'novo_1tri' },
          { label: '🌷 13 a 28 semanas',   nextId: 'novo_2tri' },
          { label: '🌟 Mais de 28 semanas', nextId: 'novo_3tri' },
        ],
      },
      novo_1tri: {
        id: 'novo_1tri',
        texto: 'Começo perfeito! O Dr. Itamar vai acompanhar desde os primeiros exames, configurar o app Nattal e planejar o parto humanizado junto com você desde agora. Você vai ter o pré-natal e o parto dos seus sonhos — tudo com muita atenção e cuidado!',
        dica: 'Celebre! O começo do pré-natal é o melhor momento para a empolgação.',
      },
      novo_2tri: {
        id: 'novo_2tri',
        texto: 'Ainda há muito tempo para um pré-natal incrível — e o Dr. Itamar vai adorar receber você! Ele assume de onde parou, faz uma avaliação completa e continua com toda a atenção até o parto. Você vai sentir a diferença de um cuidado que é de verdade!',
        dica: 'Não deixe ela se sentir culpada por estar começando no 2º trimestre. Reforce que ainda há muito caminho pela frente.',
      },
      novo_3tri: {
        id: 'novo_3tri',
        texto: 'Bem-vinda — estamos felizes em receber você! No 3º trimestre o Dr. Itamar foca em preparar o parto humanizado com você: plano de parto, sinais de alerta, o momento do nascimento. Ainda dá tempo de um final de gestação muito bem cuidado e inesquecível!',
        dica: 'Transmita muita segurança. Trocar de médico perto do parto é um ato de coragem — reconheça isso.',
      },
      so_parto: {
        id: 'so_parto',
        texto: 'Entendo o que você está buscando! Para o Dr. Itamar, conhecer a paciente ao longo do pré-natal é fundamental para o parto ideal — garante segurança total e respeito ao seu histórico. Mas se quiser uma consulta de avaliação para conversar sobre o caso, ele recebe com muito prazer e sem compromisso nenhum.',
        dica: 'Não feche a porta. Uma consulta de avaliação é o pé na porta — ela pode vir a fazer o pré-natal também.',
      },
    },
  },

  // ── HISTEROSCOPIA ───────────────────────────────────────────────
  histeroscopia: {
    raiz: 'inicio',
    nos: {
      inicio: {
        id: 'inicio',
        texto: 'Entendo que pode gerar uma certa insegurança não saber o que esperar — mas pode ter calma! A histeroscopia com o Dr. Itamar é feita com todo o cuidado. Ele explica cada etapa antes e durante o procedimento, e você vai se sentir completamente tranquila e amparada.',
        dica: 'Reconheça o possível medo antes de falar do procedimento. Empatia primeiro, informação depois.',
        pergunta: 'Qual é o objetivo?',
        opcoes: [
          { label: '🔍 Diagnóstico / investigação',          nextId: 'diagnostico' },
          { label: '🏥 Tratamento (retirada de pólipo etc)', nextId: 'terapeutica' },
          { label: '❓ Ainda não sabe',                     nextId: 'nao_sabe' },
        ],
      },
      diagnostico: {
        id: 'diagnostico',
        texto: 'A histeroscopia diagnóstica é rápida e ambulatorial — e o Dr. Itamar faz com muita delicadeza. Ele vai explicando o que está vendo em tempo real para que você entenda tudo, e já dá um retorno completo na mesma consulta. Muitas pacientes ficam surpresas com o quanto é tranquilo!',
        dica: 'Normalize o procedimento sem minimizar o medo. "Muitas pacientes ficam surpresas" é um argumento muito eficaz.',
      },
      terapeutica: {
        id: 'terapeutica',
        texto: 'A histeroscopia cirúrgica é feita pelo Dr. Itamar com toda a precisão e cuidado. É um procedimento seguro, com recuperação rápida, e você vai ter acompanhamento em todas as etapas — não vai estar sozinha em nenhum momento.',
        dica: 'Pode ser feita com anestesia local ou sedação leve — o Dr. decide junto com a paciente. Mencione isso para reduzir o medo.',
      },
      nao_sabe: {
        id: 'nao_sabe',
        texto: 'Sem problema nenhum — o Dr. Itamar vai avaliar o caso com calma e explicar se a histeroscopia é a melhor opção para você, e o que ela pode revelar. Às vezes uma consulta já esclarece tudo antes de qualquer procedimento. Você vai sair muito mais tranquila e informada!',
        dica: 'Posicione a consulta como o primeiro passo seguro — sem obrigação de fazer o procedimento.',
      },
    },
  },

  // ── CONSULTA DE RETORNO ─────────────────────────────────────────
  consulta_retorno: {
    raiz: 'inicio',
    nos: {
      inicio: {
        id: 'inicio',
        texto: 'Que saudade, [nome]! O Dr. Itamar vai adorar te ver de novo! Ele mantém todo o histórico e sabe exatamente onde vocês pararam — é aquele acompanhamento contínuo e personalizado que só ele oferece.',
        dica: 'Seja genuinamente calorosa. A paciente de retorno já tem uma relação com o consultório — fortaleça esse vínculo.',
        pergunta: 'Qual é o motivo do retorno?',
        opcoes: [
          { label: '🔬 Ver resultado de exames',      nextId: 'exames' },
          { label: '🔄 Continuação do tratamento',   nextId: 'tratamento' },
          { label: '📅 Consulta de rotina periódica', nextId: 'rotina' },
        ],
      },
      exames: {
        id: 'exames',
        texto: 'Ótimo! O Dr. Itamar analisa os resultados com toda a calma que você merece e explica tudo de forma muito clara. Peça para trazer todos os exames — ele avalia o conjunto completo e já orienta o próximo passo. Você vai sair muito mais tranquila!',
        dica: 'Lembrar de trazer os exames impressos ou no celular/nuvem. Isso agiliza muito a consulta.',
      },
      tratamento: {
        id: 'tratamento',
        texto: 'Que ótimo que está dando continuidade — isso faz toda a diferença! O Dr. Itamar vai avaliar a evolução com cuidado, ajustar o que for necessário e garantir que o tratamento esteja no caminho certo para você. Continuidade é fundamental para bons resultados!',
        dica: 'Reforce que ela fez certo em voltar. Pacientes que mantêm o acompanhamento têm resultados muito melhores.',
      },
      rotina: {
        id: 'rotina',
        texto: 'Que ótimo hábito retornar regularmente — você está cuidando muito bem de você! O Dr. Itamar vai fazer uma avaliação completa, ver se há algo novo e dar todas as orientações preventivas. Saúde em dia é o melhor investimento!',
        dica: 'Celebre a disciplina dela. Pacientes que fazem acompanhamento regular são as que têm melhor saúde a longo prazo.',
      },
    },
  },

  // ── ULTRASSONOGRAFIA ────────────────────────────────────────────
  ultrassonografia: {
    raiz: 'inicio',
    nos: {
      inicio: {
        id: 'inicio',
        texto: 'Aqui o exame é feito com equipamento de última geração e com todo o cuidado! O melhor: o Dr. Itamar explica cada detalhe durante o exame para que você saia sabendo exatamente o que está acontecendo — sem dúvidas, sem angústia.',
        dica: 'Reforce que ela vai entender o exame, não só receber um papel. Isso reduz muito a ansiedade.',
        pergunta: 'Qual tipo de ultrassom?',
        opcoes: [
          { label: '🔵 Pélvico / transvaginal',    nextId: 'pelvico' },
          { label: '👶 Obstétrico (gravidez)',      nextId: 'obstetrico' },
          { label: '❓ Não sabe o tipo ainda',     nextId: 'nao_sabe_tipo' },
        ],
      },
      pelvico: {
        id: 'pelvico',
        texto: 'O ultrassom pélvico ou transvaginal é feito no próprio consultório — sem precisar ir a outro lugar e com toda a praticidade. O Dr. Itamar explica o que está vendo em tempo real e já correlaciona com a consulta. Você sai com tudo esclarecido!',
        dica: 'Reforce a praticidade: tudo no mesmo lugar, na mesma consulta.',
      },
      obstetrico: {
        id: 'obstetrico',
        texto: 'Que momento especial! O ultrassom obstétrico aqui é feito com equipamento de alta resolução — e o Dr. Itamar explica cada detalhe do bebê durante o exame. Você vai adorar esse momento!',
        dica: 'Para ultrassom morfológico de 1º e 2º trimestre, verificar disponibilidade de agenda e horários específicos.',
      },
      nao_sabe_tipo: {
        id: 'nao_sabe_tipo',
        texto: 'Sem problema nenhum! O Dr. Itamar avalia qual tipo de ultrassom é mais adequado para o seu caso. Pode vir com ou sem solicitação médica — ele avalia na consulta e já realiza quando possível. Muito mais prático para você!',
        dica: 'Posicione como solução completa em um lugar só. Isso é uma vantagem real sobre hospitais e clínicas de imagem.',
      },
    },
  },

  // ── VACINA ──────────────────────────────────────────────────────
  vacina: {
    raiz: 'inicio',
    nos: {
      inicio: {
        id: 'inicio',
        texto: 'Que ótima iniciativa cuidar da saúde preventiva — parabéns pela atitude! O Dr. Itamar oferece um calendário vacinal personalizado para o seu perfil e orienta com muito cuidado quais vacinas são indicadas para você.',
        dica: 'Celebre a atitude preventiva dela. Vacina é um ato de autocuidado que merece reconhecimento.',
        pergunta: 'Qual vacina está buscando?',
        opcoes: [
          { label: '🦠 HPV',                    nextId: 'hpv' },
          { label: '🤧 Gripe / Influenza',      nextId: 'gripe' },
          { label: '💛 Hepatite A ou B',        nextId: 'hepatite' },
          { label: '📋 Avaliar calendário completo', nextId: 'calendario' },
        ],
      },
      hpv: {
        id: 'hpv',
        texto: 'Ótima escolha! A vacina HPV é uma das mais importantes para a prevenção do câncer de colo do útero. O Dr. Itamar indica para mulheres de 9 a 45 anos e avalia o histórico para definir o esquema mais adequado para você.',
        dica: 'Reforce: vacina HPV não substitui o papanicolau — os dois são complementares e igualmente importantes.',
      },
      gripe: {
        id: 'gripe',
        texto: 'Que cuidado! A vacina da gripe é especialmente importante para gestantes, mulheres com comorbidades e para quem quer se proteger durante o inverno. O Dr. Itamar orienta o melhor momento e realiza a vacinação com todo o cuidado no próprio consultório.',
        dica: 'Reforce a conveniência: vacina no próprio consultório, sem filas ou espera em outro local.',
      },
      hepatite: {
        id: 'hepatite',
        texto: 'Ótima iniciativa! As vacinas de hepatite A e B oferecem proteção de longo prazo e são muito importantes. O Dr. Itamar avalia o status vacinal dela e indica o esquema correto de acordo com a situação atual — com toda a orientação necessária.',
        dica: 'Muitas pacientes não sabem se já tomaram ou quantas doses tomaram. Ressalte que o Dr. avalia isso.',
      },
      calendario: {
        id: 'calendario',
        texto: 'Que atitude incrível revisar o calendário vacinal! O Dr. Itamar avalia quais vacinas estão em dia e quais precisam ser atualizadas, criando um plano completamente personalizado para você. Saúde preventiva em dia é o melhor investimento!',
        dica: 'Posicione como um "check-up" vacinal — algo que toda mulher deveria fazer e que poucos fazem.',
      },
    },
  },

  // ── OUTRO ───────────────────────────────────────────────────────
  outro: {
    raiz: 'inicio',
    nos: {
      inicio: {
        id: 'inicio',
        texto: 'Que bom que nos procurou, [nome]! Pode me contar um pouquinho mais sobre o que está sentindo? Assim eu entendo melhor e te oriento da forma certa. O Dr. Itamar tem um atendimento muito completo — tenho certeza que vamos encontrar a melhor solução juntos!',
        dica: 'Demonstre interesse genuíno. Faça ela sentir que a queixa dela importa, por menor que pareça.',
        pergunta: 'Consegue identificar a área?',
        opcoes: [
          { label: '🌸 Área ginecológica',      nextId: 'gineco_geral' },
          { label: '🤰 Relacionado à gravidez', nextId: 'gestacao' },
          { label: '❓ Não sabe ao certo',      nextId: 'nao_sabe' },
        ],
      },
      gineco_geral: {
        id: 'gineco_geral',
        texto: 'Entendido! O Dr. Itamar tem uma consulta muito abrangente — avalia a queixa com calma, sem pressa, e define o melhor caminho para você. Você vai ser muito bem ouvida e atendida!',
        dica: 'Reforce a escuta. Muitas pacientes chegam com queixas que outros médicos descartaram — o Dr. Itamar vai ouvir.',
      },
      gestacao: {
        id: 'gestacao',
        texto: 'O Dr. Itamar atende toda a área obstétrica — desde o planejamento até o parto. Pode me contar um pouquinho mais para eu te orientar melhor? Vamos encontrar o horário ideal para você!',
        dica: 'Seja calorosa e curiosa. Perguntar mais demonstra interesse genuíno.',
      },
      nao_sabe: {
        id: 'nao_sabe',
        texto: 'Sem problema nenhum! O Dr. Itamar vai ouvir com toda a atenção e encaminhar da melhor forma possível. Muitas vezes na consulta é possível identificar e já começar a resolver o que estava incomodando. Vamos agendar e colocar você no cuidado que merece?',
        dica: 'Não precisa ter resposta para tudo agora. A consulta é o primeiro passo — facilite esse passo.',
      },
    },
  },
};
