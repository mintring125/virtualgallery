"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, RoundedBox, Text, useTexture } from "@react-three/drei";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Vector3, type Group, type Mesh } from "three";
import { TabletDialPad } from "@/components/gallery/tablet-dialpad";
import type { Artwork, ArtworkComment, PresenceUser, ViewerRole } from "@/lib/types";

type GalleryExperienceProps = {
  galleryId: string;
  artworks: Artwork[];
  comments: ArtworkComment[];
  presenceUsers: PresenceUser[];
  viewerName: string;
  viewerRole: ViewerRole;
};

type MovementVector = {
  x: number;
  y: number;
};

type GallerySceneProps = {
  artworks: Artwork[];
  cameraQuarterTurn: number;
  otherUsers: PresenceUser[];
  viewerName: string;
  viewerRole: ViewerRole;
  selectedArtworkId: string | null;
  movement: MovementVector;
  onSelectArtwork: (artworkId: string) => void;
  onPositionChange: (position: [number, number, number]) => void;
};

type ArtworkFrameProps = {
  artwork: Artwork;
  isSelected: boolean;
  onSelectArtwork: (artworkId: string) => void;
};

type FrameSpec = {
  shadow: [number, number];
  outer: [number, number, number];
  inner: [number, number, number];
  art: [number, number];
  plaque: [number, number, number];
  plaqueY: number;
  plaqueTitleY: number;
  plaqueMetaY: number;
  plaqueMaxWidth: number;
  hangerY: number;
  titleMaxWidth: number;
  metaMaxWidth: number;
  excerptMaxWidth: number;
  excerptY: number;
};

const ROOM_WIDTH = 42;
const ROOM_DEPTH = 34;
const ROOM_HEIGHT = 9.6;
const HALF_ROOM_WIDTH = ROOM_WIDTH / 2;
const HALF_ROOM_DEPTH = ROOM_DEPTH / 2;
const BACK_WALL_Z = -16.5;

function getFrameSpec(artwork: Artwork): FrameSpec {
  if (artwork.frameVariant === "wallMural") {
    return {
      shadow: [15.8, 8.3],
      outer: [15.2, 7.7, 0.06],
      inner: [15.2, 7.7, 0.06],
      art: [14.7, 7.2],
      plaque: [5.2, 0.82, 0.05],
      plaqueY: -4.22,
      plaqueTitleY: 0.16,
      plaqueMetaY: -0.16,
      plaqueMaxWidth: 4.5,
      hangerY: 0,
      titleMaxWidth: 11.8,
      metaMaxWidth: 10.4,
      excerptMaxWidth: 11.8,
      excerptY: -0.05
    };
  }

  if (artwork.frameVariant === "landscapeWide") {
    return {
      shadow: [7.2, 4.6],
      outer: [6.8, 4.2, 0.14],
      inner: [6.2, 3.6, 0.07],
      art: [5.68, 3.06],
      plaque: [3.8, 0.72, 0.05],
      plaqueY: -2.5,
      plaqueTitleY: 0.16,
      plaqueMetaY: -0.16,
      plaqueMaxWidth: 3.25,
      hangerY: 2.36,
      titleMaxWidth: 4.8,
      metaMaxWidth: 4.5,
      excerptMaxWidth: 4.8,
      excerptY: -0.05
    };
  }

  return {
    shadow: [2.74, 3.36],
    outer: [2.58, 3.08, 0.14],
    inner: [2.28, 2.78, 0.07],
    art: [1.92, 2.34],
    plaque: [2.16, 0.66, 0.05],
    plaqueY: -1.98,
    plaqueTitleY: 0.14,
    plaqueMetaY: -0.14,
    plaqueMaxWidth: 1.82,
    hangerY: 1.78,
    titleMaxWidth: 1.5,
    metaMaxWidth: 1.4,
    excerptMaxWidth: 1.44,
    excerptY: -0.22
  };
}

