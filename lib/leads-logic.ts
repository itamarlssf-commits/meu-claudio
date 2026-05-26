import type { Lead, LeadMotivo } from '@/types/lead';
import type { Paciente } from '@/types/paciente';
import { todayISO } from '@/lib/business-logic';

// ── Scripts por motivo ─────────────────────────────────────────────

export const SCRIPTS: Record<LeadMotivo, string> = {
  gineco:
    'O Dr. Itamar tem um atendimento muito diferenciado — ele dedica tempo real a cada paciente, escuta de verdade e usa os protocolos mais atuais da medicina. Muitas pacientes nos dizem que foi a primeira vez que se sentiram verdadeiramente ouvidas e cuidadas.',
  pre_natal:
    'O pré-natal com o Dr. Itamar é multiprofissional e inclui o aplicativo Nattal, onde a paciente acompanha tudo pelo celular em tempo real. O acompanhamento vai do início até o parto humanizado — ela nunca fica sozinha em nenhuma etapa.',
  endometriose:
    'O Dr. Itamar é especialista em endometriose clínica e cirúrgica. Ele tem um protocolo específico que realmente transforma a qualidade de vida. Muitas pacientes chegam com anos de sofrimento sem diagnóstico correto — e finalmente encontram a solução aqui.',
  anticoncep:
    'O Dr. Itamar é referência em anticoncepção de longa duração — DIU e Implanon. Ele apresenta todas as opções com calma, sem pressão, para que a paciente escolha o que faz mais sentido para ela e para sua saúde.',
  cirurgia:
    'O Dr. Itamar realiza cirurgias ginecológicas com foco total na segurança e na recuperação da paciente. Ela é acompanhada em todo o processo — antes, durante e depois do procedimento, com toda a equipe disponível.',
  parto:
    'O Dr. Itamar é referência em parto humanizado — seja normal ou cesariana. Ele respeita o plano de parto, está presente de verdade e garante que esse momento seja o mais seguro e bonito possível para mãe e bebê.',
  histeroscopia:
    'A histeroscopia com o Dr. Itamar é feita com todo o cuidado para a paciente se sentir segura e tranquila. Ele explica cada etapa do procedimento e garante um pós-procedimento bem acompanhado.',
  consulta_retorno:
    'Que ótimo que a senhora está retornando! O Dr. Itamar vai adorar te ver de novo. Ele mantém todo o histórico e garante um acompanhamento contínuo e personalizado para você.',
  ultrassonografia:
    'A ultrassonografia no consultório do Dr. Itamar é realizada com equipamento de última geração, com toda a atenção e cuidado. O Dr. explica cada detalhe durante o exame para que a paciente entenda tudo o que está acontecendo.',
  vacina:
    'O consultório do Dr. Itamar oferece um calendário vacinal personalizado para cada paciente. Ele orienta sobre quais vacinas são indicadas para o seu perfil e garante um acompanhamento seguro.',
  outro:
    'Conte mais sobre o que está sentindo. O Dr. Itamar tem um atendimento muito completo — certamente vamos encontrar a melhor solução para você.',
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
      '"Claro! Só me conta o que está te impedindo de marcar hoje — às vezes consigo te ajudar. E olha, a agenda do Dr. Itamar está bem concorrida essa semana. Não quero que você perca o horário ideal."',
  },
  {
    codigo: 'caro',
    titulo: '💰 "Está caro..."',
    resposta:
      '"Entendo. O valor é pelo atendimento completo — tempo real de consulta, protocolo personalizado e toda a equipe disponível para você. Mas me conta: o valor ficou fora do orçamento agora ou tem outra preocupação?"',
  },
  {
    codigo: 'agenda',
    titulo: '📅 "Deixa eu ver minha agenda..."',
    resposta:
      '"Perfeito! Posso reservar um horário para você enquanto verifica? Se não conseguir vir, é só me avisar com antecedência que a gente libera sem problema nenhum. Sem pressão!"',
  },
  {
    codigo: 'pesquisar',
    titulo: '🔍 "Quero pesquisar o médico..."',
    resposta:
      '"Com certeza! O Instagram do Dr. Itamar é @itamarsantana.go — você vai ver bastante sobre o trabalho dele lá. Se quiser, já marco o horário e você cancela sem problema se não se sentir confortável."',
  },
  {
    codigo: 'ligar',
    titulo: '📞 "Ligo depois..."',
    resposta:
      '"Claro! Mas já posso te passar os horários disponíveis para você escolher agora? Assim quando ligar de volta, você já sabe o que tem. A agenda costuma fechar rápido."',
  },
  {
    codigo: 'plano',
    titulo: '🏥 "Tenho plano de saúde..."',
    resposta:
      '"Entendo perfeitamente! O diferencial do Dr. Itamar é o acompanhamento personalizado, o tempo dedicado e o protocolo próprio — coisas que o plano infelizmente não consegue oferecer. Muitas pacientes com plano escolhem o Dr. Itamar justamente por isso."',
  },
  {
    codigo: 'medico',
    titulo: '👩‍⚕️ "Já tenho médico..."',
    resposta:
      '"Que ótimo que você já tem acompanhamento! Caso queira uma segunda opinião ou simplesmente conhecer uma abordagem diferente, o Dr. Itamar recebe muito bem. Sem compromisso — é só uma consulta."',
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
