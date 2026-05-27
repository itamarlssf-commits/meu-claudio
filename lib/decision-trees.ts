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
        texto: 'Que ótimo que entrou em contato, [nome]! Me conta um pouquinho — o que te trouxe até nós hoje?',
        pergunta: 'Qual é o tipo de consulta?',
        opcoes: [
          { label: '📅 Rotina / preventivo',     nextId: 'rotina' },
          { label: '🔍 Tem alguma queixa',        nextId: 'sintoma' },
          { label: '💬 Segunda opinião',          nextId: 'segunda_opiniao' },
        ],
      },
      rotina: {
        id: 'rotina',
        texto: 'Ótimo hábito! O Dr. Itamar faz uma consulta de rotina muito completa — preventivo, papanicolau e toda a orientação. Muitas pacientes dizem que foi a consulta mais completa que já fizeram. Vamos garantir um horário?',
        dica: 'Reforçar que a agenda está concorrida e que é bom garantir logo.',
      },
      sintoma: {
        id: 'sintoma',
        texto: 'Entendo, e fico feliz que esteja buscando cuidado! O Dr. Itamar tem um atendimento muito atencioso — a paciente vai ser muito bem ouvida.',
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
        texto: 'Dor pélvica ou menstrual intensa pode ser sinal de endometriose, mioma ou outras condições tratáveis. O Dr. Itamar é especialista nisso — avalia tudo na consulta e, se precisar, já solicita ultrassom. Quanto antes avaliado, melhor!',
      },
      sint_ciclo: {
        id: 'sint_ciclo',
        texto: 'Irregularidades no ciclo são sempre importantes de investigar. O Dr. Itamar faz avaliação hormonal completa e tem protocolos específicos. Vamos marcar logo para entender o que está acontecendo!',
      },
      sint_corrimento: {
        id: 'sint_corrimento',
        texto: 'Com certeza vamos cuidar disso! O Dr. Itamar faz a avaliação completa, colhe os exames necessários e já orienta o tratamento na mesma consulta. Não deixe arrastar — é simples de resolver.',
      },
      sint_outro: {
        id: 'sint_outro',
        texto: 'Sem problema! O Dr. Itamar tem um atendimento muito abrangente. Ela conta o que está sentindo ao chegar — ele vai avaliar tudo com cuidado, sem pressa.',
      },
      segunda_opiniao: {
        id: 'segunda_opiniao',
        texto: 'Ótima decisão buscar uma segunda opinião! O Dr. Itamar recebe sem julgamentos e sem pressão. Peça para trazer todos os exames e relatórios anteriores — ele vai dar um panorama honesto e personalizado.',
        dica: 'Não questionar o médico anterior. Foco em acolhimento e qualidade da avaliação.',
      },
    },
  },

  // ── PRÉ-NATAL ───────────────────────────────────────────────────
  pre_natal: {
    raiz: 'inicio',
    nos: {
      inicio: {
        id: 'inicio',
        texto: 'Que notícia incrível! O pré-natal com o Dr. Itamar é multiprofissional — inclui o app Nattal para acompanhar tudo pelo celular e suporte do início até o parto humanizado.',
        pergunta: 'Qual é a situação atual?',
        opcoes: [
          { label: '🤰 Já está grávida',        nextId: 'gravida' },
          { label: '🌱 Planejando engravidar',  nextId: 'planejando' },
          { label: '❓ Acabou de descobrir',    nextId: 'confirmando' },
        ],
      },
      gravida: {
        id: 'gravida',
        texto: 'Maravilhoso! O Dr. Itamar acompanha do início até o parto — nenhum momento fica sem cuidado.',
        pergunta: 'Quantas semanas está?',
        opcoes: [
          { label: '🌱 1º trimestre (até 12 sem)',  nextId: 'grav_1tri' },
          { label: '🌷 2º trimestre (13–28 sem)',   nextId: 'grav_2tri' },
          { label: '🌟 3º trimestre (29+ sem)',     nextId: 'grav_3tri' },
        ],
      },
      grav_1tri: {
        id: 'grav_1tri',
        texto: 'Começo ideal! O Dr. Itamar faz a 1ª consulta com todos os exames do 1º trimestre, configura o app Nattal e já planeja o parto humanizado. O bebê vai ter o melhor começo possível!',
        dica: 'Mencionar que quanto antes começar o pré-natal, melhor para mãe e bebê.',
      },
      grav_2tri: {
        id: 'grav_2tri',
        texto: 'Ainda dá tempo de um pré-natal excelente! O Dr. Itamar assume de onde parou, ajusta os exames e garante acompanhamento completo até o parto. Ela vai sentir a diferença!',
      },
      grav_3tri: {
        id: 'grav_3tri',
        texto: 'Bem-vinda! No 3º trimestre o foco é preparar o parto humanizado — plano de parto, sinais de alerta e toda a segurança que mãe e bebê merecem. O Dr. Itamar estará presente de verdade.',
        dica: 'Transmitir segurança. Trocar de médico no 3º trimestre pode gerar ansiedade — reforçar acolhimento.',
      },
      planejando: {
        id: 'planejando',
        texto: 'Que decisão incrível se preparar antes! A consulta pré-concepcional com o Dr. Itamar dura em torno de 1 hora — avalia histórico, ajusta medicações se necessário e cria um plano para a gravidez mais saudável possível.',
        pergunta: 'Tem alguma condição de saúde prévia?',
        opcoes: [
          { label: '✅ Sim, tenho histórico',      nextId: 'plan_sim' },
          { label: '💚 Não, só avaliação geral',  nextId: 'plan_nao' },
        ],
      },
      plan_sim: {
        id: 'plan_sim',
        texto: 'Perfeito que está se cuidando antes! O Dr. Itamar avalia e ajusta tudo com antecedência — medicações, exames específicos — para garantir a gravidez mais segura possível. Essa consulta pode fazer toda a diferença!',
      },
      plan_nao: {
        id: 'plan_nao',
        texto: 'Ótimo! Mesmo sem condições prévias, a consulta pré-concepcional é muito valiosa — orientação sobre ácido fólico, vacinação e estilo de vida. O Dr. Itamar deixa tudo preparado para quando acontecer.',
      },
      confirmando: {
        id: 'confirmando',
        texto: 'Não se preocupe, vamos cuidar de tudo! O Dr. Itamar confirma a gravidez e já inicia o pré-natal na mesma consulta. Os primeiros exames são muito importantes — melhor não perder tempo!',
        dica: 'Transmitir calma e acolhimento. Este momento pode ser emocionante ou assustador para a paciente.',
      },
    },
  },

  // ── ENDOMETRIOSE ────────────────────────────────────────────────
  endometriose: {
    raiz: 'inicio',
    nos: {
      inicio: {
        id: 'inicio',
        texto: 'O Dr. Itamar é especialista em endometriose — clínica e cirúrgica. Muitas pacientes chegam com anos de sofrimento sem diagnóstico correto e finalmente encontram a solução aqui.',
        pergunta: 'Qual é a situação?',
        opcoes: [
          { label: '📋 Já tem diagnóstico',              nextId: 'diagnosticada' },
          { label: '🔍 Suspeita / tem sintomas',         nextId: 'suspeita' },
          { label: '💬 Quer segundo acompanhamento',     nextId: 'acompanhamento' },
        ],
      },
      diagnosticada: {
        id: 'diagnosticada',
        texto: 'O Dr. Itamar tem protocolo específico para endometriose diagnosticada — pode dar continuidade ao tratamento ou reavaliá-lo.',
        pergunta: 'Já fez algum tratamento?',
        opcoes: [
          { label: '💊 Tratamento clínico (hormônios)',  nextId: 'diag_clinico' },
          { label: '🏥 Já fez cirurgia',                nextId: 'diag_cirurgia' },
          { label: '❌ Ainda não tratou',               nextId: 'diag_sem_trat' },
        ],
      },
      diag_clinico: {
        id: 'diag_clinico',
        texto: 'O Dr. Itamar avalia se o protocolo atual está funcionando e ajusta conforme necessário. Ele tem experiência com todas as abordagens — hormonal e não hormonal — para garantir a melhor qualidade de vida.',
      },
      diag_cirurgia: {
        id: 'diag_cirurgia',
        texto: 'O Dr. Itamar faz um acompanhamento pós-cirúrgico cuidadoso para evitar recidivas. Quando indicado, também realiza novas cirurgias com toda segurança. Ela vai estar em boas mãos!',
      },
      diag_sem_trat: {
        id: 'diag_sem_trat',
        texto: 'O Dr. Itamar vai avaliar o melhor momento e abordagem. Com endometriose, iniciar o tratamento certo faz uma diferença enorme na qualidade de vida — e a gente vai encontrar o que funciona para ela.',
        dica: 'Reforçar que tratar logo evita progressão e preserva a fertilidade.',
      },
      suspeita: {
        id: 'suspeita',
        texto: 'Muitas mulheres ficam anos achando que a dor forte é normal — e não é! O Dr. Itamar faz avaliação completa e, se necessário, solicita exames para confirmar o diagnóstico.',
        pergunta: 'Principal sintoma?',
        opcoes: [
          { label: '💢 Dor forte na menstruação',       nextId: 'susp_dor' },
          { label: '👶 Dificuldade para engravidar',    nextId: 'susp_infert' },
          { label: '💔 Dor durante relação',            nextId: 'susp_relacao' },
          { label: '📋 Outro sintoma',                  nextId: 'susp_outro' },
        ],
      },
      susp_dor: {
        id: 'susp_dor',
        texto: 'Dor intensa na menstruação é o sintoma mais clássico da endometriose. Não precisa sofrer assim! O Dr. Itamar faz avaliação completa e já orienta o tratamento. Não deixe para depois!',
      },
      susp_infert: {
        id: 'susp_infert',
        texto: 'A endometriose é uma das principais causas de infertilidade — e tem tratamento! O Dr. Itamar tem protocolo específico para quem quer engravidar. Quanto antes avaliado, maiores as chances!',
        dica: 'Urgente — reforçar a importância de agendar o mais rápido possível.',
      },
      susp_relacao: {
        id: 'susp_relacao',
        texto: 'Dor durante a relação impacta demais a qualidade de vida — e não precisa ser assim. O Dr. Itamar trata com cuidado e discrição. Vamos agendar para ela ter o alívio que merece.',
      },
      susp_outro: {
        id: 'susp_outro',
        texto: 'A endometriose pode se manifestar de formas variadas. O Dr. Itamar faz uma avaliação abrangente para identificar a causa e já orientar o caminho certo.',
      },
      acompanhamento: {
        id: 'acompanhamento',
        texto: 'O Dr. Itamar recebe muito bem para segunda opinião. Peça para trazer todos os exames e relatórios — ele vai dar uma avaliação honesta e um plano personalizado para o caso.',
        dica: 'Não questionar o médico anterior. Transmitir confiança no acolhimento.',
      },
    },
  },

  // ── ANTICONCEPÇÃO ───────────────────────────────────────────────
  anticoncep: {
    raiz: 'inicio',
    nos: {
      inicio: {
        id: 'inicio',
        texto: 'O Dr. Itamar é referência em anticoncepção de longa duração — DIU e Implanon. Ele apresenta todas as opções com calma, sem pressão, para que ela escolha o que faz mais sentido para ela.',
        pergunta: 'Qual é a situação atual?',
        opcoes: [
          { label: '🔄 Quer trocar de método',  nextId: 'troca' },
          { label: '✨ Primeira vez',            nextId: 'primeira_vez' },
          { label: '🤱 Pós-parto',              nextId: 'pos_parto' },
        ],
      },
      troca: {
        id: 'troca',
        texto: 'Perfeito! O Dr. Itamar avalia o histórico e apresenta as melhores opções para ela.',
        pergunta: 'Qual método usa hoje?',
        opcoes: [
          { label: '💊 Pílula diária',               nextId: 'troca_pilula' },
          { label: '💉 Injeção mensal ou trimestral', nextId: 'troca_injecao' },
          { label: '🔧 Outro método',                nextId: 'troca_outro' },
        ],
      },
      troca_pilula: {
        id: 'troca_pilula',
        texto: 'Muitas pacientes trocam a pílula pelo DIU ou Implanon justamente para não precisar lembrar todo dia! O Dr. Itamar explica tudo com calma — ela vai saber o que esperar de cada opção antes de decidir.',
      },
      troca_injecao: {
        id: 'troca_injecao',
        texto: 'Ótimo que já conhece a praticidade dos contraceptivos duradouros! O DIU e o Implanon são ainda mais cômodos — sem retorno mensal. O Dr. Itamar explica tudo em detalhes.',
      },
      troca_outro: {
        id: 'troca_outro',
        texto: 'Sem problema! O Dr. Itamar avalia o histórico dela e apresenta todas as opções — inclusive DIU sem hormônio para quem prefere. Ela vai sair da consulta muito mais informada.',
      },
      primeira_vez: {
        id: 'primeira_vez',
        texto: 'Ótima decisão se proteger! O Dr. Itamar tem uma abordagem muito educativa — sem pressão para escolher nada.',
        pergunta: 'Qual é a principal preocupação?',
        opcoes: [
          { label: '⏰ Praticidade / sem lembrar todo dia', nextId: 'pv_praticidade' },
          { label: '🌿 Quer anticoncepção sem hormônios',   nextId: 'pv_sem_hormonio' },
          { label: '⚠️ Medo de efeitos colaterais',        nextId: 'pv_efeitos' },
        ],
      },
      pv_praticidade: {
        id: 'pv_praticidade',
        texto: 'O Implanon é perfeito para quem quer praticidade — colocado uma vez, funciona por até 3 anos sem precisar de nada. O DIU também é excelente — 3 a 10 anos de proteção. O Dr. Itamar explica qual encaixa melhor no perfil dela.',
      },
      pv_sem_hormonio: {
        id: 'pv_sem_hormonio',
        texto: 'Existe o DIU de cobre — sem nenhum hormônio, dura até 10 anos e é muito eficaz. O Dr. Itamar é especialista nesse método e vai esclarecer todas as dúvidas com calma e sem pressa.',
      },
      pv_efeitos: {
        id: 'pv_efeitos',
        texto: 'Esse medo é muito comum e o Dr. Itamar entende! Ele dedica tempo real para explicar o perfil de cada método — benefícios, possíveis efeitos e como o corpo reage. Ela não vai sair da consulta com dúvidas.',
      },
      pos_parto: {
        id: 'pos_parto',
        texto: 'Ótimo que está pensando na anticoncepção pós-parto!',
        pergunta: 'Está amamentando?',
        opcoes: [
          { label: '🤱 Sim, amamentando',      nextId: 'pp_amamentando' },
          { label: '🍼 Não está amamentando',  nextId: 'pp_nao_amament' },
        ],
      },
      pp_amamentando: {
        id: 'pp_amamentando',
        texto: 'O DIU de cobre e o Implanon são seguros durante a amamentação! O Dr. Itamar pode inserir o DIU ainda no puerpério — muito conveniente. Vamos agendar para ele dar todas as orientações.',
        dica: 'Pílula combinada (estrogênio + progesterona) não é indicada durante a amamentação.',
      },
      pp_nao_amament: {
        id: 'pp_nao_amament',
        texto: 'Todas as opções estão disponíveis nesse momento! O Dr. Itamar vai avaliar o melhor método para o perfil e a rotina dela, considerando o pós-parto recente.',
      },
    },
  },

  // ── CIRURGIA ────────────────────────────────────────────────────
  cirurgia: {
    raiz: 'inicio',
    nos: {
      inicio: {
        id: 'inicio',
        texto: 'O Dr. Itamar realiza cirurgias ginecológicas com foco total na segurança e na recuperação. A paciente é acompanhada em todo o processo — antes, durante e depois.',
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
        texto: 'O Dr. Itamar realiza miomectomia e cistectomia com muita precisão. A abordagem — laparoscópica ou aberta — depende do caso, e ele explica tudo antes. A paciente vai entender completamente o procedimento antes de decidir.',
      },
      laparoscopia: {
        id: 'laparoscopia',
        texto: 'A laparoscopia é a abordagem menos invasiva, com recuperação muito mais rápida. O Dr. Itamar avalia se é indicada para o caso e garante um procedimento seguro com acompanhamento completo no pré e pós-operatório.',
      },
      histerectomia: {
        id: 'histerectomia',
        texto: 'O Dr. Itamar avalia criteriosamente a indicação e apresenta todas as alternativas antes de qualquer decisão. Se a cirurgia for indicada, ele faz com toda segurança e acompanha de perto a recuperação.',
        dica: 'Transmitir segurança. Pacientes de histerectomia geralmente têm muito medo e muitas dúvidas.',
      },
      outra_cirurgia: {
        id: 'outra_cirurgia',
        texto: 'Sem problema! O Dr. Itamar avalia o caso na consulta e explica qual procedimento é mais indicado. Muitas vezes uma boa avaliação já resolve sem necessidade de cirurgia — mas quando necessário, ela estará em ótimas mãos.',
      },
    },
  },

  // ── PARTO ───────────────────────────────────────────────────────
  parto: {
    raiz: 'inicio',
    nos: {
      inicio: {
        id: 'inicio',
        texto: 'O Dr. Itamar é referência em parto humanizado — normal ou cesariana. Ele respeita o plano de parto, está presente de verdade e garante que esse momento seja o mais seguro e bonito possível.',
        pergunta: 'Qual é a situação?',
        opcoes: [
          { label: '🔄 Quer trocar de médico',         nextId: 'trocar' },
          { label: '🌱 Início do pré-natal',           nextId: 'novo' },
          { label: '🤱 Já tem pré-natal, quer o parto', nextId: 'so_parto' },
        ],
      },
      trocar: {
        id: 'trocar',
        texto: 'Completamente compreensível! Sempre é possível mudar quando não se está satisfeita.',
        pergunta: 'O que motivou a troca?',
        opcoes: [
          { label: '👂 Falta de atenção / comunicação',  nextId: 'troca_comunicacao' },
          { label: '🕊️ Quer parto mais humanizado',     nextId: 'troca_humanizacao' },
          { label: '📵 Médico pouco disponível',         nextId: 'troca_disponibilidade' },
        ],
      },
      troca_comunicacao: {
        id: 'troca_comunicacao',
        texto: 'O Dr. Itamar tem um jeito de atender completamente diferente — tempo real de consulta, explica tudo e é acessível. Ela nunca vai sair de uma consulta com dúvidas. Muitas pacientes relatam exatamente essa diferença ao vir para cá.',
      },
      troca_humanizacao: {
        id: 'troca_humanizacao',
        texto: 'O Dr. Itamar é referência em parto humanizado! Respeita o plano de parto, está presente de verdade no momento do parto — não manda residente — e garante que esse momento seja o mais bonito e seguro possível.',
      },
      troca_disponibilidade: {
        id: 'troca_disponibilidade',
        texto: 'O Dr. Itamar tem agenda organizada e se compromete a estar presente no parto das suas pacientes — isso é uma prioridade para ele. Ele é muito claro sobre esse compromisso desde o início do acompanhamento.',
      },
      novo: {
        id: 'novo',
        texto: 'Ótimo que vai começar o pré-natal com o Dr. Itamar!',
        pergunta: 'Quantas semanas está?',
        opcoes: [
          { label: '🌱 Até 12 semanas',     nextId: 'novo_1tri' },
          { label: '🌷 13 a 28 semanas',   nextId: 'novo_2tri' },
          { label: '🌟 Mais de 28 semanas', nextId: 'novo_3tri' },
        ],
      },
      novo_1tri: {
        id: 'novo_1tri',
        texto: 'Começo ideal! O Dr. Itamar começa desde os primeiros exames, configura o app Nattal e planeja o parto humanizado junto com a mamãe desde agora. Que ótima notícia!',
      },
      novo_2tri: {
        id: 'novo_2tri',
        texto: 'Ainda há muito tempo para um pré-natal excelente! O Dr. Itamar assume de onde parou, pega o histórico completo e continua com toda atenção. A paciente vai sentir a diferença!',
      },
      novo_3tri: {
        id: 'novo_3tri',
        texto: 'Bem-vinda! No 3º trimestre o Dr. Itamar foca na preparação do parto humanizado — plano de parto, sinais de alerta, momento do parto. Ainda dá tempo de um final de gravidez muito bem acompanhado!',
        dica: 'Transmitir segurança. Trocar de médico no 3º trimestre pode gerar ansiedade na paciente.',
      },
      so_parto: {
        id: 'so_parto',
        texto: 'Para o Dr. Itamar, conhecer a paciente ao longo do pré-natal é fundamental para o parto ideal — garante segurança total e respeito ao histórico. Mas se quiser uma consulta de avaliação para conversar, ele recebe com prazer e sem compromisso.',
        dica: 'Não fechar a porta. Oferecer uma consulta de avaliação como ponto de entrada.',
      },
    },
  },

  // ── HISTEROSCOPIA ───────────────────────────────────────────────
  histeroscopia: {
    raiz: 'inicio',
    nos: {
      inicio: {
        id: 'inicio',
        texto: 'A histeroscopia com o Dr. Itamar é feita com todo o cuidado para a paciente se sentir segura e tranquila. Ele explica cada etapa do procedimento antes de começar.',
        pergunta: 'Qual é o objetivo?',
        opcoes: [
          { label: '🔍 Diagnóstico / investigação',          nextId: 'diagnostico' },
          { label: '🏥 Tratamento (retirada de pólipo etc)', nextId: 'terapeutica' },
          { label: '❓ Ainda não sabe',                     nextId: 'nao_sabe' },
        ],
      },
      diagnostico: {
        id: 'diagnostico',
        texto: 'A histeroscopia diagnóstica é rápida e ambulatorial. O Dr. Itamar faz com muita delicadeza — explica o que está vendo em tempo real e já dá um retorno na mesma consulta. A paciente vai se sentir muito segura.',
      },
      terapeutica: {
        id: 'terapeutica',
        texto: 'A histeroscopia cirúrgica é feita pelo Dr. Itamar com toda precisão — procedimento seguro, com recuperação rápida. Ele acompanha todo o processo e a paciente não fica sozinha em nenhuma etapa.',
        dica: 'Pode ser feita com anestesia local ou sedação leve — o Dr. decide junto com a paciente conforme o caso.',
      },
      nao_sabe: {
        id: 'nao_sabe',
        texto: 'Sem problema! O Dr. Itamar avalia o caso e explica se a histeroscopia é a melhor opção para ela. Às vezes uma consulta já esclarece tudo antes de qualquer procedimento.',
      },
    },
  },

  // ── CONSULTA DE RETORNO ─────────────────────────────────────────
  consulta_retorno: {
    raiz: 'inicio',
    nos: {
      inicio: {
        id: 'inicio',
        texto: 'Que ótimo que está voltando, [nome]! O Dr. Itamar mantém todo o histórico e garante um acompanhamento contínuo e personalizado. Ele vai adorar te ver de novo!',
        pergunta: 'Qual é o motivo do retorno?',
        opcoes: [
          { label: '🔬 Ver resultado de exames',      nextId: 'exames' },
          { label: '🔄 Continuação do tratamento',   nextId: 'tratamento' },
          { label: '📅 Consulta de rotina periódica', nextId: 'rotina' },
        ],
      },
      exames: {
        id: 'exames',
        texto: 'Perfeito! O Dr. Itamar analisa os resultados com calma e explica tudo detalhadamente. Peça para trazer todos os exames — ele avalia o conjunto completo e já orienta o próximo passo.',
        dica: 'Lembrar de trazer todos os exames impressos ou no celular/nuvem.',
      },
      tratamento: {
        id: 'tratamento',
        texto: 'Ótimo que está dando continuidade! O Dr. Itamar vai avaliar a evolução, ajustar o protocolo se necessário e garantir que o tratamento esteja no caminho certo. Continuidade é fundamental para bons resultados!',
      },
      rotina: {
        id: 'rotina',
        texto: 'Que ótimo hábito retornar regularmente! O Dr. Itamar vai fazer uma avaliação completa, ver se há algo novo e dar todas as orientações preventivas. Saúde em dia!',
      },
    },
  },

  // ── ULTRASSONOGRAFIA ────────────────────────────────────────────
  ultrassonografia: {
    raiz: 'inicio',
    nos: {
      inicio: {
        id: 'inicio',
        texto: 'A ultrassonografia no consultório do Dr. Itamar é feita com equipamento de última geração. Ele explica cada detalhe durante o exame para que a paciente entenda tudo.',
        pergunta: 'Qual tipo de ultrassom?',
        opcoes: [
          { label: '🔵 Pélvico / transvaginal',    nextId: 'pelvico' },
          { label: '👶 Obstétrico (gravidez)',      nextId: 'obstetrico' },
          { label: '❓ Não sabe o tipo ainda',     nextId: 'nao_sabe_tipo' },
        ],
      },
      pelvico: {
        id: 'pelvico',
        texto: 'O ultrassom pélvico ou transvaginal é feito no próprio consultório — sem precisar ir a outro lugar. O Dr. Itamar explica o que está vendo em tempo real e já correlaciona com a consulta. Muito prático!',
      },
      obstetrico: {
        id: 'obstetrico',
        texto: 'O ultrassom obstétrico é um momento muito especial! Equipamento de alta resolução e o Dr. Itamar explica cada detalhe do bebê durante o exame. Ela vai adorar!',
        dica: 'Morfológico de 1º e 2º trimestre pode ser feito no consultório. Checar disponibilidade de agenda.',
      },
      nao_sabe_tipo: {
        id: 'nao_sabe_tipo',
        texto: 'Sem problema! O Dr. Itamar avalia qual tipo de ultrassom é mais adequado para o caso dela. Pode vir com a solicitação médica ou sem — ele avalia e já realiza na mesma consulta quando possível.',
      },
    },
  },

  // ── VACINA ──────────────────────────────────────────────────────
  vacina: {
    raiz: 'inicio',
    nos: {
      inicio: {
        id: 'inicio',
        texto: 'O consultório do Dr. Itamar oferece um calendário vacinal personalizado — ele orienta quais vacinas são indicadas para cada perfil e momento de vida.',
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
        texto: 'A vacina HPV é muito importante para a prevenção do câncer de colo do útero! O Dr. Itamar indica para mulheres de 9 a 45 anos. Na consulta ele avalia o histórico e define o esquema correto.',
        dica: 'Reforçar que a vacina HPV não substitui o papanicolau — os dois são complementares.',
      },
      gripe: {
        id: 'gripe',
        texto: 'A vacina da gripe é especialmente importante para gestantes, pacientes com comorbidades e idosas. O Dr. Itamar orienta o melhor momento e realiza a vacinação no próprio consultório.',
      },
      hepatite: {
        id: 'hepatite',
        texto: 'As vacinas de hepatite A e B oferecem proteção de longo prazo. O Dr. Itamar avalia o status vacinal dela e indica o esquema correto de acordo com a situação atual.',
      },
      calendario: {
        id: 'calendario',
        texto: 'Ótima ideia revisar o calendário vacinal! O Dr. Itamar avalia quais vacinas estão em dia e quais precisam ser atualizadas, criando um plano personalizado. Saúde preventiva em dia!',
      },
    },
  },

  // ── OUTRO ───────────────────────────────────────────────────────
  outro: {
    raiz: 'inicio',
    nos: {
      inicio: {
        id: 'inicio',
        texto: 'Que ótimo que entrou em contato! Conte mais sobre o que está sentindo — o Dr. Itamar tem um atendimento muito completo e certamente vamos encontrar a melhor solução.',
        pergunta: 'Consegue identificar a área?',
        opcoes: [
          { label: '🌸 Área ginecológica',      nextId: 'gineco_geral' },
          { label: '🤰 Relacionado à gravidez', nextId: 'gestacao' },
          { label: '❓ Não sabe ao certo',      nextId: 'nao_sabe' },
        ],
      },
      gineco_geral: {
        id: 'gineco_geral',
        texto: 'Entendido! O Dr. Itamar tem uma consulta muito abrangente — avalia a queixa com calma e define o melhor caminho. A paciente vai ser muito bem ouvida e atendida.',
      },
      gestacao: {
        id: 'gestacao',
        texto: 'O Dr. Itamar atende toda a área obstétrica — planejamento, pré-natal e parto. Me conta mais para eu orientar melhor? Vamos encontrar o melhor horário para ela.',
      },
      nao_sabe: {
        id: 'nao_sabe',
        texto: 'Sem problema nenhum! O Dr. Itamar vai ouvir com atenção e encaminhar da melhor forma. Muitas vezes na consulta é possível identificar e já resolver o que estava incomodando. Vamos agendar!',
      },
    },
  },
};
