export function getArtworkPlacement(index: number): { position: [number, number, number]; rotationY: number } {
  const backWallX = [-17.5, -14, -10.5, -7, -3.5, 0, 3.5, 7, 10.5, 14, 17.5];
  const leftGroupWallZ = [9.8, 3.2, -3.2, -9.8];
  const artworkHeight = 3.1;
  const backWallArtworkZ = -15.8;
  const sideArtworkHeight = 3.95;

  if (index < backWallX.length) {
    return {
      position: [backWallX[index] ?? 0, artworkHeight, backWallArtworkZ],
      rotationY: 0
    };
  }

  if (index < backWallX.length + leftGroupWallZ.length) {
    const sideIndex = index - backWallX.length;

    return {
      position: [-20.35, sideArtworkHeight, leftGroupWallZ[sideIndex] ?? 0],
      rotationY: Math.PI / 2
    };
  }

  if (index === backWallX.length + leftGroupWallZ.length) {
    return {
      position: [20.2, sideArtworkHeight + 0.85, 0],
      rotationY: -Math.PI / 2
    };
  }

  return {
    position: [0, artworkHeight, backWallArtworkZ],
    rotationY: 0
  };
}
