// Detecção de rosto na selfie do ponto.
//
// Objetivo: garantir que a foto tirada no registro contém um rosto humano
// (não uma parede, um print ou foto preta). NÃO é reconhecimento facial /
// biometria — não identifica QUEM é, só confirma que HÁ um rosto.
//
// A biblioteca pesada (@vladmandic/face-api) é carregada sob demanda (dynamic
// import) só quando a verificação roda, para não pesar o carregamento inicial.
// Os pesos do modelo vêm de um CDN em tempo de execução. Se o modelo não puder
// carregar (offline/bloqueado), a verificação é considerada "não realizada" e o
// fluxo de chamada decide o que fazer (aqui: deixa registrar, mas a foto
// continua obrigatória).

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

export interface ResultadoRosto {
  // Há pelo menos um rosto detectado na imagem.
  temRosto: boolean;
  // A verificação realmente rodou (modelo carregou e processou a imagem).
  verificado: boolean;
}

let modeloCarregado = false;

function carregarImagem(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

/**
 * Verifica se há um rosto na selfie. Nunca lança: em caso de falha devolve
 * `{ temRosto: false, verificado: false }` para o chamador decidir.
 */
export async function detectarRosto(file: File): Promise<ResultadoRosto> {
  if (typeof window === 'undefined') {
    return { temRosto: false, verificado: false };
  }
  try {
    const faceapi = await import('@vladmandic/face-api');

    if (!modeloCarregado) {
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      modeloCarregado = true;
    }

    const img = await carregarImagem(file);
    const deteccoes = await faceapi.detectAllFaces(
      img,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 }),
    );

    return { temRosto: deteccoes.length > 0, verificado: true };
  } catch {
    // Modelo não carregou / ambiente sem suporte: não bloqueia o fluxo.
    return { temRosto: false, verificado: false };
  }
}
