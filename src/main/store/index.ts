import Store from 'electron-store'
import { StoreSchema, storeDefaults } from './schema'

const store = new Store<StoreSchema>({
  defaults: storeDefaults
})

export default store