function createExcerpt(text: string | undefined) {
  if (!text) {
    return "";
  }

  return text.length > 84 ? `${text.slice(0, 84)}...` : text;
}

function ArtworkPlaque({ artwork }: { artwork: Artwork }) {
  const spec = getFrameSpec(artwork);
  const titleSize = artwork.frameVariant === "wallMural" ? 0.23 : artwork.frameVariant === "landscapeWide" ? 0.22 : 0.18;
  const metaSize = artwork.frameVariant === "wallMural" ? 0.15 : artwork.frameVariant === "landscapeWide" ? 0.15 : 0.13;

  return (
    <group position={[0, spec.plaqueY, 0.06]}>
      <RoundedBox args={spec.plaque} radius={0.06} smoothness={4}>
        <meshStandardMaterial color="#e7dbc4" />
      </RoundedBox>
      <Text position={[0, spec.plaqueTitleY, 0.04]} fontSize={titleSize} color="#45382b" anchorX="center" anchorY="middle" maxWidth={spec.plaqueMaxWidth}>
        {artwork.title}
      </Text>
      <Text position={[0, spec.plaqueMetaY, 0.04]} fontSize={metaSize} color="#7a6957" anchorX="center" anchorY="middle" maxWidth={spec.plaqueMaxWidth}>
        {`${artwork.studentNumber ?? "--"}번 ${artwork.authorName}`}
      </Text>
    </group>
  );
}

function FrameShell({
  artwork,
  isSelected,
  onSelectArtwork,
  children
}: {
  artwork: Artwork;
  isSelected: boolean;
  onSelectArtwork: (artworkId: string) => void;
  children: React.ReactNode;
}) {
  const clipRef = useRef<Mesh>(null);
  const spec = getFrameSpec(artwork);

  useFrame((state) => {
    if (!clipRef.current || artwork.frameVariant === "wallMural") {
      return;
    }

    clipRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.3) * 0.02;
  });

  return (
    <group position={artwork.position} rotation={[0, artwork.rotationY ?? 0, 0]} scale={artwork.frameScale ?? 1}>
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={spec.shadow} />
        <meshStandardMaterial color="#000000" transparent opacity={0.12} />
      </mesh>

      <RoundedBox args={spec.outer} radius={0.08} smoothness={4} onClick={() => onSelectArtwork(artwork.id)}>
        <meshStandardMaterial color={isSelected ? "#c78f42" : "#2b2928"} metalness={0.18} roughness={0.72} />
      </RoundedBox>

      <RoundedBox args={spec.inner} radius={0.05} smoothness={4} position={[0, 0, 0.05]}>
        <meshStandardMaterial color={isSelected ? "#ead6b2" : "#f7f4ef"} roughness={0.82} />
      </RoundedBox>

      <group position={[0, 0, 0.11]} onClick={() => onSelectArtwork(artwork.id)}>
        {children}
      </group>

      {artwork.frameVariant !== "wallMural" ? (
        <mesh position={[0, spec.hangerY, 0.08]} ref={clipRef}>
          <cylinderGeometry args={[0.07, 0.07, 0.2, 18]} />
          <meshStandardMaterial color="#b9a17d" metalness={0.45} roughness={0.35} />
        </mesh>
      ) : null}

      <ArtworkPlaque artwork={artwork} />
    </group>
  );
}

function ImageArtworkFrame({ artwork, isSelected, onSelectArtwork }: ArtworkFrameProps) {
  const texture = useTexture(artwork.imageUrl || "/uploads/placeholder.png");
  const spec = getFrameSpec(artwork);

  return (
    <FrameShell artwork={artwork} isSelected={isSelected} onSelectArtwork={onSelectArtwork}>
      <mesh>
        <planeGeometry args={spec.art} />
        <meshStandardMaterial map={texture} />
      </mesh>
      {isSelected ? (
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[spec.art[0] + 0.08, spec.art[1] + 0.08]} />
          <meshStandardMaterial color="#f0c377" transparent opacity={0.12} />
        </mesh>
      ) : null}
    </FrameShell>
  );
}

