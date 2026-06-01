import type { Lead, LeadMotivo } from '@/types/lead';
import type { Paciente } from '@/types/paciente';
import { todayISO } from '@/lib/business-logic';

// ── Scripts por motivo ─────────────────────────────────────────────

export const SCRIPTS: Record<LeadMotivo, string> = {
  gineco:
    'Que boa iniciativa cuidar da saúde! O Dr. Itamar é muito diferenciado — ele realmente escuta, tem tempo de verdade para você na consulta e usa os protocolos mais modernos. Muitas pacientes nos contam que foi a primeira vez que se sentiram verdadeiramente cuidadas. Vamos garantir um horário especial para você?',
  pre_natal:
    'Que notícia maravilhosa! O pré-natal com o Dr. Itamar é muito especial — acompanhamento multiprofissional, aplicativo Nattal para acompanhar tudo pelo celular, e presença real do início até o parto humanizado. Você não vai ficar sozinha em nenhum momento. Que fase linda!',
  endometriose:
    'Que bom que você está buscando cuidado! O Dr. Itamar é especialista em endometriose e tem um protocolo que realmente transforma a qualidade de vida. Muitas pacientes chegam aqui depois de anos de sofrimento e finalmente encontram a resposta que estavam buscando. Você está no lugar certo!',
  anticoncep:
    'Que bom que está pensando nisso! O Dr. Itamar é referência em anticoncepção de longa duração — DIU e Implanon — e tem uma abordagem muito cuidadosa: apresenta todas as opções com calma e sem pressa, para que você escolha o que faz mais sentido para a sua vida.',
  cirurgia:
    'Entendo que é uma decisão importante e que pode gerar alguma ansiedade — é completamente natural. O Dr. Itamar acompanha cada paciente em todo o processo, antes, durante e depois, e toda a equipe está disponível para você. Você vai estar em mãos muito cuidadosas.',
  parto:
    'Que momento lindo! O Dr. Itamar é referência em parto humanizado e garante estar presente de verdade no seu parto — não manda substituto. Ele respeita cada detalhe do plano de parto e cuida para que esse seja o momento mais seguro e especial possível para você e seu bebê.',
  histeroscopia:
    'Entendo que pode gerar uma certa insegurança não saber o que esperar. O Dr. Itamar explica cada etapa antes e durante o procedimento, e você vai se sentir completamente tranquila e acolhida. Ele faz tudo com muito cuidado e atenção.',
  consulta_retorno:
    'Que saudade! O Dr. Itamar vai adorar receber você de novo. Ele mantém todo o histórico e sabe exatamente onde vocês pararam — é aquele acompanhamento contínuo e personalizado que você merece.',
  ultrassonografia:
    'Aqui o exame é feito com equipamento de última geração e o melhor: o Dr. Itamar explica tudo em tempo real, para você sair sabendo exatamente o que está acontecendo. Sem dúvidas, sem angústia — só clareza e cuidado.',
  vacina:
    'Que ótima iniciativa cuidar da saúde preventiva! O Dr. Itamar oferece um calendário vacinal personalizado para o seu perfil — ele orienta quais vacinas são indicadas para você e garante que tudo seja feito com segurança e atenção.',
  outro:
    'Que bom que nos procurou! Pode me contar um pouquinho mais sobre o que está sentindo? Assim eu consigo te orientar da forma certa. O Dr. Itamar tem um atendimento muito completo — tenho certeza que vamos encontrar a melhor solução juntos.',
};

// ── Objeções com respostas ─────────────────────────────────────────

export interface Objecao {
  codigo: string;
  titulo: string;
  resposta: string;
}

export const OBJECOES: Objecao[] = [
  {
    codigo: 'pensar',
    titulo: '💭 "Vou pensar..."',
    resposta:
      '"Claro, sem problema nenhum! Só queria entender melhor — tem alguma coisa específica que está te dando dúvida? Às vezes consigo te ajudar aqui mesmo. E só para você saber: a agenda está bem concorrida essa semana — não quero que você fique sem um horário especial."',
  },
  {
    codigo: 'caro',
    titulo: '💰 "Está caro..."',
    resposta:
      '"Claro que sim, é muito natural avaliar. O que está incluso é o tempo real de consulta, protocolo personalizado e todo o suporte da equipe — não é uma consulta rápida de 15 minutos. Mas me conta: é o momento financeiro que está pesando ou tem alguma outra dúvida que posso esclarecer?"',
  },
  {
    codigo: 'agenda',
    titulo: '📅 "Deixa eu ver minha agenda..."',
    resposta:
      '"Claro! Enquanto você verifica, posso já separar um horário reservado para você? Se depois não encaixar, é só me avisar com antecedência que liberamos sem problema algum — zero pressão da nossa parte!"',
  },
  {
    codigo: 'pesquisar',
    titulo: '🔍 "Quero pesquisar o médico..."',
    resposta:
      '"Ótimo! Fica totalmente à vontade — é importante se sentir segura. O Instagram do Dr. Itamar é @itamarsantana.go, você vai se sentir muito mais tranquila depois de ver o trabalho dele. Posso reservar um horário enquanto isso? Se não quiser manter, cancela sem compromisso nenhum."',
  },
  {
    codigo: 'ligar',
    titulo: '📞 "Ligo depois..."',
    resposta:
      '"Claro, sem problema! Só queria já te deixar com as opções na cabeça: quais dias e horários costumam funcionar melhor para você? Assim quando você ligar, a gente resolve rapidinho e não corre o risco de a agenda fechar."',
  },
  {
    codigo: 'plano',
    titulo: '🏥 "Tenho plano de saúde..."',
    resposta:
      '"Faz todo sentido pensar nisso! A diferença principal é o tempo e a atenção que o Dr. Itamar dedica — consultas de 1 hora, protocolo próprio, acompanhamento contínuo e personalizado. É uma experiência completamente diferente. Muitas pacientes que têm plano escolhem vir aqui justamente por isso. Posso te explicar como funciona?"',
  },
  {
    codigo: 'medico',
    titulo: '👩‍⚕️ "Já tenho médico..."',
    resposta:
      '"Que ótimo que você já tem acompanhamento — é muito importante ter essa referência! O Dr. Itamar recebe muito bem para uma segunda opinião, sem pressão nenhuma. Às vezes um novo olhar traz informações valiosas. Seria só uma consulta, sem compromisso de trocar de médico."',
  },
];

