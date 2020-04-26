import { IRules } from 'graphql-shield'
import { IOptionsConstructor } from 'graphql-shield/dist/types'

export interface Settings {
  rules: IRules
  options?: IOptionsConstructor
}