function TextArtworkFrame({ artwork, isSelected, onSelectArtwork }: ArtworkFrameProps) {
  const excerpt = createExcerpt(artwork.contentText);
  const spec = getFrameSpec(artwork);
  const titleY = artwork.frameVariant === "landscapeWide" ? 0.88 : 0.74;
  const metaY = artwork.frameVariant === "landscapeWide" ? 0.58 : 0.46;
  const titleSize = artwork.frameVariant === "landscapeWide" ? 0.18 : 0.16;
  const metaSize = artwork.frameVariant === "landscapeWide" ? 0.12 : 0.1;
  const excerptSize = artwork.frameVariant === "landscapeWide" ? 0.13 : 0.11;

  return (
    <FrameShell artwork={artwork} isSelected={isSelected} onSelectArtwork={onSelectArtwork}>
      <RoundedBox args={[spec.art[0] + 0.02, spec.art[1] + 0.02, 0.02]} radius={0.03} smoothness={4}>
        <meshStandardMaterial color="#fffaf2" />
      </RoundedBox>
      <Text position={[0, titleY, 0.03]} fontSize={titleSize} color="#2c2119" anchorX="center" anchorY="middle" maxWidth={spec.titleMaxWidth}>
        {artwork.title}
      </Text>
      <Text position={[0, metaY, 0.03]} fontSize={metaSize} color="#8b7760" anchorX="center" anchorY="middle" maxWidth={spec.metaMaxWidth}>
        {`${artwork.studentNumber ?? "--"}번 ${artwork.authorName}`}
      </Text>
      <Text position={[0, spec.excerptY, 0.03]} fontSize={excerptSize} color="#4d4034" anchorX="center" anchorY="middle" lineHeight={1.5} maxWidth={spec.excerptMaxWidth}>
        {excerpt}
      </Text>
      {isSelected ? (
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[spec.art[0] + 0.08, spec.art[1] + 0.08]} />
          <meshStandardMaterial color="#8dc7e8" transparent opacity={0.08} />
        </mesh>
      ) : null}
    </FrameShell>
  );
}

function WallMuralArtwork({ artwork, isSelected, onSelectArtwork }: ArtworkFrameProps) {
  const texture = useTexture(artwork.imageUrl || "/uploads/placeholder.png");
  const spec = getFrameSpec(artwork);

  return (
    <group position={artwork.position} rotation={[0, artwork.rotationY ?? 0, 0]}>
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={spec.shadow} />
        <meshStandardMaterial color="#000000" transparent opacity={0.1} />
      </mesh>

      <mesh onClick={() => onSelectArtwork(artwork.id)}>
        <planeGeometry args={spec.art} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {isSelected ? (
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[spec.art[0] + 0.14, spec.art[1] + 0.14]} />
          <meshStandardMaterial color="#f0c377" transparent opacity={0.12} />
        </mesh>
      ) : null}

      <ArtworkPlaque artwork={artwork} />
    </group>
  );
}

