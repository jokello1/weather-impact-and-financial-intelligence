export function windDirectionLabel(degrees?: number) {
  if (degrees == null) return 'N'
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(degrees / 45) % 8
  return directions[index]
}

export function msToMph(speed: number) {
  return speed * 2.237
}
