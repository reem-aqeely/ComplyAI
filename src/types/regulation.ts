export interface RegulationControlChange {
  controlId: string
  domainTitle: string
  text: string
}

export interface RegulationUpdateCheck {
  checkedAt: string
  hasUpdate: boolean
  currentVersion: string
  newVersion?: string
  newControls?: RegulationControlChange[]
  modifiedControls?: RegulationControlChange[]
  removedControls?: RegulationControlChange[]
  summary?: string
  expectedImpact?: string
}