function RoomShell() {
  return (
    <group position={[0, -0.1, 0]}>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#ddd7cf" roughness={0.96} />
      </mesh>

      <mesh position={[0, ROOM_HEIGHT, 0]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#f3eee8" />
      </mesh>

      <mesh position={[0, ROOM_HEIGHT / 2, BACK_WALL_Z]}>
        <boxGeometry args={[ROOM_WIDTH, ROOM_HEIGHT, 0.18]} />
        <meshStandardMaterial color="#f0ece6" />
      </mesh>

      <mesh position={[-HALF_ROOM_WIDTH, ROOM_HEIGHT / 2, 0]} rotation-y={Math.PI / 2}>
        <boxGeometry args={[ROOM_DEPTH, ROOM_HEIGHT, 0.18]} />
        <meshStandardMaterial color="#ece8e1" />
      </mesh>

      <mesh position={[HALF_ROOM_WIDTH, ROOM_HEIGHT / 2, 0]} rotation-y={-Math.PI / 2}>
        <boxGeometry args={[ROOM_DEPTH, ROOM_HEIGHT, 0.18]} />
        <meshStandardMaterial color="#ece8e1" />
      </mesh>

      <mesh position={[0, 0.12, BACK_WALL_Z + 0.3]}>
        <boxGeometry args={[ROOM_WIDTH, 0.26, 0.24]} />
        <meshStandardMaterial color="#d4c8b3" />
      </mesh>
      <mesh position={[-HALF_ROOM_WIDTH + 0.3, 0.12, 0]} rotation-y={Math.PI / 2}>
        <boxGeometry args={[ROOM_DEPTH, 0.26, 0.24]} />
        <meshStandardMaterial color="#d4c8b3" />
      </mesh>
      <mesh position={[HALF_ROOM_WIDTH - 0.3, 0.12, 0]} rotation-y={Math.PI / 2}>
        <boxGeometry args={[ROOM_DEPTH, 0.26, 0.24]} />
        <meshStandardMaterial color="#d4c8b3" />
      </mesh>

      <mesh position={[0, ROOM_HEIGHT - 0.28, BACK_WALL_Z + 0.5]}>
        <boxGeometry args={[ROOM_WIDTH - 2, 0.08, 0.18]} />
        <meshStandardMaterial color="#c7ddff" emissive="#c7ddff" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[-HALF_ROOM_WIDTH + 0.45, ROOM_HEIGHT - 0.28, 0]} rotation-y={Math.PI / 2}>
        <boxGeometry args={[ROOM_DEPTH - 2, 0.08, 0.18]} />
        <meshStandardMaterial color="#c7ddff" emissive="#c7ddff" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[HALF_ROOM_WIDTH - 0.45, ROOM_HEIGHT - 0.28, 0]} rotation-y={Math.PI / 2}>
        <boxGeometry args={[ROOM_DEPTH - 2, 0.08, 0.18]} />
        <meshStandardMaterial color="#c7ddff" emissive="#c7ddff" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

function GalleryScene({
  artworks,
  cameraQuarterTurn,
  otherUsers,
  viewerName,
  viewerRole,
  selectedArtworkId,
  movement,
  onSelectArtwork,
  onPositionChange
}: GallerySceneProps) {
  const selfRef = useRef<Group>(null);
  const cameraTargetRef = useRef(new Vector3(0, 4.2, 8.4));
  const lookTargetRef = useRef(new Vector3(0, 1.7, 0));

  useFrame((state, delta) => {
    if (!selfRef.current) {
      return;
    }

    const speed = viewerRole === "teacher" ? 4 : 2.8;
    const angle = cameraQuarterTurn * (Math.PI / 2);
    const rotatedX = movement.x * Math.cos(angle) + movement.y * Math.sin(angle);
    const rotatedZ = -movement.x * Math.sin(angle) + movement.y * Math.cos(angle);
    const nextX = selfRef.current.position.x + rotatedX * speed * delta;
    const nextZ = selfRef.current.position.z + rotatedZ * speed * delta;

    selfRef.current.position.x = Math.max(-18.8, Math.min(18.8, nextX));
    selfRef.current.position.z = Math.max(-14.5, Math.min(14.5, nextZ));
    onPositionChange([
      Number(selfRef.current.position.x.toFixed(2)),
      0.6,
      Number(selfRef.current.position.z.toFixed(2))
    ]);

    const distance = 10.4;
    const desiredCameraX = selfRef.current.position.x + Math.sin(angle) * distance;
    const desiredCameraZ = selfRef.current.position.z + Math.cos(angle) * distance;
    const cameraPadding = 2.4;
    const clampedCameraX = Math.max(-HALF_ROOM_WIDTH + cameraPadding, Math.min(HALF_ROOM_WIDTH - cameraPadding, desiredCameraX));
    const clampedCameraZ = Math.max(BACK_WALL_Z + cameraPadding, Math.min(HALF_ROOM_DEPTH - cameraPadding, desiredCameraZ));

    cameraTargetRef.current.set(clampedCameraX, 5.4, clampedCameraZ);
    lookTargetRef.current.set(
      selfRef.current.position.x - Math.sin(angle) * 2.8,
      2.1,
      selfRef.current.position.z - Math.cos(angle) * 2.8
    );

    state.camera.position.lerp(cameraTargetRef.current, 1 - Math.pow(0.002, delta));
    state.camera.lookAt(lookTargetRef.current);
  });

  return (
    <>
      <color attach="background" args={["#dde7fb"]} />
      <ambientLight intensity={1.1} />
      <hemisphereLight args={["#edf4ff", "#c9c3bb", 0.9]} />
      <directionalLight castShadow intensity={1.6} position={[7, 12, 6]} shadow-mapSize-height={1024} shadow-mapSize-width={1024} />
      <spotLight angle={0.4} intensity={16} penumbra={0.6} position={[0, 6, -6]} />
      <spotLight angle={0.34} intensity={10} penumbra={0.7} position={[-11.2, 5.8, 0]} />
      <spotLight angle={0.34} intensity={10} penumbra={0.7} position={[11.2, 5.8, 0]} />

      <RoomShell />

      {artworks.map((artwork) => {
        const isSelected = artwork.id === selectedArtworkId;

        if (artwork.frameVariant === "wallMural") {
          return <WallMuralArtwork artwork={artwork} isSelected={isSelected} key={artwork.id} onSelectArtwork={onSelectArtwork} />;
        }

        if (artwork.type === "image") {
          return <ImageArtworkFrame artwork={artwork} isSelected={isSelected} key={artwork.id} onSelectArtwork={onSelectArtwork} />;
        }

        return <TextArtworkFrame artwork={artwork} isSelected={isSelected} key={artwork.id} onSelectArtwork={onSelectArtwork} />;
      })}

      {otherUsers.map((user) => (
        <group key={user.id} position={user.position}>
          <mesh castShadow>
            <capsuleGeometry args={[0.34, 0.66, 4, 8]} />
            <meshStandardMaterial color={user.color} roughness={0.65} />
          </mesh>
          <mesh position={[0, -0.57, 0]} rotation-x={-Math.PI / 2}>
            <ringGeometry args={[0.32, 0.48, 28]} />
            <meshStandardMaterial color={user.color} emissive={user.color} emissiveIntensity={0.15} />
          </mesh>
          <Billboard position={[0, 0.95, 0]}>
            <Text fontSize={0.24} color="#32404c" anchorX="center" anchorY="middle">
              {user.name}
            </Text>
          </Billboard>
        </group>
      ))}

      <group position={[0, 0.6, 3.6]} ref={selfRef}>
        <mesh castShadow>
          <capsuleGeometry args={[0.38, 0.76, 4, 8]} />
          <meshStandardMaterial color={viewerRole === "teacher" ? "#b88948" : "#d47850"} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.57, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.34, 0.54, 28]} />
          <meshStandardMaterial
            color={viewerRole === "teacher" ? "#b88948" : "#d47850"}
            emissive={viewerRole === "teacher" ? "#b88948" : "#d47850"}
            emissiveIntensity={0.2}
          />
        </mesh>
        <Billboard position={[0, 1.02, 0]}>
          <Text fontSize={0.24} color="#32404c" anchorX="center" anchorY="middle">
            {viewerName}
          </Text>
        </Billboard>
      </group>
    </>
  );
}

