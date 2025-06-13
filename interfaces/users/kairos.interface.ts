export enum KAIOROS_ROLE {
  TESTER = 'tester',
  GOD = 'god',
}

export interface IKairosData {
  name: string
  role: string
  // TODO verify objectID === string
  institutionAccess: string[] // Array of mongo objectIds
  totalAccess: boolean
}
