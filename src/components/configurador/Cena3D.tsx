"use client";
// Os objetos three.js (materiais, texturas, refs) são mutados dentro de useFrame:
// é o padrão do react-three-fiber para animar sem re-renderizar a cada frame.
/* eslint-disable react-hooks/immutability */

import { ContactShadows, useTexture } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import type { Peca } from "@/config/precos";
import { contorno, encaixar, type Area } from "@/lib/silhueta";

export type EstadoRotacao = { atual: number; alvo: number; velocidade: number; aArrastar: boolean };

type Props = {
  peca: Peca;
  corHex: string;
  estampa: { id: string; imagemUrl: string; proporcao: number } | null;
  areas: Area[];
  rotacao: MutableRefObject<EstadoRotacao>;
  reduzirMovimento: boolean;
  origemVoo: "esquerda" | "baixo";
};

const ESPESSURA = 0.5;
const BISEL = 0.24;
const FACE_Z = ESPESSURA / 2 + BISEL;

function geometriaPeca(peca: Peca): THREE.ExtrudeGeometry {
  const { inicio, segmentos } = contorno(peca);
  const forma = new THREE.Shape();
  forma.moveTo(inicio[0], inicio[1]);
  for (const s of segmentos) {
    if (s.tipo === "Q") forma.quadraticCurveTo(s.c[0], s.c[1], s.p[0], s.p[1]);
    else forma.lineTo(s.p[0], s.p[1]);
  }
  const g = new THREE.ExtrudeGeometry(forma, {
    depth: ESPESSURA,
    bevelEnabled: true,
    bevelThickness: BISEL,
    bevelSize: 0.16,
    bevelSegments: 10,
    curveSegments: 28,
  });
  g.translate(0, 0, -ESPESSURA / 2);
  g.computeVertexNormals();
  return g;
}

// Textura de malha procedimental (relevo subtil do algodão), sem ficheiros externos.
function texturaMalha(): THREE.DataTexture {
  const n = 128;
  const dados = new Uint8Array(n * n * 4);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const malha = Math.sin(x * 1.6) * 0.5 + Math.sin(y * 3.2 + (x % 2) * 1.5) * 0.5;
      const v = 128 + malha * 40 + (Math.random() - 0.5) * 50;
      const i = (y * n + x) * 4;
      dados[i] = dados[i + 1] = dados[i + 2] = v;
      dados[i + 3] = 255;
    }
  }
  const t = new THREE.DataTexture(dados, n, n);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2.2, 2.2);
  t.needsUpdate = true;
  return t;
}

function Enquadrar({ peca }: { peca: Peca }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const meiaAltura = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const largura = peca === "tshirt" ? 9.4 : 9.2;
    const altura = 9.2;
    const dist = Math.max(altura / (2 * meiaAltura), largura / (2 * meiaAltura * (size.width / size.height)));
    cam.position.set(0, 0.2, dist + 0.6);
    cam.lookAt(0, 0, 0);
  }, [camera, size, peca]);
  return null;
}

function Estampa({
  area,
  url,
  proporcao,
  voar,
  origemVoo,
  aoAterrar,
}: {
  area: Area;
  url: string;
  proporcao: number;
  voar: boolean;
  origemVoo: Props["origemVoo"];
  aoAterrar: () => void;
}) {
  const textura = useTexture(url);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.anisotropy = 8;
  const ref = useRef<THREE.Mesh>(null);
  const tempo = useRef(voar ? 0 : 1.4);
  const aterrou = useRef(!voar);
  const tamanho = encaixar(area, proporcao);
  const lado = area.face === "frente" ? 1 : -1;
  const x = area.face === "frente" ? area.x : -area.x;
  const alvo = useMemo(() => new THREE.Vector3(x, area.y, lado * (FACE_Z + 0.006)), [x, area.y, lado]);
  // Vem do lado da lista de estampas (esquerda no computador, de baixo no telemóvel)
  const origem = useMemo(
    () =>
      origemVoo === "esquerda"
        ? new THREE.Vector3(x - 7 * lado, area.y + 2.5, lado * 7)
        : new THREE.Vector3(x, area.y - 7, lado * 7),
    [x, area.y, lado, origemVoo],
  );
  const escalaAtual = useRef(new THREE.Vector2(tamanho.largura, tamanho.altura));

  useFrame((_, dt) => {
    const m = ref.current;
    if (!m) return;
    tempo.current += dt;
    const DURACAO = 0.85;
    const t = Math.min(tempo.current / DURACAO, 1);
    const e = 1 - Math.pow(1 - t, 3);
    m.position.lerpVectors(origem, alvo, e);
    m.position.y += Math.sin(Math.PI * t) * 1.4;
    m.rotation.set(0, area.face === "frente" ? 0 : Math.PI, (1 - e) * 1.2 * lado);
    if (t >= 1 && !aterrou.current) {
      aterrou.current = true;
      aoAterrar();
    }
    // "prensa": pequena compressão depois de assentar
    const depois = tempo.current - DURACAO;
    const prensa = depois > 0 && depois < 0.4 ? 1 + Math.sin((depois / 0.4) * Math.PI) * 0.06 : 1;
    const voo = 0.35 + 0.65 * e;
    escalaAtual.current.lerp(new THREE.Vector2(tamanho.largura, tamanho.altura), Math.min(1, dt * 10));
    m.scale.set(escalaAtual.current.x * voo * prensa, escalaAtual.current.y * voo * prensa, 1);
  });

  return (
    <mesh ref={ref} renderOrder={2}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial
        map={textura}
        transparent
        roughness={0.75}
        metalness={0}
        polygonOffset
        polygonOffsetFactor={-4}
        depthWrite={false}
      />
    </mesh>
  );
}