export function GalleryExperience({
  galleryId,
  artworks,
  comments,
  presenceUsers,
  viewerName,
  viewerRole
}: GalleryExperienceProps) {
  const router = useRouter();
  const canvasShellRef = useRef<HTMLDivElement>(null);
  const detailModeRef = useRef<"manual" | "proximity" | null>(null);
  const suppressedArtworkIdRef = useRef<string | null>(null);
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null);
  const [, setPosition] = useState<[number, number, number]>([0, 0.6, 3.6]);
  const [movement, setMovement] = useState<MovementVector>({ x: 0, y: 0 });
  const [commentBody, setCommentBody] = useState("");
  const [commentStatus, setCommentStatus] = useState("");
  const [isPresenceOpen, setIsPresenceOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameraQuarterTurn, setCameraQuarterTurn] = useState(0);
  const [isArtworkDetailOpen, setIsArtworkDetailOpen] = useState(false);
  const [isArtworkZoomOpen, setIsArtworkZoomOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function setDetailModeSafe(value: "manual" | "proximity" | null) {
    detailModeRef.current = value;
  }

  function setSuppressedArtworkIdSafe(value: string | null) {
    suppressedArtworkIdRef.current = value;
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "w") setMovement((prev) => ({ ...prev, y: -1 }));
      if (event.key.toLowerCase() === "s") setMovement((prev) => ({ ...prev, y: 1 }));
      if (event.key.toLowerCase() === "a") setMovement((prev) => ({ ...prev, x: -1 }));
      if (event.key.toLowerCase() === "d") setMovement((prev) => ({ ...prev, x: 1 }));
    }

    function onKeyUp(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "w" || event.key.toLowerCase() === "s") {
        setMovement((prev) => ({ ...prev, y: 0 }));
      }
      if (event.key.toLowerCase() === "a" || event.key.toLowerCase() === "d") {
        setMovement((prev) => ({ ...prev, x: 0 }));
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const selectedArtwork = selectedArtworkId ? artworks.find((artwork) => artwork.id === selectedArtworkId) : undefined;
  const selectedComments = selectedArtwork ? comments.filter((comment) => comment.artworkId === selectedArtwork.id) : [];

  function handlePositionChange(nextPosition: [number, number, number]) {
    setPosition(nextPosition);

    if (artworks.length === 0) {
      setSelectedArtworkId(null);
      setIsArtworkDetailOpen(false);
      setIsArtworkZoomOpen(false);
      setDetailModeSafe(null);
      return;
    }

    if (detailModeRef.current === "manual") {
      return;
    }

    const nearest = artworks.reduce<{ artwork: Artwork; distance: number } | null>((best, artwork) => {
      const dx = artwork.position[0] - nextPosition[0];
      const dz = artwork.position[2] - nextPosition[2];
      const distance = Math.hypot(dx, dz);
      return !best || distance < best.distance ? { artwork, distance } : best;
    }, null);

    if (!nearest) {
      setSelectedArtworkId(null);
      setIsArtworkDetailOpen(false);
      setIsArtworkZoomOpen(false);
      setDetailModeSafe(null);
      return;
    }

    if (suppressedArtworkIdRef.current && nearest.artwork.id !== suppressedArtworkIdRef.current) {
      setSuppressedArtworkIdSafe(null);
    }

    if (nearest.distance <= 2.6) {
      if (suppressedArtworkIdRef.current === nearest.artwork.id) {
        return;
      }
      setSelectedArtworkId(nearest.artwork.id);
      setIsArtworkDetailOpen(true);
      setDetailModeSafe("proximity");
      return;
    }

    if (nearest.distance >= 3.3) {
      if (suppressedArtworkIdRef.current) {
        setSuppressedArtworkIdSafe(null);
      }
      setSelectedArtworkId(null);
      setIsArtworkDetailOpen(false);
      setIsArtworkZoomOpen(false);
      setDetailModeSafe(null);
      setCommentBody("");
      setCommentStatus("");
    }
  }

  function handleArtworkSelect(artworkId: string) {
    if (selectedArtworkId === artworkId && isArtworkDetailOpen) {
      setSelectedArtworkId(null);
      setIsArtworkDetailOpen(false);
      setIsArtworkZoomOpen(false);
      setSuppressedArtworkIdSafe(artworkId);
      setDetailModeSafe(null);
      setCommentBody("");
      setCommentStatus("");
      return;
    }

    setSelectedArtworkId(artworkId);
    setIsArtworkDetailOpen(true);
    setIsArtworkZoomOpen(false);
    setSuppressedArtworkIdSafe(null);
    setDetailModeSafe("manual");
  }

  function submitComment() {
    if (!selectedArtwork || !commentBody.trim()) {
      setCommentStatus("댓글 내용을 입력해야 합니다.");
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artworkId: selectedArtwork.id,
          authorName: viewerName,
          body: commentBody.trim()
        })
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setCommentStatus(payload.error || "댓글 저장에 실패했습니다.");
        return;
      }

      setCommentBody("");
      setCommentStatus("댓글을 저장했습니다.");
      router.refresh();
    });
  }

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await canvasShellRef.current?.requestFullscreen();
      return;
    }

    await document.exitFullscreen();
  }

  function rotateCamera(direction: -1 | 1) {
    setCameraQuarterTurn((value) => Math.max(-1, Math.min(1, value + direction)));
  }

  return (
    <div className="gallery-layout gallery-layout-expanded">
      <div className="canvas-shell" ref={canvasShellRef}>
        <Canvas camera={{ position: [0, 3.6, 7.2], fov: 58 }} shadows>
          <GalleryScene
            artworks={artworks}
            cameraQuarterTurn={cameraQuarterTurn}
            otherUsers={presenceUsers}
            viewerName={viewerName}
            viewerRole={viewerRole}
            selectedArtworkId={selectedArtworkId}
            movement={movement}
            onSelectArtwork={handleArtworkSelect}
            onPositionChange={handlePositionChange}
          />
        </Canvas>

        <div className="gallery-overlay">
          <div className="overlay-topbar">
            <div className="overlay-box">
              <div className="frame-caption">
                <strong>{`${galleryId} 전시실`}</strong>
                <span className="muted">{viewerRole === "teacher" ? "교사 운영 모드" : "학생 관람 모드"}</span>
              </div>
            </div>
            <div className="toolbar-row">
              <button className="ghost-link button-reset overlay-action-button" onClick={toggleFullscreen} type="button">
                {isFullscreen ? "전체화면 닫기" : "전체화면"}
              </button>
            </div>
          </div>

          <div className="overlay-left">
            <div className="overlay-box stack">
              <button className="ghost-link button-reset presence-toggle" onClick={() => setIsPresenceOpen((value) => !value)} type="button">
                {isPresenceOpen ? "접속 중 닫기" : `접속 중 ${presenceUsers.length}명`}
              </button>
              {isPresenceOpen
                ? presenceUsers.map((user) => (
                    <div className="presence-row" key={user.id}>
                      <span className="dot" style={{ background: user.color }} />
                      <span>{user.name}</span>
                      <span className="muted">{user.role === "teacher" ? "교사" : "학생"}</span>
                    </div>
                  ))
                : null}
            </div>
          </div>

          <div className={`overlay-panel ${isArtworkDetailOpen ? "overlay-panel-open" : "overlay-panel-collapsed"}`}>
            <div className="overlay-box stack">
              <strong>{selectedArtwork ? "작품 상세" : "작품 가까이 가기"}</strong>
              {selectedArtwork ? (
                <span className="muted">{selectedArtwork.description}</span>
              ) : (
                <span className="muted">작품 근처에 가면 이 패널이 자동으로 열립니다.</span>
              )}

              {selectedArtwork ? (
                <>
                  <div className="frame-caption">
                    <strong>{selectedArtwork.title}</strong>
                    <span className="muted">{`${selectedArtwork.studentNumber ?? "--"}번 ${selectedArtwork.authorName}`}</span>
                  </div>
                  {selectedArtwork.type === "image" && selectedArtwork.imageUrl ? (
                    <div className="artwork-preview-shell">
                      <button className="ghost-link button-reset artwork-zoom-button" onClick={() => setIsArtworkZoomOpen(true)} type="button">
                        +
                      </button>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt={selectedArtwork.title} className="artwork-preview" src={selectedArtwork.imageUrl} />
                    </div>
                  ) : null}
                  {selectedArtwork.type === "text" && selectedArtwork.contentText ? (
                    <div className="text-artwork-box">{selectedArtwork.contentText}</div>
                  ) : null}
                  <div className="comment-list">
                    {selectedComments.map((comment) => (
                      <div className="comment-item" key={comment.id}>
                        <strong>{comment.authorName}</strong>
                        <span>{comment.body}</span>
                      </div>
                    ))}
                  </div>
                  <div className="input-grid compact-input-grid">
                    <textarea
                      onChange={(event) => setCommentBody(event.target.value)}
                      placeholder="이 작품을 보고 느낀 점을 적어 보세요."
                      value={commentBody}
                    />
                    <button className="cta-link button-reset" disabled={isPending} onClick={submitComment} type="button">
                      {isPending ? "저장 중..." : "댓글 남기기"}
                    </button>
                    {commentStatus ? <span className="muted">{commentStatus}</span> : null}
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div className="overlay-bottom">
            {viewerRole === "student" ? (
              <div className="overlay-box stack">
                <span className="muted">다이얼패드 또는 WASD로 이동하고 작품 가까이 가기</span>
                <div className="dialpad-controls">
                  <TabletDialPad onVectorChange={setMovement} />
                  <div className="camera-turn-stack">
                    <button className="ghost-link button-reset camera-turn-button" disabled={cameraQuarterTurn <= -1} onClick={() => rotateCamera(-1)} type="button">
                      90도 좌회전
                    </button>
                    <button className="ghost-link button-reset camera-turn-button" disabled={cameraQuarterTurn >= 1} onClick={() => rotateCamera(1)} type="button">
                      90도 우회전
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overlay-box stack">
                <strong>교사 이동 안내</strong>
                <span className="muted">WASD로 이동하면 작품 근처에서 상세 패널이 자동으로 열립니다.</span>
              </div>
            )}

            <div className="overlay-box stack">
              <strong>바로 가기</strong>
              <button className="ghost-link button-reset" onClick={() => setIsSidebarOpen((value) => !value)} type="button">
                {isSidebarOpen ? "작품 목록 닫기" : "작품 목록 열기"}
              </button>
              <Link className="ghost-link" href="/admin">
                관리자 화면
              </Link>
            </div>
          </div>
        </div>
      </div>

      {isArtworkZoomOpen && selectedArtwork?.type === "image" && selectedArtwork.imageUrl ? (
        <div className="artwork-zoom-overlay" onClick={() => setIsArtworkZoomOpen(false)} role="presentation">
          <div className="artwork-zoom-dialog" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <button className="ghost-link button-reset artwork-zoom-close" onClick={() => setIsArtworkZoomOpen(false)} type="button">
              닫기
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={selectedArtwork.title} className="artwork-zoom-image" src={selectedArtwork.imageUrl} />
          </div>
        </div>
      ) : null}

      {isSidebarOpen ? (
        <aside className="gallery-side gallery-side-drawer">
          <section className="panel-card stack">
            <div className="toolbar-row">
              <strong>작품 목록</strong>
              <button className="ghost-link button-reset" onClick={() => setIsSidebarOpen(false)} type="button">
                닫기
              </button>
            </div>
            {artworks.map((artwork) => (
              <button
                className="comment-item"
                key={artwork.id}
                onClick={() => {
                  handleArtworkSelect(artwork.id);
                  setIsSidebarOpen(false);
                }}
                type="button"
              >
                <strong>{artwork.title}</strong>
                <span className="muted">{`${artwork.studentNumber ?? "--"}번 ${artwork.authorName}`}</span>
              </button>
            ))}
          </section>
        </aside>
      ) : null}
    </div>
  );
}