// ── Helpers ────────────────────────────────────────────────────────

export function genLeadId(): string {
  return 'lead_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function leadAgingDays(lead: Lead): number {
  return Math.floor((Date.now() - lead.timestamp) / (1000 * 60 * 60 * 24));
}

export function isRetornoOverdue(lead: Lead): boolean {
  if (lead.status !== 'retornar' || !lead.dataRetorno) return false;
  return lead.dataRetorno < todayISO();
}

export function findDuplicatePhone(
  phone: string,
  leads: Lead[],
  pacientes: Paciente[],
  excludeId?: string,
): { type: 'lead' | 'paciente'; nome: string } | null {
  const normalized = phone.replace(/\D/g, '');
  if (!normalized || normalized.length < 8) return null;

  const dupLead = leads.find(
    (l) => l.id !== excludeId && l.telefone.replace(/\D/g, '') === normalized,
  );
  if (dupLead) return { type: 'lead', nome: dupLead.nome };

  const dupPac = pacientes.find((p) => p.telefone.replace(/\D/g, '') === normalized);
  if (dupPac) return { type: 'paciente', nome: dupPac.nome };

  return null;
}

export function whatsAppConfirmacao(lead: Lead): string {
  const primeiro = lead.nome.split(' ')[0];
  const txt = `Olá, ${primeiro}! Aqui é a secretária do Dr. Itamar Santana. Tudo certo com o seu agendamento! Qualquer dúvida, estou à disposição. 😊`;
  return `https://wa.me/55${lead.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(txt)}`;
}

export function whatsAppRetornar(lead: Lead): string {
  const primeiro = lead.nome.split(' ')[0];
  const txt = `Olá, ${primeiro}! Aqui é a secretária do Dr. Itamar. Passando para dar continuidade ao nosso contato anterior. Teve chance de pensar a respeito? Posso ajudar com alguma dúvida? 🌸`;
  return `https://wa.me/55${lead.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(txt)}`;
}

export function formatPhone(v: string): string {
  const n = v.replace(/\D/g, '').slice(0, 11);
  if (n.length <= 2) return n;
  if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
}

export interface LeadMetrics {
  total: number;
  agendou: number;
  pendente: number;
  retornar: number;
  perdeu: number;
  conversionRate: number;
  overdue: number;
  byOrigem: Record<string, { total: number; agendou: number }>;
  byMotivo: Record<string, { total: number; agendou: number }>;
}

export function computeLeadMetrics(leads: Lead[]): LeadMetrics {
  const total = leads.length;
  const agendou = leads.filter((l) => l.status === 'agendou').length;
  const pendente = leads.filter((l) => l.status === 'pendente').length;
  const retornar = leads.filter((l) => l.status === 'retornar').length;
  const perdeu = leads.filter((l) => l.status === 'perdeu').length;
  const conversionRate = total > 0 ? Math.round((agendou / total) * 100) : 0;
  const overdue = leads.filter(isRetornoOverdue).length;

  const byOrigem: Record<string, { total: number; agendou: number }> = {};
  leads.forEach((l) => {
    if (!byOrigem[l.origem]) byOrigem[l.origem] = { total: 0, agendou: 0 };
    byOrigem[l.origem].total++;
    if (l.status === 'agendou') byOrigem[l.origem].agendou++;
  });

  const byMotivo: Record<string, { total: number; agendou: number }> = {};
  leads.forEach((l) => {
    if (!byMotivo[l.motivoLabel]) byMotivo[l.motivoLabel] = { total: 0, agendou: 0 };
    byMotivo[l.motivoLabel].total++;
    if (l.status === 'agendou') byMotivo[l.motivoLabel].agendou++;
  });

  return { total, agendou, pendente, retornar, perdeu, conversionRate, overdue, byOrigem, byMotivo };
}
