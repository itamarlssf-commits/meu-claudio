// Fila de sincronização compartilhada entre useData (escrita) e useAuth (leitura).
// Enquanto um paciente tem edição local ainda não enviada ao Firestore, a versão
// local vence sobre a versão remota — evita que um snapshot que chegue no meio
// da digitação apague o que o usuário acabou de escrever.

export const pendingIds = new Set<string>();
export const deletedIds = new Set<string>();