function Peca3D({ peca, corHex, estampa, areas, rotacao, reduzirMovimento, origemVoo }: Props) {
  const grupo = useRef<THREE.Group>(null);
  const corpo = useRef<THREE.Group>(null);
  const geometria = useMemo(() => geometriaPeca(peca), [peca]);
  const malha = useMemo(() => texturaMalha(), []);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: corHex, roughness: 0.92, metalness: 0, bumpMap: malha, bumpScale: 0.6 }),
    // a cor é animada no useFrame
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [malha],
  );
  const corAlvo = useMemo(() => new THREE.Color(corHex), [corHex]);
  const prensa = useRef(0);

  useEffect(() => () => geometria.dispose(), [geometria]);

  useFrame((estado, dt) => {
    material.color.lerp(corAlvo, Math.min(1, dt * 6));
    const r = rotacao.current;
    if (!r.aArrastar) {
      // inércia depois de largar, depois aproxima suavemente do alvo
      if (Math.abs(r.velocidade) > 0.0005) {
        r.atual += r.velocidade;
        r.alvo = r.atual;
        r.velocidade *= 0.92;
      } else {
        r.atual += (r.alvo - r.atual) * Math.min(1, dt * 5);
      }
    }
    const g = grupo.current;
    if (g) {
      const balanco = reduzirMovimento ? 0 : Math.sin(estado.clock.elapsedTime * 0.8) * 0.04;
      g.rotation.y = r.atual + balanco;
      g.position.y = reduzirMovimento ? 0 : Math.sin(estado.clock.elapsedTime * 1.1) * 0.06;
    }
    if (corpo.current) {
      prensa.current = Math.max(0, prensa.current - dt * 3);
      corpo.current.scale.z = 1 - Math.sin(prensa.current * Math.PI) * 0.35;
    }
  });

  return (
    <group ref={grupo}>
      <group ref={corpo}>
        <mesh geometry={geometria} material={material} />
      </group>
      {estampa && (
        <Suspense fallback={null}>
          {areas.map((a) => (
            <Estampa
              key={`${estampa.id}-${a.face}`}
              area={a}
              url={estampa.imagemUrl}
              proporcao={estampa.proporcao}
              voar={!reduzirMovimento}
              origemVoo={origemVoo}
              aoAterrar={() => {
                prensa.current = 1;
              }}
            />
          ))}
        </Suspense>
      )}
    </group>
  );
}

export default function Cena3D(props: Props) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 32, near: 0.1, far: 100, position: [0, 0.2, 16] }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      aria-hidden
    >
      <Enquadrar peca={props.peca} />
      <hemisphereLight args={["#fff6e8", "#2a231c", 0.9]} />
      <directionalLight position={[5, 7, 9]} intensity={2.2} />
      <directionalLight position={[-6, 2, -8]} intensity={1.2} color="#ffd9b0" />
      <directionalLight position={[-4, -3, 6]} intensity={0.5} />
      <Peca3D {...props} />
      <ContactShadows position={[0, -4.25, 0]} opacity={0.55} scale={14} blur={2.6} far={6} resolution={512} />
    </Canvas>
  );
}
