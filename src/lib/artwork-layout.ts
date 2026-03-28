export function getArtworkPlacement(index: number): { position: [number, number, number]; rotationY: number } {
  const backWallX = [-17.5, -14, -10.5, -7, -3.5, 0, 3.5, 7, 10.5, 14, 17.5];
  const sideWallZ = [7.5, 4.5, 1.5, -1.5, -4.5, -7.5];
  const artworkHeight = 2.25;

  if (index < backWallX.length) {
    return {
      position: [backWallX[index] ?? 0, artworkHeight, -10.8],
      rotationY: 0
    };
  }

  if (index < backWallX.length + sideWallZ.length) {
    const sideIndex = index - backWallX.length;

    return {
      position: [-20.85, artworkHeight, sideWallZ[sideIndex] ?? 0],
      rotationY: Math.PI / 2
    };
  }

  const sideIndex = (index - backWallX.length - sideWallZ.length) % sideWallZ.length;

  return {
    position: [20.85, artworkHeight, sideWallZ[sideIndex] ?? 0],
    rotationY: -Math.PI / 2
  };
}
